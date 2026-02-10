import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message } from '@/types/chat';
import MessageBubble from './message-bubble';

interface MessageListProps {
    messages: Message[];
    streamingContent?: string;
    streamError?: string | null;
}

export default function MessageList({ messages, streamingContent, streamError }: MessageListProps) {
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
        <div ref={scrollRef} className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-6 p-4 pb-40">
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

                {streamError && (
                    <div className="mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/50">
                        <p className="text-sm text-red-700 dark:text-red-300">{streamError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Refresh page
                        </button>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
