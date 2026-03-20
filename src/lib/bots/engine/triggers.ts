/**
 * Email Bots System - Trigger Evaluation Engine
 * 
 * Evaluates bot triggers against email events to determine
 * if a bot should be activated.
 */

import type {
    BotTrigger,
    EmailEvent,
    EmailFromSenderConfig,
    EmailContainsKeywordConfig,
    EmailContainsMultipleKeywordsConfig,
    EmailContainsSentimentConfig,
    EmailWithAttachmentConfig,
    UrgencyThresholdConfig,
    TimeBasedConfig,
    PreviousActionCompletedConfig,
} from '../types';
import { analyzeEmailContext } from '@/ai/flows/context-analyzer';

// ============================================================================
// Main Trigger Evaluator
// ============================================================================

/**
 * Evaluate if a trigger matches the given email event
 */
export async function evaluateTrigger(
    trigger: BotTrigger,
    event: EmailEvent
): Promise<boolean> {
    switch (trigger.type) {
        case 'new_email_received':
            return evaluateNewEmailReceived(event);

        case 'email_from_sender':
            return evaluateEmailFromSender(trigger.config as EmailFromSenderConfig, event);

        case 'email_contains_keyword':
            return evaluateEmailContainsKeyword(trigger.config as EmailContainsKeywordConfig, event);

        case 'email_contains_multiple_keywords':
            return evaluateEmailContainsMultipleKeywords(trigger.config as EmailContainsMultipleKeywordsConfig, event);

        case 'email_contains_sentiment':
            return await evaluateEmailContainsSentiment(trigger.config as EmailContainsSentimentConfig, event);

        case 'email_with_attachment':
            return evaluateEmailWithAttachment(trigger.config as EmailWithAttachmentConfig, event);

        case 'time_based':
            return evaluateTimeBased(trigger.config as TimeBasedConfig, event);
            if (event.type === 'thread_check' && (event as any).inactiveDuration) {
                const config = trigger.config as any; // Type lazily
                // Logic would be here if we unify proactive/reactive
                return true;
            }
            return false;

        case 'external_webhook':
            // Webhooks are triggered externally, not via email events
            return false;

        case 'previous_action_completed':
            // Evaluated when an action completes
            if (event.type === 'action_completed') {
                return evaluatePreviousActionCompleted(trigger.config as PreviousActionCompletedConfig, event);
            }
            return false;

        case 'order_status_changed':
            // Assumes event.type === 'webhook' and payload contains order info
            if (event.type === 'webhook') {
                return evaluateOrderStatusChanged(trigger.config as any, event);
            }
            return false;

        case 'refund_requested':
            if (event.type === 'webhook') {
                return evaluateRefundRequested(trigger.config as any, event);
            }
            return false;

        case 'thread_topic_changed':
            // Requires AI analysis of thread history. 
            // We assume the event has thread history context or we fetch it?
            // For MVP, we'll assume the event contains `previousContext` or `messages`.
            // Realistically, this needs to be fetched.
            // But `triggers.ts` is synchronous-ish (async marked).
            if (event.threadId) {
                return await evaluateThreadTopicChanged(trigger.config as any, event);
            }
            return false;

        default:
            return false;
    }
}

// Stubs for missing evaluators
function evaluateOrderStatusChanged(config: any, event: EmailEvent): boolean { return false; }
function evaluateRefundRequested(config: any, event: EmailEvent): boolean { return false; }
async function evaluateThreadTopicChanged(config: any, event: EmailEvent): Promise<boolean> { return false; }

// ============================================================================
// Individual Trigger Evaluators
// ============================================================================

/**
 * Trigger: new_email_received
 * Always fires for new emails
 */
function evaluateNewEmailReceived(event: EmailEvent): boolean {
    return event.type === 'new_email';
}

/**
 * Trigger: email_from_sender
 * Fires when email is from specific sender(s)
 */
function evaluateEmailFromSender(
    config: EmailFromSenderConfig,
    event: EmailEvent
): boolean {
    const { senderEmails, matchMode } = config;
    const senderEmail = event.sender.email.toLowerCase();

    return senderEmails.some(pattern => {
        const patternLower = pattern.toLowerCase();

        switch (matchMode) {
            case 'exact':
                return senderEmail === patternLower;

            case 'contains':
                return senderEmail.includes(patternLower);

            case 'domain':
                // Extract domain from pattern (e.g., '@company.com' or 'company.com')
                const domain = patternLower.replace(/^@/, '');
                return senderEmail.endsWith(`@${domain}`);

            default:
                return false;
        }
    });
}

/**
 * Trigger: email_contains_keyword
 * Fires when email subject/body contains keyword(s)
 */
