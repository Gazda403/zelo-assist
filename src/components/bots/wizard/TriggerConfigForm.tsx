
import { BotTrigger, TriggerType } from '@/lib/bots/types';
import { useState, useEffect } from 'react';

interface TriggerConfigFormProps {
    trigger: BotTrigger;
    onChange: (trigger: BotTrigger) => void;
}

export function TriggerConfigForm({ trigger, onChange }: TriggerConfigFormProps) {
    const handleConfigChange = (key: string, value: any) => {
        onChange({
            ...trigger,
            config: {
                ...trigger.config,
                [key]: value
            }
        });
    };

    // Render fields based on trigger type
    switch (trigger.type) {
        case 'email_from_sender':
            return (
                <div className="space-y-4 class-p-4 class-bg-gray-50 class-rounded-lg class-mt-4">
                    <label className="block text-sm font-medium text-gray-700">Sender Emails (comma separated)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).senderEmails?.join(', ') || ''}
                        onChange={(e) => handleConfigChange('senderEmails', e.target.value.split(',').map((s: string) => s.trim()))}
                        placeholder="example@domain.com, boss@company.com"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Match Mode</label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).matchMode || 'exact'}
                        onChange={(e) => handleConfigChange('matchMode', e.target.value)}
                    >
                        <option value="exact">Exact Match</option>
                        <option value="contains">Contains</option>
                        <option value="domain">Domain Match</option>
                    </select>
                </div>
            );

        case 'email_contains_keyword':
            return (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Keywords (comma separated)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).keywords?.join(', ') || ''}
                        onChange={(e) => handleConfigChange('keywords', e.target.value.split(',').map((s: string) => s.trim()))}
                        placeholder="urgent, invoice, help"
                    />
                </div>
            );

        case 'email_contains_multiple_keywords':
            return (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Keywords (comma separated)</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).keywords?.join(', ') || ''}
                        onChange={(e) => handleConfigChange('keywords', e.target.value.split(',').map((s: string) => s.trim()))}
                        placeholder="refund, damaged"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={(trigger.config as any).matchAll ?? true}
                            onChange={(e) => handleConfigChange('matchAll', e.target.checked)}
                        />
                        <label className="text-sm text-gray-700">Match ALL keywords (AND logic)</label>
                    </div>
                </div>
            );

        case 'email_contains_sentiment':
            return (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Target Sentiment</label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).sentiment || 'frustrated'}
                        onChange={(e) => handleConfigChange('sentiment', e.target.value)}
                    >
                        <option value="frustrated">Frustrated / Angry</option>
                        <option value="urgent">Urgent / Demanding</option>
                        <option value="negative">Negative</option>
                        <option value="positive">Positive</option>
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mt-2">Minimum Confidence (0.0 - 1.0)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).minConfidence || 0.7}
                        onChange={(e) => handleConfigChange('minConfidence', parseFloat(e.target.value))}
                    />
                </div>
            );

        case 'email_thread_inactive_for':
            return (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Inactive Duration (Hours)</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).hours || 24}
                        onChange={(e) => handleConfigChange('hours', parseInt(e.target.value))}
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Inactive Duration (Days)</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded-md"
                        value={(trigger.config as any).days || 0}
                        onChange={(e) => handleConfigChange('days', parseInt(e.target.value))}
                    />
                </div>
            );

        case 'time_based':
            return (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={(trigger.config as any).businessHoursOnly ?? true}
                            onChange={(e) => handleConfigChange('businessHoursOnly', e.target.checked)}
                        />
                        <label className="text-sm text-gray-700">During Business Hours Only (9am - 5pm)</label>
                    </div>
                </div>
            );

        default:
            return <div className="mt-4 text-sm text-gray-500 italic">No additional configuration required for this trigger.</div>;
    }
}
