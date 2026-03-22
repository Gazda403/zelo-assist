"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inbox, FileEdit, Send, Trash2, Moon, Sun, Aperture, Bot, Bell, User, LogOut, Settings, Users, ChevronDown, CheckCircle2, Calendar, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionBanner";
import { useReminders } from "../providers/RemindersProvider";
import { Sidebar } from "./Sidebar";

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

    // Hide TopBar on Landing Page for unauthenticated users
    if (status !== "authenticated" && pathname === "/") {
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/50">
            {/* Subscription banner strip - only for authenticated users not on landing page */}
            {status === "authenticated" && pathname !== "/" && (
                <div className="container mx-auto px-4 pt-2">
                    <SubscriptionBanner />
                </div>
            )}
            <div className="mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 w-full">
                
                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search Area */}
                <div className="flex-1 max-w-2xl bg-secondary/30 rounded-2xl border border-transparent hover:border-accent/10 transition-colors">
                    <div className="p-2 text-xs text-muted-foreground ml-2">
                        Search workspace...
                    </div>
                </div>

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
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <p className="font-semibold text-sm truncate">{session?.user?.name || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                Switch Account
                                            </button>
                                            <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-lg transition-colors">
                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                                Settings
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

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                    />
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-80 bg-background z-[80] lg:hidden shadow-2xl"
                    >
                        <Sidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
}
