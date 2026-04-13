"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    const handleAuthProvider = (provider: 'google' | 'microsoft-entra-id') => {
        signIn(provider);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-stone-100"
                >
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="size-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-stone-100 overflow-hidden">
                                <img src="/logo.png" alt="XeloFlow" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Log In</h3>
                        <p className="text-gray-500">Choose your email provider</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleAuthProvider('google')}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-800 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleAuthProvider('microsoft-entra-id')}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-800 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 21 21">
                                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                            </svg>
                            Continue with Microsoft
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
