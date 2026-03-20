import { useState } from 'react';
import { Clock, Save, Users, Target, MessageSquare, Shield, Activity, Plus, X } from 'lucide-react';
import type { EmailBot, BotFollowUpConfig, AcknowledgmentTemplate } from '@/lib/bots/types';
import { toast } from 'sonner';
import { AcknowledgmentTemplateEditor } from './AcknowledgmentTemplateEditor';
import { cn } from '@/lib/utils';

interface FollowUpConfigProps {
    bot: EmailBot;
    onUpdate: (updates: Partial<EmailBot>) => Promise<void>;
}

const DEFAULT_FOLLOW_UP_TEMPLATE: AcknowledgmentTemplate = {
    id: 'follow_up_default',
    name: 'Gentle Nudge',
    subject: 'Re: {{subject}}',
    body: `Hi {{recipient_name}},

Just bumping this to the top of your inbox. Did you get a chance to see my previous email?

Best,
{{your_name}}`,
    variables: [
        { key: 'recipient_name', label: 'Recipient Name', defaultValue: 'there' },
        { key: 'your_name', label: 'Your Name', defaultValue: 'Me' }
    ],
    enabled: true
};

const DEFAULT_SAFETY_NET_TEMPLATE: AcknowledgmentTemplate = {
    id: 'safety_net_default',
    name: 'Reliability Safety Net',
    subject: 'Apology for the delay: {{subject}}',
    body: `Hi {{recipient_name}},

I'm following up because I promised a response within a certain timeframe but I've run into some unexpected issues.

I'm very sorry for not replying sooner. I wanted to make sure you know I'm still working on this and haven't forgotten your request. I'll get back to you with a full response as soon as possible.

Best,
{{your_name}}`,
    variables: [
        { key: 'recipient_name', label: 'Recipient Name', defaultValue: 'there' },
        { key: 'your_name', label: 'Your Name', defaultValue: 'Me' }
    ],
    enabled: true
};

/**
 * FollowUpConfig component for configuring outbound email follow-ups.
 * Focuses on timing strategy and reply detection.
 */
