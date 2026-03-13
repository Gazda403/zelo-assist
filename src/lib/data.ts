export interface Email {
    id: string;
    sender: {
        name: string;
        email: string;
        avatar?: string;
    };
    subject: string;
    snippet: string;
    body: string;
    date: string;
    read: boolean;
    urgencyScore: number;
    urgencyReason: string;
    labels: string[];
}

export const MOCK_EMAILS: Email[] = [
    {
        id: "1",
        sender: { name: "Google Cloud", email: "cloud-noreply@google.com" },
        subject: "Urgent: Your billing account has been suspended",
        snippet: "Action required: Your billing account XXXXXX has been suspended due to...",
        body: "Dear Customer, Your billing account has been suspended. Please update your payment method immediately to avoid service interruption.",
        date: "2024-03-10T10:00:00Z",
        read: false,
        urgencyScore: 10,
        urgencyReason: "Financial/Service Interruption Risk",
        labels: ["Inbox", "Important"],
    },
    {
        id: "2",
        sender: { name: "Sarah Connor", email: "sarah@resistance.net" },
        subject: "Project Skynet Update - Phase 1 Complete",
        snippet: "Hey team, just wanted to let you know that Phase 1 is wrapped up...",
        body: "Hey team, just wanted to let you know that Phase 1 is wrapped up. We encountered a few T-800s but handled them. Lets sync tomorrow.",
        date: "2024-03-10T09:30:00Z",
        read: true,
        urgencyScore: 4,
        urgencyReason: "Project Update, Routine Sync",
        labels: ["Inbox"],
    },
    {
        id: "3",
        sender: { name: "Marketing Team", email: "newsletter@company.com" },
        subject: "March Newsletter: Trends in AI",
        snippet: "Check out the latest trends in Artificial Intelligence for March...",
        body: "Hi everyone, here are the top AI trends for March. Generative AI is taking over...",
        date: "2024-03-09T14:00:00Z",
        read: false,
        urgencyScore: 1,
        urgencyReason: "Newsletter, Informational",
        labels: ["Promotions"],
    },
    {
        id: "4",
        sender: { name: "Client: Acme Corp", email: "alice@acme.com" },
        subject: "Feedback on the latest design delivery",
        snippet: "We reviewed the designs and have a few requested changes...",
        body: "Hi, thanks for the delivery. We love the direction but have a few comments on the color palette. See attached.",
        date: "2024-03-09T11:20:00Z",
        read: true,
        urgencyScore: 7,
        urgencyReason: "Client Feedback, Actionable",
        labels: ["Inbox", "Work"],
    },
];
