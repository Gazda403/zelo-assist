"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Is XELOFLOW secure?",
        answer: "Absolutely. XELOFLOW uses bank-grade encryption and is SOC2 compliant. Your emails are processed in a secure environment and your data is never used to train global models without your explicit consent."
    },
    {
        question: "Does it work with all email providers?",
        answer: "Currently, XELOFLOW is optimized for Gmail. We are actively working on integrations for Outlook, iCloud, and custom IMAP providers which will be arriving later this year."
    },
    {
        question: "Can I train the AI on my specific business data?",
        answer: "Yes! Our Knowledge Base Sync feature allows you to connect Notion, PDFs, and documentation. XELOFLOW will then use this context to provide 100% accurate, context-aware responses to your specific business inquiries."
    },
    {
        question: "Will the AI-generated drafts sound like me?",
        answer: "Yes. XELOFLOW analyzes your previous sent messages to learn your unique tone, signature style, and vocabulary preferences, ensuring every draft feels like it was written by you."
    },
    {
        question: "How long does it take to set up?",
        answer: "Setup takes less than 2 minutes. Simply connect your Gmail account, set your preferences, and XELOFLOW will begin analyzing your inbox to start saving you time immediately."
    }
];

const FAQItem = ({ faq, isOpen, toggle }: { faq: typeof faqs[0], isOpen: boolean, toggle: () => void }) => {
    return (
        <div className="border-b border-slate-200 last:border-0">
            <button
                onClick={toggle}
                className="w-full py-6 flex items-center justify-between text-left group focus:outline-none"
            >
                <span className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {faq.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-primary' : 'text-slate-400'}`} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-600 leading-relaxed max-w-2xl">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-[#FAFAF9]">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                        <HelpCircle className="w-4 h-4" />
                        <span>FAQ</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                        Common Questions
                    </h2>
                    <p className="text-xl text-slate-600">
                        Everything you need to know about XELOFLOW.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200/50 shadow-soft p-8 md:p-12">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            toggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
