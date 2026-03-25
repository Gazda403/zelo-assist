import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client to bypass RLS in the webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use the service role key since webhooks don't have user sessions
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const headersList = req.headers;

        // In a production environment, you MUST verify the webhook signature here.
        // You would take the headers (PAYPAL-AUTH-ALGO, PAYPAL-CERT-URL, PAYPAL-TRANSMISSION-ID, PAYPAL-TRANSMISSION-SIG, PAYPAL-TRANSMISSION-TIME)
        // and send them along with the exact raw body string and your WEBHOOK_ID to PayPal's /v1/notifications/verify-webhook-signature API.

        // Ensure webhooks are authenticated locally/sandbox for now

        const eventType = body.event_type;
        const resource = body.resource;

        console.log(`[PayPal Webhook] Received Event: ${eventType}`);

        // The user's ID/Email is typically passed in 'custom_id' during subscription creation.
        // Depending on the event, it might be nested differently.
        const customId = resource.custom_id || resource.subscriber?.custom_id;
        const subscriptionId = resource.id || resource.billing_agreement_id;

        // Note: For PAYMENT.SALE.COMPLETED, the resource is a 'sale', so the subscription_id is 'billing_agreement_id'

        if (!subscriptionId) {
            console.warn("[PayPal Webhook] Missing subscription ID in resource:", resource);
            return NextResponse.json({ status: "ignored - no subscription ID" });
        }

        switch (eventType) {
            case "BILLING.SUBSCRIPTION.CREATED":
            case "BILLING.SUBSCRIPTION.ACTIVATED":
            case "PAYMENT.SALE.COMPLETED": {
                // Derive plan type from the plan_id in the resource
                const planId = resource.plan_id || resource.agreement_details?.plan_id;
                // Map known Plan IDs to plan types
                const PLAN_ID_TO_TYPE: Record<string, string> = {
                    "P-0G345889PP367702PNHCEERA": "starter", // Starter Monthly (Live)
                    "P-74N72422VD313690PNHCEERA": "starter", // Starter Annual (Live)
                    "P-5M650937436226326NHCEERA": "pro",     // Pro Monthly (Live)
                    "P-2W102421T2805691UNHCEERI": "pro",     // Pro Annual (Live)
                };
                const planType = planId ? (PLAN_ID_TO_TYPE[planId] ?? "starter") : "starter";

                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        plan_type: planType,
                        paypal_subscription_id: subscriptionId,
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .or(`id.eq.${customId},paypal_subscription_id.eq.${subscriptionId}`);

                console.log(`[PayPal Webhook] Activated subscription ${subscriptionId} as plan_type: ${planType}`);
                break;
            }


            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.EXPIRED":
            case "BILLING.SUBSCRIPTION.SUSPENDED":
                // User canceled, or account lapsed/failed payment.
                // Note: If they cancel, they might still have time left in their current period.
                // Best practice is to mark status as 'canceled' but let the app logic check 'current_period_end' before kicking them out.

                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 'inactive'
                        // Do NOT clear current_period_end. They paid for the rest of the month!
                    })
                    .eq('paypal_subscription_id', subscriptionId);

                console.log(`[PayPal Webhook] Updated subscription ${subscriptionId} to ${eventType}`);
                break;

            case "PAYMENT.SALE.DENIED":
            case "PAYMENT.SALE.REFUNDED":
            case "PAYMENT.SALE.REVERSED":
                // Money was clawed back. Terminate access immediately.
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'inactive',
                        current_period_end: new Date().toISOString() // Expire mapping immediately
                    })
                    .eq('paypal_subscription_id', subscriptionId);
                break;

            default:
                console.log(`[PayPal Webhook] Unhandled event type ${eventType}`);
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("[PayPal Webhook Error]", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
