import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Clock, Mail, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MonitoredThread } from "@/lib/bots/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { getMonitoredThreadsAction, addMonitoredThreadAction, deleteMonitoredThreadAction } from "@/app/actions/follow-up";

interface BotFollowUpListProps {
    botId: string;
}

export function BotFollowUpList({ botId }: BotFollowUpListProps) {
    const [threads, setThreads] = useState<MonitoredThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const loadThreads = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMonitoredThreadsAction(botId);
            setThreads(data);
        } catch (error) {
            console.error("Failed to load threads:", error);
            toast.error("Failed to load monitored threads");
        } finally {
            setIsLoading(false);
        }
    }, [botId]);

    useEffect(() => {
        loadThreads();
    }, [loadThreads]);

    const handleAddThread = async () => {
        // For MVP, we'll just ask for a Thread ID and Recipient (Manual Entry)
        // In production, this would be a sophisticated picker
        const threadId = window.prompt("Enter Gmail Thread ID (e.g., from URL):");
        if (!threadId) return;

        const recipient = window.prompt("Enter Recipient Email:");
        if (!recipient) return;

        const subject = window.prompt("Enter Subject (Optional):") || "Manual Entry";

        setIsAdding(true);
        try {
            // New signature: botId, { threadId, subject, recipient }
            await addMonitoredThreadAction(botId, {
                threadId,
                recipient,
                subject
            });

            toast.success('Thread added to monitoring');
            loadThreads();
        } catch (err) {
            console.error(err);
            toast.error('Failed to add thread');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveThread = async (id: string) => {
        try {
            await deleteMonitoredThreadAction(id);
            setThreads(threads.filter(t => t.id !== id));
            toast.success("Stopped monitoring thread");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete thread");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h3 className="font-semibold text-lg">Monitored Threads</h3>
                    <p className="text-sm text-gray-500">
                        The bot watches these threads and sends follow-ups if no reply.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadThreads}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleAddThread}
                        disabled={isAdding}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Thread</span>
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading && threads.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">Loading threads...</div>
                ) : (
                    <AnimatePresence>
                        {threads.map((thread) => (
                            <motion.div
                                key={thread.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${thread.status === 'sent' ? 'bg-green-100 text-green-600' :
                                        thread.status === 'failed' ? 'bg-red-100 text-red-600' :
                                            thread.status === 'replied' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 border-b border-dashed border-transparent hover:border-gray-300 inline-block transition-colors" title={thread.thread_id}>
                                            {thread.subject}
                                        </h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {thread.recipient}
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                {thread.status === 'pending' ? (
                                                    <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-medium">
                                                        Due: {format(new Date(thread.scheduled_for), "MMM d, h:mm a")}
                                                    </span>
                                                ) : thread.status === 'replied' ? (
                                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Replied
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Sent
                                                    </span>
                                                )}
                                            </div>
                                            {thread.attempts > 0 && (
                                                <span className="text-xs text-gray-400">
                                                    • {thread.attempts} {thread.attempts === 1 ? 'attempt' : 'attempts'}
                                                </span>
                                            )}
                                            {thread.metadata?.original_snippet && (
                                                <span className="text-xs text-gray-400 italic truncate max-w-[200px]" title={thread.metadata.original_snippet}>
                                                    • "{thread.metadata.original_snippet}"
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveThread(thread.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Stop Monitoring"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!isLoading && threads.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No threads currently monitored</p>
                        <p className="text-sm text-gray-400">Add a thread to start automating follow-ups</p>
                    </div>
                )}
            </div>
        </div >
    );
}
