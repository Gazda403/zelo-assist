/**
 * Wizard Step 3: Actions Selection
 */

'use client';

import { Plus, X } from 'lucide-react';
import type { BotAction, ActionType } from '@/lib/bots/types';

interface ActionsStepProps {
    actions: BotAction[];
    onChange: (actions: BotAction[]) => void;
}

const ACTION_OPTIONS: Array<{ type: ActionType; label: string; isPremium?: boolean }> = [
    { type: 'create_draft', label: '📝 Create draft reply' },
    { type: 'auto_send_email', label: '✉️ Auto-send reply', isPremium: true },
    { type: 'apply_label', label: '🏷️ Apply Gmail label' },
    { type: 'mark_as_read', label: '✓ Mark as read' },
    { type: 'notify_user', label: '🔔 Send notification' },
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
                            className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                                <span className="text-sm font-medium">{action.type}</span>
                            </div>
                            <button
                                onClick={() => removeAction(index)}
                                className="p-1 hover:bg-violet-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Actions */}
            <div className="grid grid-cols-2 gap-2">
                {ACTION_OPTIONS.map(option => (
                    <button
                        key={option.type}
                        onClick={() => addAction(option.type)}
                        className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                        <Plus className="w-4 h-4 text-violet-600" />
                        <span className="text-sm">{option.label}</span>
                        {option.isPremium && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                Premium
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
