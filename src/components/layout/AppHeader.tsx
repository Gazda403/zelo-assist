"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Mail, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppHeader({ title = "Inbox", onSelectEmail }: any) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    return (
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
            <h2 className="text-xl font-serif font-bold text-foreground">{title}</h2>
            <div className="flex items-center gap-4 w-full justify-end">
                <div className="max-w-md w-full relative">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search...`} className="bg-secondary/50 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm w-full" />
                </div>
            </div>
        </header>
    );
}
