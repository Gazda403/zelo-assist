/**
 * Wizard Step 4: Safety Settings
 */

'use client';

import type { SafetyConfig, BotAction } from '@/lib/bots/types';

interface SafetyStepProps {
    safety: SafetyConfig;
    actions: BotAction[];
    onChange: (safety: SafetyConfig) => void;
}

export function SafetyStep({ safety, actions, onChange }: SafetyStepProps) {
    const hasAutoSend = actions.some(a => a.type === 'auto_send_email' || a.type === 'reply_with_template');

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">Safety Settings</h2>
            <p className="text-gray-600 mb-6">
                Configure safety limits to prevent abuse and spam
            </p>

            <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
                {/* Auto-send toggle */}
                {hasAutoSend && (
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={safety.autoSendEnabled}
                                onChange={(e) => onChange({ ...safety, autoSendEnabled: e.target.checked })}
                                className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                            />
                            <div>
                                <div className="font-medium">Enable auto-send</div>
                                <div className="text-sm text-gray-600">Allow bot to send emails automatically</div>
                            </div>
                        </label>
                    </div>
                )}

                {/* Daily limit */}
                <div>
                    <label className="block mb-2 font-medium">Max emails per day</label>
                    <input
                        type="number"
                        value={safety.maxSendsPerDay}
                        onChange={(e) => onChange({ ...safety, maxSendsPerDay: parseInt(e.target.value) || 0 })}
                        min="1"
                        max="1000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <p className="text-sm text-gray-600 mt-1">Recommended: 10-50</p>
                </div>

                {/* Cooldown */}
                <div>
                    <label className="block mb-2 font-medium">Cooldown (minutes)</label>
                    <input
                        type="number"
                        value={safety.cooldownMinutes}
                        onChange={(e) => onChange({ ...safety, cooldownMinutes: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="1440"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <p className="text-sm text-gray-600 mt-1">Wait time between responses to same sender</p>
                </div>

                {/* Loop prevention */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={safety.loopPrevention}
                            onChange={(e) => onChange({ ...safety, loopPrevention: e.target.checked })}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                        />
                        <div>
                            <div className="font-medium">Loop prevention</div>
                            <div className="text-sm text-gray-600">Prevent replying to similar emails repeatedly</div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
