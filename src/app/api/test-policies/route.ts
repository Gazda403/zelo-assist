
import { NextResponse } from 'next/server';
import { ECOMMERCE_BOT_PRESET } from "@/ai/bots/ecommerce-bot";
import { EmailBot, KnowledgeBasePolicy } from "@/lib/bots/types";

// Helper to simulate prompt generation with policies
function generateSystemPrompt(bot: EmailBot): string {
    let prompt = bot.prompt || '';

    if (bot.policyConfig?.enabled && bot.policyConfig.policies.length > 0) {
        prompt += "\n\n=== STORE POLICIES (KNOWLEDGE BASE) ===\n";
        prompt += "You must strictly adhere to these rules:\n\n";

        bot.policyConfig.policies.forEach((policy, index) => {
            prompt += `${index + 1}. [${policy.title}]\n`;
            prompt += `${policy.content}\n`;
            if (policy.tags.length) prompt += `   Tags: ${policy.tags.join(', ')}\n`;
            prompt += "\n";
        });
    }

    return prompt;
}

export async function GET() {
    // 1. Load the Preset
    const bot = { ...ECOMMERCE_BOT_PRESET };

    // 2. Simulate Adding a User-Defined Policy
    const newPolicy: KnowledgeBasePolicy = {
        id: "custom_holiday_policy",
        title: "Holiday Shipping Update",
        content: "Due to high volume, all orders placed after Dec 20th will ship Jan 2nd.",
        tags: ["shipping", "holiday", "urgent"],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Initialize array if needed (though preset has it)
    if (bot.policyConfig) {
        bot.policyConfig.policies.push(newPolicy);
    }

    // 3. Generate the "AI View"
    const finalPrompt = generateSystemPrompt(bot);

    return NextResponse.json({
        test: "Policy Injection Verification",
        status: "SUCCESS",
        originalPolicies: ECOMMERCE_BOT_PRESET.policyConfig?.policies.length,
        finalPolicies: bot.policyConfig?.policies.length,
        preview: {
            injectedPolicyCount: bot.policyConfig?.policies.length,
            sampleInjectedContent: newPolicy.content,
        },
        fullSystemPrompt: finalPrompt
    }, { status: 200 });
}
