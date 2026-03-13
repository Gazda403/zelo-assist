"use client";
import React from 'react';
import { Bot, Database, PenTool, CheckCircle, Zap, BarChart3 } from 'lucide-react';

const features = [
    { title: "AI Auto-Reply Bots", description: "Specialized bots for E-Commerce and Startups.", icon: <Bot className="w-6 h-6 text-white" /> },
    { title: "Knowledge Base Sync", description: "Sync your Notion, docs, or PDFs.", icon: <Database className="w-6 h-6 text-white" /> },
    { title: "Smart Draft Generation", description: "AI reads the room and drafts replies.", icon: <PenTool className="w-6 h-6 text-white" /> },
];

const Features: React.FC = () => {
    return (
        <section id="features" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-stone-50 border border-gray-100">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6">{f.icon}</div>
                        <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                        <p className="text-gray-600">{f.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
export default Features;
