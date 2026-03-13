"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Brain, FastForward, ArrowRight } from 'lucide-react';

export default function BenefitsSection() {
    return (
        <section className="relative py-32 overflow-hidden bg-[#FAFAF9]">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-5xl font-bold mb-12">Stop drowning in unread emails.</h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 p-12 bg-white rounded-[2rem] border">
                        <h3 className="text-4xl font-bold mb-4">Rescue 10 hours a week from inbox triage.</h3>
                        <p className="text-lg text-slate-600">Let ZELO handle the busy work.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
