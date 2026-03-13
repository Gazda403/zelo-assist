"use client";
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

export default function SplineHero() {
    return (
        <div className="w-full h-[500px]">
            <Spline scene="https://prod.spline.design/oFC-fhKpHkUsBANK/scene.splinecode" />
        </div>
    );
}
