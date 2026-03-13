'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Zap, Brain, MessageSquare, AlertTriangle } from 'lucide-react';
import type { EmailBot } from '@/lib/bots/types';
import { updateBotAction } from '@/app/actions/bots';
import { toast } from 'sonner';

interface BotPolicyManagerProps {
    botId: string;
}

export function BotPolicyManager({ botId }: BotPolicyManagerProps) {
    // This is a placeholder for the actual policy management UI
    // In a real app, this would fetch and update RAG policies,
    // instructions, and safety guardrails.

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Safety & Privacy Policies</h3>
                        <p className="text-sm text-gray-500">Configure how the AI handles sensitive information and automated replies.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <PolicyItem
                        title="PII Protection"
                        description="Automatically redact Personal Identifiable Information from AI prompts and logs."
                        icon={Lock}
                        enabled={true}
                    />
                    <PolicyItem
                        title="Competitor Filtering"
                        description="Prevent the AI from discussing or acknowledging competitor products."
                        icon={ShieldAlert}
                        enabled={false}
                    />
                    <PolicyItem
                        title="Strict Adherence"
                        description="Ensure the AI only answers based on provided documentation. No creative writing."
                        icon={ShieldCheck}
                        enabled={true}
                    />
                </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Important:</strong> Changes to policies take effect immediately for all subsequent bot executions. Be careful when disabling PII protection as it may lead to data leaks in external AI provider logs.
                </p>
            </div>
        </div>
    );
}

function PolicyItem({ title, description, icon: Icon, enabled }: { title: string, description: string, icon: any, enabled: boolean }) {
    const [isEnabled, setIsEnabled] = useState(enabled);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-white text-violet-600' : 'bg-white text-gray-400 opacity-50'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={() => {
                    setIsEnabled(!isEnabled);
                    toast.success(`${title} policy ${!isEnabled ? 'enabled' : 'disabled'}`);
                }}
                className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-violet-600' : 'bg-gray-200'}`}
            >
                <motion.div
                    className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                    animate={{ x: isEnabled ? 20 : 0 }}
                />
            </button>
        </div>
    );
}
