/**
 * Email Bots System - Bot Templates
 * 
 * Predefined bot configurations users can clone and customize.
 * These serve as starting points for common automation scenarios.
 */

import type { EmailBot } from './types';

// Helper to create bot templates (omitting runtime-generated fields)
type BotTemplate = Omit<EmailBot, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const BOT_TEMPLATES: Record<string, BotTemplate> = {
    customer_support_auto_reply: {
        name: 'Customer Support Auto-Reply',
        description: 'Automatically create draft replies for customer support emails',
        enabled: false, // Disabled by default for safety
        isPremium: false,

        trigger: {
            type: 'email_contains_keyword',
            config: {
                keywords: ['help', 'issue', 'support', 'problem', 'question'],
                searchIn: 'subject',
            },
        },

        conditions: [
            {
                type: 'received_within',
                config: { minutes: 60 },
            },
        ],

        actions: [
            {
                type: 'create_draft',
                config: { tone: 'professional' },
            },
            {
                type: 'apply_label',
                config: { labelName: 'Support/Auto-Drafted', createIfMissing: true },
            },
            {
                type: 'notify_user',
                config: {
                    message: 'Draft prepared for customer support inquiry from {{sender}}',
                    priority: 'low',
                },
            },
        ],

        safety: {
            autoSendEnabled: false, // Drafts only - safe default
            maxSendsPerDay: 50,
            cooldownMinutes: 30,
            loopPrevention: true,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    invoice_receipt_organizer: {
        name: 'Invoice/Receipt Organizer',
        description: 'Automatically file and label financial documents (invoices, receipts, payments).',
        enabled: false,
        isPremium: false,

        trigger: {
            type: 'email_contains_keyword',
            config: {
                keywords: ['invoice', 'receipt', 'payment confirmed', 'order summary', 'billing'],
                searchIn: 'both',
            },
        },

        conditions: [],

        actions: [
            {
                type: 'apply_label',
                config: { labelName: 'Invoices & Receipts', createIfMissing: true },
            },
            {
                type: 'mark_as_read',
                config: {},
            },
        ],

        safety: {
            autoSendEnabled: false,
            maxSendsPerDay: 0,
            cooldownMinutes: 0,
            loopPrevention: false,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    sales_inquiry_handler: {
        name: 'Sales Inquiry Handler',
        description: 'Auto-reply to emails about pricing, quotes, or demos with calendar link',
        enabled: false,
        isPremium: true, // Auto-send requires premium

        trigger: {
            type: 'email_contains_keyword',
            config: {
                keywords: ['pricing', 'quote', 'demo', 'trial', 'sales'],
                searchIn: 'both',
            },
        },

        conditions: [
            {
                type: 'email_is_unread',
                config: {},
            },
            {
                type: 'urgency_score_gte',
                config: { threshold: 6 },
            },
        ],

        actions: [
            {
                type: 'reply_with_template',
                config: {
                    templateId: 'sales_inquiry',
                    variables: {
                        calendarLink: 'https://cal.com/yourname',
                    },
                },
            },
            {
                type: 'notify_user',
                config: {
                    message: 'Sales inquiry from {{sender}} - auto-replied with calendar link',
                    priority: 'high',
                },
            },
            {
                type: 'apply_label',
                config: { labelName: 'Sales/Auto-Replied', createIfMissing: true },
            },
        ],

        safety: {
            autoSendEnabled: true, // Requires terms acceptance
            maxSendsPerDay: 20,
            cooldownMinutes: 120, // 2 hours between responses to same sender
            loopPrevention: true,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    out_of_office_responder: {
        name: 'Out-of-Office Responder',
        description: 'Auto-reply during non-business hours or vacation',
        enabled: false,
        isPremium: false,

        trigger: {
            type: 'time_based',
            config: {
                businessHoursOnly: false,
                invertBusinessHours: true, // Fire OUTSIDE 9-5 Mon-Fri
            },
        },

        conditions: [
            {
                type: 'email_is_unread',
                config: {},
            },
        ],

        actions: [
            {
                type: 'reply_with_template',
                config: {
                    templateId: 'out_of_office',
                    variables: {
                        returnDate: '2026-02-15',
                        backupContact: 'team@company.com',
                    },
                },
            },
            {
                type: 'mark_as_read',
                config: {},
            },
        ],

        safety: {
            autoSendEnabled: true,
            maxSendsPerDay: 100, // High limit for OOO
            cooldownMinutes: 1440, // 24 hours (send once per sender per day)
            loopPrevention: true,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    high_urgency_notifier: {
        name: 'High Urgency Email Notifier',
        description: 'Get notified immediately when high-urgency emails arrive',
        enabled: false,
        isPremium: false,

        trigger: {
            type: 'urgency_threshold',
            config: {
                minScore: 8, // Only urgent emails (8-10)
            },
        },

        conditions: [
            {
                type: 'email_is_unread',
                config: {},
            },
        ],

        actions: [
            {
                type: 'notify_user',
                config: {
                    message: 'High-urgency email from {{sender}}: {{subject}}',
                    priority: 'high',
                },
            },
            {
                type: 'apply_label',
                config: { labelName: 'Urgent', createIfMissing: true },
            },
        ],

        safety: {
            autoSendEnabled: false, // No sending
            maxSendsPerDay: 0,
            cooldownMinutes: 0,
            loopPrevention: false,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    generic_reply_bot: {
        name: 'Auto-Acknowledgment Bot',
        description: 'Automatically sends acknowledgment emails to new senders, like government or corporate auto-replies.',
        enabled: false,
        isPremium: false,

        trigger: {
            type: 'new_email_received',
            config: {},
        },

        conditions: [
            {
                type: 'exclude_automated',
                config: {},
            },
            {
                type: 'email_is_unread',
                config: {},
            },
        ],

        actions: [
            {
                type: 'auto_send_email',
                config: {
                    tone: 'professional',
                    acknowledgmentTemplate: {
                        id: 'professional_acknowledgment',
                        name: 'Professional Acknowledgment',
                        subject: 'Re: {{subject}}',
                        body: 'Dear {{sender_name}},\n\nThank you for your email regarding "{{subject}}".\n\nWe have received your message and it has been added to our queue. We typically respond to inquiries within {{response_time}}.\n\nBest regards,\n{{your_name}}\n{{organization}}',
                        variables: [
                            { key: 'response_time', label: 'Response Time', defaultValue: '3-5 business days' },
                            { key: 'your_name', label: 'Your Name', defaultValue: 'The Team' },
                            { key: 'organization', label: 'Organization', defaultValue: '' }
                        ],
                        enabled: true
                    }
                }
            },
            {
                type: 'mark_as_read',
                config: {},
            },
        ],

        safety: {
            autoSendEnabled: true,
            maxSendsPerDay: 50,
            cooldownMinutes: 60,
            loopPrevention: true,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    newsletter_auto_archiver: {
        name: 'Newsletter Auto-Archiver',
        description: 'Automatically organize newsletters and mark as read',
        enabled: false,
        isPremium: false,

        trigger: {
            type: 'email_contains_keyword',
            config: {
                keywords: ['unsubscribe', 'newsletter', 'digest', 'weekly update'],
                searchIn: 'body',
            },
        },

        conditions: [],

        actions: [
            {
                type: 'apply_label',
                config: { labelName: 'Newsletters', createIfMissing: true },
            },
            {
                type: 'mark_as_read',
                config: {},
            },
        ],

        safety: {
            autoSendEnabled: false, // No sending
            maxSendsPerDay: 0,
            cooldownMinutes: 0,
            loopPrevention: false,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },

    follow_up_bot: {
        name: 'Follow-Up Assistant',
        description: 'Automatically follows up on sent emails if no reply is received.',
        enabled: false,
        isPremium: true,

        trigger: {
            type: 'outgoing_email_sent',
            config: {
                excludeDomains: ['gmail.com', 'yahoo.com', 'hotmail.com'], // Default exclusions
                excludeKeywords: ['unsubscribe', 'no-reply', 'marketing'],
            },
        },

        followUpConfig: {
            enabled: true,
            mode: 'auto',
            settings: {
                delayValue: 3,
                delayUnit: 'days',
                businessHoursOnly: true,
                excludeDomains: [],
                excludeKeywords: [],
                smartDelay: true, // Enabled by default
            }
        },

        conditions: [],

        actions: [], // Actions are handled by the monitoring engine

        safety: {
            autoSendEnabled: true,
            maxSendsPerDay: 50,
            cooldownMinutes: 60,
            loopPrevention: true,
        },

        stats: {
            totalExecutions: 0,
            successCount: 0,
            failureCount: 0,
            emailsSent: 0,
            draftsCreated: 0,
        },
    },
};

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): BotTemplate | null {
    return BOT_TEMPLATES[templateId] || null;
}

/**
 * Get all template IDs and metadata
 */
export function getAllTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    isPremium: boolean;
}> {
    return Object.entries(BOT_TEMPLATES).map(([id, template]) => ({
        id,
        name: template.name,
        description: template.description || '',
        isPremium: template.isPremium,
    }));
}

const TEMPLATE_CONTENTS: Record<string, string> = {
    sales_inquiry: "Hi {{sender_name}},\n\nThank you for getting in touch with us regarding your interest!\n\nTo ensure we can address all your questions effectively, I'd love to hop on a quick call. You can find a time that works best for you here: {{calendarLink}}\n\nLooking forward to speaking with you.\n\nBest regards,\n[Your Name]\n[Your Company]",
    out_of_office: "Hello,\n\nThank you for your message. Please note that I am currently out of the office and will have limited access to email until {{returnDate}}.\n\nIf your request is urgent, please reach out to {{backupContact}} for immediate assistance. Otherwise, I will review your email upon my return.\n\nBest regards,\n[Your Name]",
    generic_auto_reply: "Hi {{sender_name}},\n\nThank you for reaching out regarding \"{{subject_reference}}\".\n\nWe have received your message and our team is currently reviewing it. We will get back to you shortly with an update.\n\nBest regards,\n[Your Name]\n[Your Company]",
};

/**
 * Get populated template content
 */
export function getTemplateContent(templateId: string, variables: Record<string, any> = {}): string {
    let content = TEMPLATE_CONTENTS[templateId];

    if (!content) {
        return `[Template '${templateId}' not found]`;
    }

    for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return content;
}
