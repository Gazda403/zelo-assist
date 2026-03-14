
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Landmark, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    planPrice: number | string;
    planId: string;
}

export function CheckoutModal({ isOpen, onClose, planName, planPrice, planId }: CheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank'>('paypal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [{ isPending }] = usePayPalScriptReducer();

    const handleBankTransferConfirm = async () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsSuccess(true);
            setIsProcessing(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100"
                >
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-stone-900">Checkout</h3>
                            <p className="text-sm text-stone-500">Secure your {planName} subscription</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100"><X /></button>
                    </div>

                    <div className="p-8 text-center">
                        {isSuccess ? (
                            <div>
                                <h4 className="text-2xl font-bold text-green-600 mb-4">Subscription Activated!</h4>
                                <button onClick={() => window.location.href = '/dashboard'} className="w-full py-4 bg-primary text-white font-bold rounded-2xl">Go to Dashboard</button>
                            </div>
                        ) : (
                            <div>
                                <PayPalButtons
                                    createSubscription={(data, actions) => {
                                        return actions.subscription.create({ plan_id: planId });
                                    }}
                                    onApprove={async (data, actions) => {
                                        setIsSuccess(true);
                                    }}
                                />
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button onClick={handleBankTransferConfirm} className="text-sm text-gray-500 underline">Pay via Bank Transfer</button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
