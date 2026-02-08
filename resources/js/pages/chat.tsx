import AppLayout from '@/layouts/app-layout';
import ChatInterface from '@/components/chat/chat-interface';
import ConversationSidebar from '@/components/chat/conversation-sidebar';
import { Head, usePage } from '@inertiajs/react';
import type { Conversation, ConversationWithMessages, SystemPromptTemplate } from '@/types/chat';

type ChatPageProps = {
    conversations: Conversation[];
    conversation: ConversationWithMessages | null;
    templates: SystemPromptTemplate[];
};

function ChatPage() {
    const { conversations, conversation, templates } = usePage<{ props: ChatPageProps }>().props as unknown as ChatPageProps;

    const title = conversation?.title ?? 'AI Chat';

    return (
        <>
            <Head title={title} />
            <AppLayout noPadding>
                <div className="flex h-[calc(100vh-var(--topnav-height))]">
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
            </AppLayout>
        </>
    );
}

export default ChatPage;
