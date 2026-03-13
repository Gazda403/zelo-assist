import React, { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import BenefitsSection from './BenefitsSection';
import SocialProof from './SocialProof';
import FAQ from './FAQ';
import BottomCTA from './BottomCTA';
import Footer from './Footer';
import StickyCTA from './StickyCTA';
import { VideoTextHero } from './VideoTextHero';
import { Pricing } from './Pricing';
import { PlanPickerModal } from './PlanPickerModal';

export function LandingPage() {
    const [isPlanPickerOpen, setIsPlanPickerOpen] = useState(false);
    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            <PlanPickerModal isOpen={isPlanPickerOpen} onClose={() => setIsPlanPickerOpen(false)} />
            <Navbar onGetStarted={() => setIsPlanPickerOpen(true)} />
            <main>
                <Hero />
                <BenefitsSection />
                <Features />
                <VideoTextHero />
                <Pricing />
                <SocialProof />
                <FAQ />
                <BottomCTA onGetStarted={() => setIsPlanPickerOpen(true)} />
            </main>
            <Footer />
            <StickyCTA onGetStarted={() => setIsPlanPickerOpen(true)} />
        </div>
    );
}
