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
            const isNew = session?.user?.isNewUser;
            const isForced = typeof window !== "undefined" && localStorage.getItem("tour_force") === "1";
            
            if (isNew || isForced) {
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
