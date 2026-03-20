/**
 * Terms Acceptance Modal
 * Displayed when user tries to enable a bot with auto-send actions
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, X, Check } from 'lucide-react';
import type { EmailBot } from '@/lib/bots/types';

interface TermsAcceptanceModalProps {
    bot: EmailBot;
    isOpen: boolean;
    onAccept: () => Promise<void>;
    onCancel: () => void;
}

const TERMS_VERSION = '1.0';

export function TermsAcceptanceModal({ bot, isOpen, onAccept, onCancel }: TermsAcceptanceModalProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [hasReadTerms, setHasReadTerms] = useState(false);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await onAccept();
        } catch (error) {
            console.error('Failed to accept terms:', error);
            alert('Failed to accept terms. Please try again.');
        } finally {
            setIsAccepting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-pink-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-violet-600" />
                                <h2 className="text-2xl font-bold font-serif">Auto-Send Terms</h2>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Warning Banner */}
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-900 mb-1">Important: Auto-Send Enabled</h3>
                                <p className="text-sm text-amber-800">
                                    This bot will automatically send emails on your behalf without manual approval.
                                    Please review the terms and safety settings carefully.
                                </p>
                            </div>
                        </div>

                        {/* Bot Safety Summary */}
                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
                            <h3 className="font-semibold mb-3">Your Bot's Safety Settings</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bot Name:</span>
                                    <span className="font-medium">{bot.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Max Sends Per Day:</span>
                                    <span className="font-medium text-violet-600">{bot.safety.maxSendsPerDay}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cooldown Between Sends:</span>
                                    <span className="font-medium">{bot.safety.cooldownMinutes} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loop Prevention:</span>
                                    <span className={`font-medium ${bot.safety.loopPrevention ? 'text-green-600' : 'text-red-600'}`}>
                                        {bot.safety.loopPrevention ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Terms of Service</h3>
                            <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-3 max-h-64 overflow-y-auto">
                                <p>
                                    By enabling auto-send, you acknowledge and agree to the following:
                                </p>
                                <ol className="list-decimal list-inside space-y-2 ml-2">
                                    <li>
                                        <strong>Automated Actions:</strong> This bot will automatically send emails based on the
                                        configured triggers, conditions, and actions without requiring your manual approval for each email.
                                    </li>
                                    <li>
                                        <strong>Your Responsibility:</strong> You are solely responsible for all emails sent by this bot.
                                        You should carefully review the bot configuration before enabling auto-send.
                                    </li>
                                    <li>
                                        <strong>Safety Limits:</strong> While safety mechanisms are in place (daily limits, cooldowns, and
                                        loop prevention), you remain responsible for monitoring bot activity.
                                    </li>
                                    <li>
                                        <strong>Compliance:</strong> You must ensure that automated emails comply with applicable laws,
                                        including anti-spam regulations (CAN-SPAM, GDPR, etc.).
                                    </li>
                                    <li>
                                        <strong>Monitoring:</strong> You should regularly review execution logs to ensure the bot is
                                        operating as intended.
                                    </li>
                                    <li>
                                        <strong>Disable Anytime:</strong> You can disable the bot at any time from the bot settings page.
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Checkbox */}
                        <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <input
                                type="checkbox"
                                checked={hasReadTerms}
                                onChange={(e) => setHasReadTerms(e.target.checked)}
                                className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500 mt-0.5"
                            />
                            <div className="text-sm">
                                I have read and understand the terms above. I take full responsibility for all emails
                                sent by this bot and will monitor its activity regularly.
                            </div>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleAccept}
                            disabled={!hasReadTerms || isAccepting}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAccepting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Accept Terms & Enable Bot
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
