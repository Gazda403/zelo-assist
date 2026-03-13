import { cn } from "@/lib/utils";
export function UrgencyBadge({ score, className }: any) {
    const getColor = (s: number) => {
        if (s >= 8) return "bg-red-500/20 text-red-500 border-red-500/50";
        if (s >= 5) return "bg-amber-500/20 text-amber-500 border-amber-500/50";
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/50";
    };
    return (
        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black", getColor(score), className)}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {score}/10 URGENCY
        </div>
    );
}
