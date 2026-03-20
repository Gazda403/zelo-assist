/**
 * Default Acknowledgment Templates
 * 
 * Pre-built templates for auto-acknowledgment emails
 */

import { AcknowledgmentTemplate } from '../types';

export const DEFAULT_ACKNOWLEDGMENT_TEMPLATES: Record<string, AcknowledgmentTemplate> = {
    professional_acknowledgment: {
        id: 'professional_acknowledgment',
        name: 'Professional Acknowledgment',
        subject: 'Re: {{subject}}',
        body: `Dear {{sender_name}},

Thank you for your email regarding "{{subject}}".

We have received your message and it has been added to our queue. We typically respond to inquiries within {{response_time}}.

{{faq_section}}

{{useful_link}}

If your matter is urgent, please reply with "URGENT" in the subject line.

Best regards,
{{your_name}}
{{organization}}`,
        variables: [
            {
                key: 'response_time',
                label: 'Expected Response Time',
                defaultValue: '3-5 business days',
                description: 'How long until you typically respond'
            },
            {
                key: 'your_name',
                label: 'Your Name',
                defaultValue: 'Support Team',
                description: 'Name to sign off with'
            },
            {
                key: 'organization',
                label: 'Organization',
                defaultValue: '',
                description: 'Company or organization name (optional)'
            },
            {
                key: 'faq_section',
                label: 'FAQ Section',
                defaultValue: '',
                description: 'Optional FAQ or additional information (optional)'
            },
            {
                key: 'useful_link',
                label: 'Useful Link',
                defaultValue: '',
                description: 'Any link you want to share (optional)'
            }
        ],
        enabled: true,
    },

    casual_acknowledgment: {
        id: 'casual_acknowledgment',
        name: 'Casual Acknowledgment',
        subject: 'Got your message!',
        body: `Hi {{sender_name}},

Thanks for reaching out! I got your email about "{{subject}}".

I'll get back to you within {{response_time}}. In the meantime, feel free to check out {{resource_link}} if you need quick answers.

{{useful_link}}

Cheers,
{{your_name}}`,
        variables: [
            {
                key: 'response_time',
                label: 'Expected Response Time',
                defaultValue: '24-48 hours',
            },
            {
                key: 'your_name',
                label: 'Your Name',
                defaultValue: 'The Team',
            },
            {
                key: 'resource_link',
                label: 'Resource Link',
                defaultValue: 'our FAQ page',
                description: 'Link to help docs or FAQ (optional)'
            },
            {
                key: 'useful_link',
                label: 'Useful Link',
                defaultValue: '',
                description: 'Any link you want to share (optional)'
            }
        ],
        enabled: true,
    },

    government_style: {
        id: 'government_style',
        name: 'Government/Formal Acknowledgment',
        subject: 'Acknowledgment of Receipt - {{reference_number}}',
        body: `Dear {{sender_name}},

This is to acknowledge receipt of your communication dated {{email_date}} regarding: {{subject}}.

Your inquiry has been assigned reference number: {{reference_number}}.

We will review your submission and respond within {{response_time}}. Please reference this number in any future correspondence.

For frequently asked questions, please visit: {{faq_link}}

{{useful_link}}

Sincerely,
{{department_name}}
{{organization}}`,
        variables: [
            {
                key: 'reference_number',
                label: 'Reference Number',
                defaultValue: 'AUTO-{{timestamp}}',
                description: 'Unique reference ID for tracking'
            },
            {
                key: 'response_time',
                label: 'Expected Response Time',
                defaultValue: '10 business days',
            },
            {
                key: 'department_name',
                label: 'Department Name',
                defaultValue: 'Customer Relations',
            },
            {
                key: 'organization',
                label: 'Organization Name',
                defaultValue: '',
            },
            {
                key: 'faq_link',
                label: 'FAQ Link',
                defaultValue: 'https://example.com/faq',
                description: 'Link to FAQ or help resources'
            },
            {
                key: 'useful_link',
                label: 'Useful Link',
                defaultValue: '',
                description: 'Any link you want to share (optional)'
            }
        ],
        enabled: true,
    },

    support_ticket: {
        id: 'support_ticket',
        name: 'Support Ticket Acknowledgment',
        subject: 'Support Ticket Created - #{{ticket_number}}',
        body: `Hello {{sender_name}},

Your support ticket has been created successfully.

Ticket #: {{ticket_number}}
Subject: {{subject}}
Priority: {{priority}}
Status: Open

Our support team will review your request and respond within {{response_time}}.

You can track the status of your ticket at: {{ticket_tracking_link}}

Common Questions:
{{common_qa}}

{{useful_link}}

Thank you for contacting support.

Best regards,
{{support_team_name}}`,
        variables: [
            {
                key: 'ticket_number',
                label: 'Ticket Number',
                defaultValue: 'AUTO-{{timestamp}}',
            },
            {
                key: 'priority',
                label: 'Default Priority',
                defaultValue: 'Normal',
            },
            {
                key: 'response_time',
                label: 'Expected Response Time',
                defaultValue: '24 hours',
            },
            {
                key: 'support_team_name',
                label: 'Support Team Name',
                defaultValue: 'Support Team',
            },
            {
                key: 'ticket_tracking_link',
                label: 'Ticket Tracking Link',
                defaultValue: '',
                description: 'Link to ticket tracking system (optional)'
            },
            {
                key: 'common_qa',
                label: 'Common Q&A',
                defaultValue: '',
                description: 'FAQ section (optional)'
            },
            {
                key: 'useful_link',
                label: 'Useful Link',
                defaultValue: '',
                description: 'Any link you want to share (optional)'
            }
        ],
        enabled: true,
    }
};

/**
 * Get default template by ID
 */
export function getDefaultAcknowledgmentTemplate(templateId: string): AcknowledgmentTemplate | null {
    return DEFAULT_ACKNOWLEDGMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all default templates
 */
export function getAllDefaultAcknowledgmentTemplates(): AcknowledgmentTemplate[] {
    return Object.values(DEFAULT_ACKNOWLEDGMENT_TEMPLATES);
}

/**
 * Substitute variables in template
 */
export function substituteTemplateVariables(
    template: string,
    variables: Record<string, string>,
    emailContext?: {
        subject?: string;
        senderName?: string;
        emailDate?: string;
    }
): string {
    let result = template;

    // Auto-fill email context variables
    if (emailContext) {
        if (emailContext.subject) {
            result = result.replace(/\{\{subject\}\}/g, emailContext.subject);
        }
        if (emailContext.senderName) {
            result = result.replace(/\{\{sender_name\}\}/g, emailContext.senderName);
        }
        if (emailContext.emailDate) {
            result = result.replace(/\{\{email_date\}\}/g, emailContext.emailDate);
        }
    }

    // Add timestamp for reference numbers
    const timestamp = Date.now().toString().slice(-8);
    result = result.replace(/\{\{timestamp\}\}/g, timestamp);

    // Substitute user-defined variables
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }

    // Remove any remaining unfilled optional variables (empty placeholders)
    result = result.replace(/\{\{[^}]+\}\}/g, '');

    return result;
}
