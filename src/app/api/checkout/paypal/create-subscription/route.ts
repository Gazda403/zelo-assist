import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await nextAuth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan_id } = await req.json();

        if (!plan_id) {
            return NextResponse.json({ error: "Missing plan_id" }, { status: 400 });
        }

        // Generate a PayPal Access Token
        const auth = Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64");

        const baseUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

        const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error("PayPal Token Error:", error);
            return NextResponse.json({ error: "Failed to authenticate with PayPal" }, { status: 500 });
        }

        const { access_token } = await tokenResponse.json();

        // Create the subscription
        const createSubscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
                Accept: "application/json",
            },
            body: JSON.stringify({
                plan_id: plan_id,
                custom_id: session.user.email,
                application_context: {
                    shipping_preference: "NO_SHIPPING",
                    user_action: "SUBSCRIBE_NOW",
                },
            }),
        });

        if (!createSubscriptionResponse.ok) {
            const error = await createSubscriptionResponse.json();
            console.error("PayPal Create Subscription Error:", error);
            return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
        }

        const subscription = await createSubscriptionResponse.json();

        return NextResponse.json({ id: subscription.id });

    } catch (error) {
        console.error("Error creating PayPal subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
