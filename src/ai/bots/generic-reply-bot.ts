
import { EmailBot } from "@/lib/bots/types";
import { DEFAULT_ACKNOWLEDGMENT_TEMPLATES } from "@/lib/bots/templates/acknowledgment-templates";

export const GENERIC_REPLY_BOT_PRESET: EmailBot = {
    id: "preset_generic_reply_bot",
    userId: "system",
    name: "Auto-Acknowledgment Bot",
    description: "Automatically sends acknowledgment emails to new senders, like government or corporate auto-replies.",
    prompt: `You are the Auto-Acknowledgment Bot.
    Your goal is to send standardized acknowledgment emails to incoming messages.
    
    CORE TASKS:
    1. ANALYZE: Review the incoming email metadata (sender, subject, date).
    2. TEMPLATE PROCESSING: Use the configured acknowledgment template.
    3. VARIABLE SUBSTITUTION: Fill in template variables with email-specific data.
    4. SAFETY: Do NOT respond to automated emails, newsletters, or marketing blasts.
    
    OPERATING RULES:
    - Use professional, courteous language.
    - Extract sender name and email subject for personalization.
    - Respect cooldown periods to avoid spam.
    - Only send once per sender within the cooldown window.
    `,
    enabled: true,
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),

    trigger: {
        type: 'new_email_received',
        config: {}
    },

    conditions: [
        {
            type: 'exclude_automated',
            config: {}
        }
    ],

    actions: [
        {
            type: 'auto_send_email',
            config: {
                tone: 'professional',
                acknowledgmentTemplate: DEFAULT_ACKNOWLEDGMENT_TEMPLATES.professional_acknowledgment
            }
        }
    ],

    safety: {
        autoSendEnabled: true,
        maxSendsPerDay: 100,
        cooldownMinutes: 1440, // 24 hours - only send once per day per sender
        loopPrevention: true,
        requireApproval: false
    },

    stats: {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        emailsSent: 0,
        draftsCreated: 0
    }
};
