
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, Shield, Clock, Zap } from 'lucide-react';

const features = [
    {
        title: "AI Bot Engine",
        description: "Intelligent bots that understand context and intent before replying.",
        icon: <Brain className="w-6 h-6" />,
        color: "bg-blue-500"
    },
    {
        title: "Smart Drafting",
        description: "Perfectly phrased replies generated in your unique brand voice.",
        icon: <Sparkles className="w-6 h-6" />,
        color: "bg-orange-500"
    },
    {
        title: "Context Analysis",
        description: "AI-powered importance scoring to focus on what matters most.",
        icon: <MessageSquare className="w-6 h-6" />,
        color: "bg-green-500"
    },
    {
        title: "Safety Shield",
        description: "Risk scoring and manual review options for sensitive inquiries.",
        icon: <Shield className="w-6 h-6" />,
        color: "bg-purple-500"
    },
    {
        title: "Scheduling",
        description: "Follow up exactly when needed with intelligent time-based triggers.",
        icon: <Clock className="w-6 h-6" />,
        color: "bg-red-500"
    },
    {
        title: "Instant Sync",
        description: "Blazing fast real-time synchronization with your Gmail inbox.",
        icon: <Zap className="w-6 h-6" />,
        color: "bg-yellow-500"
    }
];

const Features: React.FC = () => {
    return (
        <section id="features" className="py-24 bg-[#FAFAF9] relative scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Master your inbox, <br /><span className="text-primary italic">automate the chaos.</span></h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
                        Powerful features designed to give you hours back every day.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${feature.color.split('-')[1]}-500/20`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
