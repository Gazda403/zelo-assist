/**
 * Wizard Step 5: Review & Create
 */

'use client';

import type { BotTrigger, BotCondition, BotAction, SafetyConfig } from '@/lib/bots/types';

interface ReviewStepProps {
    name: string;
    description: string;
    trigger: BotTrigger | null;
    conditions: BotCondition[];
    actions: BotAction[];
    safety: SafetyConfig;
    onNameChange: (name: string) => void;
    onDescriptionChange: (description: string) => void;
}

export function ReviewStep({
    name,
    description,
    trigger,
    conditions,
    actions,
    safety,
    onNameChange,
    onDescriptionChange,
}: ReviewStepProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">Review Your Bot</h2>
            <p className="text-gray-600 mb-6">
                Give your bot a name and review the configuration
            </p>

            {/* Name & Description */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block mb-2 font-medium">Bot Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g., Customer Support Auto-Responder"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Description (optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Brief description of what this bot does..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
            </div>

            {/* Configuration Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Trigger</h3>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded">
                        {trigger?.type || 'None'}
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Conditions</h3>
                    {conditions.length === 0 ? (
                        <p className="text-sm text-gray-400">No conditions (will run for all triggered emails)</p>
                    ) : (
                        <div className="space-y-1">
                            {conditions.map((c, i) => (
                                <p key={i} className="text-sm text-gray-600">• {c.type}</p>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Actions</h3>
                    <div className="space-y-1">
                        {actions.map((a, i) => (
                            <p key={i} className="text-sm text-gray-600">
                                {i + 1}. {a.type}
                            </p>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Safety</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• Max sends per day: {safety.maxSendsPerDay}</p>
                        <p>• Cooldown: {safety.cooldownMinutes} minutes</p>
                        <p>• Loop prevention: {safety.loopPrevention ? 'Enabled' : 'Disabled'}</p>
                        {safety.autoSendEnabled && <p>• Auto-send: Enabled</p>}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                    ⚠️ Your bot will be created in <strong>disabled</strong> mode for safety. Enable it from the bot details page when ready.
                </p>
            </div>
        </div>
    );
}
