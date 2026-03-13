"use client";
import React from 'react';
export default function StatsSidebar() {
    return (
        <div className="h-full w-64 bg-white/40 border-l p-6">
            <h3 className="font-bold mb-4">Inbox Insights</h3>
            <div className="space-y-4">
                <div className="p-4 bg-violet-600 text-white rounded-2xl">
                    <p className="text-xs opacity-80">Avg Urgency</p>
                    <p className="text-2xl font-black">8.4</p>
                </div>
            </div>
        </div>
    );
}
