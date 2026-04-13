"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Testimonial } from './types';

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Product Manager at Acme",
        content: "The mental load of answering emails is completely gone. Xelo Flow captures my tone perfectly. I can't imagine working without it.",
        avatar: "https://picsum.photos/100/100?random=1"
    },
    {
        id: 2,
        name: "David Chen",
        role: "Freelance Developer",
        content: "Simple, clean, and blazing fast. Xelo Flow's concise mode is a lifesaver for quick client updates. Saves me 2+ hours a day easily.",
        avatar: "https://picsum.photos/100/100?random=2"
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Marketing Director",
        content: "Finally, an AI tool that doesn't feel cluttered. Xelo Flow actually makes email peaceful — inbox zero every single day.",
        avatar: "https://picsum.photos/100/100?random=3"
    },
    {
        id: 7,
        name: "Anika Patel",
        role: "Legal Operations Manager",
        content: "Xelo Flow drafts responses to complex contract follow-ups with the right tone every time. It's like having a senior paralegal on email duty 24/7.",
        avatar: "https://picsum.photos/100/100?random=7"
    },
    {
        id: 4,
        name: "Marcus Thompson",
        role: "E-Commerce Founder",
        content: "The E-Commerce bot handles customer inquiries before I even wake up. Revenue stayed up while my support workload dropped 80%.",
        avatar: "https://picsum.photos/100/100?random=4"
    },
    {
        id: 5,
        name: "Priya Nair",
        role: "Startup CEO",
        content: "Xelo Flow's knowledge base sync is a game-changer. It answers investor questions using our actual deck data. Accuracy is incredible.",
        avatar: "https://picsum.photos/100/100?random=5"
    },
    {
        id: 6,
        name: "Jordan Lee",
        role: "Customer Success Lead",
        content: "The Safety Net auto-reply kept our SLA green during a spike. Customers never felt ignored — and follow-ups were handled automatically.",
        avatar: "https://picsum.photos/100/100?random=6"
    }
];

// Double the list to create the seamless infinite loop
const loopedTestimonials = [...testimonials, ...testimonials];

const CARD_WIDTH = 396;
const CARD_GAP = 24;
const TRACK_WIDTH = (CARD_WIDTH + CARD_GAP) * testimonials.length;

const TestimonialCard: React.FC<{ t: Testimonial }> = ({ t }) => (
    <div
        className="flex-shrink-0 bg-[#FAFAF9] p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing"
        style={{ width: CARD_WIDTH }}
    >
        <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-primary text-primary" />
            ))}
        </div>
        <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.content}"</p>
        <div className="flex items-center gap-4">
            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
            <div>
                <h5 className="font-bold text-gray-900 text-sm">{t.name}</h5>
                <p className="text-xs text-gray-500">{t.role}</p>
            </div>
        </div>
    </div>
);

const SocialProof: React.FC = () => {
    return (
        <section id="testimonials" className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by 10,000+ professionals</h2>
                    <p className="mt-4 text-gray-500 text-lg">Join the movement for calmer, smarter communication.</p>
                </div>
            </div>

            {/* Carousel — full width, bleeds past container */}
            <div className="relative w-full">
                {/* Left fade */}
                <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex"
                    style={{ gap: CARD_GAP, paddingLeft: CARD_GAP, paddingRight: CARD_GAP }}
                    animate={{ x: [`0px`, `-${TRACK_WIDTH}px`] }}
                    transition={{
                        ease: "linear",
                        duration: 28,
                        repeat: Infinity,
                    }}
                    drag="x"
                    dragConstraints={{ left: -TRACK_WIDTH, right: 0 }}
                    whileDrag={{ animationPlayState: "paused" } as never}
                >
                    {loopedTestimonials.map((t, i) => (
                        <TestimonialCard key={`${t.id}-${i}`} t={t} />
                    ))}
                </motion.div>
            </div>

            {/* Logo Cloud */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-gray-100">
                <p className="text-center text-sm font-semibold text-gray-400 mb-8 uppercase tracking-widest">Trusted by teams at</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['Acme', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map((company) => (
                        <span key={company} className="text-xl font-bold font-sans text-gray-800">{company}</span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
