"use client";

import React, { useEffect, useState } from "react";
import { Lock, ArrowRight, Zap, Infinity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function PremiumFeatureGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/subscription/status")
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <>{children}</>;

    const isLocked = status && !status.isActive;

    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="absolute inset-0 select-none pointer-events-none opacity-30 blur-[4px] transition-all overflow-hidden flex-1">
                {children}
            </div>

            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/20 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10 rounded-3xl p-8 text-center"
                >
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-orange-200/50 dark:border-orange-500/20">
                        <Lock className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold font-serif mb-3 text-gray-900 dark:text-gray-100">7-Day Trial Expired</h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                        Your trial has ended and this premium AI feature is currently locked. Upgrade to unlock all AI capabilities.
                    </p>

                    <div className="mb-8 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-4 py-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Infinity className="w-4 h-4 text-white stroke-[2.5px]" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 leading-tight">Sequencing & Sending</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-0.5">Still 100% free, forever!</p>
                        </div>
                    </div>
                    
                    <Link 
                        href="/#pricing"
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        Upgrade to Pro
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
