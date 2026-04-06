"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { TourSpotlight } from "../onboarding/TourSpotlight";

export function TourProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [showGuide, setShowGuide] = useState(false);

    // Show spotlight tour for first-time users or forced reset
    useEffect(() => {
        if (status === "authenticated") {
            const isForced = typeof window !== "undefined" && localStorage.getItem("tour_force") === "1";
            
            // If we are forcing the tour, clear the completion flag so it actually shows
            if (isForced) {
                localStorage.removeItem("onboarding_complete");
            }

            const isNew = session?.user?.isNewUser;
            const isSeenLocal = typeof window !== "undefined" && localStorage.getItem("onboarding_complete") === "true";

            // Only show if user is new (or forced) AND hasn't already completed/dismissed it locally
            if ((isNew || isForced) && !isSeenLocal) {
                setShowGuide(true);
            }
        }
    }, [status, session]);

    return (
        <>
            {children}
            <TourSpotlight 
                open={showGuide} 
                onClose={() => setShowGuide(false)} 
            />
        </>
    );
}
