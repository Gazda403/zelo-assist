"use client";
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function BottomCTA({ onGetStarted }: any) {
    return (
        <section className="py-24 bg-slate-950 text-white">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to liberate your inbox?</h2>
                <button onClick={onGetStarted} className="px-10 py-5 bg-white text-slate-950 font-bold rounded-2xl">Get Started Free</button>
            </div>
        </section>
    );
}
