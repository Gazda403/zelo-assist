
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 rounded-3xl w-full h-full" />
});

export default function SplineHero() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center">
            <Spline
                scene="https://prod.spline.design/oFC-fhKpHkUsBANK/scene.splinecode"
                onLoad={() => setIsLoaded(true)}
                style={{
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
}
