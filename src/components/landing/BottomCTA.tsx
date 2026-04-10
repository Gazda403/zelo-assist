"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export default function BottomCTA({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-950">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 max-w-5xl relative z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl overflow-hidden relative group transition-all duration-500 hover:border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-medium text-sm mb-8 backdrop-blur-md border border-white/10">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span>Reclaim your time</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-[1.1]">
                            Ready to liberate<br />your inbox?
                        </h2>

                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed italic font-serif">
                            Join 10,000+ professionals who have already reclaimed their deep work time.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-white/10 transition-shadow hover:shadow-white/20 active:shadow-inner"
                            >
                                Get Started for Free
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-10 py-5 bg-transparent text-white font-bold border border-white/20 rounded-2xl flex items-center justify-center gap-3 backdrop-blur-md transition-all hover:bg-white/10"
                            >
                                Book a Demo
                            </motion.button>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <img
                                            key={i}
                                            src={`https://picsum.photos/100/100?random=${i + 10}`}
                                            className="w-8 h-8 rounded-full border-2 border-slate-900"
                                            alt="User"
                                        />
                                    ))}
                                </div>
                                <p>Already saving 10h/week for teams globally</p>
                            </div>

                            <Link href="/blog">
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 bg-gradient-to-b from-white to-gray-50 text-slate-600 font-medium rounded-full shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1),0_5px_10px_-5px_rgba(0,0,0,0.1)] border border-white/20 flex items-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-[0_15px_30px_-5px_rgba(255,255,255,0.15)] group"
                                >
                                    <BookOpen className="w-4 h-4 text-primary group-hover:rotate-6 transition-transform" />
                                    <span>See Blogs</span>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
