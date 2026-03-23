import { AppHeader } from "./AppHeader";
import { AIChatbot } from "../chat/AIChatbot";
import { SubscriptionBanner } from "../dashboard/SubscriptionBanner";

export function AppShell({
    children,
    showAppHeader = true,
    title,
    onSelectEmail
}: {
    children: React.ReactNode,
    showAppHeader?: boolean,
    title?: string,
    onSelectEmail?: (id: string) => void
}) {
    return (
        <div className="flex-1 flex flex-col relative min-h-0">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-0">
                {showAppHeader && (
                    <AppHeader
                        title={title}
                        onSelectEmail={onSelectEmail}
                    />
                )}
                <main className="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-hide">
                    <div className="max-w-[1600px] mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* AI Chatbot */}
            <AIChatbot />

            {/* Floating Subscription Status */}
            <SubscriptionBanner />
        </div>
    );
}
