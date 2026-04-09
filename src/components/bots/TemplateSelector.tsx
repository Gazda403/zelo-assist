/**
 * Template Selector Component
 * First step in wizard - choose from predefined templates or start from scratch
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { getTemplatesAction, cloneTemplateAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';

interface TemplateSelectorProps {
    onTemplateSelected: (template: Partial<EmailBot>) => void;
    onSkip: () => void;
}

export function TemplateSelector({ onTemplateSelected, onSkip }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Array<{
        id: string;
        name: string;
        description: string;
        isPremium: boolean;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await getTemplatesAction();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = async (templateId: string) => {
        try {
            const bot = await cloneTemplateAction(templateId);
            onTemplateSelected(bot);
        } catch (error) {
            console.error('Failed to clone template:', error);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading templates...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 font-serif">Choose a Starting Point</h2>
            <p className="text-gray-600 mb-6">
                Select a template to get started quickly, or build from scratch
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 max-h-[40vh] sm:max-h-[500px] overflow-y-auto pr-1 pb-4 custom-scrollbar">
                {templates.map((template, index) => (
                    <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelectTemplate(template.id)}
                        className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-lg transition-all text-left group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-violet-600 transition-colors">
                                {template.name}
                            </h3>
                            {template.isPremium && (
                                <Crown className="w-5 h-5 text-amber-500" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={onSkip}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all text-gray-600 hover:text-violet-600 flex items-center justify-center gap-2"
            >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Start from Scratch</span>
            </button>
        </div>
    );
}
