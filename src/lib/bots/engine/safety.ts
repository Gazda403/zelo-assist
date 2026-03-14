/**
 * Email Bots System - Safety & Rate Limiting
 * 
 * Multi-layer protection against abuse, loops, and spam.
 */

import type {
    EmailBot,
    EmailEvent,
    SafetyResult,
} from '../types';
import { countSendsToday, getLastSentTo, getExecutionLogs } from '../storage';

// ============================================================================
// Main Safety Checker
// ============================================================================

/**
 * Check if bot execution is safe
 * Returns { allowed: true } or { allowed: false, reason: '...' }
 */
export async function checkSafety(
    bot: EmailBot,
    event: EmailEvent,
    intent?: string
): Promise<SafetyResult> {
    const { safety } = bot;

    const hasAutoSend = bot.actions.some(action =>
        action.type === 'auto_send_email' || action.type === 'reply_with_template'
    );

    if (hasAutoSend && safety.autoSendEnabled && !bot.acceptedTermsAt) {
        return {
            allowed: false,
            reason: 'Auto-send terms not accepted',
        };
    }

    if (hasAutoSend && safety.autoSendEnabled) {
        const todaySends = await countSendsToday(bot.id);

        if (todaySends >= safety.maxSendsPerDay) {
            return {
                allowed: false,
                reason: `Daily send limit reached (${safety.maxSendsPerDay})`,
            };
        }
    }

    if (safety.cooldownMinutes > 0 && hasAutoSend) {
        const lastSent = await getLastSentTo(bot.id, event.sender.email);

        if (lastSent) {
            const minutesSince = (Date.now() - lastSent.getTime()) / 60000;

            if (minutesSince < safety.cooldownMinutes) {
                const remaining = Math.ceil(safety.cooldownMinutes - minutesSince);
                return {
                    allowed: false,
                    reason: `Cooldown active (${remaining}m remaining)`,
                };
            }
        }
    }

    if (safety.loopPrevention) {
        const hasLoop = await detectLoop(bot.id, event);

        if (hasLoop) {
            return {
                allowed: false,
                reason: 'Loop detected - already replied to similar email recently',
            };
        }
    }

    if (hasAutoSend && safety.autoSendEnabled && safety.autoSendRules && safety.autoSendRules.length > 0 && intent) {
        const intentToRule: Record<string, string> = {
            'Order_Status': 'product_qa',
            'Return_Request': 'refunds',
            'Product_Inquiry': 'product_qa',
            'Shipping_Question': 'faq',
            'Complaint': 'customer_support',
            'FAQ': 'faq',
            'Hiring': 'hiring_talent',
            'User_Support': 'user_support',
            'Investor_Outreach': 'investor_outreach',
            'Cold_Sales': 'cold_sales'
        };

        const requiredRule = intentToRule[intent];
        if (requiredRule && !safety.autoSendRules?.includes(requiredRule)) {
            return {
                allowed: false,
                reason: `Auto-send not enabled for category: ${requiredRule} (Intent: ${intent})`,
            };
        }
    }

    return { allowed: true };
}

/**
 * Detect potential email loops
 */
async function detectLoop(
    botId: string,
    event: EmailEvent
): Promise<boolean> {
    const recentLogs = await getExecutionLogs(botId, 50);
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);

    const recentSimilar = recentLogs.filter(log => {
        if (log.triggeredAt.getTime() < thirtyMinutesAgo) {
            return false;
        }

        const wasSent = log.status === 'success' &&
            log.actionsExecuted.some(action =>
                action === 'auto_send_email' || action === 'reply_with_template'
            );

        if (!wasSent) {
            return false;
        }

        const senderEmail = log.metadata?.senderEmail;
        if (senderEmail !== event.sender.email) {
            return false;
        }

        const logSubject = (log.metadata?.subject || '').toLowerCase();
        const eventSubject = event.subject.toLowerCase();

        const normalizedLogSubject = logSubject.replace(/^re:\s*/i, '');
        const normalizedEventSubject = eventSubject.replace(/^re:\s*/i, '');

        return normalizedLogSubject === normalizedEventSubject;
    });

    return recentSimilar.length > 0;
}

/**
 * Check if user has accepted terms for auto-send
 */
export function checkAutoSendTermsAccepted(bot: EmailBot): boolean {
    if (!bot.safety.autoSendEnabled) {
        return true;
    }

    return !!bot.acceptedTermsAt;
}

/**
 * Validate bot configuration for safety issues
 */
export function validateBotSafety(bot: EmailBot): string[] {
    const warnings: string[] = [];

    const hasAutoSend = bot.actions.some(action =>
        action.type === 'auto_send_email' || action.type === 'reply_with_template'
    );

    if (hasAutoSend && !bot.acceptedTermsAt) {
        warnings.push('Auto-send actions require terms acceptance');
    }

    if (bot.safety.maxSendsPerDay > 1000) {
        warnings.push('Daily send limit is very high (>1000) - consider reducing');
    }

    if (bot.safety.cooldownMinutes < 5 && hasAutoSend) {
        warnings.push('Cooldown is very short (<5min) - risk of spam');
    }

    if (
        bot.trigger.type === 'new_email_received' &&
        bot.conditions.length === 0 &&
        hasAutoSend
    ) {
        warnings.push('Auto-send with no conditions is dangerous - will reply to ALL emails');
    }

    return warnings;
}
