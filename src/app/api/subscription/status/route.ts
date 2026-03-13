import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export const PLAN_LIMITS: Record<string, number> = { free: 1, starter: 3, pro: 10 };

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", session.user.id).single();
    const planType = profile?.plan_type ?? "free";
    const { count } = await supabaseAdmin.from("connected_emails").select("*", { count: "exact" }).eq("owner_id", session.user.id);
    const usedSlots = 1 + (count ?? 0);
    return NextResponse.json({ planType, usedSlots, maxSlots: PLAN_LIMITS[planType] ?? 1 });
}
