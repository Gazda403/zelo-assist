"use client";

import React from 'react';
import { Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface NavbarProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted, onLogin }) => {
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
                <nav className="pointer-events-auto h-12 md:h-14 px-6 md:px-12 flex items-center justify-between gap-4 md:gap-12 bg-white/45 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] w-full max-w-4xl mx-auto transition-all duration-300 hover:bg-white/55 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm bg-white p-0.5">
                            <img src="/icons/icon-512x512.png" alt="Zelo logo" className="w-full h-full object-contain" />
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

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={onGetStarted}
                            className="relative px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium text-white bg-gray-900 rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                        >
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-orange-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        <button
                            onClick={onLogin}
                            className="hidden md:block relative px-5 py-2 text-sm font-medium text-gray-900 bg-primary rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 cursor-pointer"
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
