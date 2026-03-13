"use client";
import { Inbox, FileEdit, Send, Bot, Trash2, Aperture, Bell, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function TopBar() {
    const pathname = usePathname();
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Aperture className="w-5 h-5" />
                    <span className="font-bold">Zelo Assist</span>
                </div>
                <nav className="flex gap-4">
                    <Link href="/">Inbox</Link>
                    <Link href="/bots">Bots</Link>
                </nav>
            </div>
        </header>
    );
}
