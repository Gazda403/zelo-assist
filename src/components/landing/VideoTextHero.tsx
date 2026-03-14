
'use client';

import { useEffect, useRef } from 'react';

export function VideoTextHero() {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <section className="py-16 bg-[#FAFAF9] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-5xl font-black uppercase tracking-tighter text-gray-900">Save Time</h2>
            </div>
        </section>
    );
}
