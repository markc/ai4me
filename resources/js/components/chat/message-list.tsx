import type { Message } from '@/types/chat';
import MessageBubble from './message-bubble';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MessageListProps {
    messages: Message[];
    streamingContent?: string;
    isStreaming: boolean;
}

export default function MessageList({ messages, streamingContent, isStreaming }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 2;
        setShouldAutoScroll(atBottom);
    }, []);

    useEffect(() => {
        if (scrollRef.current && shouldAutoScroll) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, streamingContent, shouldAutoScroll]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', handleScroll);
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                {messages.length === 0 && !streamingContent && (
                    <p className="text-muted-foreground mt-16 text-center text-lg">
                        Start a conversation
                    </p>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={msg.id ?? `local-${i}`} message={msg} />
                ))}

                {streamingContent && (
                    <MessageBubble
                        message={{ role: 'assistant', content: streamingContent }}
                        isStreaming
                    />
                )}
            </div>
        </div>
    );
}
