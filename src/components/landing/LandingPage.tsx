"use client";
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
import { LoginModal } from './LoginModal';

export function LandingPage() {
    const [isPlanPickerOpen, setIsPlanPickerOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <div className="min-h-screen animate-gradient-brand font-sans selection:bg-white/20 selection:text-white">
            <PlanPickerModal isOpen={isPlanPickerOpen} onClose={() => setIsPlanPickerOpen(false)} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <Navbar onGetStarted={() => setIsPlanPickerOpen(true)} onLogin={() => setIsLoginModalOpen(true)} />
            <main>
                <Hero onGetStarted={() => setIsPlanPickerOpen(true)} />
                <BenefitsSection />
                <Features />
                <VideoTextHero />
                <Pricing onGetStarted={() => setIsPlanPickerOpen(true)} />
                <SocialProof />
                <FAQ />
                <BottomCTA onGetStarted={() => setIsPlanPickerOpen(true)} />
            </main>
            <Footer />
            <StickyCTA onGetStarted={() => setIsPlanPickerOpen(true)} />
        </div>
    );
}
