/**
 * Email Template Library
 * 
 * Predefined email templates for bot actions
 */

interface EmailTemplate {
    id: string;
    name: string;
    subject?: string; // Optional custom subject
    body: string;
    variables?: string[]; // List of supported variables
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
    out_of_office: {
        id: 'out_of_office',
        name: 'Out of Office',
        subject: 'Out of Office Auto-Reply',
        body: `Thank you for your email.

I am currently out of the office and will have limited access to email. I will return on {{returnDate}} and will respond to your message as soon as possible.

If you need immediate assistance, please contact {{backupContact}}.

Best regards`,
        variables: ['returnDate', 'backupContact'],
    },

    customer_support_ack: {
        id: 'customer_support_ack',
        name: 'Customer Support Acknowledgment',
        body: `Dear {{sender}},

Thank you for contacting us. We've received your message regarding "{{subject}}" and our team is reviewing it.

We aim to respond to all inquiries within 24 hours. If your matter is urgent, please reply with "URGENT" in the subject line.

Best regards,
Support Team`,
        variables: [],
    },

    sales_inquiry: {
        id: 'sales_inquiry',
        name: 'Sales Inquiry Response',
        body: `Hi {{sender}},

Thank you for your interest in our products/services!

I'd love to learn more about your needs. Would you be available for a quick call this week? You can book a time that works for you here: {{calendarLink}}

Alternatively, feel free to reply with any questions and I'll get back to you right away.

Looking forward to connecting!

Best regards`,
        variables: ['calendarLink'],
    },

    meeting_request: {
        id: 'meeting_request',
        name: 'Meeting Request Response',
        body: `Hi {{sender}},

Thanks for reaching out about a meeting.

You can view my availability and schedule a time here: {{calendarLink}}

If none of those times work, please let me know your preferred times and I'll do my best to accommodate.

Best regards`,
        variables: ['calendarLink'],
    },

    newsletter_confirmation: {
        id: 'newsletter_confirmation',
        name: 'Newsletter Sign-up Confirmation',
        body: `Hi {{sender}},

Thanks for subscribing to our newsletter!

You'll receive updates about {{topics}} directly to your inbox. We typically send emails {{frequency}}.

If you ever want to unsubscribe, there's a link at the bottom of every email.

Welcome aboard!

Best regards`,
        variables: ['topics', 'frequency'],
    },
};
