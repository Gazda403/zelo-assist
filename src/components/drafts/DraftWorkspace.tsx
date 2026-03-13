'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideSend, LucideEdit3, LucideSparkles, LucideCopy, LucideCheck, LucideX } from 'lucide-react';
import { refineDraftAction, sendEmailAction, fetchEmailBodyAction } from '@/app/actions/gmail';

export default function DraftWorkspace({ selectedEmail }: any) {
    const [draft, setDraft] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!selectedEmail) { setDraft(''); return; }
        setDraft(`Dear ${selectedEmail.sender.name},\n\nThank you for your email regarding "${selectedEmail.subject}".\n\nBest regards`);
    }, [selectedEmail?.id]);

    const handleRefine = async () => {
        if (!chatInput.trim()) return;
        setIsRefining(true);
        try {
            const result = await refineDraftAction(draft, chatInput, { sender: selectedEmail.sender.name, subject: selectedEmail.subject });
            setDraft(result.refinedDraft);
            setChatInput('');
        } finally {
            setIsRefining(false);
        }
    };

    if (!selectedEmail) return <div className="h-full flex items-center justify-center text-gray-400">Select an email to start drafting</div>;

    return (
        <div className="h-full flex flex-col bg-white/40 backdrop-blur-2xl">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">{selectedEmail.subject}</h1>
                <p className="text-sm text-gray-600">{selectedEmail.sender.name} &lt;{selectedEmail.sender.email}&gt;</p>
            </div>
            <div className="flex-1 p-6 relative flex flex-col">
                <textarea className="flex-1 w-full bg-white border rounded-2xl p-5 text-gray-800 resize-none font-sans" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="absolute bottom-10 right-10 flex gap-3">
                    <button onClick={() => { navigator.clipboard.writeText(draft); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="p-3 bg-white border rounded-xl shadow-lg">{isCopied ? <LucideCheck className="text-green-500"/> : <LucideCopy/>}</button>
                    <button onClick={async () => { await sendEmailAction(selectedEmail.sender.email, `Re: ${selectedEmail.subject}`, draft); alert("Sent!"); }} className="p-3 bg-violet-600 text-white rounded-xl shadow-lg flex items-center gap-2">Send <LucideSend className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="p-6">
                <div className="max-w-2xl mx-auto relative">
                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefine()} className="w-full bg-white border rounded-full pl-12 pr-14 py-4 shadow-xl" placeholder="Ask AI to refine..." />
                    <LucideSparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"/>
                    <button onClick={handleRefine} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-full"><LucideSend className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    );
}
