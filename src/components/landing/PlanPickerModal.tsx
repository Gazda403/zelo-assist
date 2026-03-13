"use client";
import React from 'react';
import { X, Check } from 'lucide-react';

export function PlanPickerModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-md">
            <div className="bg-white p-8 rounded-3xl max-w-4xl w-full">
                <div className="flex justify-between mb-8">
                    <h3 className="text-3xl font-bold">Choose your plan</h3>
                    <button onClick={onClose}><X/></button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 border rounded-2xl">
                        <h4 className="text-xl font-bold">Pro</h4>
                        <p className="text-3xl font-bold">$39</p>
                        <button className="w-full mt-4 py-2 bg-primary text-white rounded-lg">Select</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
