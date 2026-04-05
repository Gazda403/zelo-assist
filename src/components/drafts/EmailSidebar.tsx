'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideInbox, LucideAlertCircle } from 'lucide-react';

interface Email {
    id: string;
    subject: string;
    sender: { name: string; email: string };
    snippet: string;
    date: string;
    read: boolean;
    urgencyScore?: number;
}

interface EmailSidebarProps {
    emails: Email[];
    selectedEmailId: string | null;
    onSelectEmail: (id: string) => void;
    onMouseEnter?: (id: string) => void;
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isLoadingMore?: boolean;
}

export default function EmailSidebar({ emails, selectedEmailId, onSelectEmail, onMouseEnter, onLoadMore, hasNextPage, isLoadingMore }: EmailSidebarProps) {
    return (
        <div id="tour-draft-list" className="h-full flex flex-col bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-r border-violet-100/50 dark:border-white/5">
            <div className="p-4 border-b border-violet-100/50 dark:border-white/5">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <LucideInbox className="w-5 h-5 text-violet-600" />
                    Latest Emails
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    {emails.length} emails found
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {emails.map((email) => (
                    <motion.div
                        key={email.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, x: 4, transition: { type: "spring", stiffness: 300 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectEmail(email.id)}
                        onMouseEnter={() => onMouseEnter?.(email.id)}
                        className={cn(
                            "cursor-pointer p-4 rounded-xl transition-all duration-300 relative group overflow-hidden",
                            selectedEmailId === email.id
                                ? "bg-white dark:bg-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] ring-2 ring-violet-500/20 border border-transparent dark:ring-violet-400/30"
                                : "bg-white/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md hover:border-violet-100 dark:hover:border-violet-500/30"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn(
                                "font-medium text-sm truncate max-w-[70%]",
                                !email.read ? "text-gray-900 font-bold" : "text-gray-700"
                            )}>
                                {email.sender.name}
                            </span>
                            {email.urgencyScore && email.urgencyScore > 7 && (
                                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-red-100">
                                    <LucideAlertCircle className="w-3 h-3" />
                                    {email.urgencyScore}/10
                                </div>
                            )}
                        </div>

                        <h3 className={cn(
                            "text-sm mb-1 truncate",
                            !email.read ? "text-gray-900 font-semibold" : "text-gray-600"
                        )}>
                            {email.subject}
                        </h3>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {email.snippet}
                        </p>
                    </motion.div>
                ))}
                
                {hasNextPage && onLoadMore && (
                    <div className="py-4 flex justify-center">
                        <button
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                            className="text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
