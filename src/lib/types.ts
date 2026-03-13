/**
 * Global Types
 */

export type User = {
    id: string;
    email: string;
    name?: string;
    image?: string;
};

export type Email = {
    id: string;
    threadId: string;
    subject: string;
    sender: {
        name: string;
        email: string;
    };
    snippet: string;
    body?: string;
    date: string;
    read: boolean;
    hasAttachment?: boolean;
    attachmentCount?: number;
    urgencyScore?: number;
};
