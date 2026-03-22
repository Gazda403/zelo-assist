"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Database, PenTool, CheckCircle, Zap, BarChart3 } from 'lucide-react';
import { Feature } from './types';

const features: Feature[] = [
    {
        title: "AI Auto-Reply Bots",
        description: "Specialized bots for E-Commerce and Startups that handle complex inquiries with human-like precision.",
        icon: <Bot className="w-6 h-6 text-white" />,
    },
    {
        title: "Knowledge Base Sync",
        description: "Sync your Notion, docs, or PDFs. Our AI uses your actual data to provide 100% accurate information.",
        icon: <Database className="w-6 h-6 text-white" />,
    },
    {
        title: "Smart Draft Generation",
        description: "AI reads the room and drafts replies in your voice. Review, tweak, and send in seconds.",
        icon: <PenTool className="w-6 h-6 text-white" />,
    },
    {
        title: "Safety Net Auto-Replies",
        description: "Instant 'we've got this' responses ensure your customers feel heard while the AI works on the solution.",
        icon: <CheckCircle className="w-6 h-6 text-white" />,
    },
    {
        title: "Intelligent Triage",
        description: "Automatic tagging, sentiment analysis, and priority routing for your most critical customer threads.",
        icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
        title: "Performance Analytics",
        description: "Track time saved, resolution rates, and bot accuracy with sleek, real-time visual dashboards.",
        icon: <BarChart3 className="w-6 h-6 text-white" />,
    },
];

const Features: React.FC = () => {
    return (
        <section id="features" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything you need to master your inbox
                    </h3>
                    <p className="text-lg text-gray-600">
                        Powerful tools wrapped in a minimalist design.
                    </p>
                </div>

                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 hide-scrollbar">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="flex-none w-[85vw] sm:w-[320px] md:w-auto snap-center mr-4 md:mr-0 p-8 rounded-3xl bg-[#FAFAF9] border border-gray-100 hover:shadow-soft transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
