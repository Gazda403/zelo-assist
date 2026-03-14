
import { calculateRiskScore as calcStartupRisk } from "../ai/bots/startup-bot";
import { calculateEcomRisk as calcEcomRisk } from "../ai/bots/ecommerce-bot";

// Utility to print results cleanly
function printResult(botName: string, testName: string, input: any, result: any) {
    console.log(`\n--- [${botName}] Test: ${testName} ---`);
    console.log(`Input: "${input.subject}"`);
    console.log(`Risk Score: ${result.score}/100`);
    if (result.reasons.length > 0) {
        console.log(`Reasons: ${result.reasons.join(", ")}`);
    } else {
        console.log("Reasons: None (Safe)");
    }
}

// ==========================================
// 1. STARTUP BOT TESTS
// ==========================================
console.log("\n🧪 TESTING STARTUP BOT LOGIC...");

const startupTests = [
    {
        name: "Standard Cold Sales",
        input: {
            subject: "Boost your SEO rankings",
            body: "Hi, we can help you get to #1 on Google.",
            sender: "sales@marketing-guru.com",
            sentimentScore: 0.2
        }
    },
    {
        name: "Legal Threat (High Risk)",
        input: {
            subject: "URGENT: Legal Notice regarding contract breach",
            body: "We will sue if you do not respond immediately.",
            sender: "legal@angry-partners.com",
            sentimentScore: -0.9
        }
    },
    {
        name: "Free Email Provider (Medium Risk)",
        input: {
            subject: "Partnership opportunity",
            body: "Hey, love what you're building. Let's chat.",
            sender: "random.guy123@gmail.com",
            sentimentScore: 0.5
        }
    }
];

startupTests.forEach(test => {
    const result = calcStartupRisk(test.input);
    printResult("Startup Bot", test.name, test.input, result);
});


// ==========================================
// 2. E-COMMERCE BOT TESTS
// ==========================================
console.log("\n\n🧪 TESTING E-COMMERCE BOT LOGIC...");

const ecomTests = [
    {
        name: "Routine Order Status",
        input: {
            intent: "Order_Status",
            sentimentScore: 0.1,
            keywords: ["tracking", "order", "where"],
            orderValue: 45
        }
    },
    {
        name: "High Value Order Scam",
        input: {
            intent: "Complaint",
            sentimentScore: -0.8,
            keywords: ["fake", "scam", "broken", "refund"],
            orderValue: 850 // > $500 threshold
        }
    },
    {
        name: "Angry Return Request",
        input: {
            intent: "Return_Request",
            sentimentScore: -0.5,
            keywords: ["return", "broken", "disappointed"],
            orderValue: 120
        }
    }
];

ecomTests.forEach(test => {
    // @ts-ignore - intent string mapping for test simplicity
    const result = calcEcomRisk(test.input);
    printResult("E-Com Bot", test.name, { subject: `[Intent: ${test.input.intent}]` }, result);
});
