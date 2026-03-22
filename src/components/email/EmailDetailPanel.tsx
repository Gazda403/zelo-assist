'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, User, Loader2, Sparkles, Send, ArrowLeft } from 'lucide-react';
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
    onClose: () => void;
}

export function EmailDetailPanel({ emailId, sender, subject, date, snippet, onClose }: EmailDetailPanelProps) {
    const [fullBody, setFullBody] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadEmailBody() {
            setLoading(true);
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
    }, [emailId, snippet]);

    const handleAiDraftReply = () => {
        router.push(`/drafts?emailId=${emailId}`);
    };

    const handleCreateNew = () => {
        router.push(`/send?to=${encodeURIComponent(sender.email)}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-br from-accent/5 to-transparent dark:bg-zinc-900/40">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors"
                        aria-label="Close email detail"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-2xl font-serif font-bold flex-1 dark:text-white">{getCleanName(sender.name)}</h2>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-foreground dark:text-white">{getCleanName(sender.name)}</span>
                        <span className="text-xs">({sender.email})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(date).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {fullBody}
                        </pre>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-white/40 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                    onClick={handleAiDraftReply}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 dark:hover:bg-zinc-700/50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Sparkles className="w-5 h-5" />
                    AI Draft Reply
                </button>
                <button
                    onClick={handleCreateNew}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 dark:hover:bg-zinc-700/50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shadow-primary/20"
                >
                    <Send className="w-4 h-4" />
                    Create New with AI
                </button>
            </div>
        </motion.div>
    );
}
