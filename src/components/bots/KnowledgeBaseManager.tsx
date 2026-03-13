'use client';

import { useState } from 'react';
import { 
    Search, 
    Plus, 
    FileText, 
    Trash2, 
    Edit2, 
    BookOpen, 
    Save, 
    X,
    MessageSquare,
    Globe,
    Lock,
    ExternalLink,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface KnowledgeDoc {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt: string;
    isPublic: boolean;
}

export function KnowledgeBaseManager() {
    const [docs, setDocs] = useState<KnowledgeDoc[]>([
        {
            id: '1',
            title: 'Founders Bot FAQ',
            content: 'Contains information about our pricing, roadmap, and common investor questions.',
            category: 'Investor Relations',
            updatedAt: '2024-03-20',
            isPublic: false
        },
        {
            id: '2',
            title: 'Technical Support Guidelines',
            content: 'Standard operating procedures for handling common bugs and feature requests.',
            category: 'Customer Support',
            updatedAt: '2024-03-18',
            isPublic: true
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);

    const filteredDocs = docs.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string) => {
        setDocs(docs.filter(d => d.id !== id));
        toast.success('Document removed from knowledge base');
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-500" />
                        Knowledge Base
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">Manage documents that the AI uses to ground its responses.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    ADD DOCUMENT
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                    type="text"
                    placeholder="Search knowledge documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 outline-none transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredDocs.map((doc) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-none">
                                    <FileText className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEditingDoc(doc)}
                                        className="p-1.5 text-zinc-400 hover:text-orange-500 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 truncate group-hover:text-orange-500 transition-colors">
                                {doc.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-8 leading-relaxed">
                                {doc.content}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
                                    {doc.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {doc.updatedAt}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredDocs.length === 0 && (
                <div className="text-center py-20 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800">
                    <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium text-zinc-500">No matching brain components found.</p>
                </div>
            )}

            {/* Document Training Modal (Placeholder for future training UI) */}
            <AnimatePresence>
                {(isAdding || editingDoc) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Plus className="w-32 h-32 text-orange-500" />
                            </div>

                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-orange-500" />
                                        {isAdding ? 'Augment Brain' : 'Refine Context'}
                                    </h3>
                                    <button 
                                        onClick={() => { setIsAdding(false); setEditingDoc(null); }}
                                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., Q3 Funding Strategy"
                                            defaultValue={editingDoc?.title}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 font-bold outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brain Content</label>
                                        <textarea 
                                            rows={6}
                                            placeholder="Paste the core knowledge here..."
                                            defaultValue={editingDoc?.content}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 font-medium outline-none focus:border-orange-500 transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Classification</label>
                                            <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 font-bold outline-none focus:border-orange-500 transition-colors appearance-none">
                                                <option>Investor Relations</option>
                                                <option>Customer Support</option>
                                                <option>Product Specs</option>
                                                <option>Strategic Roadmap</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4 h-full pt-6">
                                            <button className="flex-1 h-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                <Lock className="w-3 h-3" />
                                                Private
                                            </button>
                                            <button className="flex-1 h-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                <Globe className="w-3 h-3" />
                                                Public
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button 
                                        onClick={() => { setIsAdding(false); setEditingDoc(null); }}
                                        className="px-8 py-4 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                        onClick={() => {
                                            toast.success('Vector embeddings updated in brain matrix');
                                            setIsAdding(false);
                                            setEditingDoc(null);
                                        }}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Index Document
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
