import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentId?: number;
}

export default function ConversationSidebar({ conversations, currentId }: ConversationSidebarProps) {
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

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                    <p className="text-muted-foreground p-3 text-center text-xs">No conversations yet</p>
                )}
                {conversations.map(conv => (
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
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.delete(`/chat/${conv.id}`, { preserveScroll: true });
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                        >
                            <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
