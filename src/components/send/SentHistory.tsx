'use client';
import { useState, useEffect } from 'react';
import { LucideHistory, LucideArrowUpRight } from 'lucide-react';
import { fetchSentEmailsAction } from '@/app/actions/gmail';

export function SentHistory() {
    const [sentEmails, setSentEmails] = useState<any[]>([]);
    useEffect(() => {
        async function load() {
            const data = await fetchSentEmailsAction();
            if (data) setSentEmails(data);
        }
        load();
    }, []);

    return (
        <div className="bg-white/40 rounded-2xl border overflow-hidden">
            <div className="p-4 border-b font-bold text-sm flex items-center gap-2"><LucideHistory className="text-violet-500 w-4 h-4"/> Sent History</div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {sentEmails.map((e) => (
                    <div key={e.id} className="flex gap-3 items-center">
                        <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center"><LucideArrowUpRight className="w-4 h-4"/></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{e.recipient.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{e.subject}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
