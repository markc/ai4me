import type { Message } from '@/types/chat';
import { Streamdown } from 'streamdown';
import { createCodePlugin } from '@streamdown/code';
import { FileText, Copy, Download, Check } from 'lucide-react';
import { useState, useCallback } from 'react';

interface MessageBubbleProps {
    message: Message;
    isStreaming?: boolean;
}

function formatCost(cost: number): string {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
}

function formatTokens(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toLocaleString();
}

function MessageActions({ content, role }: { content: string; role: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [content]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${role}-message.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [content, role]);

    return (
        <div className="flex gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
            <button
                onClick={handleCopy}
                className="rounded p-1 hover:bg-muted"
                title="Copy message"
            >
                {copied
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                }
            </button>
            <button
                onClick={handleDownload}
                className="rounded p-1 hover:bg-muted"
                title="Download as markdown"
            >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
        </div>
    );
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const hasAttachments = message.attachments && message.attachments.length > 0;

    return (
        <div className="group/msg relative flex">
            {isUser ? (
                <div className="bg-muted rounded-2xl px-4 py-3 w-full">
                    {hasAttachments && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {message.attachments!.map(att => (
                                att.mime_type.startsWith('image/') ? (
                                    <a key={att.id} href={`/chat/attachment/${att.id}`} target="_blank" rel="noopener">
                                        <img
                                            src={`/chat/attachment/${att.id}`}
                                            alt={att.filename}
                                            className="h-20 w-20 rounded-lg object-cover border"
                                        />
                                    </a>
                                ) : (
                                    <a
                                        key={att.id}
                                        href={`/chat/attachment/${att.id}`}
                                        target="_blank"
                                        rel="noopener"
                                        className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs hover:bg-muted"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        {att.filename}
                                    </a>
                                )
                            ))}
                        </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
            ) : (
                <div className="w-full">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown
                            mode={isStreaming ? 'typewriter' : 'static'}
                            plugins={[createCodePlugin({ theme: 'github-dark' })]}
                        >
                            {message.content}
                        </Streamdown>
                    </div>
                    {!isStreaming && message.input_tokens != null && (
                        <p className="text-muted-foreground mt-1.5 text-xs">
                            {formatTokens(message.input_tokens!)} in / {formatTokens(message.output_tokens ?? 0)} out
                            {message.cost != null && ` · ${formatCost(message.cost)}`}
                        </p>
                    )}
                </div>
            )}
            {!isStreaming && (
                <div className="absolute -right-1 top-0 translate-x-full pl-1">
                    <MessageActions content={message.content} role={message.role} />
                </div>
            )}
        </div>
    );
}
