<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\MessageAttachment;
use App\Models\SystemPromptTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Streaming\Events\TextDeltaEvent;
use Prism\Prism\Streaming\Events\StreamEndEvent;
use Prism\Prism\ValueObjects\Messages\UserMessage;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;
use Prism\Prism\ValueObjects\Media\Image;
use Prism\Prism\ValueObjects\Media\Document;
use Prism\Prism\ValueObjects\ProviderTool;

class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $conversations = $user->conversations()
            ->latest()
            ->get(['id', 'title', 'model', 'updated_at']);

        $templates = SystemPromptTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->orderByRaw('user_id IS NULL')
            ->orderBy('name')
            ->get();

        return Inertia::render('chat', [
            'conversations' => $conversations,
            'conversation' => null,
            'templates' => $templates,
        ]);
    }

    public function show(Conversation $conversation)
    {
        abort_unless($conversation->user_id === Auth::id(), 403);

        $conversation->load('messages.attachments');

        // Set inverse relationship to avoid N+1 for cost accessor
        $conversation->messages->each(fn ($msg) => $msg->setRelation('conversation', $conversation));

        $user = Auth::user();
        $conversations = $user->conversations()
            ->latest()
            ->get(['id', 'title', 'model', 'updated_at']);

        $templates = SystemPromptTemplate::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->orderByRaw('user_id IS NULL')
            ->orderBy('name')
            ->get();

        return Inertia::render('chat', [
            'conversations' => $conversations,
            'conversation' => $conversation,
            'templates' => $templates,
        ]);
    }

    public function stream(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|in:user,assistant',
            'messages.*.content' => 'required|string',
            'conversation_id' => 'nullable|integer',
            'model' => 'nullable|string',
            'system_prompt' => 'nullable|string|max:5000',
            'attachment_temp_ids' => 'nullable|array',
            'attachment_temp_ids.*' => 'string',
            'web_search' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $messages = $request->input('messages');
        $conversationId = $request->input('conversation_id');
        $model = $request->input('model', 'claude-sonnet-4-5-20250929');
        $systemPrompt = $request->input('system_prompt');
        $webSearch = $request->boolean('web_search');

        // Get or create conversation
        if ($conversationId) {
            $conversation = Conversation::where('user_id', $user->id)->findOrFail($conversationId);
            // Update model if user switched mid-conversation
            if ($conversation->model !== $model) {
                $conversation->update(['model' => $model]);
            }
        } else {
            $conversation = $user->conversations()->create([
                'title' => 'Untitled',
                'model' => $model,
                'system_prompt' => $systemPrompt,
            ]);
        }

        // Save the latest user message
        $lastMessage = end($messages);
        $userMessageRecord = null;
        if ($lastMessage['role'] === 'user') {
            $userMessageRecord = $conversation->messages()->create([
                'role' => 'user',
                'content' => $lastMessage['content'],
            ]);
        }

        // Handle file attachments
        $tempIds = $request->input('attachment_temp_ids', []);
        $attachmentParts = [];
        if ($userMessageRecord && !empty($tempIds)) {
            foreach ($tempIds as $tempId) {
                $meta = session("upload_{$tempId}");
                if (!$meta) continue;

                $attachment = $userMessageRecord->attachments()->create([
                    'filename' => $meta['filename'],
                    'storage_path' => $meta['storage_path'],
                    'mime_type' => $meta['mime_type'],
                    'size' => $meta['size'],
                ]);

                session()->forget("upload_{$tempId}");

                // Build Prism content parts
                if (str_starts_with($meta['mime_type'], 'image/')) {
                    $attachmentParts[] = Image::fromStoragePath($meta['storage_path']);
                } else {
                    $attachmentParts[] = Document::fromStoragePath($meta['storage_path']);
                }
            }
        }

        // Build Prism Message objects
        $prismMessages = collect($messages)->map(function ($m, $i) use ($messages, $attachmentParts) {
            if ($m['role'] === 'assistant') {
                return new AssistantMessage($m['content']);
            }
            // Only attach files to the last user message
            if ($i === count($messages) - 1 && !empty($attachmentParts)) {
                return new UserMessage($m['content'], $attachmentParts);
            }
            return new UserMessage($m['content']);
        })->all();

        $provider = $this->providerForModel($model);

        $effectiveSystemPrompt = $conversation->system_prompt
            ?? $user->setting('default_system_prompt')
            ?? 'You are a helpful AI assistant. Be concise, accurate, and friendly. Format responses with markdown when appropriate.';

        return response()->stream(function () use ($conversation, $prismMessages, $model, $provider, $effectiveSystemPrompt, $webSearch) {
            $fullResponse = '';
            $inputTokens = null;
            $outputTokens = null;

            try {
                // Two-step web search: Gemini searches, then chosen model answers
                if ($webSearch) {
                    $lastMsg = end($prismMessages);
                    $query = $lastMsg instanceof UserMessage ? $lastMsg->content : '';

                    try {
                        $searchResponse = Prism::text()
                            ->using(Provider::Gemini, 'gemini-2.0-flash')
                            ->withProviderTools([new ProviderTool('google_search')])
                            ->withPrompt("Search the web and provide a comprehensive summary of current information about: {$query}")
                            ->asText();

                        $lastIndex = count($prismMessages) - 1;
                        $enriched = "Web search results:\n\n{$searchResponse->text}\n\n---\n\nUsing the above search results as context, please answer: {$query}";
                        $media = $lastMsg instanceof UserMessage
                            ? array_merge($lastMsg->images(), $lastMsg->documents())
                            : [];
                        $prismMessages[$lastIndex] = new UserMessage($enriched, $media);
                    } catch (\Exception $e) {
                        \Log::warning('Web search failed, continuing without: ' . $e->getMessage());
                    }
                }

                $stream = Prism::text()
                    ->using($provider, $model)
                    ->withSystemPrompt($effectiveSystemPrompt)
                    ->withMessages($prismMessages)
                    ->asStream();

                foreach ($stream as $event) {
                    if ($event instanceof TextDeltaEvent) {
                        $fullResponse .= $event->delta;
                        echo $event->delta;
                        ob_flush();
                        flush();
                    }

                    if ($event instanceof StreamEndEvent && $event->usage) {
                        $inputTokens = $event->usage->promptTokens;
                        $outputTokens = $event->usage->completionTokens;
                    }
                }
            } catch (\Exception $e) {
                $fullResponse = 'Error: ' . $e->getMessage();
                echo $fullResponse;
                ob_flush();
                flush();
            }

            // Save assistant response
            if ($fullResponse) {
                $conversation->messages()->create([
                    'role' => 'assistant',
                    'content' => $fullResponse,
                    'input_tokens' => $inputTokens,
                    'output_tokens' => $outputTokens,
                ]);

                // Auto-generate title from first user message
                if ($conversation->title === 'Untitled') {
                    $firstMessage = $conversation->messages()->where('role', 'user')->first();
                    if ($firstMessage) {
                        $title = str($firstMessage->content)->limit(50)->toString();
                        $conversation->update(['title' => $title]);
                    }
                }
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'X-Conversation-Id' => $conversation->id,
        ]);
    }

    public function export(Conversation $conversation)
    {
        abort_unless($conversation->user_id === Auth::id(), 403);

        $conversation->load('messages');

        $markdown = "# {$conversation->title}\n\n";
        $markdown .= "Model: {$conversation->model}\n";
        $markdown .= "Date: {$conversation->created_at->format('Y-m-d H:i')}\n\n---\n\n";

        foreach ($conversation->messages as $msg) {
            $label = $msg->role === 'user' ? '**User**' : '**Assistant**';
            $markdown .= "{$label}\n\n{$msg->content}\n\n---\n\n";
        }

        $filename = Str::slug($conversation->title) . '.md';

        return response($markdown, 200, [
            'Content-Type' => 'text/markdown',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'required|array|max:5',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,txt,md',
        ]);

        $user = Auth::user();
        $tempIds = [];

        foreach ($request->file('files') as $file) {
            $tempId = Str::uuid()->toString();
            $path = $file->store("attachments/{$user->id}", 'local');

            session(["upload_{$tempId}" => [
                'filename' => $file->getClientOriginalName(),
                'storage_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]]);

            $tempIds[] = $tempId;
        }

        return response()->json(['temp_ids' => $tempIds]);
    }

    public function attachment(MessageAttachment $attachment)
    {
        $message = $attachment->message;
        abort_unless($message->conversation->user_id === Auth::id(), 403);

        return response()->file(
            Storage::disk('local')->path($attachment->storage_path),
            ['Content-Type' => $attachment->mime_type],
        );
    }

    public function destroy(Conversation $conversation)
    {
        abort_unless($conversation->user_id === Auth::id(), 403);

        $conversation->delete();

        return redirect()->route('chat.index');
    }

    private function providerForModel(string $model): Provider
    {
        return match (true) {
            str_starts_with($model, 'gpt-'),
            str_starts_with($model, 'o1-'),
            str_starts_with($model, 'o3-') => Provider::OpenAI,
            str_starts_with($model, 'gemini-') => Provider::Gemini,
            default => Provider::Anthropic,
        };
    }
}
