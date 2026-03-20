
"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, Save, Edit2, Book, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { KnowledgeBasePolicy } from "@/lib/bots/types";
import { format } from "date-fns";
import { toast } from "sonner";

interface BotPolicyManagerProps {
    botId: string;
}

// MOCK DATA GENERATOR
function getMockPolicies(botId: string): KnowledgeBasePolicy[] {
    return [
        {
            id: "pol_1",
            title: "Standard Return Policy",
            content: "We offer a 30-day return window for unworn items with tags attached. Shipping costs are non-refundable.",
            tags: ["returns", "shipping"],
            createdAt: new Date(Date.now() - 86400000 * 20),
            updatedAt: new Date(Date.now() - 86400000 * 5)
        },
        {
            id: "pol_2",
            title: "International Shipping",
            content: "We ship to EU, UK, and Canada via DHL Express (3-5 business days). Duties are paid by the customer.",
            tags: ["shipping", "international"],
            createdAt: new Date(Date.now() - 86400000 * 30),
            updatedAt: new Date(Date.now() - 86400000 * 30)
        }
    ];
}

export function BotPolicyManager({ botId }: BotPolicyManagerProps) {
    const [policies, setPolicies] = useState<KnowledgeBasePolicy[]>(getMockPolicies(botId));
    const [isEditing, setIsEditing] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState<Partial<KnowledgeBasePolicy>>({});
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleSavePolicy = () => {
        if (!currentPolicy.title || !currentPolicy.content) {
            toast.error("Title and Content are required");
            return;
        }

        const newPolicy: KnowledgeBasePolicy = {
            id: currentPolicy.id || `pol_${Date.now()}`,
            title: currentPolicy.title,
            content: currentPolicy.content,
            tags: currentPolicy.tags || [],
            createdAt: currentPolicy.createdAt || new Date(),
            updatedAt: new Date()
        };

        if (currentPolicy.id) {
            setPolicies(policies.map(p => p.id === newPolicy.id ? newPolicy : p));
            toast.success("Policy updated");
        } else {
            setPolicies([...policies, newPolicy]);
            toast.success("New policy added");
        }

        setIsEditing(false);
        setCurrentPolicy({});
    };

    const handleDeletePolicy = (id: string) => {
        if (confirmingId !== id) {
            setConfirmingId(id);
            setTimeout(() => setConfirmingId(null), 3000);
            return;
        }

        setPolicies(policies.filter(p => p.id !== id));
        toast.success("Policy deleted");
        setConfirmingId(null);
    };

    const handleEdit = (policy: KnowledgeBasePolicy) => {
        setCurrentPolicy(policy);
        setIsEditing(true);
    };

    const handleNew = () => {
        setCurrentPolicy({});
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Book className="w-5 h-5 text-violet-600" />
                        Knowledge Base
                    </h3>
                    <p className="text-sm text-gray-500">
                        Add store policies here. The AI will use them to answer customer questions.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Policy</span>
                    </button>
                )}
            </div>

            {/* Editor Mode */}
            {isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl border border-violet-200 shadow-sm space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none"
                            placeholder="e.g. Refund Policy"
                            value={currentPolicy.title || ''}
                            onChange={(e) => setCurrentPolicy({ ...currentPolicy, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (Rules & Guidelines)</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none h-32"
                            placeholder="Paste your policy text here..."
                            value={currentPolicy.content || ''}
                            onChange={(e) => setCurrentPolicy({ ...currentPolicy, content: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePolicy}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        >
                            <Save className="w-4 h-4" />
                            Save Policy
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Policy List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {policies.map((policy) => (
                        <motion.div
                            key={policy.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <h4 className="font-semibold text-gray-900">{policy.title}</h4>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(policy)}
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePolicy(policy.id)}
                                        className={`p-1.5 transition-all rounded ${confirmingId === policy.id
                                            ? 'bg-red-500 text-white hover:bg-red-600 px-3'
                                            : 'text-red-500 hover:bg-red-50'
                                            }`}
                                        title={confirmingId === policy.id ? "Click again to confirm" : "Delete"}
                                    >
                                        {confirmingId === policy.id ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Confirm?</span>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">
                                {policy.content}
                            </p>
                            <div className="flex gap-2">
                                {policy.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {policies.length === 0 && !isEditing && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Book className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Knowledge Base is Empty</p>
                        <p className="text-sm text-gray-400">Add policies to help the bot answer questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
