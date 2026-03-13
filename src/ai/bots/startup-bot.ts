
import { EmailBot, BotTrigger, BotCondition, BotAction, TriggerType, ConditionType, ActionType, SafetyConfig } from "@/lib/bots/types";

export const STARTUP_BOT_PRESET: EmailBot = {
    id: "preset_startup_bot",
    userId: "system",
    name: "Startup Bot",
    description: "A founder-focused assistant that filters noise, drafts context-aware replies, and manages investor/partner communications with high safety guardrails.",
    prompt: `You are the Startup Bot, an AI executive assistant for a busy founder. 
    Your goal is to protect the founder's time and ensure high-value relationships are nurtured.
    
    CORE OPERATING RULES:
    1. NEVER commit to financial spend or legal terms.
    2. NEVER auto-schedule meetings (Calendar is read-only).
    3. NEVER hallucinate facts. Use only provided context.
    4. ALWAYS be concise, professional, and deterministic.
    
    INTENT CATEGORIES:
    - User_Support -> Draft Acknowledge + Tag Urgent
    - Cold_Sales/Vendor -> Draft Polite Decline ("Not a priority right now")
    - Investor_Outreach -> Draft Warm Reply + Pin Thread
    - Hiring/Talent -> Forward to Team or Draft Interview Request
    - Meeting_Request -> Draft Availability Check (Do NOT auto-book)
    - Legal/Finance -> Flag for Review (NO auto-draft)
    
    RISK SCORING (0-100):
    - Keywords "Urgent", "Legal", "Sue", "Contract", "Term Sheet", "Resign" -> High Risk (+50)
    - Sentiment Negative/Aggressive -> High Risk (+30)
    - Free Domain (gmail/yahoo) -> Medium Risk (+10)
    
    THRESHOLDS:
    - Low (0-20): Safe for Auto-Send (if enabled)
    - Medium (21-70): Draft Only
    - High (71-100): Draft Only + Alert User
    
    FOLLOW-UP LOGIC:
    - Urgent: T+1 Day
    - Standard: T+3 Days
    - Long-tail: T+7 Days
    - KILL SWITCH: Stop IF reply received OR sentiment negative.
    `,
    enabled: true,
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Default Trigger: New Email
    trigger: {
        type: 'new_email_received',
        config: {}
    },

    // Default Conditions: None (Logic handles filtering)
    conditions: [],

    // Default Actions (Logic determines specific execution)
    actions: [
        {
            type: 'create_draft',
            config: {
                tone: 'professional'
            }
        }
    ],

    // strict safety config
    safety: {
        autoSendEnabled: false, // Default to OFF for safety
        maxSendsPerDay: 50,
        cooldownMinutes: 5,
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

export const INTENT_DEFINITIONS = {
    "User_Support": { action: "draft_reply", priority: "high", template: "support_ack" },
    "Cold_Sales": { action: "draft_reply", priority: "low", template: "decline_vendor" },
    "Investor_Outreach": { action: "draft_reply", priority: "critical", template: "warm_investor" },
    "Hiring_Talent": { action: "forward", priority: "medium", target: "team" },
    "Meeting_Request": { action: "draft_reply", priority: "medium", template: "availability_check" },
    "Legal_Finance": { action: "flag", priority: "critical", template: null }
};

export type StartupBotIntent = keyof typeof INTENT_DEFINITIONS;

export interface RiskScoreInput {
    subject: string;
    body: string;
    sender: string;
    sentimentScore: number; // -1 to 1
}

export function calculateRiskScore(input: RiskScoreInput): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const HIGH_RISK_KEYWORDS = ["urgent", "legal", "sue", "contract", "term sheet", "resign", "breach", "audit"];

    // Keyword Analysis
    const text = (input.subject + " " + input.body).toLowerCase();
    for (const word of HIGH_RISK_KEYWORDS) {
        if (text.includes(word)) {
            score += 50;
            reasons.push(`High risk keyword detected: ${word}`);
        }
    }

    // Sentiment Analysis
    if (input.sentimentScore < -0.5) {
        score += 30;
        reasons.push("Negative sentiment detected");
    }

    // Sender Domain Analysis
    const freeDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    const domain = input.sender.split('@')[1]?.toLowerCase();

    if (domain && freeDomains.includes(domain)) {
        score += 10;
        reasons.push("Free email provider detected");
    }

    return { score: Math.min(score, 100), reasons };
}
