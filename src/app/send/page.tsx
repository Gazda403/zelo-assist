'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { EmailComposer } from '@/components/send/EmailComposer';
import { SequencingComposer } from '@/components/send/SequencingComposer';
import { ReminderSidebar } from '@/components/send/ReminderSidebar';
import { SentHistory } from '@/components/send/SentHistory';
import { AppShell } from '@/components/layout/AppShell';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Inner component uses useSearchParams — must be inside <Suspense>
function SendPageContent() {
    const searchParams = useSearchParams();
    const initialTo = searchParams.get('to') || '';
    const [view, setView] = useState<'normal' | 'sequencing'>('normal');

    return (
        <AppShell title="Send">
            <div className="min-h-screen flex flex-col md:flex-row gap-6 p-6 bg-slate-50/30 dark:bg-zinc-900">
                {/* Main Composer Area - Left */}
                <div className="flex-[2] flex flex-col min-w-0">
                    <div className="flex items-center justify-center mb-10">
                        <div className="flex items-center p-2 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setView('normal')}
                                className={`px-10 py-3.5 rounded-full text-base font-bold transition-all duration-300 ${view === 'normal' ? 'bg-orange-500 text-white shadow-orange-500/25 shadow-xl' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Normal Send
                            </button>
                            <button 
                                onClick={() => setView('sequencing')}
                                className={`px-10 py-3.5 rounded-full text-base font-bold transition-all duration-300 ${view === 'sequencing' ? 'bg-orange-500 text-white shadow-orange-500/25 shadow-xl' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                Sequencing
                            </button>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={view}
                        className="flex flex-col"
                    >
                        {view === 'normal' ? (
                            <EmailComposer initialTo={initialTo} />
                        ) : (
                            <SequencingComposer />
                        )}
                    </motion.div>
                </div>

                {/* Sidebars - Right */}
                <div className="flex-1 flex flex-col gap-6 min-w-[320px]">
                    {/* Top Right: Reminders */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm"
                    >
                        <ReminderSidebar />
                    </motion.div>

                    {/* Bottom Right: Sent History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="shadow-sm"
                    >
                        <SentHistory />
                    </motion.div>
                </div>
            </div>
        </AppShell>
    );
}

// Default export wraps the content in Suspense (required by Next.js for useSearchParams)
export default function SendPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
            </div>
        }>
            <SendPageContent />
        </Suspense>
    );
}
