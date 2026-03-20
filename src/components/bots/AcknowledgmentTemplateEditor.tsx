'use client';

import { useState } from 'react';
import {
    FileText,
    Save,
    Eye,
    Settings,
    Sparkles,
    Send
} from 'lucide-react';
import { AcknowledgmentTemplate, TemplateVariable } from '@/lib/bots/types';
import { getAllDefaultAcknowledgmentTemplates, substituteTemplateVariables } from '@/lib/bots/templates/acknowledgment-templates';
import { cn } from '@/lib/utils';

interface AcknowledgmentTemplateEditorProps {
    botId: string;
    currentTemplate?: AcknowledgmentTemplate;
    onSave: (template: AcknowledgmentTemplate) => void;
    // New optional props for reusability
    aiContext?: string;
    presets?: AcknowledgmentTemplate[];
    labels?: {
        aiTitle?: string;
        contentTitle?: string;
        variablesTitle?: string;
        presetsTitle?: string;
        saveButton?: string;
    };
}

/**
 * Template editor for auto-acknowledgment emails
 */
export function AcknowledgmentTemplateEditor({
    botId,
    currentTemplate,
    onSave,
    aiContext,
    presets,
    labels
}: AcknowledgmentTemplateEditorProps) {
    const defaultTemplates = presets || getAllDefaultAcknowledgmentTemplates();

    const [template, setTemplate] = useState<AcknowledgmentTemplate>(
        currentTemplate || defaultTemplates[0]
    );
    const [showPreview, setShowPreview] = useState(false);
    const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
        const values: Record<string, string> = {};
        (template.variables || []).forEach(v => {
            values[v.key] = v.defaultValue;
        });
        return values;
    });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleTemplateSelect = (templateId: string) => {
        const selected = defaultTemplates.find(t => t.id === templateId);
        if (selected) {
            setTemplate(selected);
            // Reset variable values to defaults
            const values: Record<string, string> = {};
            (selected.variables || []).forEach(v => {
                values[v.key] = v.defaultValue;
            });
            setVariableValues(values);
        }
    };

    const handleVariableChange = (key: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [key]: value }));
        // Update the default value in the template
        setTemplate(prev => ({
            ...prev,
            variables: (prev.variables || []).map(v =>
                v.key === key ? { ...v, defaultValue: value } : v
            )
        }));
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);

        try {
            // Call the AI to generate template
            const response = await fetch('/api/ai/generate-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    context: aiContext || `You are helping create an auto-acknowledgment email template.  
                    
Available variables that can be used:
- {{sender_name}} - automatically filled with the sender's name
- {{subject}} - automatically filled with the email subject
- {{email_date}} - automatically filled with the date
- {{timestamp}} - automatically generates a unique reference number

Custom variables you can suggest (user will define default values):
- {{response_time}} - expected response time (e.g., "3-5 business days")
- {{your_name}} - name to sign off with
- {{organization}} - company/organization name
- {{faq_link}} - link to FAQ or help resources
- {{useful_link}} - any link you want to share

Create a professional acknowledgment email with a subject line and body. Use the variables appropriately.`
                })
            });

            const data = await response.json();

            if (data.subject && data.body) {
                setTemplate(prev => ({
                    ...prev,
                    subject: data.subject,
                    body: data.body
                }));
            }

            setAiPrompt('');
        } catch (error) {
            console.error('AI generation failed:', error);
            alert('Failed to generate template. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePreview = () => {
        const previewContext = {
            subject: 'Example: Question about pricing',
            senderName: 'John Doe',
            emailDate: new Date().toLocaleDateString()
        };

        return {
            subject: substituteTemplateVariables(template.subject, variableValues, previewContext),
            body: substituteTemplateVariables(template.body, variableValues, previewContext)
        };
    };

    const preview = generatePreview();

    return (
        <div className="space-y-6">
            {/* Template Content Editor - TOP */}
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">{labels?.contentTitle || "Template Content"}</h3>
                    </div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>

                {!showPreview ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject Line
                            </label>
                            <input
                                type="text"
                                value={template.subject}
                                onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Body
                            </label>
                            <textarea
                                value={template.body}
                                onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono resize-none"
                            />
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700">
                                <strong>Tip:</strong> Use variables like <code className="bg-blue-100 px-1 rounded">{`{{variable_name}}`}</code> in your template.
                                Auto-filled variables: <code className="bg-blue-100 px-1 rounded">{`{{subject}}`}</code>,
                                <code className="bg-blue-100 px-1 rounded">{`{{sender_name}}`}</code>,
                                <code className="bg-blue-100 px-1 rounded">{`{{email_date}}`}</code>,
                                <code className="bg-blue-100 px-1 rounded">{`{{timestamp}}`}</code>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-1">SUBJECT:</p>
                            <p className="text-sm font-medium text-gray-900">{preview.subject}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-2">BODY:</p>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                {preview.body}
                            </div>
                        </div>

                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-xs text-green-700">
                                <strong>Preview Info:</strong> This shows how your email will look with example data.
                                Actual emails will use real sender names and subjects.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Template Generator - Below Email Body */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">{labels?.aiTitle || "Ask AI for Help"}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Let AI help you build your acknowledgment template. Describe what you need and AI will generate a professional template for you.
                </p>

                {/* AI Input (Floating Input Style) */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Sparkles className={cn("w-5 h-5 transition-colors", isGenerating ? "text-purple-500 animate-pulse" : "text-purple-400")} />
                    </div>
                    <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                        className="w-full bg-white border border-purple-200 rounded-full pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                        placeholder="Create a professional acknowledgment for support tickets..."
                    />
                    <button
                        onClick={handleAiGenerate}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50 shadow-md"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Variable Editor */}
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">{labels?.variablesTitle || "Customize Variables"}</h3>
                </div>

                <div className="space-y-4">
                    {(template.variables || []).map(variable => (
                        <div key={variable.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {variable.label}
                                <span className="ml-1 text-xs text-purple-600 font-mono">
                                    {`{{${variable.key}}}`}
                                </span>
                            </label>
                            {variable.description && (
                                <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                            )}
                            <input
                                type="text"
                                value={variableValues[variable.key] || ''}
                                onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                                placeholder={variable.defaultValue}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Template Selector */}
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">{labels?.presetsTitle || "Choose Preset Template"}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {defaultTemplates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateSelect(t.id)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${template.id === t.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-200'
                                }`}
                        >
                            <p className="font-bold text-sm text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {t.variables.length} customizable fields
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => onSave(template)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-medium shadow-sm"
                >
                    <Save className="w-4 h-4" />
                    {labels?.saveButton || "Save Template"}
                </button>
            </div>
        </div>
    );
}
