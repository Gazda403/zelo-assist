
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "How does Zelo Assist know my unique voice?",
        answer: "We analyze your past sent emails (securely and privately) to build a 'Style DNA'. This captures typical greetings, closing remarks, and the level of formality you use with different recipients."
    },
    {
        question: "Is my email data safe?",
        answer: "Security is our top priority. We use industry-standard OAuth2 to connect to your Gmail account. We never store your login credentials, and your email content is only used to generate responses — it's never sold or shared."
    },
    {
        question: "Can I review drafts before they are sent?",
        answer: "Absolutely. By default, ZELO creates drafts for you to review. You can enable 'Auto-Send' only for specific trusted senders or simple acknowledgment scenarios."
    },
    {
        question: "Does it work with existing CRM or support tools?",
        answer: "Yes! ZELO's Pro plan includes API access and native integrations with popular tools like Shopify, WooCommerce, and Slack."
    },
    {
        question: "What happens if the AI makes a mistake?",
        answer: "Our 'Safety Net' features include risk scoring. If the AI is unsure about a complex inquiry or detects a sensitive topic, it will flag the draft for your manual attention."
    }
];

const FAQItem: React.FC<{ q: string; a: string; i: number }> = ({ q, a, i }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 last:border-0 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:text-primary transition-colors focus:outline-none group"
            >
                <span className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{q}</span>
                <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <p className="pb-8 text-gray-500 leading-relaxed max-w-3xl">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="text-primary" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <p className="mt-4 text-gray-500 text-lg">Everything you need to know about Zelo Assist.</p>
                </div>

                <div className="bg-[#FAFAF9] rounded-[2rem] px-8 md:px-12 border border-gray-100 shadow-sm">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} q={faq.question} a={faq.answer} i={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
