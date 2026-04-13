"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Sun, Moon, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavbarProps {
    onGetStarted: () => void;
    onLogin: () => void;
    variant?: 'full' | 'minimal';
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted, onLogin, variant = 'full' }) => {
    const [activeSection, setActiveSection] = useState<string>('');
    const [isDark, setIsDark] = useState(false);
    const { data: session, status } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize theme
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);

        if (variant === 'full') {
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
        }
    }, [variant]);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            setIsDark(true);
            localStorage.setItem("theme", "dark");
        }
    };

    const handleLoginClick = () => {
        const isFromLanding = typeof document !== 'undefined' && 
                             document.referrer.includes(window.location.origin) && 
                             !document.referrer.includes('/blog');
        
        if (isFromLanding || variant === 'full') {
            onLogin();
        } else {
            signIn('google');
        }
    };

    const navLinks = [
        { name: 'Features', href: '#features', id: 'features' },
        { name: 'Pricing', href: '#pricing', id: 'pricing' },
        { name: 'Testimonials', href: '#testimonials', id: 'testimonials' },
        { name: 'Blog', href: '/blog', id: 'blog' },
    ];

    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : session?.user?.email?.slice(0, 2).toUpperCase() || "U";

    return (
        <>
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <nav className="pointer-events-auto h-12 md:h-14 px-4 md:px-8 flex items-center justify-between gap-4 bg-white/45 dark:bg-zinc-900/45 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] w-full max-w-4xl mx-auto transition-all duration-300 hover:bg-white/55 dark:hover:bg-zinc-900/55 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
                    <Link href="/" className="flex items-center group shrink-0">
                        <div className="h-7 md:h-9 w-auto overflow-hidden rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                            <img src="/logo.png" alt="XeloFlow logo" className="h-full w-auto object-contain" />
                        </div>
                    </Link>

                    {variant === 'full' && (
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className={cn(
                                        "transition-all duration-300 text-sm font-medium",
                                        activeSection === link.id
                                            ? "text-primary scale-110"
                                            : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:scale-105"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 md:gap-3">
                        {variant === 'minimal' && (
                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors border border-white/20"
                                title={isDark ? "Light Mode" : "Dark Mode"}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isDark ? 'dark' : 'light'}
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        )}

                        {variant === 'full' && (
                            <button
                                onClick={onGetStarted}
                                className="hidden sm:flex relative px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-md whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-orange-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        )}

                        {status === 'authenticated' ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-1.5 p-1 rounded-full bg-white/50 dark:bg-white/10 border border-white/20 hover:border-primary/30 transition-all group"
                                >
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-inner overflow-hidden">
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                        ) : userInitials}
                                    </div>
                                    <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showUserMenu && "rotate-180")} />
                                </button>
                                
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60]"
                                        >
                                            <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Account</p>
                                                <p className="text-sm font-semibold truncate dark:text-white mt-1">{session.user?.name || 'User'}</p>
                                            </div>
                                            <div className="p-1">
                                                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <button 
                                                    onClick={() => signOut({ callbackUrl: '/' })}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Log Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="relative px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-gray-900 bg-primary rounded-full overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer whitespace-nowrap flex-shrink-0"
                            >
                                <span className="relative z-10">Log In</span>
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
