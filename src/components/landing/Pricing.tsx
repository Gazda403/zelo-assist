"use client";
import React, { useState } from 'react';
import { Check } from 'lucide-react';

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-gradient-to-b from-orange-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-extrabold mb-12">Individual Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white rounded-3xl border">
                        <h3 className="text-2xl font-bold mb-4">Starter</h3>
                        <p className="text-4xl font-bold mb-6">$13.99</p>
                        <button className="w-full py-3 bg-primary text-white rounded-xl">Get started</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
