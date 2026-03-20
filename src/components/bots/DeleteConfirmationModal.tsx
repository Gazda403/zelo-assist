'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    botName: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    botName,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500/80" />

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold font-serif mb-2 text-gray-900 dark:text-white">
                                Delete Bot?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{botName}"</span>?
                                This action is permanent and cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border border-gray-100 dark:border-white/5"
                                >
                                    Keep it
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Delete Forever
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Subtle Warning Footer */}
                        <div className="px-8 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">DANGER ZONE</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
