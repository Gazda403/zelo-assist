'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Shield, Send, ArrowRight, ArrowLeft, Check, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotWizardProps {
    onCancel: () => void;
    onComplete: (data: any) => Promise<void>;
}

type Step = 'intro' | 'identity' | 'trigger' | 'safety' | 'review';

export function BotWizard({ onCancel, onComplete }: BotWizardProps) {
    const [step, setStep] = useState<Step>('intro');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger: 'new_email_received',
        safety: {
            autoSendEnabled: false,
            maxSendsPerDay: 50,
            cooldownMinutes: 15,
            loopPrevention: true
        }
    });

    const handleNext = () => {
        if (step === 'intro') setStep('identity');
        else if (step === 'identity') setStep('trigger');
        else if (step === 'trigger') setStep('safety');
        else if (step === 'safety') setStep('review');
    };

    const handleBack = () => {
        if (step === 'identity') setStep('intro');
        else if (step === 'trigger') setStep('identity');
        else if (step === 'safety') setStep('trigger');
        else if (step === 'review') setStep('safety');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onComplete(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-6">
            <div className="mb-8">
                <button
                    onClick={onCancel}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    ← Cancel and go back
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                {/* Wizard Header */}
                <div className="p-8 border-b bg-gradient-to-br from-violet-50/50 to-white">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-serif">Create New Bot</h2>
                            <p className="text-gray-500 text-sm">Design your automated workspace coworker</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 flex gap-2">
                        {['intro', 'identity', 'trigger', 'safety', 'review'].map((s, i) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full bg-gray-100 transition-all duration-500",
                                    step === s ? "bg-violet-600 w-2 flex-[2]" : (i < ['intro', 'identity', 'trigger', 'safety', 'review'].indexOf(step) ? "bg-violet-200" : "bg-gray-100")
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-8 flex-1">
                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
                                        <Sparkles className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Let's build something magical</h3>
                                    <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                        Email bots help you handle volume without losing the personal touch. We'll guide you through setting up its identity, triggers, and safety guardrails.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'identity' && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold mb-6">Give your bot an identity</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Bot Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Support Assistant"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Internal Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What is this bot's primary purpose?"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'trigger' && (
                            <motion.div
                                key="trigger"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold mb-2">Define the trigger</h3>
                                <p className="text-gray-500 text-sm mb-6">When should this bot start acting?</p>

                                <div className="grid grid-cols-1 gap-4">
                                    <TriggerOption
                                        id="new_email_received"
                                        title="New Email Received"
                                        description="Trigger when any new email lands in your inbox."
                                        selected={formData.trigger === 'new_email_received'}
                                        onClick={() => setFormData({ ...formData, trigger: 'new_email_received' })}
                                    />
                                    <TriggerOption
                                        id="outgoing_email_sent"
                                        title="Outgoing Email Sent"
                                        description="Start monitoring a thread when you send a manual email."
                                        selected={formData.trigger === 'outgoing_email_sent'}
                                        onClick={() => setFormData({ ...formData, trigger: 'outgoing_email_sent' })}
                                    />
                                    <TriggerOption
                                        id="manual"
                                        title="Manual Only"
                                        description="This bot is triggered manually via the 'Add to Monitoring' button."
                                        selected={formData.trigger === 'manual'}
                                        onClick={() => setFormData({ ...formData, trigger: 'manual' })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 'safety' && (
                            <motion.div
                                key="safety"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold mb-2">Safety Guardrails</h3>
                                <p className="text-gray-500 text-sm mb-6">Keep your automation safe and professional.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-white text-violet-600 rounded-lg">
                                                <Send className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">Auto-Send (Ghost Mode)</h4>
                                                <p className="text-xs text-violet-700 mt-0.5">Allow AI to send replies without approval.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, safety: { ...formData.safety, autoSendEnabled: !formData.safety.autoSendEnabled } })}
                                            className={cn(
                                                "relative w-12 h-6 rounded-full transition-colors",
                                                formData.safety.autoSendEnabled ? "bg-violet-600" : "bg-gray-200"
                                            )}
                                        >
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                                                animate={{ x: formData.safety.autoSendEnabled ? 24 : 0 }}
                                            />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Sends / Day</label>
                                            <input
                                                type="number"
                                                value={formData.safety.maxSendsPerDay}
                                                onChange={(e) => setFormData({ ...formData, safety: { ...formData.safety, maxSendsPerDay: parseInt(e.target.value) } })}
                                                className="w-full bg-transparent text-xl font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cooldown (Mins)</label>
                                            <input
                                                type="number"
                                                value={formData.safety.cooldownMinutes}
                                                onChange={(e) => setFormData({ ...formData, safety: { ...formData.safety, cooldownMinutes: parseInt(e.target.value) } })}
                                                className="w-full bg-transparent text-xl font-bold focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'review' && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6 text-center py-6"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold">Ready to deploy?</h3>
                                <p className="text-gray-500 mb-8">
                                    Review your details and click Create. You can always fine-tune its logic later in the dashboard.
                                </p>

                                <div className="max-w-xs mx-auto text-left space-y-3 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Name:</span>
                                        <span className="font-bold">{formData.name || 'Unnamed Bot'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Trigger:</span>
                                        <span className="font-bold">{formData.trigger}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Auto-Send:</span>
                                        <span className={formData.safety.autoSendEnabled ? 'text-green-600 font-bold' : 'text-gray-600 font-bold'}>
                                            {formData.safety.autoSendEnabled ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                <div className="p-8 border-t flex justify-between bg-gray-50/50">
                    <button
                        onClick={step === 'intro' ? onCancel : handleBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === 'intro' ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={step === 'review' ? handleSubmit : handleNext}
                        disabled={isSubmitting || (step === 'identity' && !formData.name)}
                        className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {step === 'review' ? (
                            <>
                                {isSubmitting ? 'Creating...' : 'Create Bot'}
                                <Wand2 className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TriggerOption({ id, title, description, selected, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-4 text-left rounded-2xl border-2 transition-all flex items-start gap-4",
                selected
                    ? "border-violet-600 bg-violet-50/50 ring-4 ring-violet-500/10"
                    : "border-gray-100 hover:border-gray-300"
            )}
        >
            <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 outline-none",
                selected ? "border-violet-600" : "border-gray-300"
            )}>
                {selected && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
            </div>
            <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
            </div>
        </button>
    );
}
