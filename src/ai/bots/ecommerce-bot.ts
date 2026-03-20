
import { EmailBot, SafetyConfig } from "@/lib/bots/types";

export const ECOMMERCE_BOT_PRESET: EmailBot = {
    id: "preset_ecommerce_bot",
    userId: "system",
    name: "E-Commerce Support Bot",
    description: "Automated support for online stores. Handles order status, returns, and product Q&A for Shopify/WooCommerce.",
    prompt: `You are the E-Commerce Support Bot for an online store.
    Your goal is to resolve customer inquiries quickly and accurately using the store's API and FAQ database.
    
    CORE FEATURES & WORKFLOWS:
    
    1. ORDER STATUS & TRACKING
       - Detect "Order Status" inquiries.
       - IF Order ID is missing -> REPLY asking for it. NEVER guess.
       - IF ID present -> Query Store API -> Reply with Status (Processing/Shipped), Carrier, & Tracking Link.
       
    2. REFUNDS & RETURNS HELPER
       - Detect "Refund/Return" requests.
       - IF Order ID is missing -> REPLY asking for it.
       - Check Eligibility via API (e.g., within 30 days?).
       - IF Eligible -> Reply with specific return instructions.
       - IF Ineligible -> Reply with polite decline citing policy.
       - ESCALATE complex cases or high-value items (>$500).
       
    3. PRODUCT Q&A
       - Detect questions about products (Stock, Sizes, Colors).
       - IF Product/SKU is ambiguous -> ASK user to clarify.
       - Fetch info from Catalog API -> Reply with specific specs.
       - ESCALATE if the answer is unknown or ambiguous.
       
    4. FAQ AUTO-RESPONDER
       - Detect common repetitive questions (Shipping times, International delivery).
       - Reply using the strict FAQ database.
       - ESCALATE any unknown or complex questions not in the DB.
       
    5. THREAD STATE MANAGEMENT
       - You must remember the Order ID and Product ID provided earlier in the thread.
       - Check the "action_log" to prevent sending duplicate replies.
       - Store eligibility flags to avoid re-checking policies unnecessarily.
       
    OPERATING RULES:
    - PAYMENT SAFETY: Read-only for specific financial data. NEVER process refunds or capture payments.
    - ESCALATION: Flag >$500 orders, angry sentiment, or legal threats.
    - API: Use Shopify/WooCommerce endpoints for all data. Fallback to "Human Handover" on error.
    `,
    enabled: true,
    isPremium: true,
    createdAt: new Date(),
    updatedAt: new Date(),

    trigger: {
        type: 'new_email_received',
        config: {}
    },

    conditions: [], // Logic handled in flow

    actions: [
        {
            type: 'create_draft',
            config: {
                tone: 'professional'
            }
        }
    ],

    safety: {
        autoSendEnabled: false,
        maxSendsPerDay: 100,
        cooldownMinutes: 2,
        loopPrevention: true,
        requireApproval: true
    },

    stats: {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        emailsSent: 0,
        draftsCreated: 0
    },

    policyConfig: {
        enabled: true,
        policies: [
            {
                id: "default_return_policy",
                title: "General Return Policy",
                content: "Items can be returned within 30 days of delivery. Must be unused and in original packaging. Return shipping is free for domestic orders.",
                tags: ["returns", "shipping"],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

export const ECOM_INTENTS = {
    "Order_Status": { action: "query_order", required_entities: ["order_id"] },
    "Return_Request": { action: "check_policy", required_entities: ["order_id"] },
    "Product_Inquiry": { action: "query_product", required_entities: ["product_name_or_sku"] },
    "Complaint": { action: "escalate", priority: "high" }
};

export interface EcomRiskInput {
    intent: keyof typeof ECOM_INTENTS;
    orderValue?: number;
    sentimentScore: number;
    keywords: string[];
}

export function calculateEcomRisk(input: EcomRiskInput): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // High Value Check
    if (input.orderValue && input.orderValue > 500) {
        score += 60;
        reasons.push("High value order (>$500)");
    }

    // Sentiment
    if (input.sentimentScore < -0.4) {
        score += 40;
        reasons.push("Negative customer sentiment");
    }

    // Keywords
    const ESCALATION_WORDS = ["fake", "scam", "police", "money back", "broken", "legal"];
    const foundKeywords = input.keywords.filter(k => ESCALATION_WORDS.includes(k.toLowerCase()));

    if (foundKeywords.length > 0) {
        score += 50;
        reasons.push(`Escalation keywords: ${foundKeywords.join(", ")}`);
    }

    return { score: Math.min(score, 100), reasons };
}
