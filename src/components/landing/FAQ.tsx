"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { question: "Is ZELO secure?", answer: "Absolutely. ZELO uses bank-grade encryption." },
];

export default function FAQ() {
    return (
        <section className="py-24 bg-stone-50">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-12">Common Questions</h2>
                <div className="bg-white rounded-[2rem] p-8 border">
                    {faqs.map((f, i) => (
                        <div key={i} className="py-4 border-b">
                            <button className="w-full text-left font-bold text-lg">{f.question}</button>
                            <p className="mt-2 text-slate-600">{f.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
