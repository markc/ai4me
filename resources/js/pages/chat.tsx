import ChatInterface from '@/components/chat/chat-interface';
import ConversationSidebar from '@/components/chat/conversation-sidebar';
import { useTheme } from '@/contexts/theme-context';
import { Head, usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import type { Conversation, ConversationWithMessages, SystemPromptTemplate } from '@/types/chat';

type ChatPageProps = {
    conversations: Conversation[];
    conversation: ConversationWithMessages | null;
    templates: SystemPromptTemplate[];
};

export default function ChatPage() {
    const { conversations, conversation, templates } = usePage<{ props: ChatPageProps }>().props as unknown as ChatPageProps;
    const { setNoPadding } = useTheme();

    const title = conversation?.title ?? 'AI Chat';

    useLayoutEffect(() => {
        setNoPadding(true);
        return () => setNoPadding(false);
    }, [setNoPadding]);

    return (
        <>
            <Head title={title} />
            <div className="flex h-full">
                <ConversationSidebar
                    conversations={conversations}
                    currentId={conversation?.id}
                />
                <div className="flex-1">
                    <ChatInterface
                        key={conversation?.id ?? 'new'}
                        conversation={conversation}
                        templates={templates}
                    />
                </div>
            </div>
        </>
    );
}
