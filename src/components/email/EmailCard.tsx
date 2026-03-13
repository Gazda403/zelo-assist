"use client";
import { motion } from "framer-motion";
import { Mail, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

export function EmailCard({ email, onClick, isSelected }: any) {
    const timeDisplay = format(new Date(email.date), 'MMM d');
    return (
        <div onClick={onClick} className={cn("p-4 rounded-2xl cursor-pointer border flex gap-4 items-start", isSelected ? "bg-orange-50 border-primary" : "bg-white border-gray-100")}>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                    <h3 className="text-sm font-bold truncate">{email.sender.name}</h3>
                    <span className="text-xs text-gray-400">{timeDisplay}</span>
                </div>
                <h4 className="text-[15px] font-bold mb-2 truncate">{email.subject}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{email.snippet}</p>
            </div>
        </div>
    );
}
