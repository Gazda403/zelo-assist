"use client";

import { memo } from "react";

import { motion } from "framer-motion";
import { Mail, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface EmailCardProps {
    email: {
        id: string;
        sender: { name: string; email: string };
        subject: string;
        snippet: string;
        date: string;
        read: boolean;
        urgencyScore: number;
        urgencyReason: string;
        aiConfidence?: 'low' | 'medium' | 'high';
    };
    onClick: (id: string) => void;
    onMouseEnter?: (id: string) => void;
    isSelected?: boolean;
}

function getCleanName(name: string) {
    // Remove quotes, brackets, and leading/trailing whitespace
    return name?.replace(/['"<>[\]]/g, '').trim() || "Unknown";
}

function getInitials(name: string) {
    const clean = getCleanName(name);
    return clean
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || "?";
}

function getAvatarColor(name: string) {
    const colors = [
        "bg-red-100 text-red-600",
        "bg-orange-100 text-orange-600",
        "bg-amber-100 text-amber-600",
        "bg-green-100 text-green-600",
        "bg-emerald-100 text-emerald-600",
        "bg-teal-100 text-teal-600",
        "bg-cyan-100 text-cyan-600",
        "bg-blue-100 text-blue-600",
        "bg-indigo-100 text-indigo-600",
        "bg-violet-100 text-violet-600",
        "bg-purple-100 text-purple-600",
        "bg-fuchsia-100 text-fuchsia-600",
        "bg-pink-100 text-pink-600",
        "bg-rose-100 text-rose-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function formatEmailDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Unknown date";
    if (isToday(date)) {
        return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return format(date, 'MMM d');
}

function getServiceBrand(email: string, name: string) {
    const lowerEmail = email.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerEmail.includes("paypal") || lowerName.includes("paypal")) {
        return { name: "PayPal", color: "bg-blue-600", text: "text-white", icon: "P" };
    }
    if (lowerEmail.includes("supabase") || lowerName.includes("supabase")) {
        return { name: "Supabase", color: "bg-[#3ECF8E]", text: "text-black", icon: "S" };
    }
    if (lowerEmail.includes("kucoin") || lowerName.includes("kucoin")) {
        return { name: "KuCoin", color: "bg-[#23AF91]", text: "text-white", icon: "K" };
    }
    if (lowerEmail.includes("spotify") || lowerName.includes("spotify")) {
        return { name: "Spotify", color: "bg-[#1DB954]", text: "text-black", icon: "S" };
    }
    if (lowerEmail.includes("google") || lowerEmail.includes("gmail")) {
        return { name: "Google", color: "bg-red-500", text: "text-white", icon: "G" };
    }
    if (lowerEmail.includes("github")) {
        return { name: "GitHub", color: "bg-gray-900 dark:bg-zinc-100", text: "text-white dark:text-black", icon: "GH" };
    }
    return null;
}

export const EmailCard = memo(function EmailCard({ email, onClick, onMouseEnter, isSelected }: EmailCardProps) {
    const cleanName = getCleanName(email.sender.name || email.sender.email);
    const initials = getInitials(cleanName);
    const avatarColor = getAvatarColor(cleanName);
    const brand = getServiceBrand(email.sender.email, email.sender.name);
    const timeDisplay = formatEmailDate(email.date);

    // Determine badge style based on score
    const getBadgeStyle = (score: number) => {
        if (score >= 9) return "bg-red-50 text-red-700 border-red-200";
        if (score >= 7) return "bg-orange-50 text-orange-700 border-orange-200";
        if (score >= 4) return "bg-blue-50 text-blue-700 border-blue-200";
        return "bg-slate-50 text-slate-600 border-slate-200";
    };

    return (
        <motion.div
            layoutId={`email-card-${email.id}`}
            onClick={() => onClick(email.id)}
            onMouseEnter={() => onMouseEnter?.(email.id)}
            className={cn(
                "p-4 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group border flex gap-4 items-start select-none",
                isSelected
                    ? "bg-orange-50/60 dark:bg-zinc-800/80 backdrop-blur-md border-primary/20 dark:border-primary/40 shadow-md ring-1 ring-primary/20 dark:ring-primary/40"
                    : "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border-white/60 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:bg-white/90 dark:hover:bg-zinc-800/80",
                email.read ? "opacity-80 hover:opacity-100" : ""
            )}
        >
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
                {brand ? (
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black shadow-sm border border-black/5 dark:border-white/10 text-sm",
                        brand.color,
                        brand.text
                    )}>
                        {brand.icon}
                    </div>
                ) : (
                    <div className={cn(
                        "w-10 h-10 rounded-full bg-gradient-to-tr from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 dark:border-white/10 flex items-center justify-center font-bold text-accent shadow-sm overflow-hidden text-sm",
                        avatarColor
                    )}>
                        {initials}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
                {/* Header: Sender & Time */}
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn(
                        "text-sm truncate pr-2",
                        email.read ? "font-semibold text-gray-900 dark:text-white" : "font-bold text-gray-900 dark:text-white"
                    )}>
                        {cleanName}
                    </h3>
                    <span className={cn(
                        "text-xs whitespace-nowrap flex-shrink-0",
                        email.read ? "text-gray-400" : "text-violet-600 font-medium"
                    )}>
                        {timeDisplay}
                    </span>
                </div>

                {/* Subject */}
                <h4 className={cn(
                    "text-[15px] leading-snug mb-2 truncate",
                    email.read ? "font-medium text-gray-700" : "font-bold text-gray-900"
                )}>
                    {email.subject}
                </h4>

                {/* Badge Row (if high urgency) */}
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border",
                        getBadgeStyle(email.urgencyScore)
                    )}>
                        {email.urgencyScore >= 8 ? 'Urgent' : email.urgencyScore >= 5 ? 'Priority' : 'Normal'} • {email.urgencyScore}
                    </span>

                    {/* Optional: Add custom reason badge if exists */}
                    {email.urgencyReason && email.urgencyReason !== "Pending Analysis" && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {email.urgencyReason}
                        </span>
                    )}
                </div>

                {/* Snippet */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {email.snippet}
                </p>
            </div>

            {/* Unread Indicator Dot (absolute positioning for clean layout) */}
            {!email.read && (
                <div className="absolute top-5 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,127,17,0.5)] ring-2 ring-white" />
            )}
        </motion.div>
    );
});
