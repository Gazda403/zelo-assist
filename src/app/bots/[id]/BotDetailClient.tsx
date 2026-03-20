'use client';

import { useRouter } from 'next/navigation';
import { BotDetailView } from '@/components/bots/BotDetailView';
import type { EmailBot } from '@/lib/bots/types';
import { toast } from 'sonner';

interface BotDetailClientProps {
    bot: EmailBot;
}

export function BotDetailClient({ bot }: BotDetailClientProps) {
    const router = useRouter();

    const handleBotUpdated = (updatedBot: EmailBot) => {
        router.refresh();
        toast.success('Bot updated');
    };

    const handleBotDeleted = (botId: string) => {
        toast.success('Bot deleted');
        router.push('/bots');
        router.refresh();
    };

    return (
        <BotDetailView
            bot={bot}
            onBotUpdated={handleBotUpdated}
            onBotDeleted={handleBotDeleted}
        />
    );
}
