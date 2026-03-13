"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Mail, Calendar, User, Cpu } from "lucide-react";
import { searchEmailsAction } from "@/app/actions/gmail";
import { searchBotsAction } from "@/app/actions/bots";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface AppHeaderProps {
    title?: string;
    onSelectEmail?: (id: string) => void;
}

export function AppHeader({ title = "Inbox", onSelectEmail }: AppHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    const isBotSearch = title === "Bots";

    // Close search dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) { // Faster search for bots
                setIsSearching(true);
                setShowResults(true);
                try {
                    let data;
                    if (isBotSearch) {
                        data = await searchBotsAction(searchQuery);
                    } else {
                        data = await searchEmailsAction(searchQuery);
                    }
                    setResults(data || []);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, isBotSearch]);

    const handleSelect = (id: string) => {
        if (onSelectEmail) {
            onSelectEmail(id);
        }
        setShowResults(false);
        setSearchQuery("");
    };

    return (
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Left side - Title */}
            <div className="flex items-center gap-6">
                <h2 className="text-xl font-serif font-bold text-foreground">{title}</h2>
            </div>

            {/* Right Side - Search & Notifications */}
            <div className="flex items-center gap-4 w-full justify-end">
                {/* Search Area */}
                <div className="max-w-md w-full relative" ref={searchDropdownRef}>
                    <div className="relative group w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 text-accent animate-spin" />
                            ) : (
                                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length > (isBotSearch ? 0 : 2) && setShowResults(true)}
                            placeholder={isBotSearch ? `Search bots by name...` : `Search in ${title.toLowerCase()}... (sender, subject, keyword)`}
                            className="bg-secondary/50 border border-transparent focus:border-accent/50 rounded-full py-2 pl-10 pr-4 text-sm w-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-sans"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showResults && (results.length > 0 || isSearching) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[60] max-h-[400px] flex flex-col origin-top-right"
                            >
                                <div className="p-2 overflow-y-auto">
                                    {isSearching && results.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            Searching...
                                        </div>
                                    ) : results.length > 0 ? (
                                        results.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item.id)}
                                                className="w-full text-left p-3 hover:bg-accent/5 rounded-xl transition-colors flex items-start gap-3 group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                                    {isBotSearch ? <Cpu className="w-4 h-4 text-accent" /> : <Mail className="w-4 h-4 text-accent" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <span className="font-semibold text-sm truncate">{isBotSearch ? item.name : item.sender.name}</span>
                                                        {!isBotSearch && (
                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground truncate">{isBotSearch ? item.description : item.subject}</p>
                                                    {!isBotSearch && <p className="text-xs text-muted-foreground truncate opacity-70">{item.snippet}</p>}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No {isBotSearch ? 'bots' : 'emails'} found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
