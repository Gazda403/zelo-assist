'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, User, Loader2, Sparkles, Send, ArrowLeft } from 'lucide-react';
import { fetchEmailBodyAction } from '@/app/actions/gmail';
import { useRouter } from 'next/navigation';

export function EmailDetailPanel({ emailId, sender, subject, date, snippet, onClose }: any) {
    const [fullBody, setFullBody] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const body = await fetchEmailBodyAction(emailId);
                setFullBody(body || snippet);
            } catch {
                setFullBody(snippet);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [emailId, snippet]);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col bg-white rounded-2xl border shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center gap-3">
                <button onClick={onClose}><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-2xl font-bold flex-1">{sender.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div> : fullBody}
            </div>
            <div className="p-5 border-t flex gap-4">
                <button onClick={() => router.push(`/drafts?emailId=${emailId}`)} className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold">AI Draft Reply</button>
                <button onClick={() => router.push(`/send?to=${encodeURIComponent(sender.email)}`)} className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold">Create New</button>
            </div>
        </motion.div>
    );
}
