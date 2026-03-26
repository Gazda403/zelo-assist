/**
 * Bot Creation Wizard
 * 6-step wizard for creating email automation bots
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
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
    { id: 'trigger', title: 'Choose Trigger', icon: '⚡' },
    { id: 'conditions', title: 'Add Conditions', icon: '🎯' },
    { id: 'actions', title: 'Set Actions', icon: '🚀' },
    { id: 'safety', title: 'Safety Settings', icon: '🛡️' },
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif">Create Email Bot</h1>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps — compact on mobile, full on desktop */}
                {/* Mobile: simple step indicator */}
                <div className="sm:hidden mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-violet-600">
                            Step {currentStep + 1} of {STEPS.length} &bull; {STEPS[currentStep].title}
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-600 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Desktop: full step pills */}
                <div className="hidden sm:flex items-center gap-2 mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${index === currentStep
                                        ? 'bg-violet-600 text-white'
                                        : index < currentStep
                                            ? 'bg-violet-100 text-violet-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className="w-2 h-0.5 bg-gray-200 mx-1" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mb-8"
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

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
                <button
                    onClick={currentStep === 0 ? onCancel : handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {currentStep === 0 ? 'Cancel' : 'Back'}
                </button>

                <div className="flex items-center gap-3">
                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={!canProceed() || isCreating}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Create Bot
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