export function FollowUpConfig({ bot, onUpdate }: FollowUpConfigProps) {
    const isAcknowledgmentBot = bot.trigger.type === 'new_email_received' && bot.actions.some(a => a.type === 'auto_send_email');
    const defaultTemplate = isAcknowledgmentBot ? DEFAULT_SAFETY_NET_TEMPLATE : DEFAULT_FOLLOW_UP_TEMPLATE;

    const [config, setConfig] = useState<BotFollowUpConfig>(bot.followUpConfig || {
        enabled: true,
        mode: 'auto',
        settings: {
            delayValue: 3,
            delayUnit: 'days',
            businessHoursOnly: true,
            excludeDomains: [],
            excludeKeywords: [],
            smartDelay: false,
            // New defaults
            ignoreIfReplied: true,
            includeRecipients: [],
            maxFollowUps: 1,
            followUpTemplate: defaultTemplate
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);

    // Calculate smart delay preview
    const getSmartDelayPreview = () => {
        // Try to find the response_time from the main bot template
        const mainTemplate = (bot.actions.find(a => a.type === 'auto_send_email')?.config as any).acknowledgmentTemplate;
        const responseTimeVar = mainTemplate?.variables.find((v: any) => v.key === 'response_time');

        if (responseTimeVar) {
            return `Auto-calculating based on promise in your SENT email + 1 day buffer.`;
        }
        return "Will parse your sent email for dates like 'next Friday' or 'tomorrow'.";
    };

    const handleSave = async (updatedConfig = config) => {
        setIsSaving(true);
        try {
            await onUpdate({ followUpConfig: updatedConfig });
            toast.success(isAcknowledgmentBot ? 'Reliability guardrail updated' : 'Follow-up configuration updated');
        } catch (error) {
            console.error('Failed to update follow-up config:', error);
            toast.error('Failed to update configuration');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-600" />
                            {isAcknowledgmentBot ? 'Reliability Guardrail: Breach Protection' : 'Follow-Up Configuration'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isAcknowledgmentBot
                                ? 'Ensure the bot catches missed deadlines. Automatically sends a "continuity mail" if you forget to reply manually after an acknowledgment.'
                                : 'Configure how the bot tracks your sent emails and reminds you to follow up.'}
                        </p>
                    </div>
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 h-10 px-6 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 font-medium whitespace-nowrap"
                    >
                        <Save className="w-4 h-4 shrink-0" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>

                {/* Status Toggle Row */}
                <div className="mb-8 p-4 bg-violet-50/50 dark:bg-violet-500/5 rounded-xl border border-violet-100 dark:border-violet-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                                {isAcknowledgmentBot ? 'Breach Protection' : 'Follow-Up Mode'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {config.enabled ? 'Active and monitoring threads' : 'Currently paused'}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.enabled}
                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-violet-600"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Scope & Targets */}
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Users className="w-4 h-4 text-violet-500" />
                                {isAcknowledgmentBot ? 'Guardrail Scope' : 'Monitoring Scope'}
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={config.mode === 'auto'}
                                            onChange={() => setConfig({ ...config, mode: 'auto' })}
                                            className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {isAcknowledgmentBot ? 'Acknowledgment Threads Only' : 'All Sent Emails'}
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={config.mode === 'targeted'}
                                            onChange={() => setConfig({ ...config, mode: 'targeted' })}
                                            className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                                        />
                                        <span className="text-sm text-gray-700">Specific List Only</span>
                                    </label>
                                </div>

                                {config.mode === 'targeted' && (
                                    <div className="pl-6 space-y-3">
                                        <p className="text-xs text-gray-500">
                                            Only monitor emails sent to these specific people or domains (e.g., "client@company.com" or "@partner.com").
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add email or domain..."
                                                className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value.trim();
                                                        if (val && !config.settings.includeRecipients?.includes(val)) {
                                                            setConfig({
                                                                ...config,
                                                                settings: {
                                                                    ...config.settings,
                                                                    includeRecipients: [...(config.settings.includeRecipients || []), val]
                                                                }
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <button className="p-2 bg-violet-100 text-violet-600 rounded-md hover:bg-violet-200">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {config.settings.includeRecipients?.map((recipient) => (
                                                <span key={recipient} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-700 bg-violet-50 rounded-full border border-violet-100">
                                                    {recipient}
                                                    <button
                                                        onClick={() => setConfig({
                                                            ...config,
                                                            settings: {
                                                                ...config.settings,
                                                                includeRecipients: config.settings.includeRecipients?.filter(r => r !== recipient)
                                                            }
                                                        })}
                                                        className="hover:text-violet-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {(!config.settings.includeRecipients || config.settings.includeRecipients.length === 0) && (
                                                <span className="text-xs text-amber-600 italic">No targets added yet (bot will be inactive).</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timing Strategy */}
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Clock className="w-4 h-4 text-violet-500" />
                                {isAcknowledgmentBot ? 'Breach Deadline' : 'Timing Strategy'}
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <input
                                            type="checkbox"
                                            checked={config.settings.smartDelay}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                settings: { ...config.settings, smartDelay: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900">
                                            {isAcknowledgmentBot ? 'Smart Deadline (Dynamic Proofing)' : 'Smart Delay (Recommended)'}
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            {isAcknowledgmentBot
                                                ? 'Automatically syncs the safety net with the "Expected Response Time" variable in your acknowledgment.'
                                                : 'Reads your sent email for promises (e.g., "I\'ll reply by Friday") and sets the reminder accordingly.'}
                                        </p>
                                        {config.settings.smartDelay && (
                                            <p className="text-xs text-violet-600 mt-1 font-medium bg-violet-50 p-2 rounded">
                                                {getSmartDelayPreview()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Ignore if Replied Toggle */}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <input
                                            type="checkbox"
                                            checked={config.settings.ignoreIfReplied !== false} // Default true
                                            onChange={(e) => setConfig({
                                                ...config,
                                                settings: { ...config.settings, ignoreIfReplied: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900">
                                            {isAcknowledgmentBot ? 'Disarm Guardrail on Manual Reply' : 'Cancel if they reply'}
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            {isAcknowledgmentBot
                                                ? 'Disable the safety email immediately if you send a manual message to the customer.'
                                                : 'Automatically remove the reminder if the recipient replies to your email.'}
                                        </p>
                                    </div>
                                </div>

                                {!config.settings.smartDelay && (
                                    <div className="pl-7">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Manual Fixed Delay</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={config.settings.delayValue}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    settings: { ...config.settings, delayValue: parseInt(e.target.value) || 1 }
                                                })}
                                                className="w-16 p-1.5 rounded border border-gray-300 text-sm"
                                            />
                                            <select
                                                value={config.settings.delayUnit}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    settings: { ...config.settings, delayUnit: e.target.value as any }
                                                })}
                                                className="p-1.5 rounded border border-gray-300 text-sm"
                                            >
                                                <option value="days">Days</option>
                                                <option value="hours">Hours</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Max Follow-ups Slider */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-900">Max Follow-ups</label>
                                        <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded">
                                            {config.settings.maxFollowUps || 1} attempt(s)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={config.settings.maxFollowUps || 1}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            settings: { ...config.settings, maxFollowUps: parseInt(e.target.value) }
                                        })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stop sending follow-ups after this many attempts if no reply is received.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Follow-Up Content */}
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 h-full">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <MessageSquare className="w-4 h-4 text-violet-500" />
                            {isAcknowledgmentBot ? 'Safety Net Content' : 'Follow-Up Content'}
                        </h4>

                        <div className="space-y-4">
                            <div className="p-3 bg-white border border-gray-200 rounded-md">
                                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Preview</p>
                                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-zinc-900/50 p-4 rounded border border-gray-100 dark:border-zinc-800 leading-relaxed">
                                    {(config.settings.followUpTemplate || defaultTemplate).body}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowTemplateEditor(true)}
                                className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {isAcknowledgmentBot ? 'Edit Safety Message' : 'Customize Message'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showTemplateEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
                            <h3 className="font-semibold text-gray-900">Customize Follow-Up Email</h3>
                            <button onClick={() => setShowTemplateEditor(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <AcknowledgmentTemplateEditor
                                botId={bot.id}
                                currentTemplate={config.settings.followUpTemplate || defaultTemplate}
                                presets={[defaultTemplate]}
                                aiContext={isAcknowledgmentBot
                                    ? "You are writing an apology email to a customer because you promised a reply in a previous auto-acknowledgment but have been delayed by issues. Keep it humble, professional, and reassuring."
                                    : "You are writing a polite follow-up email to someone who hasn't replied. Keep it short and professional."}
                                labels={{
                                    aiTitle: isAcknowledgmentBot ? "Ask AI to Write Safety Net" : "Ask AI to Write Follow-Up",
                                    contentTitle: isAcknowledgmentBot ? "Safety Message" : "Follow-Up Message",
                                    variablesTitle: "Template Variables",
                                    presetsTitle: "Reset to Default",
                                    saveButton: isAcknowledgmentBot ? "Save Guardrail" : "Save Template"
                                }}
                                onSave={(template) => {
                                    const newConfig = {
                                        ...config,
                                        settings: {
                                            ...config.settings,
                                            followUpTemplate: template
                                        }
                                    };
                                    setConfig(newConfig);
                                    setShowTemplateEditor(false);
                                    handleSave(newConfig);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
