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
    planId: string; // PayPal Plan ID
}

export function CheckoutModal({ isOpen, onClose, planName, planPrice, planId }: CheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank'>('paypal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [{ isPending }] = usePayPalScriptReducer();

    const handleBankTransferConfirm = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/checkout/bank-transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, referenceCode: `BANK-${Math.random().toString(36).substring(7).toUpperCase()}` }),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                alert("Failed to log bank transfer. Please try again.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-stone-900">Checkout</h3>
                            <p className="text-sm text-stone-500">Secure your {planName} subscription</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-stone-200/50 transition-colors text-stone-400 hover:text-stone-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {isSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-bold text-stone-900 mb-2">Order Received!</h4>
                                <p className="text-stone-500 mb-8 px-4">
                                    {paymentMethod === 'bank'
                                        ? "Please complete the bank transfer. Your account will be activated once we verify the payment."
                                        : "Your subscription is now active! Redirecting you to the dashboard..."}
                                </p>
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Plan Summary Container */}
                                <div className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-stone-500 font-medium">{planName} Plan</span>
                                        <span className="text-xl font-bold text-stone-900">
                                            {typeof planPrice === 'number' ? `$${planPrice}` : planPrice}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-400">Billed monthly. Cancel anytime.</p>
                                </div>

                                {/* Payment Method Toggle */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'paypal' ? 'border-primary bg-orange-50/30' : 'border-stone-100 hover:border-stone-200'
                                            }`}
                                    >
                                        <CreditCard className={`w-6 h-6 ${paymentMethod === 'paypal' ? 'text-primary' : 'text-stone-400'}`} />
                                        <span className="text-sm font-bold text-stone-900">PayPal / Card</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('bank')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'bank' ? 'border-primary bg-orange-50/30' : 'border-stone-100 hover:border-stone-200'
                                            }`}
                                    >
                                        <Landmark className={`w-6 h-6 ${paymentMethod === 'bank' ? 'text-primary' : 'text-stone-400'}`} />
                                        <span className="text-sm font-bold text-stone-900">Bank Transfer</span>
                                    </button>
                                </div>

                                {/* Payment Content */}
                                <div className="space-y-6">
                                    {paymentMethod === 'paypal' ? (
                                        <div className="relative min-h-[150px]">
                                            {isPending && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-2xl">
                                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                </div>
                                            )}
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect" }}
                                                createSubscription={(data, actions) => {
                                                    return actions.subscription.create({
                                                        plan_id: planId,
                                                        // custom_id is set in the backend for security
                                                    });
                                                }}
                                                onApprove={async (data, actions) => {
                                                    console.log("Subscription approved:", data.subscriptionID);
                                                    setIsSuccess(true);
                                                    // The webhook will handle final activation
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-5 bg-stone-900 rounded-2xl text-stone-300 text-sm font-mono leading-relaxed border border-stone-800">
                                                <p className="text-stone-500 mb-2 uppercase text-[10px] tracking-widest font-sans font-bold">Transfer Details</p>
                                                <div className="space-y-1">
                                                    <p><span className="text-stone-500">Bank:</span> National Bank</p>
                                                    <p><span className="text-stone-500">Holder:</span> Zelo Assist Ltd.</p>
                                                    <p><span className="text-stone-500">IBAN:</span> XS89 0000 0000 1234 5678</p>
                                                    <p><span className="text-stone-500">SWIFT:</span> ZELOXXXX</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleBankTransferConfirm}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        I've made the transfer
                                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-stone-400 text-center uppercase tracking-wide">
                                                Verification can take 1-3 business days
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
