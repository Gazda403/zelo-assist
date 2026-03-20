/**
 * Knowledge Base Manager Component
 * Allows users to manage brand info, policies, FAQs, and product info for bots
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, BookOpen, FileText, HelpCircle, Package } from 'lucide-react';
import {
    getKnowledgeBaseAction,
    createKBEntryAction,
    updateKBEntryAction,
    deleteKBEntryAction,
} from '@/app/actions/bots';
import { toast } from 'sonner';

interface KBEntry {
    id: string;
    bot_id: string;
    category: 'brand' | 'policy' | 'faq' | 'product';
    title: string;
    content: string;
    keywords: string[];
    enabled: boolean;
    usage_count: number;
    created_at: Date;
    updated_at: Date;
}

interface Props {
    botId: string;
}

const CATEGORIES = [
    { id: 'brand', label: 'Brand Info', icon: BookOpen, color: 'purple' },
    { id: 'policy', label: 'Policies', icon: FileText, color: 'blue' },
    { id: 'faq', label: 'FAQs', icon: HelpCircle, color: 'green' },
    { id: 'product', label: 'Products', icon: Package, color: 'orange' },
] as const;

export function KnowledgeBaseManager({ botId }: Props) {
    const [entries, setEntries] = useState<KBEntry[]>([]);
    const [activeCategory, setActiveCategory] = useState<'brand' | 'policy' | 'faq' | 'product'>('brand');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formKeywords, setFormKeywords] = useState('');

    useEffect(() => {
        loadKnowledgeBase();
    }, [botId]);

    const loadKnowledgeBase = async () => {
        try {
            setLoading(true);
            const data = await getKnowledgeBaseAction(botId);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            toast.error('Failed to load knowledge base');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormTitle('');
        setFormContent('');
        setFormKeywords('');
    };

    const handleEdit = (entry: KBEntry) => {
        setEditingId(entry.id);
        setFormTitle(entry.title);
        setFormContent(entry.content);
        setFormKeywords(entry.keywords.join(', '));
    };

    const handleSave = async () => {
        if (!formTitle.trim() || !formContent.trim()) {
            toast.error('Title and content are required');
            return;
        }

        try {
            const keywords = formKeywords
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k.length > 0);

            if (isAdding) {
                await createKBEntryAction(botId, {
                    category: activeCategory,
                    title: formTitle,
                    content: formContent,
                    keywords,
                });
                toast.success('Entry created!');
            } else if (editingId) {
                await updateKBEntryAction(editingId, {
                    title: formTitle,
                    content: formContent,
                    keywords,
                });
                toast.success('Entry updated!');
            }

            setIsAdding(false);
            setEditingId(null);
            setFormTitle('');
            setFormContent('');
            setFormKeywords('');
            loadKnowledgeBase();
        } catch (error) {
            console.error('Failed to save entry:', error);
            toast.error('Failed to save entry');
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormTitle('');
        setFormContent('');
        setFormKeywords('');
    };

    const handleDelete = async (id: string) => {
        if (confirmingId !== id) {
            setConfirmingId(id);
            // Reset after 3 seconds
            setTimeout(() => setConfirmingId(null), 3000);
            return;
        }

        try {
            await deleteKBEntryAction(id);
            toast.success('Entry deleted');
            setConfirmingId(null);
            loadKnowledgeBase();
        } catch (error) {
            console.error('Failed to delete entry:', error);
            toast.error('Failed to delete entry');
        }
    };

    const filteredEntries = entries.filter((e) => e.category === activeCategory);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading knowledge base...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium text-sm
                                ${isActive
                                    ? `border-${cat.color}-500 text-${cat.color}-600`
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Add Button */}
            {!isAdding && !editingId && (
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add {CATEGORIES.find((c) => c.id === activeCategory)?.label} Entry
                </button>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAdding || editingId) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-200"
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {isAdding ? 'New Entry' : 'Edit Entry'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g., Refund Policy, Shipping Times"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Detailed information the bot should use when answering questions..."
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Keywords (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formKeywords}
                                    onChange={(e) => setFormKeywords(e.target.value)}
                                    placeholder="e.g., refund, money back, return"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entries List */}
            {filteredEntries.length === 0 && !isAdding && !editingId ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 mb-4">
                        No {CATEGORIES.find((c) => c.id === activeCategory)?.label.toLowerCase()} entries yet
                    </p>
                    <button
                        onClick={handleAdd}
                        className="text-violet-600 hover:underline text-sm font-medium"
                    >
                        Add your first entry
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{entry.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {entry.content}
                                    </p>
                                    {entry.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {entry.keywords.map((kw) => (
                                                <span
                                                    key={kw}
                                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>Used {entry.usage_count} times</span>
                                        <span>•</span>
                                        <span>
                                            Updated {new Date(entry.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className={`p-2 transition-all rounded-lg ${confirmingId === entry.id
                                            ? 'bg-red-500 text-white hover:bg-red-600 px-3'
                                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                            }`}
                                        title={confirmingId === entry.id ? "Click again to confirm" : "Delete"}
                                    >
                                        {confirmingId === entry.id ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Confirm?</span>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
