'use client';

import { Activity, Mail, Sparkles, Inbox, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TriggerStepProps {
  type: string;
}

export function TriggerStep({ type }: TriggerStepProps) {
  const triggerTypes = [
    { id: 'all_inbound', label: 'Global Listener', icon: Globe, desc: 'Engage with every incoming signal' },
    { id: 'priority_only', label: 'Priority Filter', icon: Target, desc: 'Focus on high-value interactions' },
    { id: 'specific_intent', label: 'Intent Extraction', icon: Zap, desc: 'Trigger on specific sentiment or goals' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        {triggerTypes.map((t) => {
          const isSelected = type === t.id;
          
          return (
            <button
              key={t.id}
              className={`p-6 border text-left flex items-center gap-6 transition-all group ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className={`p-3 transition-colors ${isSelected ? 'bg-orange-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <h4 className={`font-black text-sm uppercase tracking-widest ${isSelected ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}>{t.label}</h4>
                   {isSelected && <Sparkles className="w-4 h-4 text-orange-500" />}
                </div>
                <p className="text-xs text-zinc-500 font-medium">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 text-center">
        <Inbox className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Simulation Engine</p>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">Preview how triggers will propagate through the mail server in real-time.</p>
        <button className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
          Initialize Test Signal
        </button>
      </div>
    </div>
  );
}

import { Globe } from 'lucide-react';
