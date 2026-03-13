'use client';

import { Globe, Users, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function TriggerConfigForm() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inbound Vector</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 pl-12 font-bold outline-none focus:border-orange-500 transition-colors appearance-none">
                            <option>All Incoming Mail</option>
                            <option>Verified Domains Only</option>
                            <option>Specific Email List</option>
                            <option>Domain Wildcards</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence Threshold</label>
                    <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 pl-12 font-bold outline-none focus:border-orange-500 transition-colors appearance-none">
                            <option>High Accuracy (85%+)</option>
                            <option>Conservative (95%+)</option>
                            <option>Experimental (50%+)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Initialization Directives</label>
                <textarea 
                    rows={4}
                    placeholder="Provide additional context for trigger activation..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 font-medium outline-none focus:border-orange-500 transition-colors resize-none"
                />
            </div>

            <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Trigger Ready</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-1 h-3 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-1 h-5 bg-orange-500" />
                    <div className="w-1 h-2 bg-zinc-200 dark:bg-zinc-800" />
                </div>
            </div>
        </div>
    );
}
