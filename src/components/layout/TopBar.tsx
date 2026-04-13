"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inbox, FileEdit, Send, Trash2, Moon, Sun, Aperture, Bot, Bell, User, LogOut, Settings, Users, ChevronDown, CheckCircle2, Calendar, PlayCircle, Download, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useReminders } from "../providers/RemindersProvider";
import { usePWA } from "../providers/PWAProvider";

const NAV_ITEMS = [
    { label: "Inbox", icon: Inbox, href: "/" },
    { label: "Drafts", icon: FileEdit, href: "/drafts" },
    { label: "Send", icon: Send, href: "/send" },
    { label: "Bots", icon: Bot, href: "/bots" },
    { label: "Trash", icon: Trash2, href: "/trash" },
];

export function TopBar() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const { data: session, status } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { reminders, toggleReminder, uncompletedCount } = useReminders();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const [imgError, setImgError] = useState(false);
    const { isInstallable, installApp } = usePWA();

    // Initialize theme based on document class or local storage
    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    // Close menus on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hide TopBar on blog pages unconditionally, and on the landing page for unauthenticated users
    if (pathname?.startsWith("/blog") || (status !== "authenticated" && pathname === "/")) {
        return null;
    }

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

    const userInitials = session?.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : session?.user?.email?.slice(0, 2).toUpperCase() || "GS";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/50">
            <div className="mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 max-w-7xl">
                {/* Logo Area */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-accent/20 bg-white p-0.5">
                        <img src="/icons/icon-512x512.png" alt="XeloFlow logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="hidden md:block text-left">
                        <h1 className="font-serif font-bold text-lg leading-none">XeloFlow</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Gmail Assistant</p>
                    </div>
                </div>

                {/* Navigation - Centered & Floating style */}
                <nav className="flex items-center gap-0.5 sm:gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative"
                                id={`tour-nav-${item.label.toLowerCase()}`}
                            >
                                <motion.div
                                    className={cn(
                                        "flex items-center justify-center h-9 sm:h-10 px-2 sm:px-3 rounded-full cursor-pointer transition-all duration-300 overflow-hidden",
                                        isActive
                                            ? "bg-accent/10 text-accent font-medium shadow-sm"
                                            : "hover:bg-accent/5 text-muted-foreground hover:text-foreground"
                                    )}
                                    // Make button expandable on hover to reveal text
                                    initial="collapsed"
                                    whileHover="expanded"
                                    animate={isActive ? "expanded" : "collapsed"}
                                    variants={{
                                        collapsed: { width: "auto" }, // Let it be auto but effectively just icon width + padding
                                        expanded: { width: "auto" }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            layout
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        >
                                            <item.icon className={cn("w-5 h-5", isActive && "fill-current opacity-20")} />
                                        </motion.div>

                                        <div className="hidden sm:block">
                                        <motion.span
                                            variants={{
                                                collapsed: { opacity: 0, width: 0 },
                                                expanded: { opacity: 1, width: "auto" }
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="whitespace-nowrap overflow-hidden text-sm block"
                                        >
                                            {item.label}
                                        </motion.span>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-full border-2 border-accent/20 pointer-events-none"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions / Theme Toggle */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                    {/* Notification Bell */}
                    <div className="relative hidden sm:block" ref={notificationsRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-full relative"
                        >
                            <Bell className="w-5 h-5" />
                            {uncompletedCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-background"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[60] flex flex-col origin-top-right"
                                >
                                    <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-accent" />
                                            Task Reminders
                                        </h3>
                                        {uncompletedCount > 0 && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                                {uncompletedCount} pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2">
                                        {reminders.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-muted-foreground">
                                                Great job! You have no tasks.
                                            </div>
                                        ) : (
                                            reminders.map((reminder) => (
                                                <div
                                                    key={reminder.id}
                                                    className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${reminder.completed ? 'opacity-50' : 'hover:bg-accent/5'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => toggleReminder(reminder.id)}
                                                        className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${reminder.completed
                                                            ? 'bg-accent border-accent text-primary-foreground'
                                                            : 'border-muted-foreground/50 hover:border-accent'
                                                            }`}
                                                    >
                                                        {reminder.completed && <CheckCircle2 className="w-3 h-3" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className={`text-sm font-medium leading-tight ${reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                            {reminder.text}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {reminder.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isDark ? "dark" : "light"}
                                initial={{ y: -20, opacity: 0, rotate: -90 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: 20, opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    {/* User Menu */}
                    {status === "authenticated" ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
                            >
                                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 shadow-sm overflow-hidden border border-border/50 flex items-center justify-center">
                                    {session?.user?.image && !imgError ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-accent flex items-center justify-center">
                                            {userInitials ? (
                                                <span className="text-[10px] font-bold text-accent-foreground">{userInitials}</span>
                                            ) : (
                                                <User className="w-4 h-4 text-accent-foreground/80" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-2 overflow-hidden">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-sm truncate">{session?.user?.name || "User"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full bg-gradient-to-tr from-accent/20 to-accent/10 border border-accent/20 flex-shrink-0">
                                                <span className="text-[10px] font-bold text-accent tracking-wider uppercase">Free Tier</span>
                                            </div>
                                        </div>
                                        <div className="p-1">
                                            <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                Switch Account
                                            </button>
                                            {isInstallable && (
                                                <button 
                                                    onClick={() => {
                                                        installApp();
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-accent font-bold hover:bg-accent/10 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Install XeloFlow
                                                </button>
                                            )}
                                            <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                                Settings
                                            </button>
                                            <Link href="/privacy-policy" className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                                Privacy Policy
                                            </Link>
                                            <Link href="/terms" className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                Terms of Service
                                            </Link>
                                            <button 
                                                onClick={async () => {
                                                    const { resetOnboardingAction } = await import("@/app/actions/onboarding");
                                                    await resetOnboardingAction();
                                                    sessionStorage.removeItem("tour_step");
                                                    localStorage.setItem("tour_force", "1");
                                                    window.location.reload();
                                                }}
                                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                                            >
                                                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                                                Restart Tour
                                            </button>
                                            <div className="h-px bg-border my-1" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
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
                            onClick={() => signIn("google")}
                            disabled={status === "loading"}
                            className="flex items-center gap-2 px-4 h-9 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all text-sm font-medium shadow-sm shadow-accent/10 active:scale-95 disabled:opacity-50"
                        >
                            {status === "loading" ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
