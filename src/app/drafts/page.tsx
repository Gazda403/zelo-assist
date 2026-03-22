'use client';

import { useState, useEffect, Suspense } from 'react';
import { fetchEmailsAction } from '@/app/actions/gmail';
import EmailSidebar from '@/components/drafts/EmailSidebar';
import DraftWorkspace from '@/components/drafts/DraftWorkspace';
import StatsSidebar from '@/components/drafts/StatsSidebar';
import { AppShell } from '@/components/layout/AppShell';
import { useSearchParams } from 'next/navigation';

interface Email {
    id: string;
    subject: string;
    sender: { name: string; email: string };
    snippet: string;
    date: string;
    read: boolean;
    urgencyScore?: number;
}

// Inner component uses useSearchParams — must be inside <Suspense>
function DraftsPageContent() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        async function loadEmails() {
            try {
                const fetchedEmails = await fetchEmailsAction();
                if (fetchedEmails && fetchedEmails.emails) {
                    setEmails(fetchedEmails.emails as any);
                } else {
                    setEmails([]);
                }
            } catch (error) {
                console.error("Failed to load emails:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadEmails();
    }, []);

    // Set selected email from URL parameter
    useEffect(() => {
        const emailId = searchParams.get('emailId');
        if (emailId) {
            setSelectedEmailId(emailId);
        }
    }, [searchParams]);

    const selectedEmail = emails.find(e => e.id === selectedEmailId) || null;

    return (
        <AppShell
            title="Drafts"
            onSelectEmail={setSelectedEmailId}
        >
            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50 dark:bg-zinc-950/50">

                {/* Left Sidebar: Email List — hidden on mobile when email is selected */}
                <div className={`lg:w-1/4 lg:min-w-[300px] h-full ${selectedEmailId ? 'hidden lg:block' : 'block w-full'}`}>
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                        </div>
                    ) : (
                        <EmailSidebar
                            emails={emails}
                            selectedEmailId={selectedEmailId}
                            onSelectEmail={setSelectedEmailId}
                        />
                    )}
                </div>

                {/* Center: Draft Workspace — full width on mobile when email selected */}
                <div className={`lg:w-1/2 h-full border-r border-violet-100 relative ${selectedEmailId ? 'block w-full' : 'hidden lg:block'}`}>
                    {/* Mobile back button */}
                    {selectedEmailId && (
                        <button
                            onClick={() => setSelectedEmailId(null)}
                            className="lg:hidden flex items-center gap-2 p-3 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-100 w-full"
                        >
                            ← Back to emails
                        </button>
                    )}
                    <DraftWorkspace selectedEmail={selectedEmail} />
                </div>

                {/* Right Sidebar: Stats — hidden on mobile */}
                <div className="hidden lg:block lg:w-1/4 lg:min-w-[300px] h-full">
                    <StatsSidebar emails={emails} />
                </div>

            </div>
        </AppShell>
    );
}

// Default export wraps the content in Suspense (required by Next.js for useSearchParams)
export default function DraftsPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
            </div>
        }>
            <DraftsPageContent />
        </Suspense>
    );
}
