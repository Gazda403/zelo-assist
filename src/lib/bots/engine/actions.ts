/**
 * Email Bots System - Action Execution Engine
 * 
 * Executes bot actions when triggers and conditions are met.
 * All actions integrate with existing Gmail Secretary infrastructure.
 */

import type {
    BotAction,
    EmailEvent,
    EmailBot,
    ActionResult,
    CreateDraftConfig,
    AutoSendEmailConfig,
    ReplyWithTemplateConfig,
    ApplyLabelConfig,
    NotifyUserConfig,
    ForwardEmailConfig,
} from '../types';

// ============================================================================
// Main Action Executor
// ============================================================================

/**
 * Execute all actions in order
 * Returns array of results - failures don't stop execution
 */
export async function executeActions(
    actions: BotAction[],
    event: EmailEvent,
    bot: EmailBot,
    intent?: string
): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const action of actions) {
        try {
            const result = await executeAction(action, event, bot, intent);
            results.push(result);
        } catch (error: any) {
            console.error(`[Bot ${bot.id}] Action ${action.type} failed:`, error);
            results.push({
                type: action.type,
                success: false,
                error: error.message || 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Execute a single action
 */
async function executeAction(
    action: BotAction,
    event: EmailEvent,
    bot: EmailBot,
    intent?: string
): Promise<ActionResult> {
    switch (action.type) {
        case 'create_draft':
            return await executeCreateDraft(action.config as CreateDraftConfig, event, bot, intent);

        case 'auto_send_email':
            return await executeAutoSendEmail(action.config as AutoSendEmailConfig, event, bot, intent);

        case 'reply_with_template':
            return await executeReplyWithTemplate(action.config as ReplyWithTemplateConfig, event);

        case 'forward_email':
            return await executeForwardEmail(action.config as ForwardEmailConfig, event);

        case 'apply_label':
            return await executeApplyLabel(action.config as ApplyLabelConfig, event);

        case 'mark_as_read':
            return await executeMarkAsRead(event);

        case 'notify_user':
            return await executeNotifyUser(action.config as NotifyUserConfig, event, bot);

        case 'webhook_call':
            // Not implemented yet - placeholder
            return { type: 'webhook_call', success: false, error: 'Not implemented' };

        default:
            console.warn(`Unknown action type: ${(action as any).type}`);
            return {
                type: action.type,
                success: false,
                error: 'Unknown action type',
            };
    }
}

// ============================================================================
// Individual Action Executors
// ============================================================================

/**
 * Action: create_draft
 * Generate AI draft via existing draft generator
 */
async function executeCreateDraft(
    config: CreateDraftConfig,
    event: EmailEvent,
    bot: EmailBot,
    intent?: string
): Promise<ActionResult> {
    try {
        // Import server action dynamically to avoid circular dependencies
        const { generateDraftAction } = await import('@/app/actions/gmail');

        const result = await generateDraftAction(
            event.emailId,
            event.sender.name,
            event.sender.email,
            event.subject,
            event.body || event.snippet || '',
            bot.id,
            intent,
            bot.prompt
        );

        return {
            type: 'create_draft',
            success: true,
            data: {
                draft: result.draft,
                tone: result.tone,
            },
        };
    } catch (error: any) {
        return {
            type: 'create_draft',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: auto_send_email
 * Generate draft AND send it automatically
 */
async function executeAutoSendEmail(
    config: AutoSendEmailConfig,
    event: EmailEvent,
    bot: EmailBot,
    intent?: string
): Promise<ActionResult> {
    try {
        const { generateDraftAction, sendEmailAction } = await import('@/app/actions/gmail');
        const { substituteTemplateVariables } = await import('../templates/acknowledgment-templates');

        let body: string;
        let subject = config.subject || `Re: ${event.subject}`;

        if (config.acknowledgmentTemplate) {
            // Use predefined template with variable substitution
            const values = config.acknowledgmentTemplate.variables.reduce((acc, v) => ({
                ...acc,
                [v.key]: v.defaultValue
            }), {});

            body = substituteTemplateVariables(
                config.acknowledgmentTemplate.body,
                values,
                {
                    senderName: event.sender.name,
                    subject: event.subject,
                    emailDate: event.date?.toLocaleString() || new Date().toLocaleString()
                }
            );

            subject = substituteTemplateVariables(
                config.acknowledgmentTemplate.subject,
                values,
                {
                    senderName: event.sender.name,
                    subject: event.subject,
                    emailDate: event.date?.toLocaleString() || new Date().toLocaleString()
                }
            );
        } else {
            // Generate draft via AI
            const draftResult = await generateDraftAction(
                event.emailId,
                event.sender.name,
                event.sender.email,
                event.subject,
                event.body || event.snippet || '',
                bot.id,
                intent,
                bot.prompt
            );
            body = draftResult.draft;
        }

        // Send email
        await sendEmailAction(
            event.sender.email,
            subject,
            body
        );

        return {
            type: 'auto_send_email',
            success: true,
            data: {
                to: event.sender.email,
                subject,
                body,
                templateName: config.acknowledgmentTemplate?.name || 'AI Generated'
            },
        };
    } catch (error: any) {
        return {
            type: 'auto_send_email',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: reply_with_template
 * Send predefined template (no AI)
 */
async function executeReplyWithTemplate(
    config: ReplyWithTemplateConfig,
    event: EmailEvent
): Promise<ActionResult> {
    try {
        // Import templates
        const { EMAIL_TEMPLATES } = await import('../templates/email-templates');

        const template = EMAIL_TEMPLATES[config.templateId];

        if (!template) {
            throw new Error(`Template not found: ${config.templateId}`);
        }

        // Replace variables
        let body = template.body;
        if (config.variables) {
            Object.entries(config.variables).forEach(([key, value]) => {
                body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
        }

        // Replace standard variables
        body = body
            .replace(/{{sender}}/g, event.sender.name) // Legacy support
            .replace(/{{sender_name}}/g, event.sender.name) // New standard
            .replace(/{{senderEmail}}/g, event.sender.email)
            .replace(/{{subject}}/g, event.subject) // Legacy support
            .replace(/{{subject_reference}}/g, event.subject); // New standard

        // Send email
        const { sendEmailAction } = await import('@/app/actions/gmail');
        await sendEmailAction(
            event.sender.email,
            template.subject || `Re: ${event.subject}`,
            body
        );

        return {
            type: 'reply_with_template',
            success: true,
            data: {
                templateId: config.templateId,
                templateName: template.name || config.templateId,
                to: event.sender.email,
            },
        };
    } catch (error: any) {
        return {
            type: 'reply_with_template',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: forward_email
 * Forward the email to a specified address
 */
async function executeForwardEmail(
    config: ForwardEmailConfig,
    event: EmailEvent
): Promise<ActionResult> {
    try {
        const { forwardEmailAction } = await import('@/app/actions/gmail');

        await forwardEmailAction(
            event.emailId,
            config.to,
            event.subject,
            event.sender.name,
            event.date
        );

        return {
            type: 'forward_email',
            success: true,
            data: {
                to: config.to,
                emailId: event.emailId,
            },
        };
    } catch (error: any) {
        return {
            type: 'forward_email',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: apply_label
 * Add Gmail label to email
 * Note: Requires Gmail API integration
 */
async function executeApplyLabel(
    config: ApplyLabelConfig,
    event: EmailEvent
): Promise<ActionResult> {
    try {
        const { applyLabelAction } = await import('@/app/actions/gmail');
        await applyLabelAction(event.emailId, config.labelName);

        return {
            type: 'apply_label',
            success: true,
            data: {
                labelName: config.labelName,
                emailId: event.emailId,
            },
        };
    } catch (error: any) {
        return {
            type: 'apply_label',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: mark_as_read
 * Mark email as read
 * Note: Requires Gmail API integration
 */
async function executeMarkAsRead(
    event: EmailEvent
): Promise<ActionResult> {
    try {
        const { markAsReadAction } = await import('@/app/actions/gmail');
        await markAsReadAction(event.emailId);

        return {
            type: 'mark_as_read',
            success: true,
            data: {
                emailId: event.emailId,
            },
        };
    } catch (error: any) {
        return {
            type: 'mark_as_read',
            success: false,
            error: error.message,
        };
    }
}

/**
 * Action: notify_user
 * Create in-app notification
 */
async function executeNotifyUser(
    config: NotifyUserConfig,
    event: EmailEvent,
    bot: EmailBot
): Promise<ActionResult> {
    try {
        // Replace template variables in message
        let message = config.message
            .replace(/{{sender}}/g, event.sender.name)
            .replace(/{{senderEmail}}/g, event.sender.email)
            .replace(/{{subject}}/g, event.subject)
            .replace(/{{botName}}/g, bot.name);

        // Placeholder - would create in-app notification
        console.log(`[Bot] Notification: ${message} (Priority: ${config.priority || 'medium'})`);

        // TODO: Implement notification system
        // const { createNotification } = await import('@/lib/notifications');
        // await createNotification(bot.userId, message, config.priority);

        return {
            type: 'notify_user',
            success: true,
            data: {
                message,
                priority: config.priority || 'medium',
            },
        };
    } catch (error: any) {
        return {
            type: 'notify_user',
            success: false,
            error: error.message,
        };
    }
}
