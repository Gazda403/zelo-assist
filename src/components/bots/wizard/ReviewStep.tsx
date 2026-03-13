'use client';

import { CheckCircle2, Shield, Zap, Target, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewStepProps {
  bot: any;
}

export function ReviewStep({ bot }: ReviewStepProps) {
  const summary = [
    { label: 'Operational Model', value: bot.name, icon: Target },
    { label: 'Autonomous Send', value: bot.safety?.autoSendEnabled ? 'ACTIVE' : 'DRAFT ONLY', icon: Shield, highlight: bot.safety?.autoSendEnabled },
    { label: 'Execution Path', value: `${bot.actions?.length || 0} Actions Configured`, icon: Zap },
    { label: 'Intent Radius', value: 'Founders / Strategic Outreach', icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-orange-500/5 border border-orange-500/20 p-8 flex items-center gap-6">
        <div className="w-16 h-16 bg-orange-500 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-50">Configuration Finalized</h4>
          <p className="text-sm text-zinc-500 font-medium">Your neural proxy is ready for initialization on the secure network.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {summary.map((item, idx) => (
          <div key={idx} className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
            <div className="flex items-center gap-3 mb-4">
              <item.icon className={`w-4 h-4 ${item.highlight ? 'text-orange-500' : 'text-zinc-400'}`} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
            </div>
            <p className={`text-sm font-black tracking-tight ${item.highlight ? 'text-orange-600 dark:text-orange-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Shield className="w-32 h-32 text-orange-500" />
        </div>
        <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Deployment Log</h5>
        <div className="space-y-2 font-mono text-[11px] leading-tight">
            <p className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                [SYSTEM] Neural weights synchronized
            </p>
            <p className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                [SYSTEM] Domain safety filters engaged
            </p>
            <p className="text-zinc-500 flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                [INIT] Ready for executive engagement
            </p>
        </div>
      </div>
    </div>
  );
}
