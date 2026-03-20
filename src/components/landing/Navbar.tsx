"use client";

import React from 'react';
import { Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { PlanPickerModal } from './PlanPickerModal';

interface NavbarProps {
    onGetStarted: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted }) => {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const sections = ['hero', 'features', 'pricing', 'testimonials', 'faq'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features', id: 'features' },
        { name: 'Pricing', href: '#pricing', id: 'pricing' },
        { name: 'Testimonials', href: '#testimonials', id: 'testimonials' },
        { name: 'FAQ', href: '#faq', id: 'faq' },
    ];

    return (
        <>
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <nav className="pointer-events-auto h-14 px-12 flex items-center justify-between gap-12 bg-white/45 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] w-full max-w-4xl mx-auto transition-all duration-300 hover:bg-white/55 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                            <Mail size={20} />
                        </div>
                        <span className="font-sans font-bold text-lg text-gray-900 tracking-tight whitespace-nowrap">Zelo Assist</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <a
                                key={link.id}
                                href={link.href}
                                className={`transition-all duration-300 text-sm font-medium ${activeSection === link.id
                                    ? 'text-primary scale-110'
                                    : 'text-gray-600 hover:text-primary hover:scale-105'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onGetStarted}
                            className="relative px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                        >
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-orange-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        <button
                            onClick={() => signIn('google')}
                            className="relative px-5 py-2 text-sm font-medium text-gray-900 bg-primary rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 cursor-pointer"
                        >
                            <span className="relative z-10">Log In</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
