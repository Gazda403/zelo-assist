"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Mail, Gift, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
    const [copied, setCopied] = useState(false);
    const referralLink = "https://xelo.com/?ref=shared";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnTwitter = () => {
        const text = encodeURIComponent("I'm using Zelo Assist to manage my Gmail inbox with AI. It's a game changer for productivity! Check it out:");
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
    };

    const shareByEmail = () => {
        const subject = encodeURIComponent("You have to try Zelo Assist");
        const body = encodeURIComponent(`Hey,\n\nI've been using this AI email assistant called Zelo Assist and it's actually saving me hours every week. It sorts my inbox by urgency and drafts replies for me.\n\nYou should check it out here: ${referralLink}\n\nCheers!`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Header Gradient */}
                        <div className="h-32 bg-gradient-to-br from-orange-400 via-rose-500 to-violet-600 flex items-center justify-center relative">
                            <Gift className="w-16 h-16 text-white/90 drop-shadow-lg" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gift Zelo to a friend</h3>
                                <p className="text-gray-500 dark:text-zinc-400">
                                    Know someone drowning in emails? Share the magic of Zelo Assist and help them reclaim their time.
                                </p>
                            </div>

                            {/* Referral Link Box */}
                            <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-white/5 mb-8">
                                <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 truncate">
                                    {referralLink}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl shadow-sm border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 font-semibold text-sm"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>

                            {/* Social Share grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={shareOnTwitter}
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20 transition-all font-semibold text-sm"
                                >
                                    <Twitter size={20} />
                                    Post on X
                                </button>
                                <button
                                    onClick={shareByEmail}
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 transition-all font-semibold text-sm"
                                >
                                    <Mail size={20} />
                                    Send Email
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/30 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Spreading the speed of light
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
