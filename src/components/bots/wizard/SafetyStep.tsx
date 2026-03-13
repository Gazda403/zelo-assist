'use client';

import { Shield, Lock, AlertTriangle, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SafetyStepProps {
  safety: any;
}

export function SafetyStep({ safety }: SafetyStepProps) {
  const safetyLevels = [
    { title: 'Draft Mode', desc: 'AI prepares responses. You review and send manually.', icon: Eye, color: 'text-blue-500' },
    { title: 'Shielded Send', desc: 'Auto-sends only to trusted, safe-classified domains.', icon: Shield, color: 'text-orange-500' },
    { title: 'Full Auto', desc: 'Maximum leverage. AI handles all routine correspondence.', icon: Lock, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
          Safety Parameters
        </h4>
        <p className="text-sm text-zinc-500 mb-6">Define the boundaries within which the AI is authorized to operate.</p>
      </div>

      <div className="space-y-4">
        {safetyLevels.map((lvl, idx) => (
          <button
            key={idx}
            className={`w-full p-6 border text-left transition-all relative overflow-hidden group ${
              idx === 0 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5' 
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
             <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4">
                    <div className={`mt-1 p-2 ${idx === 0 ? 'bg-orange-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                        <lvl.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-zinc-50 mb-1">{lvl.title}</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">{lvl.desc}</p>
                    </div>
                </div>
                {idx === 0 && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
             </div>
             {idx === 0 && (
                 <motion.div 
                    layoutId="safety-highlight"
                    className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                 />
             )}
          </button>
        ))}
      </div>

      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-4">
        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
            Advanced tiers require identity verification and a positive trust score. 
            All automated transmissions are signed with a digital audit cryptographic key.
        </p>
      </div>
    </div>
  );
}
