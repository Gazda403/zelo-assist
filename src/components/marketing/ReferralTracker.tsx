'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { recordReferralAction } from '@/app/actions/marketing';

/**
 * ReferralTracker Component
 * 
 * 1. Captures 'ref' from URL query params and stores in local storage.
 * 2. If a user just signed up (isNewUser), it attributes the referral to the referrer.
 */
export function ReferralTracker() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    useEffect(() => {
        // 1. Capture ref from URL
        const ref = searchParams.get('ref');
        if (ref) {
            console.log('[Referral] Found ref code in URL:', ref);
            localStorage.setItem('xeloflow_referrer_id', ref);
        }

        // 2. Attribution Logic
        const attributeReferral = async () => {
            const storedReferrerId = localStorage.getItem('xeloflow_referrer_id');
            
            // Only attribute if we have a referrer, a user session, and they are new
            // NextAuth provides 'isNewUser' which we set in jwt/session callbacks
            if (storedReferrerId && session?.user?.id && (session.user as any).isNewUser) {
                console.log('[Referral] New user detected. Attributing to:', storedReferrerId);
                
                try {
                    const result = await recordReferralAction(storedReferrerId);
                    if (result.success) {
                        console.log('[Referral] Attribution successful');
                        // Clear to prevent multiple records
                        localStorage.removeItem('xeloflow_referrer_id');
                    } else {
                        console.warn('[Referral] Attribution failed:', result.error);
                        // If it failed because already referred, clear it anyway
                        if (result.error === 'Already referred') {
                            localStorage.removeItem('xeloflow_referrer_id');
                        }
                    }
                } catch (err) {
                    console.error('[Referral] Error recording referral:', err);
                }
            }
        };

        if (session) {
            attributeReferral();
        }
    }, [searchParams, session]);

    return null; // Side-effect only component
}
