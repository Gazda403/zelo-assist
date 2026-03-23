"use client";

import { useState, useEffect } from "react";
import { EmailCard } from "@/components/email/EmailCard";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Mail, LogIn, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchEmailsAction } from "@/app/actions/gmail";
import { LandingPage } from "@/components/landing/LandingPage";
import { EmailDetailPanel } from "@/components/email/EmailDetailPanel";
import { WelcomeBriefing } from "@/components/dashboard/WelcomeBriefing";

// Using strict types locally if not exported, or just infer
interface Email {
    id: string;
    threadId: string;
    subject: string;
    sender: { name: string; email: string };
    snippet: string;
    date: string;
    read: boolean;
    urgencyScore: number;
    urgencyReason: string;
}

export default function HomePage() {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [sortBy, setSortBy] = useState<'urgency' | 'date' | 'alphabetical'>('urgency');

    // Filtering & Pagination
    const [filter, setFilter] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);

    async function loadData(reset = false, token?: string) {
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = await fetchEmailsAction(token, filter);
            if (data) {
                if ('error' in data && data.error === 'Unauthorized') {
                    console.error("Authentication error:", data.message);
                    router.push('/');
                    return;
                }

                if (reset) {
                    setEmails(data.emails as Email[]);
                } else {
                    setEmails(prev => [...prev, ...data.emails as Email[]]);
                }
                setNextPageToken(data.nextPageToken);
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount);
                }
                // Enriched emails are set to state
            }
        } catch (error: any) {
            console.error("Failed to load emails:", error);
        } finally {
            if (reset) setLoading(false);
            else setLoadingMore(false);
        }
    }

    // Initial load or filter change
    useEffect(() => {
        if (status === "authenticated") {
            loadData(true);
        }
    }, [filter, status]);

    const handleLoadMore = () => {
        if (nextPageToken) {
            loadData(false, nextPageToken);
        }
    };

    // const unreadCount = emails.filter((e) => !e.read).length;
    const avgUrgency = emails.length > 0 ? (emails.reduce((sum, e) => sum + e.urgencyScore, 0) / emails.length).toFixed(1) : "0.0";

    const sortedEmails = [...emails].sort((a, b) => {
        if (sortBy === 'urgency') {
            return b.urgencyScore - a.urgencyScore;
        } else if (sortBy === 'date') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            return a.sender.name.localeCompare(b.sender.name);
        }
    });

    // Move selected email to the top when one is selected
    const displayEmails = selectedEmailId
        ? [
            ...sortedEmails.filter(e => e.id === selectedEmailId),
            ...sortedEmails.filter(e => e.id !== selectedEmailId)
        ]
        : sortedEmails;

    // If checking auth or fetching initial data
    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#FAFAF9]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Loading Inbox...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show the Landing Page
    if (status === "unauthenticated") {
        return <LandingPage />;
    }

    // Authenticated View
    const userName = session?.user?.name?.split(' ')[0] || "";
    const urgentEmailsCount = emails.filter(e => e.urgencyScore >= 8).length;

    return (
        <AppShell
            title="Inbox"
            onSelectEmail={setSelectedEmailId}
        >
            <div className="relative max-w-4xl mx-auto h-full px-4 sm:px-0">
                
                {/* Bot Sidebar (Desktop - Absolute Position to keep content centered) */}
                {!selectedEmailId && (
                    <aside className="hidden lg:block lg:absolute lg:right-full lg:mr-12 xl:mr-24 top-0 w-72 xl:w-80 shrink-0">
                        <WelcomeBriefing 
                            variant="sidebar"
                            userName={userName}
                            analyzedCount={emails.length}
                            urgentCount={urgentEmailsCount}
                            draftsCount={2}
                            emailsPayload={emails}
                            unreadCount={unreadCount}
                        />
                    </aside>
                )}

                {/* Main Content Column (Perfectly Centered) */}
                <div className="space-y-6 transition-all duration-300 w-full mb-20">
                    
                    {/* Bot Banner (Mobile/Tablet only) */}
                    {!selectedEmailId && (
                        <div className="lg:hidden">
                            <WelcomeBriefing 
                                variant="banner"
                                userName={userName}
                                analyzedCount={emails.length}
                                urgentCount={urgentEmailsCount}
                                draftsCount={2}
                                emailsPayload={emails}
                                unreadCount={unreadCount}
                            />
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-accent/20 dark:bg-accent/40 rounded-full blur-2xl group-hover:bg-accent/30 dark:group-hover:bg-accent/50 transition-all duration-500" />
                            <div className="flex items-center gap-3 mb-2 relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 dark:from-accent/20 dark:to-accent/5 flex items-center justify-center border border-accent/20 dark:border-white/10 shadow-inner">
                                    <Mail className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{unreadCount}</p>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Unread</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500/20 dark:bg-amber-500/40 rounded-full blur-2xl group-hover:bg-amber-500/30 dark:group-hover:bg-amber-500/50 transition-all duration-500" />
                            <div className="flex items-center gap-3 mb-2 relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 dark:from-amber-500/20 dark:to-amber-500/5 flex items-center justify-center border border-amber-500/20 dark:border-white/10 shadow-inner">
                                    <TrendingUp className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{avgUrgency}</p>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Avg Urgency</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/20 dark:bg-purple-500/40 rounded-full blur-2xl group-hover:bg-purple-500/30 dark:group-hover:bg-purple-500/50 transition-all duration-500" />
                            <div className="flex items-center gap-3 mb-2 relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 dark:from-purple-500/20 dark:to-purple-500/5 flex items-center justify-center border border-purple-500/20 dark:border-white/10 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{emails.length}</p>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">AI Analyzed</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 pb-2 overflow-x-auto">
                        {(['1d', '7d', '30d', 'all'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${filter === f
                                    ? 'bg-primary text-white shadow-primary/30'
                                    : 'bg-white/70 backdrop-blur-sm text-gray-500 hover:bg-white/90 hover:text-gray-800 border border-white/60'
                                    }`}
                            >
                                {f === '1d' ? 'Last 24h' : f === '7d' ? 'Last 7 Days' : f === '30d' ? 'Last Month' : 'All Time'}
                            </button>
                        ))}
                    </div>

                    {/* Email List */}
                    <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-serif font-bold dark:text-white">Your Emails</h2>
                                <div className="text-sm text-muted-foreground">
                                    Sorted by {sortBy} &bull; {emails.length} items
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white/60 p-1.5 rounded-xl border border-white/60 dark:bg-zinc-800/80 dark:border-white/10 backdrop-blur-md shadow-sm w-full sm:w-auto overflow-x-auto">
                                {(['urgency', 'date', 'alphabetical'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSortBy(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${sortBy === s
                                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            // Should not be reachable if loading handles full page, but keeping for filter changes which don't trigger full page reload
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                                <p className="text-muted-foreground">Loading emails...</p>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No emails found matching criteria.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {displayEmails.map((email, index) => (
                                    <motion.div
                                        key={email.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                    >
                                        <EmailCard
                                            email={email as any}
                                            onClick={() => setSelectedEmailId(selectedEmailId === email.id ? null : email.id)}
                                            isSelected={selectedEmailId === email.id}
                                        />
                                    </motion.div>
                                ))}

                                {/* Load More Trigger */}
                                {nextPageToken && (
                                    <div className="pt-4 flex justify-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 disabled:opacity-50"
                                        >
                                            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {loadingMore ? 'Loading more...' : 'Load More Results'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Email Detail */}
                {selectedEmailId && (() => {
                    const selectedEmail = emails.find(e => e.id === selectedEmailId);
                    if (!selectedEmail) return null;
                    return (
                        <div className="w-full lg:w-1/2 h-full">
                            <EmailDetailPanel
                                emailId={selectedEmail.id}
                                sender={selectedEmail.sender}
                                subject={selectedEmail.subject}
                                date={selectedEmail.date}
                                snippet={selectedEmail.snippet}
                                onClose={() => setSelectedEmailId(null)}
                            />
                        </div>
                    );
                })()}
            </div>
        </AppShell>
);
