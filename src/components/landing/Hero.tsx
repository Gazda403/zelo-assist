"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';
import SplineHero from './SplineHero';

const Hero: React.FC = () => {
    return (
        <section id="hero" className="relative pt-32 pb-10 flex items-center overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                        Email calmness, <br />
                        <span className="text-primary">delivered instantly.</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-10">Turn chaotic inboxes into structured peace. Zelo Assist writes your replies, prioritizes your day, and gives you back your time.</p>
                    <button onClick={() => signIn('google')} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg">Try it Free</button>
                </div>
                <SplineHero />
            </div>
        </section>
    );
};
export default Hero;
