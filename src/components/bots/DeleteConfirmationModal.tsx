'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    botName: string;
    isDeleting: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    botName,
    isDeleting
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
            >
                {/* Header/Banner */}
                <div className="h-2 bg-red-500" />
                
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-2">
                        Delete "{botName}"?
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Are you sure you want to delete this bot? This action will permanently remove its configuration, knowledge base policies, and execution history.
                        <span className="block mt-2 font-bold text-red-600 dark:text-red-400 italic">This cannot be undone.</span>
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Bot
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
