import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { Streamdown } from 'streamdown';
import { createCodePlugin } from '@streamdown/code';

interface MessageBubbleProps {
    message: Message;
    isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex', isUser && 'justify-end')}>
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    isUser
                        ? 'bg-[var(--scheme-accent)] text-white'
                        : 'bg-muted',
                )}
            >
                {isUser ? (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown
                            mode={isStreaming ? 'typewriter' : 'static'}
                            plugins={[createCodePlugin({ theme: 'github-dark' })]}
                        >
                            {message.content}
                        </Streamdown>
                    </div>
                )}
            </div>
        </div>
    );
}
