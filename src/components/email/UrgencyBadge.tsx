import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
    score: number;
    className?: string;
}

export function UrgencyBadge({ score, className }: UrgencyBadgeProps) {
    const getColor = (score: number) => {
        if (score >= 8) return "bg-destructive/20 text-destructive border-destructive/50";
        if (score >= 5) return "bg-amber-500/20 text-amber-400 border-amber-500/50";
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    };

    const getLabel = (score: number) => {
        if (score >= 8) return "URGENT";
        if (score >= 5) return "MEDIUM";
        return "LOW";
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wider",
                getColor(score),
                className
            )}
        >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {getLabel(score)} ({score}/10)
        </div>
    );
}
