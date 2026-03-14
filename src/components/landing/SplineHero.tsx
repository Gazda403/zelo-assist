"use client";

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Disable SSR for Spline to prevent "position" property errors during hydration
const Spline = dynamic(() => import('@splinetool/react-spline').then(mod => mod.default), {
    ssr: false,
    loading: () => <LoadingPlaceholder />
});

interface SplineHeroProps {
    scene?: string;
    className?: string;
}

/**
 * SplineHero - A performance-optimized wrapper for the 3D Spline scene.
 * Includes a loading fallback and smooth transitions.
 */
export default function SplineHero({
    scene = 'https://prod.spline.design/oFC-fhKpHkUsBANK/scene.splinecode', // User's custom envelope scene
    className
}: SplineHeroProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative w-full h-[500px] lg:h-[600px] flex items-center justify-center ${className}`}>
            <Spline
                scene={scene}
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

function LoadingPlaceholder() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );
}
