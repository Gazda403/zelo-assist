"use client";

import React, { useEffect, useState } from 'react';
import { Zap, Star, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatus {
    planType: string;
    subscriptionStatus: string;
    maxSlots: number;
    usedSlots: number;
    remainingSlots: number;
    currentPeriodEnd: string | null;
    isActive: boolean;
}

export function SubscriptionBanner() {
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/subscription/status')
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !status) return null;

    const planLabel: Record<string, string> = {
        free: 'Free Trial',
        starter: 'Starter',
        pro: 'Pro',
    };

    const planIcon: Record<string, React.ReactNode> = {
        free: <Mail className="w-4 h-4" />,
        starter: <Star className="w-4 h-4" />,
        pro: <Zap className="w-4 h-4" />,
    };

    const isExpired = status.currentPeriodEnd
        ? new Date(status.currentPeriodEnd) < new Date()
        : false;
    const isCanceled = status.subscriptionStatus === 'canceled';
    const showWarning = isExpired || isCanceled || status.subscriptionStatus === 'inactive';

    return (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border ${showWarning ? 'bg-red-50 border-red-200 text-red-800' : 'bg-stone-50 border-stone-200 text-stone-700'}`}>
            <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 font-semibold ${showWarning ? 'text-red-700' : 'text-stone-900'}`}>
                    {showWarning ? <AlertCircle className="w-4 h-4" /> : planIcon[status.planType]}
                    {planLabel[status.planType] ?? 'Unknown'} Plan
                </span>
                <span className="text-stone-400">·</span>
                {/* Email slot usage */}
                <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                        {status.usedSlots} / {status.maxSlots} email slot{status.maxSlots !== 1 ? 's' : ''} used
                    </span>
                </span>
                {status.currentPeriodEnd && !showWarning && (
                    <>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-400 text-xs">
                            Renews {new Date(status.currentPeriodEnd).toLocaleDateString()}
                        </span>
                    </>
                )}
                {showWarning && (
                    <span className="text-xs">
                        {isCanceled ? 'Subscription canceled.' : 'Subscription inactive.'}
                    </span>
                )}
            </div>

            {(status.planType !== 'pro') && (
                <Link
                    href="/#pricing"
                    className="text-xs font-bold px-3 py-1 bg-primary text-white rounded-full hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                    Upgrade →
                </Link>
            )}
        </div>
    );
}
