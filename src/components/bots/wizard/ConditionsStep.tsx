'use client';

import { Filter, User, Calendar, Tag, Shield, Plus, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConditionsStepProps {
  conditions: any[];
}

export function ConditionsStep({ conditions }: ConditionsStepProps) {
  const conditionTypes = [
    { type: 'sender_domain', label: 'Sender Context', icon: User, desc: 'Match specific domains or roles' },
    { type: 'keyword_match', label: 'Keyword Filter', icon: Tag, desc: 'Trigger based on email content' },
    { type: 'time_window', label: 'Operating Hours', icon: Calendar, desc: 'Only active during specific times' },
    { type: 'security_score', label: 'Priority / Risk', icon: Shield, desc: 'Filter by message classification' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditionTypes.map((c) => (
          <button
            key={c.type}
            className="p-6 border text-left bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-orange-500 transition-colors">
                <c.icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{c.label}</h4>
            <p className="text-xs text-zinc-500 uppercase tracking-tighter">{c.desc}</p>
          </button>
        ))}
      </div>

      <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-center">
        <Filter className="w-10 h-10 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
        <h5 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Refine Trigger Logic</h5>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6 leading-relaxed">
          Add specific filters to ensure the bot only engages when precise criteria are met. 
          By default, the bot listens to all incoming signals.
        </p>
        <button className="px-6 py-3 border border-orange-500/30 text-orange-600 dark:text-orange-500 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
          Enable Context Filters
        </button>
      </div>

      {conditions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Filters</span>
           {conditions.map((condition, i) => (
             <div key={i} className="flex justify-between items-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-[11px]">
               <span className="text-zinc-500">{condition.type} <span className="text-orange-500">EQUALS</span> {JSON.stringify(condition.config)}</span>
               <button className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
