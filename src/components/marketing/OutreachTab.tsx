'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Plus, 
    Mail, 
    Building2, 
    ExternalLink, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { 
    getOutreachLeadsAction, 
    addOutreachLeadAction, 
    updateLeadStatusAction 
} from '@/app/actions/marketing';
import { toast } from 'sonner';

interface Lead {
    id: string;
    name: string;
    email: string;
    company: string | null;
    source: string | null;
    status: string;
    pitch_used: string | null;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    contacted: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    replied: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    converted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    bounced: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

export function OutreachTab() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddLead, setShowAddLead] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', email: '', company: '', source: 'Manual' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await getOutreachLeadsAction();
            setLeads(data as unknown as Lead[]);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLead.email) return;

        setIsSubmitting(true);
        try {
            const result = await addOutreachLeadAction(newLead);
            if (result.success) {
                toast.success('Lead added successfully');
                setNewLead({ name: '', email: '', company: '', source: 'Manual' });
                setShowAddLead(false);
                fetchLeads();
            } else {
                toast.error('Failed to add lead');
            }
        } catch (error) {
            toast.error('Error adding lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            const result = await updateLeadStatusAction(leadId, newStatus);
            if (result.success) {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: leads.length,
        contacted: leads.filter(l => l.status !== 'new').length,
        replied: leads.filter(l => l.status === 'replied').length,
        conversion: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-zinc-500' },
                    { label: 'Outreached', value: stats.contacted, icon: Mail, color: 'text-blue-500' },
                    { label: 'Responses', value: stats.replied, icon: ArrowUpRight, color: 'text-purple-500' },
                    { label: 'Conversion', value: `${stats.conversion}%`, icon: CheckCircle2, color: 'text-emerald-500' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                        type="text"
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                </div>

                <button 
                    onClick={() => setShowAddLead(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add New Lead
                </button>
            </div>

            {/* Leads Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lead</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Company</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                                <span className="text-xs text-zinc-500 font-medium tracking-widest">LOADING LEADS...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <p className="text-sm text-zinc-500 font-medium">No leads found. Start your outreach campaign!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <motion.tr 
                                            key={lead.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                        {lead.name ? lead.name[0] : lead.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{lead.name || 'Anonymous'}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3 h-3 text-zinc-400" />
                                                            <span className="text-[11px] text-zinc-500 font-medium">{lead.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{lead.company || '--'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border-none focus:ring-1 focus:ring-orange-500/30 rounded-none cursor-pointer appearance-none ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="replied">Replied</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="bounced">Bounced</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a 
                                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-zinc-400 hover:text-orange-500 transition-colors"
                                                        title="Compose Email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <button className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Lead Modal */}
            <AnimatePresence>
                {showAddLead && (
                    <div className="fixed inset-0 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mb-6">Append Outreach Lead</h3>
                            <form onSubmit={handleAddLead} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Full Name</label>
                                    <input 
                                        type="text"
                                        value={newLead.name}
                                        onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. John Smith"
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Address *</label>
                                    <input 
                                        type="email"
                                        required
                                        value={newLead.email}
                                        onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="john@company.com"
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Company</label>
                                    <input 
                                        type="text"
                                        value={newLead.company}
                                        onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                                        placeholder="Company Name"
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddLead(false)}
                                        className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Confirm Lead'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
