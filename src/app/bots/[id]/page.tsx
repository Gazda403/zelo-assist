import { getBotByIdAction } from '@/app/actions/bots';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BotDetailClient } from './BotDetailClient';

export default async function BotDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let bot;
    try {
        bot = await getBotByIdAction(id);
    } catch (e) {
        console.error('Failed to fetch bot:', e);
        // If unauthorized, middleware should have caught it, but double check
    }

    if (!bot) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <Link href="/bots" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 w-fit transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Bots
            </Link>

            <BotDetailClient bot={bot} />
        </div>
    );
}
