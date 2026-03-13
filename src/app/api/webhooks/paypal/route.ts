import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;
    const subscriptionId = resource.id || resource.billing_agreement_id;
    if (!subscriptionId) return NextResponse.json({ status: "ignored" });
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "PAYMENT.SALE.COMPLETED") {
        await supabaseAdmin.from('profiles').update({ subscription_status: 'active' }).eq('paypal_subscription_id', subscriptionId);
    }
    return NextResponse.json({ status: "success" });
}
