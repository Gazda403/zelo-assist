"use client";

import { SessionProvider } from "next-auth/react";
import { RemindersProvider } from "./providers/RemindersProvider";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReferralTracker } from "./marketing/ReferralTracker";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                vault: true,
                intent: "subscription"
            }}>
                <RemindersProvider>
                    <Suspense fallback={null}>
                        <ReferralTracker />
                    </Suspense>
                    {children}
                </RemindersProvider>
            </PayPalScriptProvider>
        </SessionProvider>
    );
}
