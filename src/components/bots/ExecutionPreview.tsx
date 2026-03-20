/**
 * Execution Preview Component
 * Shows what a bot would do in dry-run mode
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, XCircle, AlertCircle, Shield, Target, Zap, Loader2, X } from 'lucide-react';
import { testBotAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';

interface ExecutionPreviewProps {
    bot: EmailBot;
}

export function ExecutionPreview({ bot }: ExecutionPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{
        triggerMatched: boolean;
        conditionsPassed: boolean;
        safetyAllowed: boolean;
        safetyReason?: string;
        wouldExecute: boolean;
        plannedActions: string[];
    } | null>(null);

    const handleTest = async () => {
        setIsOpen(true);
        setIsLoading(true);
        setResult(null);

        try {
            // Use mock email ID for testing
            const testResult = await testBotAction(bot.id, 'mock-email-preview');
            setResult(testResult);
        } catch (error) {
            console.error('Failed to test bot:', error);
            alert('Failed to test bot. Please try again.');
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleTest}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
                <Play className="w-4 h-4" />
                Test Bot
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-blue-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Play className="w-6 h-6 text-violet-600" />
                                        <h2 className="text-2xl font-bold font-serif">Bot Execution Preview</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Dry-run mode: No emails will be sent
                                </p>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                                        <p className="text-gray-600">Running simulation...</p>
                                    </div>
                                ) : result ? (
                                    <>
                                        {/* Trigger Check */}
                                        <div className={`p-4 rounded-xl border-2 ${result.triggerMatched
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {result.triggerMatched ? (
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-6 h-6 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Zap className="w-5 h-5" />
                                                        <h3 className="font-semibold">Trigger</h3>
                                                    </div>
                                                    <p className="text-sm">
                                                        {result.triggerMatched
                                                            ? `✓ Trigger matched: ${bot.trigger.type}`
                                                            : `✗ Trigger did not match: ${bot.trigger.type}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Conditions Check */}
                                        <div className={`p-4 rounded-xl border-2 ${result.conditionsPassed
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {result.conditionsPassed ? (
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-6 h-6 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Target className="w-5 h-5" />
                                                        <h3 className="font-semibold">Conditions</h3>
                                                    </div>
                                                    {bot.conditions.length === 0 ? (
                                                        <p className="text-sm">No conditions configured</p>
                                                    ) : (
                                                        <p className="text-sm">
                                                            {result.conditionsPassed
                                                                ? `✓ All ${bot.conditions.length} conditions passed`
                                                                : `✗ Conditions not met (${bot.conditions.length} configured)`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Safety Check */}
                                        <div className={`p-4 rounded-xl border-2 ${result.safetyAllowed
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-amber-50 border-amber-200'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {result.safetyAllowed ? (
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Shield className="w-5 h-5" />
                                                        <h3 className="font-semibold">Safety Checks</h3>
                                                    </div>
                                                    <p className="text-sm">
                                                        {result.safetyAllowed
                                                            ? '✓ All safety checks passed'
                                                            : `✗ Blocked: ${result.safetyReason || 'Safety limit reached'}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Planned Actions */}
                                        <div className={`p-4 rounded-xl border-2 ${result.wouldExecute
                                            ? 'bg-violet-50 border-violet-200'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <h3 className="font-semibold mb-3">Planned Actions</h3>
                                            {result.plannedActions.length === 0 ? (
                                                <p className="text-sm text-gray-600">No actions configured</p>
                                            ) : (
                                                <ol className="space-y-2">
                                                    {result.plannedActions.map((action, index) => (
                                                        <li key={index} className="flex items-start gap-2 text-sm">
                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                                                                {index + 1}
                                                            </span>
                                                            <span className="flex-1 pt-0.5">{action}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>

                                        {/* Result Summary */}
                                        <div className={`p-4 rounded-xl border-2 ${result.wouldExecute
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <h3 className="font-semibold mb-2">Result</h3>
                                            <p className="text-sm">
                                                {result.wouldExecute ? (
                                                    <span className="text-blue-700 font-medium">
                                                        ✓ Bot would execute {result.plannedActions.length} action(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 font-medium">
                                                        ✗ Bot would not execute (trigger/conditions/safety failed)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
