export type Message = {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
    input_tokens?: number | null;
    output_tokens?: number | null;
    created_at?: string;
};

export type Conversation = {
    id: number;
    title: string;
    model: string;
    updated_at: string;
};

export type ConversationWithMessages = Conversation & {
    messages: Message[];
};
