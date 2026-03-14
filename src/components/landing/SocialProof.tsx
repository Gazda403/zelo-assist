
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Product Manager at Acme",
        content: "The mental load of answering emails is completely gone. ZELO captures my tone perfectly. I can't imagine working without it.",
        avatar: "https://picsum.photos/100/100?random=1"
    },
    {
        id: 2,
        name: "David Chen",
        role: "Freelance Developer",
        content: "Simple, clean, and blazing fast. ZELO's concise mode is a lifesaver for quick client updates. Saves me 2+ hours a day easily.",
        avatar: "https://picsum.photos/100/100?random=2"
    }
];

const SocialProof: React.FC = () => {
    return (
        <section id="testimonials" className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by 10,000+ professionals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t) => (
                        <div key={t.id} className="bg-[#FAFAF9] p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} className="fill-primary text-primary" />)}
                            </div>
                            <p className="text-gray-700 italic mb-6">"{t.content}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h5 className="font-bold text-gray-900 text-sm">{t.name}</h5>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
