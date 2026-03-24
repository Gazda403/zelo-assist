"use client";

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Sparkles, X, ChevronUp, CheckCircle2, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BotEntity } from './BotEntity';
import { generateInboxSummaryAction } from '@/app/actions/summary';

interface WelcomeBriefingProps {
    userName: string;
    analyzedCount: number;
    urgentCount: number;
    draftsCount: number;
    variant?: 'banner' | 'sidebar';
    emailsPayload?: any[];
    unreadCount?: number;
}

export function WelcomeBriefing({ 
    userName, 
    analyzedCount, 
    urgentCount, 
    draftsCount,
    variant = 'banner',
    emailsPayload = [],
    unreadCount = 0
}: WelcomeBriefingProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);

    // Prevent scrolling when expanded
    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = '' };
        }
    }, [isExpanded]);

    if (!isVisible) return null;

    const isSidebar = variant === 'sidebar';

    const handleSummarize = async () => {
        if (summaryData) {
            setIsExpanded(true);
            return;
        }

        setIsGenerating(true);
        setIsExpanded(true);
        
        window.dispatchEvent(new CustomEvent('show-subscription-status'));
        
        try {
            const data = await generateInboxSummaryAction({
                emails: emailsPayload.slice(0, 15).map(e => ({
                    id: e.id,
                    sender: e.sender?.name || e.sender?.email || 'Unknown',
                    subject: e.subject,
                    snippet: e.snippet,
                    urgencyScore: e.urgencyScore
                })),
                draftsCount,
                unreadCount
            });
            setSummaryData(data);
        } catch (error) {
            console.error("Failed to summarize:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <LayoutGroup>
            {/* INLINE / COMPACT WIDGET */}
            <AnimatePresence>
                {isVisible && !isExpanded && (
                    <motion.div
                        layoutId="briefing-card"
                        initial={{ opacity: 0, scale: 0.95, y: isSidebar ? 0 : -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ layout: { type: "spring", bounce: 0.2, duration: 0.6 } }}
                        className={cn(
                            "relative overflow-hidden border shadow-sm group bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md",
                            "border-accent/20",
                            isSidebar
                                ? "rounded-3xl p-5 flex flex-col gap-4 sticky top-6"
                                : "rounded-3xl p-6 sm:p-8 flex flex-col items-start gap-6 mb-6 w-full"
                        )}
                    >
                        {/* Background Glow */}
                        <motion.div
                            layoutId="briefing-glow"
                            className={cn(
                                "absolute bg-accent/20 rounded-full blur-2xl z-0",
                                isSidebar
                                    ? "top-0 right-0 -mt-8 -mr-8 w-32 h-32 opacity-50 group-hover:opacity-70"
                                    : "top-0 right-0 -mt-16 -mr-16 w-64 h-64 opacity-40 group-hover:opacity-60 blur-3xl"
                            )}
                        />

                        {/* Close button */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                            className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full z-20"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className={cn("relative z-10 w-full flex", isSidebar ? "flex-col gap-4" : "flex-row items-center gap-6")}>
                            <motion.div layoutId="briefing-bot" className={cn("shrink-0", isSidebar ? "w-12 h-12 self-start" : "w-16 h-16 sm:w-20 sm:h-20")}>
                                <BotEntity className="w-full h-full" />
                            </motion.div>
                            
                            <div className="flex-1">
                                <motion.h2 layoutId="briefing-title" className={cn("font-bold font-serif text-foreground leading-tight", isSidebar ? "text-base mb-1" : "text-xl sm:text-2xl mb-2")}>
                                    {isSidebar ? `Hi ${userName}!` : `Welcome back${userName ? `, ${userName}` : ''}!`}
                                </motion.h2>

                                <motion.p
                                    layoutId="briefing-desc"
                                    className={cn("text-muted-foreground leading-relaxed", isSidebar ? "text-sm" : "text-sm sm:text-base max-w-3xl mb-4")}
                                >
                                    {isSidebar ? (
                                        <>I've analyzed your inbox. {urgentCount} email{urgentCount === 1 ? '' : 's'} need attention.</>
                                    ) : (
                                        <>While you were away, I analyzed <span className="font-semibold text-foreground">{analyzedCount}</span> new emails. 
                                        There {urgentCount === 1 ? 'is' : 'are'} <span className="font-semibold text-accent">{urgentCount}</span> that require{urgentCount === 1 ? 's' : ''} your urgent attention, 
                                        and I've prepared <span className="font-semibold text-foreground">{draftsCount}</span> drafts.</>
                                    )}
                                </motion.p>

                                {!isSidebar && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <motion.button
                                            layoutId="briefing-btn"
                                            onClick={handleSummarize}
                                            className="px-4 py-2 text-sm font-medium rounded-xl shadow-sm bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {summaryData ? "Show Summary" : "Summarize Inbox"}
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isSidebar && (
                            <motion.button
                                layoutId="briefing-btn"
                                onClick={handleSummarize}
                                className="w-full relative z-10 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                {summaryData ? "Show Summary" : "Summarize Urgent"}
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXPANDED FULL-SCREEN OVERLAY */}
            <AnimatePresence>
                {isExpanded && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
                        />
                        
                        {/* The Expanding/Floating Card */}
                        <motion.div
                            layoutId="briefing-card"
                            transition={{ layout: { type: "spring", bounce: 0.15, duration: 0.7 } }}
                            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-2xl z-10"
                        >
                            {/* Inner Scroll container */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide relative z-10 w-full h-full flex flex-col content-start">
                                {/* Glows */}
                                <motion.div layoutId="briefing-glow" className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl z-0 pointer-events-none" />

                                {/* Header */}
                                <div className="relative z-10 flex items-start gap-4 md:gap-6 mb-8 lg:mb-10 w-full">
                                    <motion.div layoutId="briefing-bot" className="w-16 h-16 shrink-0 mt-1">
                                        <BotEntity className="w-full h-full" />
                                    </motion.div>
                                    
                                    <div className="flex-1 w-full min-w-0 pr-8">
                                        <motion.h2 layoutId="briefing-title" className="font-bold font-serif text-3xl md:text-4xl text-foreground mb-4">
                                            Inbox Intelligence Briefing
                                        </motion.h2>

                                        <motion.button
                                            layoutId="briefing-btn"
                                            onClick={() => setIsExpanded(false)}
                                            className="px-5 py-2.5 bg-accent text-accent-foreground rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wide shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                            Collapse Briefing
                                        </motion.button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsExpanded(false)} 
                                        className="absolute top-0 right-0 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors hidden sm:block"
                                    >
                                        <X className="w-6 h-6 text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Summary Content */}
                                <div className="relative z-10 flex-1 w-full flex flex-col">
                                    {isGenerating ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex flex-col items-center justify-center flex-1 py-12"
                                        >
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                                                <Loader2 className="w-12 h-12 text-accent animate-spin relative z-10" />
                                            </div>
                                            <p className="text-lg font-medium text-muted-foreground animate-pulse text-center max-w-md">
                                                Analyzing inbox context, synthesizing threads, and generating strategic insights...
                                            </p>
                                        </motion.div>
                                    ) : summaryData ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                            className="space-y-8 pb-4 w-full"
                                        >
                                            {/* Executive Summary */}
                                            {summaryData.executiveSummary && (
                                                <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/60 dark:border-white/10 shadow-sm w-full">
                                                    <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed">
                                                        {summaryData.executiveSummary.split('\n\n').map((paragraph: string, i: number) => (
                                                            <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                                                {/* Left Column: Urgent Matters */}
                                                <div className="space-y-6 w-full">
                                                    {summaryData.attentionEmails && summaryData.attentionEmails.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.4, duration: 0.5 }}
                                                            className="w-full"
                                                        >
                                                            <h4 className="text-sm font-bold uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
                                                                <AlertCircle className="w-5 h-5" />
                                                                Urgent Matters
                                                            </h4>
                                                            <div className="space-y-4 w-full">
                                                                {summaryData.attentionEmails.map((email: any, idx: number) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="bg-destructive/5 dark:bg-destructive/10 rounded-2xl p-5 border border-destructive/20 relative overflow-hidden w-full"
                                                                    >
                                                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-destructive/70 rounded-full" />
                                                                        <div className="flex justify-between items-start gap-3 mb-3 pr-4">
                                                                            <span className="font-bold text-base md:text-lg text-foreground w-full">{email.sender}</span>
                                                                            {email.id && <span className="text-[10px] bg-destructive text-white px-2.5 py-1 rounded-full shrink-0 font-bold tracking-widest uppercase mt-0.5">Critical</span>}
                                                                        </div>
                                                                        <p className="text-sm md:text-base font-semibold text-foreground mb-3">{email.subject}</p>
                                                                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{email.reason}</p>
                                                                        {email.recommendedAction && (
                                                                            <div className="bg-white/80 dark:bg-zinc-950/60 rounded-xl p-3 border border-destructive/10 mt-2">
                                                                                <p className="text-[11px] font-bold uppercase tracking-wider text-destructive/80 mb-1">Recommended Action</p>
                                                                                <p className="text-sm text-foreground font-medium">{email.recommendedAction}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Action Items */}
                                                    {summaryData.userActionItems && summaryData.userActionItems.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.5, duration: 0.5 }}
                                                            className="bg-primary/5 rounded-3xl p-6 border border-primary/15 w-full"
                                                        >
                                                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                                Your Action Items
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {summaryData.userActionItems.map((item: string, idx: number) => (
                                                                    <li key={idx} className="text-base text-foreground flex items-start gap-3 p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-colors">
                                                                        <span className="text-primary font-bold mt-0.5">•</span>
                                                                        <span className="leading-snug">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Right Column: Bot Work */}
                                                <div className="space-y-6 w-full">
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.45, duration: 0.5 }}
                                                        className="bg-accent/5 rounded-3xl p-6 border border-accent/15 h-full w-full"
                                                    >
                                                        <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
                                                            <Bot className="w-5 h-5" />
                                                            Bot Assistant Log
                                                        </h4>
                                                        
                                                        {summaryData.botWork && summaryData.botWork.length > 0 && (
                                                            <div className="mb-6">
                                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-accent/10 pb-2">Accomplishments</p>
                                                                <ul className="space-y-3">
                                                                    {summaryData.botWork.map((item: string, idx: number) => (
                                                                        <li key={idx} className="text-base text-foreground flex items-start gap-3">
                                                                            <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                            </div>
                                                                            <span className="leading-relaxed">{item}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {summaryData.botActionItems && summaryData.botActionItems.length > 0 && (
                                                            <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 mt-6">
                                                                <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-orange-500/10 pb-2">
                                                                    <AlertCircle className="w-4 h-4" /> Waiting on you
                                                                </p>
                                                                <ul className="space-y-3">
                                                                    {summaryData.botActionItems.map((item: string, idx: number) => (
                                                                        <li key={idx} className="text-base text-foreground flex items-start gap-3 text-orange-800 dark:text-orange-200">
                                                                            <span className="text-orange-500 font-bold mt-0.5 text-lg leading-none">→</span>
                                                                            <span className="leading-snug font-medium pt-0.5">{item}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>Failed to load summary. Please try again.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </LayoutGroup>
    );
}
