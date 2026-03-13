'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Package, RefreshCw, Star, Users, ArrowUpRight, ShieldCheck, Mail, Zap } from 'lucide-react';
import type { EmailBot } from '@/lib/bots/types';
import { cn } from '@/lib/utils';
import { BotStatsChart } from './charts/BotStatsChart';
import { BotRecentActivity } from './BotRecentActivity';

interface EcommerceBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onNavigateToTab: (tab: string) => void;
}

export function EcommerceBotDashboard({ bot, onBotUpdated, onNavigateToTab }: EcommerceBotDashboardProps) {
    const stats = [
        { label: 'Returns Handled', value: '42', icon: Package, color: 'text-violet-600', bg: 'bg-violet-100' },
        { label: 'Order Queries', value: '1,284', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'CSAT Score', value: '4.8/5', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Human Saved', value: '24h', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Market Intelligence / Performance Overview */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-5 rounded-3xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                    >
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Stats Chart */}
                <div className="col-span-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-6 rounded-3xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-white">Store Performance</h3>
                            <p className="text-xs text-gray-500">Resolved vs Escalated Tickets</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-600" /> Resolved
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Refined
                            </span>
                        </div>
                    </div>
                    <div className="h-[240px]">
                        <BotStatsChart botId={bot.id} type="ecommerce" />
                    </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-violet-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ghost Mode</span>
                            </div>
                            <h4 className="text-xl font-bold mb-2">Auto-Replies {bot.safety.autoSendEnabled ? 'Active' : 'Paused'}</h4>
                            <p className="text-xs opacity-70 leading-relaxed mb-6">The bot is currently handling order status and return inquiries automatically.</p>
                            
                            <button 
                                onClick={() => onNavigateToTab('kb')}
                                className="w-full py-3 bg-white text-violet-600 font-black text-sm rounded-2xl hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Optimize Brain
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-6 rounded-3xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Integrations</h4>
                        <div className="space-y-3">
                            <IntegrationItem name="Shopify" icon={<ShoppingBag className="w-4 h-4" />} status="Connected" />
                            <IntegrationItem name="WooCommerce" icon={<ShoppingBag className="w-4 h-4" />} status="Optional" />
                            <IntegrationItem name="Stripe" icon={<Zap className="w-4 h-4" />} status="Connected" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-white">Recent Activity</h3>
                        <p className="text-xs text-gray-500">Live feed of store interactions</p>
                    </div>
                    <button 
                        onClick={() => onNavigateToTab('logs')}
                        className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                    >
                        View System Logs <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="p-2">
                    <BotRecentActivity botId={bot.id} limit={5} />
                </div>
            </div>
        </div>
    );
}

function IntegrationItem({ name, icon, status }: { name: string, icon: any, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-zinc-900 hover:border-violet-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-zinc-800 text-gray-500 rounded-xl">
                    {icon}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{name}</span>
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                status === "Connected" ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"
            )}>{status}</span>
        </div>
    );
}
