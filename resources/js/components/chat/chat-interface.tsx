import { useStream } from '@laravel/stream-react';
import { useCallback, useEffect, useState } from 'react';
import type { Message, ConversationWithMessages, SystemPromptTemplate } from '@/types/chat';
import MessageInput from './message-input';
import MessageList from './message-list';

function getXsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

interface PendingFile {
    file: File;
    preview?: string;
}

interface ChatInterfaceProps {
    conversation?: ConversationWithMessages | null;
    templates: SystemPromptTemplate[];
}

export default function ChatInterface({ conversation, templates }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(conversation?.messages ?? []);
    const [model, setModel] = useState(conversation?.model ?? 'claude-sonnet-4-5-20250929');
    const [conversationId, setConversationId] = useState<number | undefined>(conversation?.id);
    const [systemPrompt, setSystemPrompt] = useState(conversation?.system_prompt ?? '');
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [webSearch, setWebSearch] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);

    const { data, send, isStreaming, isFetching, cancel } = useStream<{
        messages: { role: string; content: string }[];
        conversation_id?: number;
        model?: string;
        system_prompt?: string;
        attachment_temp_ids?: string[];
        web_search?: boolean;
        project_dir?: string;
    }>('/chat/stream', {
        csrfToken: '',
        headers: { 'X-XSRF-TOKEN': getXsrfToken() },
        onResponse: (response) => {
            setStreamError(null);

            if (response.redirected) {
                setStreamError('Session expired — please refresh the page.');
            }

            const newId = response.headers.get('X-Conversation-Id');
            if (newId && !conversationId) {
                const id = parseInt(newId, 10);
                setConversationId(id);
                window.history.replaceState({}, '', `/chat/${id}`);
            }
        },
        onError: (error) => {
            const msg = error?.message || String(error);
            // Extract readable error from HTML error pages
            const htmlMatch = msg.match(/<title>(.*?)<\/title>/i);
            const cleanMsg = htmlMatch
                ? htmlMatch[1]
                : msg.replace(/<[^>]*>/g, '').slice(0, 300).trim();
            setStreamError(cleanMsg || 'Unknown error — check server logs.');
        },
    });

    // Sync messages when conversation changes
    useEffect(() => {
        setMessages(conversation?.messages ?? []);
        setConversationId(conversation?.id);
        setModel(conversation?.model ?? 'claude-sonnet-4-5-20250929');
        setSystemPrompt(conversation?.system_prompt ?? '');
    }, [conversation]);

    // When streaming finishes, commit the streamed response to the messages array
    useEffect(() => {
        if (!isStreaming && data && data.trim()) {
            // Don't commit HTML error pages as assistant messages
            const trimmed = data.trim();
            if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
                if (!streamError) {
                    const titleMatch = trimmed.match(/<title>(.*?)<\/title>/i);
                    setStreamError(titleMatch?.[1] || 'Server returned HTML instead of stream — check server logs.');
                }
                return;
            }
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.content === data) return prev;
                return [...prev, { role: 'assistant', content: data }];
            });
        }
    }, [isStreaming, data, streamError]);

    const handleFilesSelected = useCallback((files: FileList) => {
        const newFiles: PendingFile[] = Array.from(files).map(file => {
            const pf: PendingFile = { file };
            if (file.type.startsWith('image/')) {
                pf.preview = URL.createObjectURL(file);
            }
            return pf;
        });
        setPendingFiles(prev => [...prev, ...newFiles]);
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
        setPendingFiles(prev => {
            const removed = prev[index];
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const handleSend = useCallback(async (content: string) => {
        setStreamError(null);
        const userMessage: Message = { role: 'user', content, created_at: new Date().toISOString() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        const payload = updatedMessages.map(m => ({ role: m.role, content: m.content }));

        let attachmentTempIds: string[] = [];

        // Upload files first if any
        if (pendingFiles.length > 0) {
            const formData = new FormData();
            pendingFiles.forEach(pf => formData.append('files[]', pf.file));

            try {
                const res = await fetch('/chat/upload', {
                    method: 'POST',
                    headers: { 'X-XSRF-TOKEN': getXsrfToken() },
                    body: formData,
                });
                const json = await res.json();
                attachmentTempIds = json.temp_ids ?? [];
            } catch (e) {
                console.error('Upload failed:', e);
            }

            // Clean up previews
            pendingFiles.forEach(pf => { if (pf.preview) URL.revokeObjectURL(pf.preview); });
            setPendingFiles([]);
        }

        // Extract project name from claude-code model for the payload
        const projectDir = model.startsWith('claude-code:') ? model.split(':')[1] : undefined;

        send({
            messages: payload,
            conversation_id: conversationId,
            model,
            system_prompt: systemPrompt || undefined,
            attachment_temp_ids: attachmentTempIds.length > 0 ? attachmentTempIds : undefined,
            web_search: webSearch || undefined,
            project_dir: projectDir,
        });
    }, [messages, conversationId, model, systemPrompt, pendingFiles, webSearch, send]);

    return (
        <div className="relative h-full">
            <MessageList
                messages={messages}
                streamingContent={isStreaming && !streamError ? data : undefined}
                streamError={streamError}
            />
            <div className="absolute bottom-0 left-0 right-0">
                <div className="pointer-events-none h-8 bg-gradient-to-t from-background to-transparent" />
                <MessageInput
                    onSend={handleSend}
                    onCancel={cancel}
                    disabled={isFetching}
                    isStreaming={isStreaming}
                    model={model}
                    onModelChange={setModel}
                    systemPrompt={systemPrompt}
                    onSystemPromptChange={setSystemPrompt}
                    templates={templates}
                    pendingFiles={pendingFiles}
                    onFilesSelected={handleFilesSelected}
                    onRemoveFile={handleRemoveFile}
                    webSearch={webSearch}
                    onWebSearchChange={setWebSearch}
                />
            </div>
        </div>
    );
}
