'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Send, ArrowLeft } from 'lucide-react';
import { fetchEmailBodyAction } from '@/app/actions/gmail';
import { useRouter } from 'next/navigation';

function getCleanName(name: string) {
    return name?.replace(/['"<>[\]]/g, '').trim() || "Unknown";
}

function getServiceBrand(email: string, name: string) {
    const lowerEmail = email.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerEmail.includes("paypal") || lowerName.includes("paypal")) {
        return { name: "PayPal", color: "bg-blue-600", text: "text-white", icon: "P" };
    }
    if (lowerEmail.includes("supabase") || lowerName.includes("supabase")) {
        return { name: "Supabase", color: "bg-[#3ECF8E]", text: "text-black", icon: "S" };
    }
    if (lowerEmail.includes("kucoin") || lowerName.includes("kucoin")) {
        return { name: "KuCoin", color: "bg-[#23AF91]", text: "text-white", icon: "K" };
    }
    if (lowerEmail.includes("spotify") || lowerName.includes("spotify")) {
        return { name: "Spotify", color: "bg-[#1DB954]", text: "text-black", icon: "S" };
    }
    if (lowerEmail.includes("google") || lowerEmail.includes("gmail")) {
        return { name: "Google", color: "bg-red-500", text: "text-white", icon: "G" };
    }
    if (lowerEmail.includes("github")) {
        return { name: "GitHub", color: "bg-gray-900 dark:bg-zinc-100", text: "text-white dark:text-black", icon: "GH" };
    }
    return null;
}

interface EmailDetailPanelProps {
    emailId: string;
    sender: { name: string; email: string };
    subject: string;
    date: string;
    snippet: string;
    initialBody?: string;
    loadingBody?: boolean;
    onClose: () => void;
}

export function EmailDetailPanel({ emailId, sender, subject, date, snippet, initialBody, loadingBody, onClose }: EmailDetailPanelProps) {
    const [fullBody, setFullBody] = useState<string>(initialBody || '');
    const [loading, setLoading] = useState(loadingBody ?? !initialBody);
    const router = useRouter();

    useEffect(() => {
        // If we have an initial body and aren't told we're still loading it, don't fetch.
        if (initialBody && !loadingBody) {
            setFullBody(initialBody);
            setLoading(false);
            return;
        }

        // If we don't have initial body but we have a snippet, show snippet first
        if (!initialBody) {
            setFullBody('');
            setLoading(true);
        }

        async function loadEmailBody() {
            try {
                const body = await fetchEmailBodyAction(emailId);
                setFullBody(body);
            } catch (error) {
                console.error('Failed to load email body:', error);
                setFullBody(snippet); // Fallback to snippet
            } finally {
                setLoading(false);
            }
        }

        loadEmailBody();
    }, [emailId, snippet, initialBody, loadingBody]);

    const handleAiDraftReply = () => {
        router.push(`/drafts?emailId=${emailId}`);
    };

    const handleCreateNew = () => {
        router.push(`/send?to=${encodeURIComponent(sender.email)}`);
    };

    const brandInfo = getServiceBrand(sender.email, sender.name);
    const initials = getCleanName(sender.name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <>
            {/* Mobile: slide-up full-screen */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden"
            >
                {/* Mobile header – sticky so it stays visible while scrolling the body */}
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-4 pt-4 pb-3 safe-area-top">
                    {/* Back row */}
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-medium text-sm p-1 -ml-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                            aria-label="Back to inbox"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Inbox</span>
                        </button>
                    </div>

                    {/* Subject */}
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-3 pr-2">
                        {subject}
                    </h1>

                    {/* Sender row */}
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${brandInfo ? `${brandInfo.color} ${brandInfo.text}` : 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'}`}>
                            {brandInfo ? brandInfo.icon : initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{getCleanName(sender.name)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sender.email}</p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                            {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="px-4 py-5">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                                {snippet}
                            </pre>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 px-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Loading full email...
                            </div>
                        </div>
                    ) : (
                        <div className="px-0 py-0">
                            {fullBody && /<html|<body|<div|<p|<br/i.test(fullBody) ? (
                                <iframe
                                    srcDoc={`<base target="_blank" />${fullBody}`}
                                    className="w-full bg-white dark:bg-zinc-900"
                                    style={{ height: 'calc(100dvh - 220px)', minHeight: '400px', border: 'none' }}
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                    title="Email Content"
                                />
                            ) : (
                                <div className="px-4 py-4">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                                        {fullBody}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action buttons — fixed at bottom on mobile */}
                <div className="safe-area-bottom px-4 py-4 border-t border-gray-100 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAiDraftReply}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-[#A182EE] to-[#8B5CF6] text-white rounded-2xl font-bold shadow-[0_10px_20px_-5px_rgba(161,130,238,0.4)] active:brightness-90 group"
                    >
                        <Sparkles className="w-5 h-5" />
                        AI Draft Reply
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCreateNew}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-[#FF7F11] to-[#F97316] text-white rounded-2xl font-bold shadow-[0_10px_20px_-5px_rgba(255,127,17,0.4)] active:brightness-90 group"
                    >
                        <Send className="w-4 h-4" />
                        Create New with AI
                    </motion.button>
                </div>
            </motion.div>
        </>
    );
}
