"use client";

import React, { useEffect, useState } from 'react';
import { Zap, Star, Mail, AlertCircle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SubscriptionStatus {
    planType: string;
    subscriptionStatus: string;
    maxSlots: number | null;
    usedSlots: number;
    remainingSlots: number | null;
    currentPeriodEnd: string | null;
    isActive: boolean;
    isTrialExpired?: boolean;
    trialDaysLeft?: number;
}

export function SubscriptionBanner() {
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleShow = () => {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 5000);
            return () => clearTimeout(timer);
        };

        window.addEventListener('show-subscription-status', handleShow);
        return () => window.removeEventListener('show-subscription-status', handleShow);
    }, []);

    useEffect(() => {
        fetch('/api/subscription/status')
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
                
                // Automatically show on load for a few seconds, but only once every 24 hours
                if (data) {
                    const lastShown = localStorage.getItem('last_subscription_banner_shown');
                    const now = new Date().getTime();
                    const twentyFourHours = 24 * 60 * 60 * 1000;

                    if (!lastShown || now - parseInt(lastShown) > twentyFourHours) {
                        setIsVisible(true);
                        localStorage.setItem('last_subscription_banner_shown', now.toString());
                        const timer = setTimeout(() => {
                            setIsVisible(false);
                        }, 8000); 
                        return () => clearTimeout(timer);
                    }
                }
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !status) return null;

    const planLabel: Record<string, string> = {
        free: 'Free Trial',
        starter: 'Starter',
        pro: 'Pro',
        exclusive: 'Exclusive Admin',
    };

    const isExpired = status.currentPeriodEnd
        ? new Date(status.currentPeriodEnd) < new Date()
        : false;
    const isCanceled = status.subscriptionStatus === 'canceled';
    const showWarning = isExpired || isCanceled || (status.subscriptionStatus === 'inactive' && status.planType !== 'free') || status.isTrialExpired;

    const maxSlotsDisplay = status.maxSlots === null ? 'Unlimited' : status.maxSlots;
    const usagePercentage = status.maxSlots === null ? 0 : Math.min((status.usedSlots / status.maxSlots) * 100, 100);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 right-6 z-[100] w-full max-w-[320px] pointer-events-auto"
                >
                    <div className={cn(
                        "relative overflow-hidden p-5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/40 dark:border-white/10",
                        showWarning 
                            ? "bg-red-500/10 border-red-500/30" 
                            : status.planType === 'exclusive'
                                ? "bg-amber-500/10 border-amber-500/30 shadow-amber-500/20"
                                : "bg-white/70 dark:bg-zinc-900/60"
                    )}>
                        {/* Background Graduate Accents */}
                        {status.planType === 'exclusive' ? (
                            <>
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                            </>
                        ) : (
                            <>
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                            </>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    showWarning 
                                        ? "bg-red-500/20 text-red-600" 
                                        : status.planType === 'exclusive'
                                            ? "bg-amber-500/20 text-amber-600"
                                            : "bg-accent/10 text-accent"
                                )}>
                                    {showWarning ? <AlertCircle className="w-4 h-4" /> : status.planType === 'exclusive' ? <Star className="w-4 h-4 fill-current" /> : <Mail className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className={cn(
                                        "text-sm font-bold font-serif",
                                        status.planType === 'exclusive' ? "text-amber-700 dark:text-amber-400" : "text-foreground"
                                    )}>
                                        {planLabel[status.planType] ?? 'Unknown'} Rank
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                        Usage Insight
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-2 mb-4 relative z-10">
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-muted-foreground">Email Slots</span>
                                <span className="text-foreground">{status.usedSlots} / {maxSlotsDisplay}</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usagePercentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full",
                                        usagePercentage > 90 ? "bg-red-500" : status.planType === 'exclusive' ? "bg-amber-500" : "bg-accent"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Footer / CTA */}
                        <div className="flex items-center justify-between gap-3 relative z-10">
                            <div>
                                {showWarning ? (
                                    <p className="text-[10px] text-red-600 font-medium">
                                        {status.isTrialExpired ? '7-Day trial expired' : isCanceled ? 'Subscription canceled' : 'Payment required'}
                                    </p>
                                ) : status.planType === 'exclusive' ? (
                                    <p className="text-[10px] text-amber-600 font-bold italic">
                                        Unlimited Access Granted
                                    </p>
                                ) : status.planType === 'free' ? (
                                    <p className="text-[10px] text-accent font-bold italic">
                                        {status.trialDaysLeft} Days Left in Trial
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Premium features enabled
                                    </p>
                                )}
                            </div>
                            
                            {status.planType !== 'pro' && status.planType !== 'exclusive' && (
                                <Link
                                    href="/#pricing"
                                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all shadow-sm active:scale-95"
                                >
                                    Upgrade
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
