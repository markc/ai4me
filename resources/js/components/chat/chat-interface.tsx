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

    const { data, send, isStreaming, isFetching, cancel } = useStream<{
        messages: { role: string; content: string }[];
        conversation_id?: number;
        model?: string;
        system_prompt?: string;
        attachment_temp_ids?: string[];
        web_search?: boolean;
    }>('/chat/stream', {
        csrfToken: '',
        headers: { 'X-XSRF-TOKEN': getXsrfToken() },
        onResponse: (response) => {
            const newId = response.headers.get('X-Conversation-Id');
            if (newId && !conversationId) {
                const id = parseInt(newId, 10);
                setConversationId(id);
                window.history.replaceState({}, '', `/chat/${id}`);
            }
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
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.content === data) return prev;
                return [...prev, { role: 'assistant', content: data }];
            });
        }
    }, [isStreaming, data]);

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
        const userMessage: Message = { role: 'user', content };
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

        send({
            messages: payload,
            conversation_id: conversationId,
            model,
            system_prompt: systemPrompt || undefined,
            attachment_temp_ids: attachmentTempIds.length > 0 ? attachmentTempIds : undefined,
            web_search: webSearch || undefined,
        });
    }, [messages, conversationId, model, systemPrompt, pendingFiles, webSearch, send]);

    return (
        <div className="relative h-full">
            <MessageList
                messages={messages}
                streamingContent={isStreaming ? data : undefined}
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
