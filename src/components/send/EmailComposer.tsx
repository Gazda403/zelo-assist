'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideSend, LucideSparkles, LucidePaperclip, LucideImage, LucideSmile, LucideMoreVertical, LucideTrash2, LucideType } from 'lucide-react';
import { generateDraftAction, sendEmailAction } from '@/app/actions/gmail';

export function EmailComposer({ initialTo = '' }: { initialTo?: string }) {
    const [to, setTo] = useState(initialTo);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiInput.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateDraftAction(`new-${Date.now()}`, to, to, subject || "(No Subject)", aiInput);
            setContent(result.draft);
            setAiInput('');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSend = async () => {
        if (!to || !content) return;
        setIsSending(true);
        try {
            await sendEmailAction(to, subject, content);
            alert("Email sent!");
            setTo(''); setSubject(''); setContent('');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border shadow-xl">
            <div className="p-6 border-b space-y-4">
                <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full text-sm focus:outline-none" placeholder="To: recipient@example.com" />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full text-sm font-bold focus:outline-none" placeholder="Subject: The topic" />
            </div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 p-6 text-base focus:outline-none resize-none min-h-[300px]" placeholder="Write your email..." />
            <div className="p-5 border-t bg-gray-50 flex flex-col gap-4">
                <div className="relative">
                    <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()} className="w-full bg-white border rounded-full pl-12 pr-14 py-3 text-sm focus:outline-none" placeholder="AI Prompt: Write an invitation..." />
                    <button onClick={handleAiGenerate} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full"><LucideSparkles className="w-4 h-4" /></button>
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={handleSend} disabled={isSending || !to || !content} className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">Send <LucideSend className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}
