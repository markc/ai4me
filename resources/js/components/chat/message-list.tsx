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
    const bottomRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const userScrolledRef = useRef(false);

    const isNearBottom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
    }, []);

    const handleScroll = useCallback(() => {
        // Only disable auto-scroll if user explicitly scrolled up during streaming
        if (userScrolledRef.current) {
            setShouldAutoScroll(isNearBottom());
        }
    }, [isNearBottom]);

    // Re-enable auto-scroll when user sends a new message (messages.length changes)
    useEffect(() => {
        setShouldAutoScroll(true);
        userScrolledRef.current = false;
    }, [messages.length]);

    // Scroll to bottom during streaming and when messages change
    useEffect(() => {
        if (shouldAutoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [messages.length, streamingContent, shouldAutoScroll]);

    // Track user-initiated scrolls (distinguish from programmatic scrolls)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onWheel = () => { userScrolledRef.current = true; };
        const onTouchMove = () => { userScrolledRef.current = true; };

        el.addEventListener('scroll', handleScroll);
        el.addEventListener('wheel', onWheel);
        el.addEventListener('touchmove', onTouchMove);
        return () => {
            el.removeEventListener('scroll', handleScroll);
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('touchmove', onTouchMove);
        };
    }, [handleScroll]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6 p-4">
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

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
