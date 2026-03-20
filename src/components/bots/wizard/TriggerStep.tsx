/**
 * Wizard Step 1: Trigger Selection
 */

'use client';

import type { BotTrigger, TriggerType } from '@/lib/bots/types';
import { TriggerConfigForm } from './TriggerConfigForm';

interface TriggerStepProps {
    trigger: BotTrigger | null;
    onChange: (trigger: BotTrigger) => void;
}

const TRIGGER_OPTIONS: Array<{ type: TriggerType; label: string; description: string }> = [
    { type: 'new_email_received', label: 'New Email Received', description: 'Fires for every new email' },
    { type: 'email_from_sender', label: 'Email from Sender', description: 'Fires when email from specific sender(s)' },
    { type: 'email_contains_keyword', label: 'Email Contains Keyword', description: 'Fires when subject/body contains keywords' },
    { type: 'email_contains_multiple_keywords', label: 'Email Contains Multiple', description: 'Fires when multiple keywords validation meets (AND/OR)' },
    { type: 'email_contains_sentiment', label: 'Sentiment Analysis', description: 'Fires based on AI detected sentiment (e.g. Frustrated)' },
    { type: 'email_thread_inactive_for', label: 'Thread Inactive', description: 'Fires if no reply for X hours/days' },
    { type: 'order_status_changed', label: 'Order Status Update', description: 'Fires when an order status changes (e.g. Shipped)' },
    { type: 'urgency_threshold', label: 'High Urgency Email', description: 'Fires when AI urgency score is high' },
    { type: 'time_based', label: 'Time-Based', description: 'Fires during specific times (e.g., business hours)' },
];

export function TriggerStep({ trigger, onChange }: TriggerStepProps) {
    const handleSelect = (type: TriggerType) => {
        // Default configurations for all managed types
        const defaultConfigs: Record<string, any> = {
            'new_email_received': {},
            'email_from_sender': { senderEmails: [], matchMode: 'exact' },
            'email_contains_keyword': { keywords: [], searchIn: 'both' },
            'email_contains_multiple_keywords': { keywords: [], matchAll: true, searchIn: 'both' },
            'email_contains_sentiment': { sentiment: 'frustrated', minConfidence: 0.7 },
            'email_with_attachment': { minAttachments: 1 },
            'email_thread_inactive_for': { hours: 24, excludeIfReplied: true },
            'thread_topic_changed': {},
            'order_status_changed': { status: 'any' },
            'refund_requested': {},
            'previous_action_completed': { actionType: '' },
            'external_webhook': { webhookId: '', eventType: '' },
            'time_based': { businessHoursOnly: true },
            'urgency_threshold': { minScore: 7 },
        };

        onChange({ type, config: defaultConfigs[type] || {} });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">When should this bot run?</h2>
            <p className="text-gray-600 mb-6">Choose what triggers your bot</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {TRIGGER_OPTIONS.map(option => (
                    <button
                        key={option.type}
                        onClick={() => handleSelect(option.type)}
                        className={`p-4 text-left rounded-xl border-2 transition-all ${trigger?.type === option.type
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-violet-300 bg-white'
                            }`}
                    >
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                    </button>
                ))}
            </div>

            {trigger && (
                <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Configure Trigger</h3>
                    <TriggerConfigForm trigger={trigger} onChange={onChange} />
                </div>
            )}
        </div>
    );
}
