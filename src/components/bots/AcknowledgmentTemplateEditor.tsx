'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Save, X, RotateCcw, Eye, Code, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AcknowledgmentTemplateEditorProps {
    template: string;
    onSave: (newTemplate: string) => void;
    onCancel: () => void;
    botName?: string;
}

const DEFAULT_TEMPLATE = `Hi {{sender_name}},

Thanks for reaching out! We've received your email regarding "{{subject}}" and our team will get back to you shortly.

For your reference, your inquiry has been logged in our system.

Best regards,
The {{bot_name}} Team`;

export function AcknowledgmentTemplateEditor({
    template,
    onSave,
    onCancel,
    botName = 'Support'
}: AcknowledgmentTemplateEditorProps) {
    const [content, setContent] = useState(template || DEFAULT_TEMPLATE);
    const [previewMode, setPreviewMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const getPreview = (text: string) => {
        return text
            .replace(/\{\{sender_name\}\}/g, 'John Doe')
            .replace(/\{\{subject\}\}/g, 'Missing Order #12345')
            .replace(/\{\{bot_name\}\}/g, botName)
            .replace(/\{\{order_id\}\}/g, 'ORD-9921')
            .replace(/\{\{ticket_id\}\}/g, 'TKT-882');
    };

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById('template-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        
        const newContent = before + `{{${variable}}}` + after;
        setContent(newContent);
        
        // Return focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
        }, 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl relative overflow-hidden transition-colors"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FileText className="w-48 h-48 text-orange-500" />
            </div>

            <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-orange-500" />
                        Reply Blueprints
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">Fine-tune the automated acknowledgment syntax.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
                            previewMode 
                                ? 'bg-orange-500 border-orange-500 text-white' 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500/50'
                        }`}
                    >
                        {previewMode ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {previewMode ? 'Edit Source' : 'Visual Preview'}
                    </button>
                    <button
                        onClick={() => setContent(DEFAULT_TEMPLATE)}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 transition-all"
                        title="Reset to Factory Default"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 relative z-10">
                {/* Editor/Preview Area */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <AnimatePresence mode="wait">
                        {!previewMode ? (
                            <motion.div
                                key="editor"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="relative group"
                            >
                                <textarea
                                    id="template-textarea"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-80 px-6 py-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-black transition-all resize-none scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
                                    placeholder="Enter acknowledgment template..."
                                />
                                <div className="absolute top-4 right-4 animate-pulse pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="w-full h-80 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 overflow-y-auto whitespace-pre-wrap font-sans text-base leading-loose text-zinc-900 dark:text-zinc-200"
                            >
                                <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preview Mode Output</span>
                                    </div>
                                    <p className="text-sm font-bold opacity-80">Subject: Re: Missing Order #12345</p>
                                </div>
                                {getPreview(content)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Variable Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Injectable Scalars</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'sender_name', label: 'Sender Identity' },
                                { id: 'subject', label: 'Email Subject' },
                                { id: 'bot_name', label: 'Agent Identifier' },
                                { id: 'order_id', label: 'Order Directive' },
                                { id: 'ticket_id', label: 'Support Token' },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => insertVariable(v.id)}
                                    className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-orange-500/30 text-left transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-500 transition-colors">
                                            {`{{${v.id}}}`}
                                        </span>
                                        <Info className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-400" />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium mt-1">{v.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 dark:text-zinc-400">Policy Guard</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-zinc-500 font-medium">
                            Avoid excessive promotion. Keep acknowledgments focused on status updates to maintain lower spam scores.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 relative z-10">
                <button
                    onClick={() => onSave(content)}
                    className="flex-1 py-4 bg-orange-500 dark:bg-orange-600 text-white dark:text-zinc-50 text-xs font-black uppercase tracking-[0.2em] border border-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(249,115,22,0.2)]"
                >
                    <Check className="w-4 h-4" />
                    Commit Template
                </button>
                <button
                    onClick={onCancel}
                    className="px-8 py-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-all"
                >
                    Abort
                </button>
            </div>
        </motion.div>
    );
}
