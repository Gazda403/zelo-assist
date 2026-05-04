'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideSend, LucideSparkles, LucidePaperclip, LucideImage, LucideSmile, LucideMoreVertical, LucideTrash2, LucideType, LucideUpload, LucideX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { composeNewEmailAction, sendEmailAction } from '@/app/actions/gmail';
import { 
    startSequenceAction,
    getActiveSequencesAction, 
    dismissSequenceAction 
} from '@/app/actions/sequences';
import { toast } from 'sonner';

export function SequencingComposer() {
    const [recipientsText, setRecipientsText] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeSequences, setActiveSequences] = useState<any[]>([]);

    // Load active sequences and poll
    useEffect(() => {
        const fetchSequences = async () => {
            const sequences = await getActiveSequencesAction();
            setActiveSequences(sequences);
        };
        fetchSequences();
        
        const interval = setInterval(fetchSequences, 3000);
        return () => clearInterval(interval);
    }, []);

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
            const result = await composeNewEmailAction(
                '',          // recipientEmail
                '',          // recipientName
                subject,     
                aiInput      
            );
            setContent(result.draft);
            if (!subject.trim() && result.subject) {
                setSubject(result.subject);
            }
            setAiInput('');
        } catch (error) {
            console.error("AI Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setCsvFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target?.result as string;
                    // Improved regex to handle common cases with or without quotes
                    const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [];
                    setRecipientsText(prev => {
                       const existing = prev ? prev + '\n' : '';
                       return existing + emails.join('\n');
                    });
                };
                reader.readAsText(file);
            } else {
                toast.error("Please upload a valid CSV file");
            }
        }
    };

    const handleSend = async () => {
        if (!recipientsText && !csvFile) {
            toast.error("Please add recipients (manual list or CSV).");
            return;
        }
        if (!content) {
            toast.error("Please add some content.");
            return;
        }
        
        setIsStarting(true);
        try {
            // Extract all emails
            const emailsToProcess = [...new Set(recipientsText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [])];
            
            if (emailsToProcess.length === 0) {
                toast.error("No valid email addresses found.");
                setIsStarting(false);
                return;
            }

            toast.info(`Starting background sequence to ${emailsToProcess.length} recipients...`);
            
            // Fire and forget server action
            await startSequenceAction(emailsToProcess, subject, content);
            
            toast.success("Sequence started in the background!");
            
            // Clear composer
            setRecipientsText('');
            setCsvFile(null);
            setSubject('');
            setContent('');
            setAiInput('');
            
            // Immediately fetch to show the new tracker
            const sequences = await getActiveSequencesAction();
            setActiveSequences(sequences);
        } catch (error) {
            console.error("Failed to start sequence:", error);
            toast.error("Failed to start sequence. Check console for details.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleDiscard = async () => {
        if (content || subject || recipientsText || csvFile) {
            if (confirm('Are you sure you want to discard this draft?')) {
                setRecipientsText('');
                setCsvFile(null);
                setSubject('');
                setContent('');
                setAiInput('');
                toast.success('Draft discarded');
            }
        }
    };

    const handleDismissTracker = async (sequenceId: string) => {
        await dismissSequenceAction(sequenceId);
        setActiveSequences(prev => prev.filter(s => s.id !== sequenceId));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl border border-gray-100/80 dark:border-white/10 shadow-xl shadow-black/[0.03] transition-all duration-500 hover:shadow-2xl hover:shadow-black/[0.05]">
                <div className="p-6 border-b border-gray-50/80 dark:border-white/10 space-y-4">
                    <div className="flex flex-col gap-2 group">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-400 transition-colors group-focus-within:text-orange-500">Recipients (Manual List or CSV)</span>
                            <div>
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                                >
                                    <LucideUpload className="w-3.5 h-3.5" />
                                    Import CSV
                                </button>
                            </div>
                        </div>
                        {csvFile && (
                            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-lg text-sm w-fit border border-orange-100 dark:border-orange-500/20">
                                <LucidePaperclip className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{csvFile.name}</span>
                                <button onClick={() => setCsvFile(null)} className="p-1 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-md transition-colors"><LucideX className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                        <textarea
                            value={recipientsText}
                            onChange={(e) => setRecipientsText(e.target.value)}
                            className="w-full text-sm bg-gray-50/50 dark:bg-zinc-800/50 rounded-xl p-3 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-y min-h-[80px] border border-transparent focus:border-orange-200 dark:focus:border-orange-500/30 transition-all"
                            placeholder="john@example.com, jane@example.com..."
                        />
                    </div>
                    <div className="flex items-center gap-4 group">
                        <span className="text-sm font-medium text-gray-400 w-16 transition-colors group-focus-within:text-orange-500">Subject</span>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-300 font-medium transition-all"
                            placeholder="The topic of your sequence email"
                        />
                    </div>
                </div>

                <div className="p-6 flex flex-col relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full text-base bg-transparent focus:outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-gray-200 min-h-[120px] overflow-hidden leading-relaxed"
                        placeholder="Write your sequence email here or use the AI assistant below..."
                    />
                </div>

                <div className="p-5 flex flex-col gap-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-zinc-800/50 mt-auto border-t border-gray-50/80 dark:border-white/10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <LucideSparkles className={cn("w-5 h-5 transition-all duration-300", isGenerating ? "text-orange-500 animate-spin-slow scale-110" : "text-orange-400 group-focus-within:text-orange-500")} />
                        </div>
                        <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                            className="w-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 rounded-full pl-12 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 placeholder:text-gray-400 dark:text-gray-200"
                            placeholder="Write an email invitation to a dinner..."
                        />
                        <button
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !aiInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-full transition-all duration-300 disabled:opacity-50 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/40 disabled:hover:scale-100 hover:scale-105 active:scale-95"
                        >
                            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucideSend className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSend}
                                disabled={isStarting || (!recipientsText && !csvFile) || !content}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-7 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform disabled:hover:-translate-y-0 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isStarting ? "Starting..." : "Start Sequence"}
                                <LucideSend className="w-4 h-4" />
                            </button>
                            <div className="h-5 w-px bg-gray-200 dark:bg-zinc-700" />
                            <div className="flex items-center gap-0.5 text-gray-400 dark:text-gray-500">
                                <button onClick={() => toast.info('Text formatting coming soon!')} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideType className="w-4 h-4" /></button>
                                <button onClick={() => toast.info('File attachments coming soon!')} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucidePaperclip className="w-4 h-4" /></button>
                                <button onClick={() => toast.info('Image uploads coming soon!')} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideImage className="w-4 h-4" /></button>
                                <button onClick={() => toast.info('Emoji picker coming soon!')} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-500/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideSmile className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-gray-400 dark:text-gray-500">
                            <button onClick={() => toast.info('More options coming soon!')} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideMoreVertical className="w-4 h-4" /></button>
                            <button onClick={handleDiscard} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"><LucideTrash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {activeSequences.map((seq) => {
                        const isFinished = seq.status === 'completed' || seq.sent_count >= seq.total_count;
                        const isSeqSending = seq.status === 'active' && !isFinished;
                        const progressPercentage = seq.total_count ? Math.round((seq.sent_count / seq.total_count) * 100) : 0;
                        
                        return (
                            <motion.div
                                key={seq.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100/80 dark:border-white/10 shadow-xl p-6 space-y-6 relative group/card"
                            >
                                {/* Dismiss Button */}
                                <button 
                                    onClick={() => handleDismissTracker(seq.id)}
                                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                                    title="Dismiss Tracker"
                                >
                                    <LucideX className="w-4 h-4" />
                                </button>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                            <LucideSend className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white max-w-[200px] sm:max-w-xs truncate" title={seq.subject}>{seq.subject || 'No Subject'}</h3>
                                            <p className="text-xs text-gray-400">{isSeqSending ? 'Sending emails...' : 'Sequence completed'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-orange-500">{progressPercentage}%</span>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Progress</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center transition-all hover:scale-105">
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{seq.total_count}</p>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total</p>
                                    </div>
                                    <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center transition-all hover:scale-105">
                                        <p className="text-2xl font-black text-orange-500">{seq.sent_count}</p>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Sent</p>
                                    </div>
                                    <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center transition-all hover:scale-105">
                                        <div className="relative inline-flex items-center justify-center">
                                            <p className="text-2xl font-black text-blue-500">{seq.opened_count}</p>
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Opened</p>
                                    </div>
                                </div>
                                
                                {isFinished && (
                                     <div className="pt-2 flex justify-end">
                                        <button 
                                            onClick={() => handleDismissTracker(seq.id)}
                                            className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest"
                                        >
                                            Dismiss Tracker
                                        </button>
                                     </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
