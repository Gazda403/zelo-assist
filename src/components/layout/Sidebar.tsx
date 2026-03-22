"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Inbox, FileEdit, Send, Bot, Trash2, 
    Aperture, Settings, LogOut, Moon, Sun,
    MessageCircle, Sparkles, ChevronRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { BotEntity } from "../dashboard/BotEntity";

const NAV_ITEMS = [
    { label: "Inbox", icon: Inbox, href: "/" },
    { label: "Drafts", icon: FileEdit, href: "/drafts" },
    { label: "Sent", icon: Send, href: "/send" },
    { label: "AI Bots", icon: Bot, href: "/bots" },
    { label: "Trash", icon: Trash2, href: "/trash" },
];

interface SidebarProps {
    mobile?: boolean;
    onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (onClose) {
            onClose(); // Close on route change
        }
    }, [pathname]);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const firstName = session?.user?.name?.split(' ')[0] || "there";

    return (
        <aside className={cn(
            "flex flex-col h-screen border-r border-border bg-card/50 backdrop-blur-xl sticky top-0 shrink-0 z-[60]",
            mobile ? "w-full" : "hidden lg:flex w-72"
        )}>
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground shadow-lg shadow-accent/20">
                        <Aperture className="w-5 h-5" />
                    </div>
                    <h1 className="font-serif font-bold text-xl tracking-tight">Zelo Assist</h1>
                </div>

                {mobile && (
                    <button 
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* AI Assistant Section (The Bot) */}
            <div className="px-4 mb-8">
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent border border-accent/20 overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                    
                    <div className="flex flex-col gap-4 relative z-10">
                        <BotEntity className="w-12 h-12" />
                        <div>
                            <h3 className="font-serif font-bold text-base mb-1">Hi {firstName}!</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                I've summarized your inbox. 3 emails need attention.
                            </p>
                        </div>
                        <button className="w-full py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px]">
                            <Sparkles className="w-3 h-3" />
                            Summarize Urgent
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Workspace</p>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 relative",
                                isActive 
                                    ? "bg-accent/10 text-accent shadow-sm" 
                                    : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                            )}>
                                <item.icon className={cn("w-5 h-5", isActive ? "text-accent" : "opacity-60 group-hover:opacity-100")} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                                    />
                                )}
                                <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity translate-x-1 group-hover:translate-x-0")} />
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 mt-auto space-y-2">
                <div className="bg-secondary/30 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground">
                            {session?.user?.name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{session?.user?.name || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Premium Plan</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => signOut()}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 rounded-xl transition-colors"
                        title="Log Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <button 
                        onClick={toggleTheme}
                        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <Link href="/settings" className="text-muted-foreground hover:text-foreground">
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
