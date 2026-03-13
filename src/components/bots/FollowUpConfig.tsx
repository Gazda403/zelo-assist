'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    Clock, 
    MessageSquare, 
    ChevronDown, 
    ChevronUp, 
    Zap, 
    AlertCircle,
    Copy,
    Save,
    Settings,
    Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface FollowUpStep {
    id: string;
    delayDays: number;
    delayHours: number;
    template: string;
    subjectPrefix?: string;
    condition?: 'no_reply' | 'no_open' | 'always';
}

interface FollowUpConfigProps {
    steps: FollowUpStep[];
    onChange: (steps: FollowUpStep[]) => void;
    maxSteps?: number;
}

export function FollowUpConfig({ steps, onChange, maxSteps = 5 }: FollowUpConfigProps) {
    const [expandedStep, setExpandedStep] = useState<string | null>(steps[0]?.id || null);

    const addStep = () => {
        if (steps.length >= maxSteps) {
            toast.error(`Maximum of ${maxSteps} steps reached`);
            return;
        }

        const newStep: FollowUpStep = {
            id: Math.random().toString(36).substring(7),
            delayDays: 2,
            delayHours: 0,
            template: "Hi {{sender_name}},\n\nJust following up on my previous email. Let me know if you had a chance to look at it.\n\nBest regards,\n{{bot_name}}",
            condition: 'no_reply'
        };

        const newSteps = [...steps, newStep];
        onChange(newSteps);
        setExpandedStep(newStep.id);
        toast.success("Sequence step added");
    };

    const removeStep = (id: string) => {
        const newSteps = steps.filter(s => s.id !== id);
        onChange(newSteps);
        if (expandedStep === id) setExpandedStep(null);
    };

    const updateStep = (id: string, updates: Partial<FollowUpStep>) => {
        const newSteps = steps.map(s => s.id === id ? { ...s, ...updates } : s);
        onChange(newSteps);
    };

    const duplicateStep = (step: FollowUpStep) => {
        if (steps.length >= maxSteps) return;
        const newStep = {
            ...step,
            id: Math.random().toString(36).substring(7),
        };
        const newSteps = [...steps, newStep];
        onChange(newSteps);
        setExpandedStep(newStep.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-indigo-500" />
                        Sequence Architecture
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">Define the chronological persistence logic for active leads.</p>
                </div>
                <button
                    onClick={addStep}
                    className="px-6 py-3 bg-indigo-500 dark:bg-indigo-600 text-white dark:text-zinc-50 text-xs font-black uppercase tracking-widest border border-indigo-500 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
                >
                    <Plus className="w-4 h-4" />
                    Extend Sequence
                </button>
            </div>

            <div className="space-y-4">
                {steps.length === 0 ? (
                    <div className="py-20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-950/20">
                        <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 italic">No persistence steps configured. Sequence is currently empty.</p>
                    </div>
                ) : (
                    steps.map((step, index) => {
                        const isExpanded = expandedStep === step.id;
                        return (
                            <motion.div
                                key={step.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border ${isExpanded ? 'border-indigo-500/50 bg-white dark:bg-zinc-900 shadow-2xl scale-[1.01]' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 hover:border-zinc-300 dark:hover:border-zinc-700'} transition-all duration-300`}
                            >
                                {/* Step Header */}
                                <div 
                                    className="px-6 py-5 flex items-center justify-between cursor-pointer group"
                                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-10 h-10 border flex items-center justify-center font-black text-xs ${isExpanded ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'} transition-colors`}>
                                            0{index + 1}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-black uppercase tracking-widest ${isExpanded ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                                Persistence Phase
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-zinc-400" />
                                                <span className="text-[10px] font-bold text-zinc-500">{step.delayDays}D {step.delayHours}H LATENCY</span>
                                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 line-clamp-1 truncate max-w-[200px]">
                                                    {step.template.substring(0, 40)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); duplicateStep(step); }}
                                                className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors"
                                                title="Clone Component"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                                className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                                                title="Delete Node"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                    </div>
                                </div>

                                {/* Step Content (Expanded) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'circOut' }}
                                            className="overflow-hidden border-t border-zinc-100 dark:border-zinc-800"
                                        >
                                            <div className="p-8 space-y-8">
                                                <div className="grid grid-cols-12 gap-8">
                                                    {/* Latency Config */}
                                                    <div className="col-span-12 lg:col-span-4 space-y-4">
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Injection Latency</p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Days</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-black focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                                    value={step.delayDays}
                                                                    onChange={(e) => updateStep(step.id, { delayDays: parseInt(e.target.value) || 0 })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Hours</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="23"
                                                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-black focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                                    value={step.delayHours}
                                                                    onChange={(e) => updateStep(step.id, { delayHours: parseInt(e.target.value) || 0 })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-3">Execute If</label>
                                                            <div className="space-y-2">
                                                                {[
                                                                    { id: 'no_reply', label: 'No Reply Received' },
                                                                    { id: 'no_open', label: 'No Email Open' },
                                                                    { id: 'always', label: 'Mandatory Sequential' }
                                                                ].map((opt) => (
                                                                    <button
                                                                        key={opt.id}
                                                                        onClick={() => updateStep(step.id, { condition: opt.id as any })}
                                                                        className={`w-full text-left px-4 py-3 text-xs font-bold font-mono transition-all border ${step.condition === opt.id ? 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content Config */}
                                                    <div className="col-span-12 lg:col-span-8 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Payload Syntax</p>
                                                            <div className="flex gap-2">
                                                                <button className="text-[10px] font-bold text-zinc-400 hover:text-indigo-500 transition-colors">HELP</button>
                                                                <button className="text-[10px] font-bold text-zinc-400 hover:text-indigo-500 transition-colors uppercase">Variables</button>
                                                            </div>
                                                        </div>
                                                        <textarea 
                                                            className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-6 py-6 text-sm font-medium leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all resize-none scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
                                                            value={step.template}
                                                            onChange={(e) => updateStep(step.id, { template: e.target.value })}
                                                            placeholder="Synthesize persistence payload..."
                                                        />
                                                        <div className="flex gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                            <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                                                Sequence will automatically abort if the recipient engages. Advanced sentiment tracking ensures follow-ups remain contextually appropriate.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>
            
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-500 transition-all group">
                    View Execution Logs
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

