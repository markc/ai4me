import { useCallback, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface MessageInputProps {
    onSend: (content: string) => void;
    onCancel?: () => void;
    disabled?: boolean;
    isStreaming?: boolean;
    model: string;
    onModelChange: (model: string) => void;
}

const models = [
    { value: 'claude-haiku-3-5-20241022', label: 'Haiku 3.5' },
    { value: 'claude-sonnet-4-5-20250929', label: 'Sonnet 4.5' },
    { value: 'claude-opus-4-6', label: 'Opus 4.6' },
];

export default function MessageInput({ onSend, onCancel, disabled, isStreaming, model, onModelChange }: MessageInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!disabled && !isStreaming) {
            textareaRef.current?.focus();
        }
    }, [disabled, isStreaming]);

    const autoResize = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }, []);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        const content = textareaRef.current?.value.trim();
        if (!content) return;
        onSend(content);
        if (textareaRef.current) {
            textareaRef.current.value = '';
            textareaRef.current.style.height = 'auto';
        }
    }, [onSend]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    }, [handleSubmit]);

    return (
        <div className="border-t bg-background">
            <div className="mx-auto max-w-3xl p-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="Type a message..."
                            disabled={disabled || isStreaming}
                            onInput={autoResize}
                            onKeyDown={handleKeyDown}
                            className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--scheme-accent)] disabled:opacity-50"
                        />
                        {isStreaming ? (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                <Square className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={disabled}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-50"
                                style={{ backgroundColor: 'var(--scheme-accent)', color: 'white' }}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={model}
                            onChange={e => onModelChange(e.target.value)}
                            className="rounded-lg border bg-muted/50 px-2 py-1 text-xs outline-none"
                        >
                            {models.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <span className="text-muted-foreground text-xs">Shift+Enter for new line</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
