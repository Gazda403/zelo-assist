"use client";
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StickyCTA = ({ onGetStarted }: any) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-3">
            <span className="font-medium">Start writing better emails</span>
            <button onClick={onGetStarted} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><ArrowUpRight size={16}/></button>
        </div>
    );
};
export default StickyCTA;
