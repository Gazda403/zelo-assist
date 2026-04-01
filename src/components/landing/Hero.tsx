"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import VideoHero from './VideoHero';
import SplineHero from './SplineHero';

interface HeroProps {
    onGetStarted?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
    return (
        <section id="hero" className="relative pt-32 pb-10 lg:pt-40 lg:pb-16 overflow-hidden min-h-[90vh] flex items-center">
            {/* Custom Curvy Animated Lines Component */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg
                    viewBox="0 0 1440 800"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    className="absolute top-0 right-0 w-full h-[130%] lg:h-full text-transparent"
                >
                    {/* Line 1 - Front */}
                    <motion.path
                        d="M1440 100C1200 250 900 300 750 500C600 700 300 750 0 800"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1, y: [0, -20, 0] }}
                        transition={{
                            pathLength: { duration: 2, ease: "easeInOut" },
                            opacity: { duration: 1 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                    />
                    {/* Line 2 - Middle */}
                    <motion.path
                        d="M1440 300C1100 400 950 200 650 450C350 700 150 700 0 800"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1, y: [0, 30, 0] }}
                        transition={{
                            pathLength: { duration: 2.5, ease: "easeInOut", delay: 0.2 },
                            opacity: { duration: 1, delay: 0.2 },
                            y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }
                        }}
                    />
                    {/* Line 3 - Back */}
                    <motion.path
                        d="M1440 500C1300 600 1000 500 800 650C600 800 400 850 0 800"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="15"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1, y: [0, -15, 0] }}
                        transition={{
                            pathLength: { duration: 3, ease: "easeInOut", delay: 0.4 },
                            opacity: { duration: 1, delay: 0.4 },
                            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }
                        }}
                    />
                </svg>
            </div>

            {/* Subtle floating blobs over the curve for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                <div className="absolute top-20 right-10 w-64 h-64 bg-white/30 rounded-full blur-3xl mix-blend-overlay animate-blob" />
                <div className="absolute top-40 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-blob animation-delay-2000" />
            </div>

            {/* Bottom Solid White Curve - Rising on the right */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none transform translate-y-1">
                <svg
                    viewBox="0 0 1440 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    className="relative block w-full h-[150px] md:h-[250px] lg:h-[350px]"
                >
                    <path
                        d="M0 200C150 200 200 280 400 280C600 280 700 220 900 180C1100 140 1200 40 1440 40V320H0V200Z"
                        fill="#FAFAF9"
                    />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Column: Text Content */}
                    <div className="text-center lg:text-left pb-24 lg:pb-0 relative z-30">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
                        >
                            <Sparkles size={16} className="text-primary" />
                            <span className="text-sm font-medium text-gray-600">Powered by trained AI models</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
                        >
                            Email calmness, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                                delivered instantly.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Turn chaotic inboxes into structured peace. Zelo Assist writes your replies, prioritizes your day, and gives you back your time.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={onGetStarted}
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:-translate-y-1 shadow-lg shadow-orange-500/30 cursor-pointer"
                            >
                                Try it Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />

                                {/* Border Beam Effect (simplified with CSS for performance) */}
                                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                            </button>

                            <button
                                onClick={onGetStarted}
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:text-gray-900 hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                            >
                                View Pricing
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Hero Image container - tucked behind the white curve (z-10 < z-20) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                        className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end z-10"
                    >
                        {/* Removed the small decorative bg behind image since we have the large curve now */}

                        <SplineHero />

                    </motion.div>

                </div>

                {/* Hero Image / Visualization - Removed indefinitely per request
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="mt-10 relative mx-auto max-w-5xl"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200">
                        <div className="absolute top-0 w-full h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="pt-12 bg-gray-50/50">
                            <VideoHero frameCount={129} />
                        </div>
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Time Saved</p>
                                <p className="text-lg font-bold text-gray-900">2h 14m</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
                */}
            </div>
        </section>
    );
};

export default Hero;
