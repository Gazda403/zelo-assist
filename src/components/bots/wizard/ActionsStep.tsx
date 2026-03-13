'use client';

import { Zap, Mail, Bell, Shield, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionsStepProps {
  actions: any[];
}

export function ActionsStep({ actions }: ActionsStepProps) {
  const availableActions = [
    { type: 'create_draft', label: 'Create Draft', icon: Mail, description: 'Prepare a response draft for review' },
    { type: 'auto_send_email', label: 'Auto-Send', icon: Zap, description: 'Reply directly to the sender' },
    { type: 'notify_me', label: 'Push Notification', icon: Bell, description: 'Alert you about this email' },
    { type: 'slack_notification', label: 'Slack Alert', icon: MessageSquare, description: 'Post to a Slack channel' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableActions.map((action) => {
          const isSelected = actions.some(a => a.type === action.type);
          
          return (
            <motion.button
              key={action.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 border text-left transition-all ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${isSelected ? 'bg-orange-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
              </div>
              <h4 className={`font-bold mb-1 ${isSelected ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}>
                {action.label}
              </h4>
              <p className="text-xs text-zinc-500 line-clamp-2">
                {action.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Active Logic Chain</h5>
        <div className="space-y-3">
          {actions.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No actions selected yet.</p>
          ) : (
            actions.map((action, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-orange-500">{idx + 1}.</span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{action.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-[10px] font-bold text-zinc-400 hover:text-orange-500 uppercase tracking-tighter">Configure</button>
                  <button className="text-zinc-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
