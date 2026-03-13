"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    { id: 1, name: "Sarah Jenkins", role: "Product Manager", content: "ZELO captures my tone perfectly.", avatar: "https://picsum.photos/100/100" },
];

const SocialProof = () => {
    return (
        <section className="py-20 bg-white">
            <h2 className="text-3xl font-bold text-center">Loved by 10,000+ professionals</h2>
            <div className="flex gap-4 overflow-hidden py-10">
                {testimonials.map(t => (
                    <div key={t.id} className="min-w-[300px] p-8 bg-stone-50 rounded-3xl border">
                        <p className="italic mb-4">"{t.content}"</p>
                        <span className="font-bold">{t.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
export default SocialProof;
