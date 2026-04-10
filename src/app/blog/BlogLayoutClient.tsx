"use client";

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import { LoginModal } from '@/components/landing/LoginModal';
import { PlanPickerModal } from '@/components/landing/PlanPickerModal';

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPlanPickerOpen, setIsPlanPickerOpen] = useState(false);

    return (
        <div className="dark:bg-zinc-950 min-h-screen">
            <Navbar 
                variant="minimal" 
                onLogin={() => setIsLoginModalOpen(true)}
                onGetStarted={() => setIsPlanPickerOpen(true)}
            />
            
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <PlanPickerModal isOpen={isPlanPickerOpen} onClose={() => setIsPlanPickerOpen(false)} />
            
            {children}
            
            {/* We could also add a script here to handle the "free trial" buttons inside the static content */}
            <style jsx global>{`
                .blog-cta-trigger {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
