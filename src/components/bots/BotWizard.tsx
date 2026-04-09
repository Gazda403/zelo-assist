/**
 * Bot Creation Wizard
 * 6-step wizard for creating email automation bots
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, X, Zap, Target, Rocket, Shield } from 'lucide-react';
import type { EmailBot, BotTrigger, BotCondition, BotAction, SafetyConfig } from '@/lib/bots/types';
import { createBotAction } from '@/app/actions/bots';
import { TemplateSelector } from './TemplateSelector';
import { TriggerStep } from './wizard/TriggerStep';
import { ConditionsStep } from './wizard/ConditionsStep';
import { ActionsStep } from './wizard/ActionsStep';
import { SafetyStep } from './wizard/SafetyStep';
import { ReviewStep } from './wizard/ReviewStep';

interface BotWizardProps {
    onBotCreated: (bot: EmailBot) => void;
    onCancel: () => void;
}

const STEPS = [
    { id: 'template', title: 'Start with Template', icon: Sparkles },
    { id: 'trigger', title: 'Choose Trigger', icon: Zap },
    { id: 'conditions', title: 'Add Conditions', icon: Target },
    { id: 'actions', title: 'Set Actions', icon: Rocket },
    { id: 'safety', title: 'Safety Settings', icon: Shield },
    { id: 'review', title: 'Review & Create', icon: Check },
];

export function BotWizard({ onBotCreated, onCancel }: BotWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isCreating, setIsCreating] = useState(false);

    // Bot configuration state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [trigger, setTrigger] = useState<BotTrigger | null>(null);
    const [conditions, setConditions] = useState<BotCondition[]>([]);
    const [actions, setActions] = useState<BotAction[]>([]);
    const [safety, setSafety] = useState<SafetyConfig>({
        autoSendEnabled: false,
        maxSendsPerDay: 10,
        cooldownMinutes: 60,
        loopPrevention: true,
    });

    const handleTemplateSelected = (templateBot: Partial<EmailBot>) => {
        if (templateBot.name) setName(templateBot.name);
        if (templateBot.description) setDescription(templateBot.description);
        if (templateBot.trigger) setTrigger(templateBot.trigger);
        if (templateBot.conditions) setConditions(templateBot.conditions);
        if (templateBot.actions) setActions(templateBot.actions);
        if (templateBot.safety) setSafety(templateBot.safety);

        // Skip to trigger step (or further if template is complete)
        setCurrentStep(1);
    };

    const handleSkipTemplate = () => {
        setCurrentStep(1);
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreate = async () => {
        if (!trigger || actions.length === 0) {
            alert('Please configure at least a trigger and an action');
            return;
        }

        setIsCreating(true);
        try {
            const newBot = await createBotAction({
                name: name || 'Untitled Bot',
                description,
                enabled: false, // Start disabled for safety
                isPremium: false,
                trigger,
                conditions,
                actions,
                safety,
                stats: {
                    totalExecutions: 0,
                    successCount: 0,
                    failureCount: 0,
                    emailsSent: 0,
                    draftsCreated: 0,
                },
            });

            onBotCreated(newBot);
        } catch (error: any) {
            console.error('Failed to create bot:', error);
            alert(error.message || 'Failed to create bot. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true; // Template is optional
            case 1: return trigger !== null;
            case 2: return true; // Conditions are optional
            case 3: return actions.length > 0;
            case 4: return true;
            case 5: return true;
            default: return false;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
            {/* 1. FIXED HEADER */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-white dark:bg-zinc-950 z-20">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold font-serif">Create Email Bot</h1>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-shrink-0">
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
                                    index === currentStep
                                        ? 'bg-violet-600 text-white shadow-md'
                                        : index < currentStep
                                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                                        : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500'
                                }`}
                            >
                                <span className="hidden sm:inline">{step.title}</span>
                                <span className="sm:hidden">{index + 1}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className="w-4 h-px bg-gray-200 dark:bg-zinc-800 mx-1 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-gray-50/30 dark:bg-transparent">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="pb-10"
                        >
                            {currentStep === 0 && (
                                <TemplateSelector
                                    onTemplateSelected={handleTemplateSelected}
                                    onSkip={handleSkipTemplate}
                                />
                            )}
                            {currentStep === 1 && (
                                <TriggerStep trigger={trigger} onChange={setTrigger} />
                            )}
                            {currentStep === 2 && (
                                <ConditionsStep conditions={conditions} onChange={setConditions} />
                            )}
                            {currentStep === 3 && (
                                <ActionsStep actions={actions} onChange={setActions} />
                            )}
                            {currentStep === 4 && (
                                <SafetyStep
                                    safety={safety}
                                    actions={actions}
                                    onChange={setSafety}
                                />
                            )}
                            {currentStep === 5 && (
                                <ReviewStep
                                    name={name}
                                    description={description}
                                    trigger={trigger}
                                    conditions={conditions}
                                    actions={actions}
                                    safety={safety}
                                    onNameChange={setName}
                                    onDescriptionChange={setDescription}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 3. FIXED NAVIGATION FOOTER */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t bg-white dark:bg-zinc-950 z-20 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button
                    onClick={currentStep === 0 ? onCancel : handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {currentStep === 0 ? 'Cancel' : 'Back'}
                </button>

                <div className="flex items-center gap-3">
                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] text-sm font-semibold active:scale-95"
                        >
                            <span>Next Step</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={!canProceed() || isCreating}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] text-sm font-semibold active:scale-95"
                        >
                            {isCreating ? (
                                <>Creating Bot...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Complete Bot</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
