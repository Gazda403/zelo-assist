import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronDown, CheckCircle2, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BotEntity } from './BotEntity';
import { generateInboxSummaryAction } from '@/app/actions/summary';

interface WelcomeBriefingProps {
    userName: string;
    analyzedCount: number;
    urgentCount: number;
    draftsCount: number;
    variant?: 'banner' | 'sidebar';
    emailsPayload?: any[]; // The emails to send to the summarizer
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

    if (!isVisible) return null;

    const isSidebar = variant === 'sidebar';

    const handleSummarize = async () => {
        if (summaryData) {
            setIsExpanded(!isExpanded);
            return;
        }

        setIsGenerating(true);
        setIsExpanded(true);
        
        // Contextually show the subscription status/usage
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
            // Handle error state if necessary
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: isSidebar ? -20 : 0, y: isSidebar ? 0 : -20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, width: isSidebar ? 0 : 'auto', height: isSidebar ? 'auto' : 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className={cn(
                    "relative overflow-hidden bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent border border-accent/20 shadow-sm group",
                    isSidebar ? "rounded-3xl p-5 flex flex-col gap-4 sticky top-6" : "rounded-3xl p-6 sm:p-8 flex flex-col items-start gap-6 mb-6 w-full"
                )}
            >
                {/* Background Glow */}
                <div className={cn(
                    "absolute top-0 right-0 bg-accent/20 rounded-full blur-2xl transition-opacity duration-1000 z-0",
                    isSidebar ? "-mt-8 -mr-8 w-32 h-32 opacity-50 group-hover:opacity-70" : "-mt-16 -mr-16 w-64 h-64 opacity-40 group-hover:opacity-60 blur-3xl"
                )} />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors z-20"
                >
                    <X className="w-3.5 h-3.5" />
                </button>

                {/* OVERVIEW SECTION (Always visible) */}
                <div className={cn("relative z-10 w-full flex", isSidebar ? "flex-col gap-4" : "flex-row items-center gap-6")}>
                    <BotEntity className={cn("shrink-0", isSidebar ? "w-12 h-12 self-start" : "w-16 h-16 sm:w-20 sm:h-20")} />
                    
                    <div className="flex-1">
                        <h2 className={cn("font-bold font-serif text-foreground leading-tight", isSidebar ? "text-base mb-1" : "text-xl sm:text-2xl mb-2")}>
                            {isSidebar ? `Hi ${userName}!` : `Welcome back${userName ? `, ${userName}` : ''}!`}
                        </h2>
                        <p className={cn("text-muted-foreground leading-relaxed", isSidebar ? "text-sm" : "text-sm sm:text-base max-w-3xl mb-4")}>
                            {isSidebar ? (
                                <>I've analyzed your inbox. {urgentCount} email{urgentCount === 1 ? 's' : ''} need attention.</>
                            ) : (
                                <>While you were away, I analyzed <span className="font-semibold text-foreground">{analyzedCount}</span> new emails. 
                                There {urgentCount === 1 ? 'is' : 'are'} <span className="font-semibold text-accent">{urgentCount}</span> that require{urgentCount === 1 ? 's' : ''} your urgent attention, 
                                and I've prepared <span className="font-semibold text-foreground">{draftsCount}</span> drafts.</>
                            )}
                        </p>

                        {!isSidebar && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleSummarize}
                                    className="px-4 py-2 text-sm bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent/50 focus:outline-none flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {summaryData ? (isExpanded ? "Hide Summary" : "Show Summary") : "Summarize Inbox"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isSidebar && (
                     <button
                        onClick={handleSummarize}
                        className="w-full relative z-10 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px] shadow-sm focus:ring-2 focus:ring-accent/50 focus:outline-none"
                    >
                        <Sparkles className="w-4 h-4" />
                        {summaryData ? (isExpanded ? "Hide Summary" : "Show Summary") : "Summarize Urgent"}
                    </button>
                )}

                {/* EXPANDABLE SUMMARY SECTION */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="relative z-10 w-full overflow-hidden"
                        >
                            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-inner w-full">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analyzing inbox context & generating insights...</p>
                                    </div>
                                ) : summaryData ? (
                                    <div className="space-y-6">
                                        {/* Emails needing attention */}
                                        {summaryData.attentionEmails && summaryData.attentionEmails.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-destructive/80 mb-3 flex items-center gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Needs Attention
                                                </h4>
                                                <div className="space-y-2">
                                                    {summaryData.attentionEmails.map((email: any, idx: number) => (
                                                        <div key={idx} className="bg-white/80 dark:bg-zinc-800/80 rounded-xl p-3 shadow-sm border border-destructive/10">
                                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                                <span className="font-semibold text-sm text-foreground truncate">{email.sender}</span>
                                                                {email.id && <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full shrink-0">Priority</span>}
                                                            </div>
                                                            <p className="text-xs font-medium text-foreground mb-1 truncate">{email.subject}</p>
                                                            <p className="text-xs text-muted-foreground">{email.reason}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bot Work & Action Items (Grid Layout) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* What the user needs to do */}
                                            {summaryData.userActionItems && summaryData.userActionItems.length > 0 && (
                                                <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Your Action Items
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {summaryData.userActionItems.map((item: string, idx: number) => (
                                                            <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                                                <span className="text-accent mt-0.5">•</span>
                                                                <span className="leading-snug">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* What the bots did / need */}
                                            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                    <Bot className="w-3.5 h-3.5" />
                                                    Bot Assistant Log
                                                </h4>
                                                
                                                {summaryData.botWork && summaryData.botWork.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Accomplishments</p>
                                                        <ul className="space-y-1.5">
                                                            {summaryData.botWork.map((item: string, idx: number) => (
                                                                <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                                                                    <span className="text-blue-500 mt-0.5">✓</span>
                                                                    <span className="leading-snug">{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {summaryData.botActionItems && summaryData.botActionItems.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-orange-500 uppercase mb-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> Waiting on you
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {summaryData.botActionItems.map((item: string, idx: number) => (
                                                                <li key={idx} className="text-xs text-foreground flex items-start gap-2 text-orange-700 dark:text-orange-300">
                                                                    <span className="mt-0.5">-</span>
                                                                    <span className="leading-snug">{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 text-muted-foreground text-sm">
                                        Failed to load summary.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
