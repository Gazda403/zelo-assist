/**
 * Wizard Step 2: Conditions Selection
 */

'use client';

import { Plus, X } from 'lucide-react';
import type { BotCondition, ConditionType } from '@/lib/bots/types';

interface ConditionsStepProps {
    conditions: BotCondition[];
    onChange: (conditions: BotCondition[]) => void;
}

const CONDITION_OPTIONS: Array<{ type: ConditionType; label: string }> = [
    { type: 'email_is_unread', label: 'Email is unread' },
    { type: 'urgency_score_gte', label: 'Urgency score ≥ threshold' },
    { type: 'subject_contains', label: 'Subject contains keywords' },
    { type: 'body_contains', label: 'Body contains keywords' },
    { type: 'sender_email_matches', label: 'Sender matches pattern' },
    { type: 'exclude_automated', label: 'Exclude automated emails' },
];

export function ConditionsStep({ conditions, onChange }: ConditionsStepProps) {
    const addCondition = (type: ConditionType) => {
        const defaultConfigs: Partial<Record<ConditionType, any>> = {
            'sender_is_internal': { domain: '' },
            'sender_email_matches': { pattern: '', matchType: 'contains' },
            'subject_contains': { keywords: [], matchAll: false },
            'body_contains': { keywords: [], matchAll: false },
            'urgency_score_gte': { threshold: 7 },
            'email_is_unread': {},
            'received_within': { minutes: 60 },
            'has_attachment': { required: true },
            'thread_count_gte': { count: 2 },
            'exclude_automated': { strict: true },
        };

        onChange([...conditions, { type, config: defaultConfigs[type] }]);
    };

    const removeCondition = (index: number) => {
        onChange(conditions.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">Add Conditions (Optional)</h2>
            <p className="text-gray-600 mb-6">
                All conditions must be met for the bot to run. Skip if you want the bot to run for all triggered emails.
            </p>

            {/* Added Conditions */}
            {conditions.length > 0 && (
                <div className="space-y-2 mb-6">
                    {conditions.map((condition, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-lg"
                        >
                            <span className="text-sm font-medium">{condition.type}</span>
                            <button
                                onClick={() => removeCondition(index)}
                                className="p-1 hover:bg-violet-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Conditions */}
            <div className="grid grid-cols-2 gap-2">
                {CONDITION_OPTIONS.map(option => (
                    <button
                        key={option.type}
                        onClick={() => addCondition(option.type)}
                        className="flex items-center gap-2 p-3 text-left border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all"
                    >
                        <Plus className="w-4 h-4 text-violet-600" />
                        <span className="text-sm">{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
