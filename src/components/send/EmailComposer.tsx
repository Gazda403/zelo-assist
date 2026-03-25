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

    // Auto-expand textarea
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
            const result = await generateDraftAction(
                `new-${Date.now()}`,
                to,
                to, // senderEmail used as proxy
                subject || "(No Subject)",
                aiInput // prompt
            );
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
            // Reset form
            setTo('');
            setSubject('');
            setContent('');
        } catch (error) {
            console.error("Failed to send email:", error);
            alert("Failed to send email. Check console for details.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div id="tour-send-logic" className="flex-1 flex flex-col bg-white overflow-hidden rounded-2xl border border-gray-100/80 shadow-xl shadow-black/[0.03] transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.05]">
            {/* Headers */}
            <div className="p-6 border-b border-gray-50/80 space-y-4">
                <div className="flex items-center gap-4 group">
                    <span className="text-sm font-medium text-gray-400 w-12 transition-colors group-focus-within:text-violet-500">To</span>
                    <input
                        type="email"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-300 transition-all"
                        placeholder="recipient@example.com"
                    />
                    <div className="flex gap-2 text-[10px] font-medium text-gray-400 transition-opacity opacity-70 hover:opacity-100">
                        <span className="cursor-pointer hover:text-violet-500 transition-colors">Cc</span>
                        <span className="cursor-pointer hover:text-violet-500 transition-colors">Bcc</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <span className="text-sm font-medium text-gray-400 w-12 transition-colors group-focus-within:text-violet-500">Subject</span>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-300 font-medium transition-all"
                        placeholder="The topic of your email"
                    />
                </div>
            </div>

            {/* Editor Area */}
            <div className="p-6 flex flex-col relative group flex-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-base bg-transparent focus:outline-none resize-none placeholder:text-gray-300 min-h-[200px] overflow-hidden leading-relaxed"
                    placeholder="Write your email here or use the AI assistant below..."
                />
            </div>

            {/* AI Action Area & Footer */}
            <div className="p-5 flex flex-col gap-4 bg-gradient-to-b from-transparent to-gray-50/50 mt-auto border-t border-gray-50/80">
                {/* AI Input (Floating Input Style) */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-violet-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <LucideSparkles className={cn("w-5 h-5 transition-all duration-300", isGenerating ? "text-violet-500 animate-spin-slow scale-110" : "text-violet-400 group-focus-within:text-violet-500")} />
                    </div>
                    <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                        className="w-full bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-full pl-12 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300 placeholder:text-gray-400"
                        placeholder="Write an email invitation to a dinner..."
                    />
                    <button
                        onClick={handleAiGenerate}
                        disabled={isGenerating || !aiInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full transition-all duration-300 disabled:opacity-50 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/40 disabled:hover:scale-100 hover:scale-105 active:scale-95"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucideSend className="w-4 h-4" />}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSend}
                            disabled={isSending || !to || !content}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-7 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform disabled:hover:-translate-y-0 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isSending ? "Sending..." : "Send"}
                            <LucideSend className="w-4 h-4" />
                        </button>
                        <div className="h-5 w-px bg-gray-200" />
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <button className="p-2 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideType className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucidePaperclip className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideImage className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideSmile className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-gray-400">
                        <button className="p-2 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideMoreVertical className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideTrash2 className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
