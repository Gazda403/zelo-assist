"use client";
import { SessionProvider } from "next-auth/react";
import { RemindersProvider } from "./providers/RemindersProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <RemindersProvider>{children}</RemindersProvider>
        </SessionProvider>
    );
}
