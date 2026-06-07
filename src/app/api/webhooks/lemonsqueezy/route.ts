import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PAYMENT_CONFIG } from "@/config/payments";

// Initialize Supabase Admin Client to bypass RLS in the webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-signature") || "";

        // Validate Lemon Squeezy Webhook Signature
        const secret = PAYMENT_CONFIG.lemonsqueezy.webhookSecret;
        if (!secret) {
            console.error("[Lemon Squeezy Webhook Error] Webhook secret not configured.");
            return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
        }

        const hmac = crypto.createHmac("sha256", secret);
        const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
        const signatureBuffer = Buffer.from(signature, "utf8");

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);
        const eventName = body.meta.event_name;
        const obj = body.data;

        console.log(`[Lemon Squeezy Webhook] Received Event: ${eventName}`);

        // Extract custom user ID from checkout data
        const customUserId = body.meta.custom_data?.user_id;
        const subscriptionId = obj.id;
        const variantId = obj.attributes.variant_id?.toString();

        if (eventName === "subscription_created" || eventName === "subscription_updated") {
            const status = obj.attributes.status; // e.g., 'active', 'past_due', 'unpaid', 'cancelled', 'expired'
            const endsAt = obj.attributes.ends_at; 
            const renewsAt = obj.attributes.renews_at;

            let dbStatus = "inactive";
            if (status === "active" || status === "past_due") {
                dbStatus = "active";
            } else if (status === "cancelled") {
                dbStatus = "canceled";
            }

            // Determine plan type from variant ID
            let planType = "starter";
            const plansConfig = PAYMENT_CONFIG.lemonsqueezy.plans;
            if (variantId === plansConfig.pro_monthly || variantId === plansConfig.pro_annual) {
                planType = "pro";
            }

            if (customUserId && customUserId !== "anonymous") {
                // If we have a user ID, update by user ID
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: dbStatus,
                        plan_type: planType,
                        paypal_subscription_id: subscriptionId, // reusing the same column for now or add lemonsqueezy_subscription_id
                        current_period_end: endsAt || renewsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq("id", customUserId);
            } else {
                // Try updating by subscription ID
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: dbStatus,
                        plan_type: planType,
                        current_period_end: endsAt || renewsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq("paypal_subscription_id", subscriptionId);
            }
        } else if (eventName === "subscription_expired" || eventName === "subscription_payment_failed") {
            await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: 'inactive'
                })
                .eq('paypal_subscription_id', subscriptionId);
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("[Lemon Squeezy Webhook Error]", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
