import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";

export async function POST(req: Request) {
    const session = await nextAuth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { plan_id } = await req.json();
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
    const baseUrl = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, { method: "POST", body: "grant_type=client_credentials", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" } });
    if (!tokenRes.ok) return NextResponse.json({ error: "Auth failed" }, { status: 500 });
    const { access_token } = await tokenRes.json();
    const subRes = await fetch(`${baseUrl}/v1/billing/subscriptions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` }, body: JSON.stringify({ plan_id, custom_id: session.user.email }) });
    if (!subRes.ok) return NextResponse.json({ error: "Sub failed" }, { status: 500 });
    const subscription = await subRes.json();
    return NextResponse.json({ id: subscription.id });
}