function evaluateEmailContainsKeyword(
    config: EmailContainsKeywordConfig,
    event: EmailEvent
): boolean {
    const { keywords, searchIn } = config;
    const searchText = getSearchText(event, searchIn);

    return keywords.some(keyword =>
        searchText.includes(keyword.toLowerCase())
    );
}

/**
 * Trigger: email_contains_multiple_keywords
 */
function evaluateEmailContainsMultipleKeywords(
    config: EmailContainsMultipleKeywordsConfig,
    event: EmailEvent
): boolean {
    const { keywords, searchIn, matchAll } = config;
    const searchText = getSearchText(event, searchIn);

    if (matchAll) {
        // AND logic
        return keywords.every(keyword => searchText.includes(keyword.toLowerCase()));
    } else {
        // OR logic (same as simple keyword trigger)
        return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    }
}

/**
 * Trigger: email_contains_sentiment
 * Uses AI to analyze sentiment
 */
async function evaluateEmailContainsSentiment(
    config: EmailContainsSentimentConfig,
    event: EmailEvent
): Promise<boolean> {
    try {
        const analysis = await analyzeEmailContext({
            subject: event.subject,
            body: event.body || event.snippet || '',
        });

        // Check sentiment match
        if (analysis.sentiment !== config.sentiment) return false;

        // Check confidence
        if (config.minConfidence && analysis.confidence < config.minConfidence) return false;

        return true;
    } catch (err) {
        console.error("AI Sentiment analysis failed:", err);
        return false; // Fail safe
    }
}

/**
 * Trigger: email_with_attachment
 * Fires when email has attachments
 */
function evaluateEmailWithAttachment(
    config: EmailWithAttachmentConfig,
    event: EmailEvent
): boolean {
    const hasAttachment = event.hasAttachment ?? false;
    const attachmentCount = event.attachmentCount ?? 0;

    if (!hasAttachment) {
        return false;
    }

    if (config.minAttachments && attachmentCount < config.minAttachments) {
        return false;
    }

    // Note: fileTypes filtering would require actual attachment metadata
    // which may not be available in the event. Implement when needed.

    return true;
}

/**
 * Trigger: urgency_threshold
 * Fires when AI urgency score meets threshold
 */
function evaluateUrgencyThreshold(
    config: UrgencyThresholdConfig,
    event: EmailEvent
): boolean {
    const urgencyScore = event.urgencyScore ?? 0;
    return urgencyScore >= config.minScore;
}

/**
 * Trigger: time_based
 * Fires based on time constraints
 */
function evaluateTimeBased(
    config: TimeBasedConfig,
    event: EmailEvent
): boolean {
    const now = new Date();
    const emailDate = new Date(event.date);

    // Check delay
    if (config.delayMinutes) {
        const minutesSinceEmail = (now.getTime() - emailDate.getTime()) / 60000;
        if (minutesSinceEmail < config.delayMinutes) {
            return false; // Too soon
        }
    }

    // Check business hours
    if (config.businessHoursOnly || config.invertBusinessHours) {
        const isBusinessHours = checkBusinessHours(now);

        if (config.invertBusinessHours) {
            // Fire OUTSIDE business hours
            return !isBusinessHours;
        } else {
            // Fire INSIDE business hours
            return isBusinessHours;
        }
    }

    // Note: schedule (cron) would require external scheduling system
    // Implement when adding cron support

    return true;
}

/**
 * Trigger: previous_action_completed
 */
function evaluatePreviousActionCompleted(
    config: PreviousActionCompletedConfig,
    event: EmailEvent
): boolean {
    // We assume event.metadata contains info about the completed action
    const metadata = (event as any).metadata || {};

    // Check if the completed action matches config
    if (metadata.actionType !== config.actionType) return false;

    // Ideally check botId too, but that might be implicit
    return true;
}

// ============================================================================
// Helpers
// ============================================================================

function getSearchText(event: EmailEvent, searchIn: 'subject' | 'body' | 'both'): string {
    switch (searchIn) {
        case 'subject':
            return event.subject.toLowerCase();
        case 'body':
            return (event.body || event.snippet || '').toLowerCase();
        case 'both':
            return `${event.subject} ${event.body || event.snippet || ''}`.toLowerCase();
        default:
            return '';
    }
}

/**
 * Check if current time is within business hours
 * Business hours: Mon-Fri, 9am-5pm (local time)
 */
export function checkBusinessHours(date: Date = new Date()): boolean {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();

    // Weekend check
    if (day === 0 || day === 6) {
        return false;
    }

    // Hour check (9am-5pm)
    if (hour < 9 || hour >= 17) {
        return false;
    }

    return true;
}

