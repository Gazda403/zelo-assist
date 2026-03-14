"use client";

import { useState, useEffect } from "react";
import { EmailCard } from "@/components/email/EmailCard";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchEmailsAction } from "@/app/actions/gmail";
import { LandingPage } from "@/components/landing/LandingPage";
import { EmailDetailPanel } from "@/components/email/EmailDetailPanel";

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [sortBy, setSortBy] = useState<'urgency' | 'date' | 'alphabetical'>('urgency');

    const [filter, setFilter] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);

    async function loadData(reset = false, token?: string) {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        try {
            const data = await fetchEmailsAction(token, filter);
            if (data) {
                if ('error' in data && data.error === 'Unauthorized') {
                    router.push('/');
                    return;
                }
                if (reset) setEmails(data.emails as Email[]);
                else setEmails(prev => [...prev, ...data.emails as Email[]]);
                setNextPageToken(data.nextPageToken);
                if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            if (reset) setLoading(false);
            else setLoadingMore(false);
        }
    }

    useEffect(() => {
        loadData(true);
    }, [filter]);

    const handleLoadMore = () => {
        if (nextPageToken) loadData(false, nextPageToken);
    };

    const avgUrgency = emails.length > 0 ? (emails.reduce((sum, e) => sum + e.urgencyScore, 0) / emails.length).toFixed(1) : "0.0";

    const sortedEmails = [...emails].sort((a, b) => {
        if (sortBy === 'urgency') return b.urgencyScore - a.urgencyScore;
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.sender.name.localeCompare(b.sender.name);
    });

    const displayEmails = selectedEmailId
        ? [...sortedEmails.filter(e => e.id === selectedEmailId), ...sortedEmails.filter(e => e.id !== selectedEmailId)]
        : sortedEmails;

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#FAFAF9]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Loading Inbox...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <LandingPage />;

    return (
        <AppShell title="Inbox" onSelectEmail={setSelectedEmailId}>
            <div className="flex gap-6 h-full">
                <div className={`space-y-6 transition-all duration-300 ${selectedEmailId ? 'w-1/2' : 'w-full'}`}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/20">
                                    <Mail className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Unread</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                                    <TrendingUp className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{avgUrgency}</p>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Avg Urgency</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-3 relative">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">AI Analyzed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {displayEmails.map((email) => (
                            <EmailCard
                                key={email.id}
                                email={email as any}
                                onClick={() => setSelectedEmailId(selectedEmailId === email.id ? null : email.id)}
                                isSelected={selectedEmailId === email.id}
                            />
                        ))}
                        {nextPageToken && (
                            <div className="pt-4 flex justify-center">
                                <button onClick={handleLoadMore} disabled={loadingMore} className="px-6 py-2 bg-secondary rounded-full hover:bg-secondary/80 disabled:opacity-50">
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {selectedEmailId && (
                    <div className="w-1/2 h-full">
                        <EmailDetailPanel
                            emailId={selectedEmailId}
                            onClose={() => setSelectedEmailId(null)}
                        />
                    </div>
                )}
            </div>
        </AppShell>
    );
}
