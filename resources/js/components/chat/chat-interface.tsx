import type { Message, ConversationWithMessages } from '@/types/chat';
import { useStream } from '@laravel/stream-react';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import MessageList from './message-list';
import MessageInput from './message-input';

interface ChatInterfaceProps {
    conversation?: ConversationWithMessages | null;
}

export default function ChatInterface({ conversation }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(conversation?.messages ?? []);
    const [model, setModel] = useState(conversation?.model ?? 'claude-sonnet-4-5-20250929');
    const [conversationId, setConversationId] = useState<number | undefined>(conversation?.id);

    const { data, send, isStreaming, isFetching, cancel } = useStream<{
        messages: { role: string; content: string }[];
        conversation_id?: number;
        model?: string;
    }>('/chat/stream', {
        onResponse: (response) => {
            // Capture the conversation ID from response header when a new conversation is created
            const newId = response.headers.get('X-Conversation-Id');
            if (newId && !conversationId) {
                const id = parseInt(newId, 10);
                setConversationId(id);
                // Update URL without full page reload
                window.history.replaceState({}, '', `/chat/${id}`);
            }
        },
    });

    // Sync messages when conversation changes
    useEffect(() => {
        setMessages(conversation?.messages ?? []);
        setConversationId(conversation?.id);
        setModel(conversation?.model ?? 'claude-sonnet-4-5-20250929');
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

    const handleSend = useCallback((content: string) => {
        const userMessage: Message = { role: 'user', content };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        const payload = updatedMessages.map(m => ({ role: m.role, content: m.content }));

        send({
            messages: payload,
            conversation_id: conversationId,
            model,
        });
    }, [messages, conversationId, model, send]);

    return (
        <div className="flex h-full flex-col">
            <MessageList
                messages={messages}
                streamingContent={isStreaming ? data : undefined}
                isStreaming={isStreaming}
            />
            <MessageInput
                onSend={handleSend}
                onCancel={cancel}
                disabled={isFetching}
                isStreaming={isStreaming}
                model={model}
                onModelChange={setModel}
            />
        </div>
    );
}
