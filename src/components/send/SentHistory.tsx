'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideHistory, LucideArrowUpRight, LucideFilter, LucideCheck, LucideChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSentEmailsAction } from '@/app/actions/gmail';

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
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        }
        loadSent();
    }, []);

    const filteredEmails = useMemo(() => {
        if (timeframe === 'All time') return sentEmails;
        const now = new Date();
        let threshold = new Date();
        if (timeframe === 'Day') threshold.setDate(now.getDate() - 1);
        else if (timeframe === 'Week') threshold.setDate(now.getDate() - 7);
        else if (timeframe === 'Month') threshold.setMonth(now.getMonth() - 1);
        return sentEmails.filter(email => new Date(email.date) >= threshold);
    }, [sentEmails, timeframe]);

    return (
        <div className="flex flex-col bg-white/40 rounded-2xl border border-gray-100 overflow-hidden min-h-[100px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-sm font-bold flex items-center gap-2"><LucideHistory className="w-4 h-4 text-violet-500" /> Sent</h3><button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-[10px] font-bold text-gray-400 uppercase">{timeframe}</button></div>
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
                {isLoading ? <div>Loading...</div> : filteredEmails.map((email) => (
                    <div key={email.id} className="flex items-start gap-3 p-2 hover:bg-white rounded-xl"><div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center"><LucideArrowUpRight className="w-4 h-4" /></div><div className="flex-1 min-w-0"><div className="flex justify-between items-center"><p className="text-xs font-bold truncate">{email.recipient.name}</p><span className="text-[10px] text-gray-400">{new Date(email.date).toLocaleDateString()}</span></div><p className="text-[11px] text-gray-500 truncate">{email.subject}</p></div></div>
                ))}
            </div>
        </div>
    );
}
