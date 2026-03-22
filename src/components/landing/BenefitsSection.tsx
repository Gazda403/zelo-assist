"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock, Brain, FastForward, Inbox, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BenefitsSection() {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

    return (
        <section className="relative py-32 overflow-hidden bg-[#FAFAF9]">
            {/* Background Accents (Subtle Glassmorphism) */}
            <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* 1. Header (The Pain) & Image - Two column layout on desktop */}
                <div className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="max-w-xl lg:w-1/2"
                    >
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                            Stop drowning in<br />
                            <span className="text-slate-400">unread emails.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                            The average professional spends 28% of their day managing email. That's time stolen from deep work, strategy, and life.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                        className="lg:w-1/2 flex justify-center lg:justify-end"
                    >
                        <div className="relative w-full max-w-md aspect-square">
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl z-0" />
                            <img
                                src="/email-overload-illustration.png"
                                alt="Abstract illustration of chaotic emails"
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* 2. Visual Bridge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex justify-center mb-16"
                >
                    <div className="h-24 w-px bg-gradient-to-b from-slate-200 to-primary/30" />
                </motion.div>

                {/* 3. The Solution (Benefit Cards) - Inspired by "N26" / "Sweet!" references */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Main Benefit Card (Spans two columns on desktop) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="md:col-span-8 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
                    >
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

                        <div className="flex-1 z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                                <Clock className="w-4 h-4" />
                                <span>Time Saved</span>
                            </div>
                            <h3 className="text-4xl sm:text-5xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
                                Rescue 10 hours a week from inbox triage.
                            </h3>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Let ZELO categorize, prioritize, and draft responses to your daily influx. Focus on the emails that actually move the needle, while AI handles the rest.
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-full md:w-64 aspect-square rounded-3xl flex items-center justify-center relative shadow-sm hover:scale-105 transition-transform duration-500 bg-white">
                            {/* The generated 3D illustration replaces the old icon */}
                            <img
                                src="/time-saved-illustration.png"
                                alt="Illustration symbolizing time saved"
                                className="w-[120%] max-w-none h-auto object-contain absolute z-10 drop-shadow-xl"
                                style={{ transform: 'scale(1.2) translateY(-10px)' }}
                            />
                            {/* Abstract visual background for the image */}
                            <motion.div style={{ y: y1 }} className="absolute inset-0 bg-slate-100 rounded-3xl border border-white flex items-center justify-center overflow-hidden opacity-50 z-0">
                                <div className="text-[14rem] sm:text-[16rem] md:text-[12rem] font-serif font-black text-primary/10 -tracking-[0.1em] pointer-events-none">
                                    10h
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Secondary Benefit Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-4 group relative overflow-hidden rounded-[2rem] bg-[#2A3441] text-white p-8 md:p-10 flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="z-10 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                                <Brain className="w-6 h-6 text-blue-300" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-3">
                                Achieve Inbox Zero without the stress.
                            </h3>
                            <p className="text-slate-300/80 leading-relaxed">
                                No more mental clutter. ZELO learns your priorities so your inbox is always perfectly organized.
                            </p>
                        </div>
                        <div className="flex justify-end z-10">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Secondary Benefit Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="md:col-span-4 group relative overflow-hidden rounded-[2rem] bg-[#E8A598] p-8 md:p-10 flex flex-col justify-between"
                    >
                        <div className="z-10 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                                <FastForward className="w-6 h-6 text-slate-900" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                                Reply faster,<br />sound smarter.
                            </h3>
                            <p className="text-slate-900/80 leading-relaxed">
                                Draft the perfect reply before you even click. ZELO generates context-aware responses instantly.
                            </p>
                        </div>
                    </motion.div>

                    {/* Stats/Proof Card (Spans remaining columns) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="md:col-span-8 group relative overflow-hidden rounded-[2rem] bg-accent/5 lg:bg-transparent lg:border-none border border-accent/10 p-8 flex items-center justify-center lg:justify-start"
                    >
                        <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-16">
                            <div className="text-center sm:text-left">
                                <div className="text-4xl md:text-5xl font-serif font-black text-accent mb-2">3x</div>
                                <div className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Faster Processing</div>
                            </div>
                            <div className="hidden sm:block w-px h-16 bg-slate-200" />
                            <div className="text-center sm:text-left">
                                <div className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-2">98%</div>
                                <div className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Draft Accuracy</div>
                            </div>
                            <div className="hidden sm:block w-px h-16 bg-slate-200" />
                            <div className="text-center sm:text-left">
                                <div className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-2">24/7</div>
                                <div className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Automated Agents</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
