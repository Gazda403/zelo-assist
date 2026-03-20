"use client";

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Application } from '@splinetool/runtime';

interface SplineHeroProps {
    scene?: string;
    className?: string;
}

/**
 * SplineHero - A performance-optimized wrapper for the 3D Spline scene.
 * Using @splinetool/runtime directly for maximum compatibility and performance.
 */
export default React.memo(function SplineHero({
    scene = 'https://prod.spline.design/oFC-fhKpHkUsBANK/scene.splinecode',
    className
}: SplineHeroProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const app = new Application(canvasRef.current);
        let isMounted = true;

        async function init() {
            try {
                await app.load(scene);
                if (isMounted) {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load Spline scene:', err);
                if (isMounted) {
                    setError(err as Error);
                    setIsLoading(false);
                }
            }
        }

        init();

        return () => {
            isMounted = false;
            app.dispose();
        };
    }, [scene]);

    return (
        <div className={`relative w-full h-[500px] lg:h-[600px] flex items-center justify-center pointer-events-auto ${className}`}>
            <canvas 
                ref={canvasRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    display: isLoading ? 'none' : 'block' 
                }} 
            />
            
            {isLoading && <LoadingPlaceholder />}
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center text-red-500/50 text-sm bg-white/5 rounded-2xl backdrop-blur-sm border border-red-500/20 px-6 py-3">
                    Failed to load 3D scene. Please try refreshing.
                </div>
            )}
        </div>
    );
});

function LoadingPlaceholder() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );
}
