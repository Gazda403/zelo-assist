
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Infinity, MessageSquare, Layers } from 'lucide-react';

const benefits = [
    {
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: "Stop the Manual Slog",
        description: "Quit spending hours on repetitive replies. Our AI captures your context and writes perfect responses in seconds.",
        color: "bg-orange-50"
    },
    {
        icon: <Shield className="w-8 h-8 text-primary" />,
        title: "Proactive Protection",
        description: "The Safety Net prevents awkward mistakes. It flags risky drafts and keeps you in control while automating the rest.",
        color: "bg-orange-50"
    },
    {
        icon: <Clock className="w-8 h-8 text-primary" />,
        title: "Buy Back Your Time",
        description: "Users save an average of 12 hours per week. That's a full day of focus reclaimed from your inbox every single month.",
        color: "bg-orange-50"
    },
    {
        icon: <Infinity className="w-8 h-8 text-primary" />,
        title: "Always On, Always Alert",
        description: "Your bots work 24/7. Whether it's a follow-up at 3 AM or a support ticket during a spike, ZELO has your back.",
        color: "bg-orange-50"
    },
    {
        icon: <MessageSquare className="w-8 h-8 text-primary" />,
        title: "Context is Everything",
        description: "The AI remembers your past conversations and brand guidelines. It doesn't just reply — it communicates with meaning.",
        color: "bg-orange-50"
    },
    {
        icon: <Layers className="w-8 h-8 text-primary" />,
        title: "Scalable Automation",
        description: "Connect as many accounts as you need. ZELO manages thousands of emails across your entire business without breaking a sweat.",
        color: "bg-orange-50"
    }
];

export const BenefitsSection: React.FC = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold font-sans text-gray-900 tracking-tight sm:text-5xl"
                    >
                        Built for builders, <br />
                        <span className="text-primary italic">not just responders.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-xl text-gray-500 font-sans"
                    >
                        ZELO isn't just another email tool. It's a strategic layer between you and the chaos, allowing you to focus on the work that actually matters.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="relative group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans">{benefit.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-sans">{benefit.description}</p>
                            
                            {/* Decorative accent */}
                            <div className="absolute bottom-4 right-8 text-primary/5 font-serif text-6xl select-none group-hover:text-primary/10 transition-colors">
                                ✦
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Graphic / Stats */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                        <svg viewBox="0 0 400 400" className="w-full h-full fill-white">
                            <circle cx="200" cy="200" r="150" />
                        </svg>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <p className="text-5xl font-bold text-primary mb-2">98%</p>
                            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Response Rate</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-primary mb-2">40s</p>
                            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Average Reply Time</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-primary mb-2">12h</p>
                            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Saved Weekly</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
