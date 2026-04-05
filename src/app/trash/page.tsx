'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { EmailDetailPanel } from '@/components/email/EmailDetailPanel';
import { EmailCard } from '@/components/email/EmailCard';
import { EmailListSkeleton } from '@/components/email/EmailCardSkeleton';
import { fetchEmailBodyAction, fetchTrashEmailsAction } from '@/app/actions/gmail';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TrashPage() {
    const [emails, setEmails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const router = useRouter();

    // Performance Caching
    const bodyCache = useRef<Record<string, string>>({});
    const [currentBody, setCurrentBody] = useState<string>('');
    const [bodyLoading, setBodyLoading] = useState(false);

    const prefetchEmailBody = useCallback(async (id: string) => {
        if (bodyCache.current[id]) return;
        try {
            const body = await fetchEmailBodyAction(id);
            if (body) bodyCache.current[id] = body;
        } catch (err) { /* ignore */ }
    }, []);

    const handleEmailSelect = useCallback(async (id: string) => {
        setSelectedEmailId(id);
        if (bodyCache.current[id]) {
            setCurrentBody(bodyCache.current[id]);
            setBodyLoading(false);
        } else {
            setBodyLoading(true);
            setCurrentBody('');
            try {
                const body = await fetchEmailBodyAction(id);
                if (body) {
                    bodyCache.current[id] = body;
                    setCurrentBody(body);
                }
            } catch (err) {
                toast.error("Failed to load email content");
            } finally {
                setBodyLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        async function loadTrash() {
            try {
                const result = await fetchTrashEmailsAction();
                if (result && result.emails) {
                    setEmails(result.emails);
                }
            } catch (error) {
                console.error("Failed to load trash emails:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadTrash();
    }, []);

    const selectedEmail = selectedEmailId ? emails.find(e => e.id === selectedEmailId) : null;

    return (
        <AppShell title="Trash" onSelectEmail={setSelectedEmailId}>
            <div className="flex gap-6 h-full">
                {/* Left Column: Email List */}
                <div className={`space-y-6 transition-all duration-300 ${selectedEmailId ? 'w-1/2' : 'w-full'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Deleted Items</h2>
                                <p className="text-sm text-gray-500">Items that have been moved to the trash.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        {isLoading && emails.length === 0 ? (
                            <EmailListSkeleton count={6} />
                        ) : emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Trash2 className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium text-gray-600 dark:text-gray-300">Trash is empty</p>
                                <p className="text-sm mt-1">No deleted messages found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {emails.map((email, index) => (
                                    <motion.div
                                        key={email.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-2"
                                    >
                                        <EmailCard
                                            email={{ ...email, read: true }} // Trash items are usually read
                                            onClick={handleEmailSelect}
                                            onMouseEnter={prefetchEmailBody}
                                            isSelected={selectedEmailId === email.id}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Email Detail */}
                {selectedEmailId && selectedEmail && (
                    <div className="w-1/2 h-full">
                        <EmailDetailPanel
                            emailId={selectedEmail.id}
                            sender={selectedEmail.sender}
                            subject={selectedEmail.subject}
                            date={selectedEmail.date}
                            snippet={selectedEmail.snippet}
                            initialBody={currentBody}
                            loadingBody={bodyLoading}
                            onClose={() => setSelectedEmailId(null)}
                        />
                    </div>
                )}
            </div>
        </AppShell>
    );
}
