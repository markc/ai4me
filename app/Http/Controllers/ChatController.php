<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Streaming\Events\TextDeltaEvent;
use Prism\Prism\Streaming\Events\StreamEndEvent;
use Prism\Prism\ValueObjects\Messages\UserMessage;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;

class ChatController extends Controller
{
    public function index()
    {
        $conversations = Auth::user()->conversations()
            ->latest()
            ->get(['id', 'title', 'model', 'updated_at']);

        return Inertia::render('chat', [
            'conversations' => $conversations,
            'conversation' => null,
        ]);
    }

    public function show(Conversation $conversation)
    {
        abort_unless($conversation->user_id === Auth::id(), 403);

        $conversation->load('messages');

        $conversations = Auth::user()->conversations()
            ->latest()
            ->get(['id', 'title', 'model', 'updated_at']);

        return Inertia::render('chat', [
            'conversations' => $conversations,
            'conversation' => $conversation,
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
        ]);

        $user = Auth::user();
        $messages = $request->input('messages');
        $conversationId = $request->input('conversation_id');
        $model = $request->input('model', 'claude-sonnet-4-5-20250929');

        // Get or create conversation
        if ($conversationId) {
            $conversation = Conversation::where('user_id', $user->id)->findOrFail($conversationId);
        } else {
            $conversation = $user->conversations()->create([
                'title' => 'Untitled',
                'model' => $model,
            ]);
        }

        // Save the latest user message
        $lastMessage = end($messages);
        if ($lastMessage['role'] === 'user') {
            $conversation->messages()->create([
                'role' => 'user',
                'content' => $lastMessage['content'],
            ]);
        }

        // Build Prism Message objects
        $prismMessages = collect($messages)->map(fn ($m) => match ($m['role']) {
            'user' => new UserMessage($m['content']),
            'assistant' => new AssistantMessage($m['content']),
        })->all();

        $provider = $this->providerForModel($model);

        return response()->stream(function () use ($conversation, $prismMessages, $model, $provider) {
            $fullResponse = '';
            $inputTokens = null;
            $outputTokens = null;

            try {
                $stream = Prism::text()
                    ->using($provider, $model)
                    ->withSystemPrompt('You are a helpful AI assistant. Be concise, accurate, and friendly. Format responses with markdown when appropriate.')
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
            default => Provider::Anthropic,
        };
    }
}
