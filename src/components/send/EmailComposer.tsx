'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideSend, LucideSparkles, LucidePaperclip, LucideImage, LucideSmile, LucideMoreVertical, LucideTrash2, LucideType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDraftAction, sendEmailAction } from '@/app/actions/gmail';

export function EmailComposer({ initialTo = '' }: { initialTo?: string }) {
    const [to, setTo] = useState(initialTo);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    const handleAiGenerate = async () => {
        if (!aiInput.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateDraftAction(`new-${Date.now()}`, to, to, subject || "(No Subject)", aiInput);
            setContent(result.draft);
            setAiInput('');
        } catch (error) {
            console.error("AI Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSend = async () => {
        if (!to || !content) return;
        setIsSending(true);
        try {
            await sendEmailAction(to, subject, content);
            alert("Email sent successfully!");
            setTo(''); setSubject(''); setContent('');
        } catch (error) {
            alert("Failed to send email.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 space-y-4">
                <div className="flex items-center gap-4"><span className="text-sm font-medium text-gray-400 w-12">To</span><input type="email" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 text-sm bg-transparent outline-none" placeholder="recipient@example.com" /></div>
                <div className="flex items-center gap-4"><span className="text-sm font-medium text-gray-400 w-12">Subject</span><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 text-sm bg-transparent outline-none font-medium" placeholder="Subject" /></div>
            </div>
            <div className="p-6 flex-1"><textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} className="w-full text-base bg-transparent outline-none resize-none min-h-[200px] leading-relaxed" placeholder="Write your email..." /></div>
            <div className="p-5 flex flex-col gap-4 bg-gray-50/50 border-t border-gray-50">
                <div className="relative"><LucideSparkles className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", isGenerating ? "text-violet-500 animate-spin-slow" : "text-violet-400")} />
                <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()} className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-14 py-3.5 text-sm outline-none" placeholder="AI assistant..." />
                <button onClick={handleAiGenerate} disabled={isGenerating || !aiInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-full"><LucideSend className="w-4 h-4" /></button></div>
                <div className="flex items-center justify-between"><button onClick={handleSend} disabled={isSending || !to || !content} className="bg-violet-600 text-white px-7 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2">{isSending ? "Sending..." : "Send"} <LucideSend className="w-4 h-4" /></button></div>
            </div>
        </div>
    );
}
