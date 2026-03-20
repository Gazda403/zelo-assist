
import { EmailBot } from "@/lib/bots/types";

export const FOLLOW_UP_BOT_PRESET: EmailBot = {
    id: "preset_follow_up_bot",
    userId: "system",
    name: "Follow-Up Bot",
    description: "Monitors outgoing emails and ensures you never lose track of a conversation. Automatically suggests or sends follow-ups.",
    prompt: `You are the Follow-Up Bot.
    Your goal is to ensure that no important conversation is left without a response.
    
    CORE MODES:
    1. PROACTIVE SCANNING: Review outgoing emails. If an email expects a reply (e.g., questions, requests), flag it for monitoring.
    2. INACTIVITY MONITORING: Track threads where you are waiting for a reply.
    
    ACTIONS:
    - IF no reply after the specified delay -> NOTIFY user or CREATE DRAFT follow-up.
    - IF reply received -> MARK thread as resolved and STOP monitoring.
    
    OPERATING RULES:
    - Respect "Business Hours" for notifications and follow-ups.
    - Avoid follow-ups for internal domains or known automated senders.
    - AI should personalize follow-up drafts based on the original message context.
    `,
    enabled: true,
    isPremium: true,
    createdAt: new Date(),
    updatedAt: new Date(),

    trigger: {
        type: 'outgoing_email_sent',
        config: {
            excludeDomains: ['yourcompany.com'],
            excludeKeywords: ['unsubscribe', 'noreply']
        }
    },

    conditions: [],

    actions: [
        {
            type: 'notify_user',
            config: {
                message: "No reply received for '{{subject}}'. Suggested follow-up draft created.",
                priority: 'medium'
            }
        }
    ],

    followUpConfig: {
        enabled: true,
        mode: 'auto',
        settings: {
            delayValue: 3,
            delayUnit: 'days',
            maxAttempts: 2,
            businessHoursOnly: true
        }
    },

    safety: {
        autoSendEnabled: false,
        maxSendsPerDay: 20,
        cooldownMinutes: 60,
        loopPrevention: true,
        requireApproval: true
    },

    stats: {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        emailsSent: 0,
        draftsCreated: 0
    }
};
