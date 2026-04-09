/**
 * Wizard Step 3: Actions Selection
 */

'use client';

import { Plus, X, FileText, Send, Tag, MailCheck, Bell } from 'lucide-react';
import type { BotAction, ActionType } from '@/lib/bots/types';

interface ActionsStepProps {
    actions: BotAction[];
    onChange: (actions: BotAction[]) => void;
}

const ACTION_OPTIONS: Array<{ type: ActionType; label: string; icon: any; isPremium?: boolean }> = [
    { type: 'create_draft', label: 'Create draft reply', icon: FileText },
    { type: 'auto_send_email', label: 'Auto-send reply', icon: Send, isPremium: true },
    { type: 'apply_label', label: 'Apply Gmail label', icon: Tag },
    { type: 'mark_as_read', label: 'Mark as read', icon: MailCheck },
    { type: 'notify_user', label: 'Send notification', icon: Bell },
];

export function ActionsStep({ actions, onChange }: ActionsStepProps) {
    const addAction = (type: ActionType) => {
        const defaultConfigs: Record<ActionType, any> = {
            'create_draft': { tone: 'professional' },
            'auto_send_email': { tone: 'professional' },
            'reply_with_template': { templateId: '' },
            'forward_email': { to: '', includeOriginal: true },
            'apply_label': { labelName: '', createIfMissing: true },
            'mark_as_read': {},
            'notify_user': { message: 'New email from {{sender}}', priority: 'medium' },
            'webhook_call': { url: '', method: 'POST' },
        };

        onChange([...actions, { type, config: defaultConfigs[type] }]);
    };

    const removeAction = (index: number) => {
        onChange(actions.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">What should the bot do?</h2>
            <p className="text-gray-600 mb-6">
                Choose one or more actions. They'll execute in order.
            </p>

            {/* Added Actions */}
            {actions.length > 0 && (
                <div className="space-y-2 mb-6">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-full">
                                    {index + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const option = ACTION_OPTIONS.find(o => o.type === action.type);
                                        const Icon = option?.icon || FileText;
                                        return (
                                            <>
                                                <Icon className="w-4 h-4 text-violet-500" />
                                                <span className="text-sm font-semibold">{option?.label || action.type}</span>
                                                {option?.isPremium && (
                                                    <span className="text-[9px] font-bold uppercase tracking-tight bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">
                                                        Premium
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={() => removeAction(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACTION_OPTIONS.map(option => (
                    <button
                        key={option.type}
                        onClick={() => addAction(option.type)}
                        className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                        <Plus className="w-4 h-4 text-violet-400 group-hover:text-violet-600 transition-colors" />
                        <option.icon className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.isPremium && (
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                Premium
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
