'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    LucideSend, LucideEdit3, LucideSparkles, LucideX,
    LucideMinimize2, LucideMaximize2, LucideReply,
    LucideCopy, LucideCheck
} from 'lucide-react';
import { refineDraftAction, sendEmailAction, fetchEmailBodyAction } from '@/app/actions/gmail';

interface Email {
    id: string;
    subject: string;
    sender: { name: string; email: string };
    snippet: string;
    date: string;
    read: boolean;
    urgencyScore?: number;
}

interface DraftWorkspaceProps {
    selectedEmail: Email | null;
}

export default function DraftWorkspace({ selectedEmail }: DraftWorkspaceProps) {
    const [draft, setDraft] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // For future full-screen mode
    const [isSending, setIsSending] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Full Email View States
    const [showFullEmail, setShowFullEmail] = useState(false);
    const [fullEmailBody, setFullEmailBody] = useState<string | null>(null);
    const [isLoadingBody, setIsLoadingBody] = useState(false);

    // Auto-generate draft when email changes
    useEffect(() => {
        async function generateInitialDraft() {
            if (!selectedEmail) {
                setDraft('');
                setFullEmailBody(null);
                setShowFullEmail(false);
                return;
            }

            setIsGeneratingDraft(true);
            setDraft(''); // Clear previous draft
            setFullEmailBody(null);
            setShowFullEmail(false);

            try {
                console.log('[DraftWorkspace] Auto-generating draft for:', selectedEmail.subject);

                const { generateDraftAction } = await import('@/app/actions/gmail');

                const result = await generateDraftAction(
                    selectedEmail.id,
                    selectedEmail.sender.name,
                    selectedEmail.sender.email,
                    selectedEmail.subject,
                    selectedEmail.snippet // Using snippet as proxy for full body
                );

                setDraft(result.draft);
                console.log('[DraftWorkspace] Draft generated successfully');
            } catch (error) {
                console.error('[DraftWorkspace] Failed to generate draft:', error);
                // Set a friendly fallback message
                setDraft(`Dear ${selectedEmail.sender.name},\n\nThank you for your email regarding "${selectedEmail.subject}". I will review this and get back to you shortly.\n\nBest regards`);
            } finally {
                setIsGeneratingDraft(false);
            }
        }

        generateInitialDraft();
    }, [selectedEmail?.id]); // Only re-run when email ID changes

    const handleShowFullEmail = async () => {
        if (!selectedEmail) return;
        setShowFullEmail(true);

        if (!fullEmailBody) {
            setIsLoadingBody(true);
            try {
                const body = await fetchEmailBodyAction(selectedEmail.id);
                setFullEmailBody(body);
            } catch (error) {
                console.error("Failed to fetch full email body:", error);
                setFullEmailBody("Failed to load email content. Please try again.");
            } finally {
                setIsLoadingBody(false);
            }
        }
    };

    // Reset draft when email changes (in a real app, you'd fetch the actual draft)
    // For this demo, we'll start with a blank or placeholder draft
    if (!selectedEmail) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white/30">
                <LucideEdit3 className="w-12 h-12 mb-4 opacity-20" />
                <p>Select an email to start drafting</p>
            </div>
        );
    }

    const handleRefine = async () => {
        if (!chatInput.trim()) return;

        setIsRefining(true);
        try {
            // Mock original email content context for now as we don't have full body in prop
            const context = {
                sender: selectedEmail.sender.name,
                subject: selectedEmail.subject,
                originalEmail: fullEmailBody || selectedEmail.snippet // Use full body if available
            };

            const result = await refineDraftAction(draft, chatInput, context);

            setDraft(result.refinedDraft);
            setChatInput(''); // Clear input after successful refinement
        } catch (error) {
            console.error("Failed to refine:", error);
            // Ideally show a toast notification here
        } finally {
            setIsRefining(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(draft);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleSend = async () => {
        if (!selectedEmail || !draft.trim()) return;

        setIsSending(true);
        try {
            await sendEmailAction(
                selectedEmail.sender.email,
                `Re: ${selectedEmail.subject}`,
                draft
            );
            alert("Email sent successfully!");
        } catch (error) {
            console.error("Failed to send:", error);
            alert("Failed to send email. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl">

            {/* Email Header / Context */}
            <div className="p-6 border-b border-violet-100/50 dark:border-white/5 flex-shrink-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedEmail.subject}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{selectedEmail.sender.name}</span>
                            <span className="text-gray-400">&lt;{selectedEmail.sender.email}&gt;</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">{new Date(selectedEmail.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <LucideReply className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Email Body Preview (Snippet for now) */}
                <div className="mt-6 p-4 bg-gray-50/80 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
                    {selectedEmail.snippet}... <span
                        onClick={handleShowFullEmail}
                        className="text-violet-500 dark:text-violet-400 cursor-pointer hover:underline font-medium ml-1"
                    >
                        Read Full
                    </span>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <LucideEdit3 className="w-4 h-4 text-violet-500" />
                        Draft Response
                    </h3>
                    {isGeneratingDraft && <span className="text-xs text-violet-600 animate-pulse flex items-center gap-1"><LucideSparkles className="w-3 h-3" /> AI Drafting...</span>}
                    {isRefining && <span className="text-xs text-violet-600 animate-pulse flex items-center gap-1"><LucideSparkles className="w-3 h-3" /> AI Refining...</span>}
                </div>

                <div className="relative flex-1 flex flex-col min-h-0 group mb-6">
                    <textarea
                        className="flex-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-base leading-relaxed"
                        placeholder={isGeneratingDraft ? "✨ AI is generating your draft..." : "AI-generated draft will appear here..."}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        disabled={isGeneratingDraft}
                    />

                    {/* Action Buttons in bottom corner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-5 right-5 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <button
                            onClick={handleCopy}
                            className="p-2.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-gray-100 dark:border-zinc-700 rounded-xl text-gray-600 dark:text-gray-300 hover:text-violet-600 hover:border-violet-200 dark:hover:border-violet-500/50 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-2 text-xs font-semibold hover:scale-105 active:scale-95"
                            title="Copy to clipboard"
                        >
                            {isCopied ? <LucideCheck className="w-4 h-4 text-green-500" /> : <LucideCopy className="w-4 h-4" />}
                            {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isSending || !draft.trim() || isGeneratingDraft}
                            className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_25px_rgba(139,92,246,0.5)] flex items-center gap-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        >
                            {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucideSend className="w-4 h-4" />}
                            {isSending ? 'Sending...' : 'Send Draft'}
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* AI Chat / Command Bar (Floating Pill Design) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 dark:border-white/10"
                >
                    <div className="relative flex items-center">
                        <div className="absolute left-4 z-10">
                            <LucideSparkles className={cn("w-5 h-5 transition-colors", isRefining ? "text-violet-500 animate-spin-slow" : "text-violet-400 dark:text-violet-300")} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none rounded-full pl-12 pr-14 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all"
                            placeholder="Ask AI to refine, shorten, or change tone..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleRefine();
                                }
                            }}
                        />
                        <button
                            onClick={handleRefine}
                            disabled={isRefining || !chatInput.trim()}
                            className="absolute right-1.5 p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            <LucideSend className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </motion.div>
                <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-3 font-medium tracking-wide opacity-70">
                    AI CAN MAKE MISTAKES. PLEASE REVIEW DRAFTS.
                </p>
            </div>

            {/* Full Email Modal */}
            <AnimatePresence>
                {showFullEmail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white/80 backdrop-blur-xl flex flex-col"
                    >
                        <div className="p-6 border-b border-violet-100 flex items-center justify-between bg-white/60">
                            <h2 className="font-bold text-gray-900">Original Email Content</h2>
                            <button
                                onClick={() => setShowFullEmail(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <LucideX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {isLoadingBody ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                                    <p className="text-sm text-gray-500 animate-pulse">Fetching full content...</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto">
                                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base font-sans">
                                        {fullEmailBody}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
