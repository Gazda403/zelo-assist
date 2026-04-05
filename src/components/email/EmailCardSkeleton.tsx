'use client';

import { motion } from 'framer-motion';

export function EmailCardSkeleton() {
    return (
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-100 dark:bg-zinc-800 rounded mb-3"></div>
            <div className="flex gap-2">
                <div className="h-5 w-12 bg-gray-50 dark:bg-zinc-800 rounded-full"></div>
                <div className="h-5 w-12 bg-gray-50 dark:bg-zinc-800 rounded-full"></div>
            </div>
        </div>
    );
}

export function EmailListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="flex flex-col h-full bg-[#FAFAF9] dark:bg-black">
            {Array.from({ length: count }).map((_, i) => (
                <EmailCardSkeleton key={i} />
            ))}
        </div>
    );
}
