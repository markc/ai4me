import { useState } from 'react';
import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { MessageSquare, Plus, Trash2, Download, Search } from 'lucide-react';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentId?: number;
}

export default function ConversationSidebar({ conversations, currentId }: ConversationSidebarProps) {
    const [query, setQuery] = useState('');

    const filtered = query
        ? conversations.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
        : conversations;

    return (
        <div className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/30">
            <div className="flex items-center justify-between border-b p-3">
                <span className="text-sm font-medium">Conversations</span>
                <Link
                    href="/chat"
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                >
                    <Plus className="h-4 w-4" />
                </Link>
            </div>

            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded-lg border bg-transparent pl-8 pr-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-[var(--scheme-accent)]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="text-muted-foreground p-3 text-center text-xs">
                        {query ? 'No matches' : 'No conversations yet'}
                    </p>
                )}
                {filtered.map(conv => (
                    <div key={conv.id} className="group relative">
                        <Link
                            href={`/chat/${conv.id}`}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                                currentId === conv.id && 'bg-muted',
                            )}
                        >
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{conv.title}</span>
                        </Link>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 rounded-lg border bg-background px-1 py-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
                            <a
                                href={`/chat/${conv.id}/export`}
                                target="_blank"
                                rel="noopener"
                                onClick={e => e.stopPropagation()}
                                className="rounded p-1 hover:bg-muted"
                                title="Export conversation"
                            >
                                <Download className="text-muted-foreground h-3.5 w-3.5" />
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
                                <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
