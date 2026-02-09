import { Link, router, usePage } from '@inertiajs/react';
import { Download, MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';

export default function ConversationsPanel() {
    const { sidebarConversations, ziggy } = usePage<{
        props: { sidebarConversations: Conversation[]; ziggy: { url: string; location: string } };
    }>().props as unknown as { sidebarConversations: Conversation[]; ziggy: { url: string; location: string } };

    const conversations = sidebarConversations ?? [];
    const [query, setQuery] = useState('');

    // Derive current conversation ID from the URL path
    const match = (typeof window !== 'undefined' ? window.location.pathname : ziggy?.location ?? '').match(/\/chat\/(\d+)/);
    const currentId = match ? Number(match[1]) : undefined;

    const filtered = query
        ? conversations.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
        : conversations;

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-3" style={{ borderColor: 'var(--glass-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--scheme-fg-muted)' }}>Conversations</span>
                <Link
                    href="/chat"
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-background"
                    style={{ color: 'var(--scheme-fg-muted)' }}
                >
                    <Plus className="h-4 w-4" />
                </Link>
            </div>

            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--scheme-fg-muted)' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded-lg border bg-transparent py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-[var(--scheme-accent)]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="p-3 text-center text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                        {query ? 'No matches' : 'No conversations yet'}
                    </p>
                )}
                {filtered.map(conv => (
                    <div key={conv.id} className="group relative">
                        <Link
                            href={`/chat/${conv.id}`}
                            prefetch
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-background',
                                currentId === conv.id && 'bg-background',
                            )}
                        >
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{conv.title}</span>
                        </Link>
                        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5 rounded-lg border bg-background px-1 py-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
                            <a
                                href={`/chat/${conv.id}/export`}
                                target="_blank"
                                rel="noopener"
                                onClick={e => e.stopPropagation()}
                                className="rounded p-1 hover:bg-muted"
                                title="Export conversation"
                            >
                                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.delete(`/chat/${conv.id}`, { preserveScroll: true });
                                }}
                                className="rounded p-1 hover:bg-destructive/10"
                                title="Delete conversation"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
