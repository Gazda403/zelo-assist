'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideChevronDown, LucideHistory, LucideArrowUpRight, LucideFilter, LucideCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSentEmailsAction } from '@/app/actions/gmail';

const TIMEFRAMES = ['Day', 'Week', 'Month', 'All time'];

export function SentHistory() {
    const [sentEmails, setSentEmails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('Week');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        async function loadSent() {
            try {
                const data = await fetchSentEmailsAction();
                if (data) setSentEmails(data);
            } catch (error) {
                console.error("Failed to load sent history:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSent();
    }, []);

    const filteredEmails = useMemo(() => {
        if (timeframe === 'All time') return sentEmails;

        const now = new Date();
        let threshold = new Date();

        if (timeframe === 'Day') {
            threshold.setDate(now.getDate() - 1);
        } else if (timeframe === 'Week') {
            threshold.setDate(now.getDate() - 7);
        } else if (timeframe === 'Month') {
            threshold.setMonth(now.getMonth() - 1);
        }

        return sentEmails.filter(email => new Date(email.date) >= threshold);
    }, [sentEmails, timeframe]);

    return (
        <div className="flex flex-col bg-white/40 rounded-2xl border border-gray-100 overflow-hidden relative">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <LucideHistory className="w-4 h-4 text-violet-500" />
                    Emails Sent
                </h3>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[100px]">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex items-start gap-3">
                                <div className="h-2 bg-gray-50 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredEmails.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic">
                        No emails sent in this timeframe
                    </div>
                ) : (
                    filteredEmails.map((email) => (
                        <motion.div
                            key={email.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-start gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                        {email.recipient?.name || 'Unknown'}
                                    </p>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium truncate">{email.subject}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
