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
        const text = encodeURIComponent("I'm using XeloFlow to manage my Gmail inbox with AI. It's a game changer for productivity! Check it out:");
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
    };

    const shareByEmail = () => {
        const subject = encodeURIComponent("You have to try XeloFlow");
        const body = encodeURIComponent(`Hey,\n\nI've been using this AI email assistant called XeloFlow and it's actually saving me hours every week. It sorts my inbox by urgency and drafts replies for me.\n\nYou should check it out here: ${referralLink}\n\nCheers!`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container to handle scroll if needed */}
            <div className="relative w-full max-w-lg max-h-full flex items-center justify-center p-2">
                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
                >
                    {/* Header Gradient */}
                    <div className="h-32 bg-gradient-to-br from-orange-400 via-rose-500 to-violet-600 flex items-center justify-center relative">
                        <Gift className="w-16 h-16 text-white/90 drop-shadow-2xl" />
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all hover:scale-110 active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 pb-10">
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Gift Xelo Flow to a friend</h3>
                            <p className="text-gray-500 dark:text-zinc-400 text-lg leading-relaxed">
                                Know someone drowning in emails? Share the magic of Xelo Flow and help them reclaim their time.
                            </p>
                        </div>

                        {/* Referral Link Box */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-white/5 mb-10">
                            <div className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 truncate font-mono">
                                {referralLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all flex items-center gap-2 font-bold text-sm active:scale-95"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                        </div>

                        {/* Social Share grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={shareOnTwitter}
                                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all font-bold text-sm border border-[#1DA1F2]/10"
                            >
                                <Twitter size={20} />
                                Post on X
                            </button>
                            <button
                                onClick={shareByEmail}
                                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-sm border border-primary/10"
                            >
                                <Mail size={20} />
                                Send Email
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-zinc-800/30 text-center border-t border-gray-100 dark:border-white/5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                            Spreading the speed of light
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );

    // Using a portal to ensure the modal stays centered and isn't affected by parent container styling
    if (typeof document === 'undefined') return null;

    const { createPortal } = require('react-dom');
    return createPortal(
        <AnimatePresence>
            {modalContent}
        </AnimatePresence>,
        document.body
    );
}
}
