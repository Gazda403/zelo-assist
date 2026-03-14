/**
 * Email Bots System - Condition Evaluation Engine
 * 
 * Evaluates bot conditions against email events.
 * All conditions use AND logic - all must pass for bot to execute.
 */

import type {
    BotCondition,
    EmailEvent,
    SenderIsInternalConfig,
    SenderEmailMatchesConfig,
    SubjectContainsConfig,
    BodyContainsConfig,
    UrgencyScoreGteConfig,
    ReceivedWithinConfig,
    HasAttachmentConfig,
    ThreadCountGteConfig,
    ExcludeAutomatedConfig,
} from '../types';

// ============================================================================
// Main Condition Evaluator
// ============================================================================

/**
 * Evaluate all conditions (AND logic - all must pass)
 */
export function evaluateConditions(
    conditions: BotCondition[],
    event: EmailEvent
): boolean {
    if (conditions.length === 0) {
        return true; // No conditions = always pass
    }

    return conditions.every(condition => evaluateCondition(condition, event));
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(
    condition: BotCondition,
    event: EmailEvent
): boolean {
    switch (condition.type) {
        case 'sender_is_internal':
            return evaluateSenderIsInternal(condition.config as SenderIsInternalConfig, event);

        case 'sender_email_matches':
            return evaluateSenderEmailMatches(condition.config as SenderEmailMatchesConfig, event);

        case 'subject_contains':
            return evaluateSubjectContains(condition.config as SubjectContainsConfig, event);

        case 'body_contains':
            return evaluateBodyContains(condition.config as BodyContainsConfig, event);

        case 'urgency_score_gte':
            return evaluateUrgencyScoreGte(condition.config as UrgencyScoreGteConfig, event);

        case 'email_is_unread':
            return evaluateEmailIsUnread(event);

        case 'received_within':
            return evaluateReceivedWithin(condition.config as ReceivedWithinConfig, event);

        case 'has_attachment':
            return evaluateHasAttachment(condition.config as HasAttachmentConfig, event);

        case 'thread_count_gte':
            return evaluateThreadCountGte(condition.config as ThreadCountGteConfig, event);

        case 'exclude_automated':
            return evaluateExcludeAutomated(condition.config as ExcludeAutomatedConfig, event);

        default:
            console.warn(`Unknown condition type: ${(condition as any).type}`);
            return false;
    }
}

// ============================================================================
// Individual Condition Evaluators
// ============================================================================

/**
 * Condition: sender_is_internal
 * Check if sender email domain matches org domain
 */
function evaluateSenderIsInternal(
    config: SenderIsInternalConfig,
    event: EmailEvent
): boolean {
    const senderEmail = event.sender.email.toLowerCase();
    const domain = config.domain.toLowerCase();

    return senderEmail.endsWith(`@${domain}`);
}

/**
 * Condition: sender_email_matches
 * Check if sender email matches pattern
 */
function evaluateSenderEmailMatches(
    config: SenderEmailMatchesConfig,
    event: EmailEvent
): boolean {
    const senderEmail = event.sender.email.toLowerCase();
    const pattern = config.pattern.toLowerCase();

    switch (config.matchType) {
        case 'exact':
            return senderEmail === pattern;

        case 'contains':
            return senderEmail.includes(pattern);

        case 'regex':
            try {
                const regex = new RegExp(pattern, 'i'); // Case-insensitive
                return regex.test(senderEmail);
            } catch (error) {
                console.error(`Invalid regex pattern: ${pattern}`, error);
                return false;
            }

        default:
            return false;
    }
}

/**
 * Condition: subject_contains
 * Check if subject contains keyword(s)
 */
function evaluateSubjectContains(
    config: SubjectContainsConfig,
    event: EmailEvent
): boolean {
    const subject = event.subject.toLowerCase();
    const { keywords, matchAll = false } = config;

    if (matchAll) {
        // AND logic - all keywords must be present
        return keywords.every(kw => subject.includes(kw.toLowerCase()));
    } else {
        // OR logic - at least one keyword must be present
        return keywords.some(kw => subject.includes(kw.toLowerCase()));
    }
}

/**
 * Condition: body_contains
 * Check if email body contains keyword(s)
 */
function evaluateBodyContains(
    config: BodyContainsConfig,
    event: EmailEvent
): boolean {
    const body = (event.body || event.snippet || '').toLowerCase();
    const { keywords, matchAll = false } = config;

    if (matchAll) {
        return keywords.every(kw => body.includes(kw.toLowerCase()));
    } else {
        return keywords.some(kw => body.includes(kw.toLowerCase()));
    }
}

/**
 * Condition: urgency_score_gte
 * Check if AI urgency score meets threshold
 */
function evaluateUrgencyScoreGte(
    config: UrgencyScoreGteConfig,
    event: EmailEvent
): boolean {
    const urgencyScore = event.urgencyScore ?? 0;
    return urgencyScore >= config.threshold;
}

/**
 * Condition: email_is_unread
 * Check if email is unread
 */
function evaluateEmailIsUnread(event: EmailEvent): boolean {
    return !event.read;
}

/**
 * Condition: received_within
 * Check if email was received within last X minutes
 */
function evaluateReceivedWithin(
    config: ReceivedWithinConfig,
    event: EmailEvent
): boolean {
    const now = new Date();
    const emailDate = new Date(event.date);
    const minutesAgo = (now.getTime() - emailDate.getTime()) / 60000;

    return minutesAgo <= config.minutes;
}

/**
 * Condition: has_attachment
 * Check if email has attachments
 */
function evaluateHasAttachment(
    config: HasAttachmentConfig,
    event: EmailEvent
): boolean {
    const hasAttachment = event.hasAttachment ?? false;
    return config.required ? hasAttachment : !hasAttachment;
}

/**
 * Condition: thread_count_gte
 * Check if email thread has minimum number of messages
 * Note: Requires thread metadata which may not be available initially
 */
function evaluateThreadCountGte(
    config: ThreadCountGteConfig,
    event: EmailEvent
): boolean {
    // Placeholder: thread count would need to be fetched from Gmail API
    // For now, always return true (to be implemented later)
    console.warn('thread_count_gte condition not fully implemented yet');
    return true;
}

/**
 * Condition: exclude_automated
 * Check if email appears to be automated or from a no-reply address
 */
function evaluateExcludeAutomated(
    config: ExcludeAutomatedConfig,
    event: EmailEvent
): boolean {
    const senderEmail = event.sender.email.toLowerCase();
    const senderName = event.sender.name.toLowerCase();

    // 1. Check Sender Address common patterns
    const automatedPatterns = [
        'no-reply', 'noreply', 'donotreply', 'mailer-daemon', 'postmaster',
        'automated', 'notification', 'alert', 'newsletter', 'digest',
        'marketing', 'sales@', 'info@', 'contact@', 'support@', 'hello@' // generic
    ];

    if (automatedPatterns.some(p => senderEmail.includes(p))) {
        return false; // It IS automated/generic (Condition fails to pass because we EXCLUDE automated)
    }

    // 2. Check Sender Name
    if (senderName.includes('marketing') || senderName.includes('newsletter')) {
        return false;
    }

    // 3. Check Headers (if available in payload)
    if (event.payload && event.payload.payload && event.payload.payload.headers) {
        const headers = event.payload.payload.headers as any[];

        const autoSubmitted = headers.find(h => h.name.toLowerCase() === 'auto-submitted');
        if (autoSubmitted && autoSubmitted.value.toLowerCase() !== 'no') {
            return false;
        }

        const listUnsubscribe = headers.find(h => h.name.toLowerCase() === 'list-unsubscribe');
        if (listUnsubscribe) {
            return false;
        }

        const precedence = headers.find(h => h.name.toLowerCase() === 'precedence');
        if (precedence && ['bulk', 'list', 'junk'].includes(precedence.value.toLowerCase())) {
            return false;
        }
    }

    return true; // Not automated
}
