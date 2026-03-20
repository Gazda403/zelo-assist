/**
 * Bot Execution Log Component
 * Displays execution history for a bot
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { getBotExecutionLogsAction } from '@/app/actions/bots';
import type { BotExecutionLog as LogType } from '@/lib/bots/types';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '../shared/EmptyState';

interface BotExecutionLogProps {
    botId: string;
}

export function BotExecutionLog({ botId }: BotExecutionLogProps) {
    const [logs, setLogs] = useState<LogType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, [botId]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await getBotExecutionLogsAction(botId, 50);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <EmptyState
                icon={Activity}
                title="No execution logs yet"
                description="This bot hasn't been triggered. Once it runs, execution history will appear here."
            />
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log, index) => (
                <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white rounded-xl border border-gray-200"
                >
                    <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {log.status === 'success' && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                            {log.status === 'failure' && (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            {log.status === 'safety_blocked' && (
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                            )}
                        </div>

                        {/* Log Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">
                                    {log.status === 'success' && 'Executed Successfully'}
                                    {log.status === 'failure' && 'Execution Failed'}
                                    {log.status === 'safety_blocked' && 'Blocked by Safety'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(log.triggeredAt), { addSuffix: true })}
                                </span>
                            </div>

                            {log.metadata?.senderEmail && (
                                <div className="text-sm text-gray-600 mb-1">
                                    From: {log.metadata.senderEmail}
                                </div>
                            )}

                            {log.metadata?.subject && (
                                <div className="text-sm text-gray-600 mb-2 truncate">
                                    Subject: {log.metadata.subject}
                                </div>
                            )}

                            {log.actionsExecuted.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {log.actionsExecuted.map((action, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded"
                                        >
                                            {action}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {log.errorMessage && (
                                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mt-2">
                                    {log.errorMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
