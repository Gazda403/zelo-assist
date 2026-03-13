import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { planId } = await req.json();
    await supabaseAdmin.from('profiles').update({ subscription_status: 'pending_bank_transfer' }).eq('id', session.user.id);
    return NextResponse.json({ status: "pending" });
}
