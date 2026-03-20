
import { NextResponse } from 'next/server';
import { calculateRiskScore as calcStartupRisk } from "@/ai/bots/startup-bot";
import { calculateEcomRisk as calcEcomRisk } from "@/ai/bots/ecommerce-bot";

export async function GET() {
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
        }
    ];

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
        }
    ];

    const results = {
        startupBot: startupTests.map(test => ({
            test: test.name,
            input: test.input.subject,
            result: calcStartupRisk(test.input)
        })),
        ecomBot: ecomTests.map(test => ({
            test: test.name,
            input: test.input.keywords,
            result: calcEcomRisk(test.input as any)
        }))
    };

    return NextResponse.json(results, { status: 200 });
}
