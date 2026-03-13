'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    ChevronDown, 
    Sparkles, 
    Zap, 
    Shield, 
    Clock, 
    MessageSquare,
    Search,
    Type,
    ArrowRight
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    type: 'startup' | 'support' | 'sales' | 'personal';
    preview: string;
    icon: any;
    color: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'startup-founders',
        name: 'Founders Proxy',
        description: 'Elite screening for startup founders. Handles investors, cold sales, and hiring.',
        type: 'startup',
        preview: "Hi {{sender_name}}, thanks for reaching out. I'm handling {{bot_name}}'s inbound. Regarding your interest in {{subject}}...",
        icon: Zap,
        color: 'text-orange-500'
    },
    {
        id: 'ecommerce-support',
        name: 'E-commerce Hero',
        description: 'Automated order status, returns, and common product FAQs for Shopify stores.',
        type: 'support',
        preview: "Hello! I've checked your inquiry for {{subject}}. Your order {{order_id}} is currently in processing...",
        icon: Shield,
        color: 'text-blue-500'
    },
    {
        id: 'sales-follow-up',
        name: 'Persistence Expert',
        description: 'Gentle multi-step follow-ups that stop automatically when you get a reply.',
        type: 'sales',
        preview: "Hi {{sender_name}}, just following up on our thread regarding {{subject}}. Any updates on your side?",
        icon: Clock,
        color: 'text-emerald-500'
    },
    {
        id: 'acknowledgment-basic',
        name: 'Neural Guard',
        description: 'Simple "received and routing" acknowledgments for high-volume inboxes.',
        type: 'personal',
        preview: "Received your email: {{subject}}. Our system is routing this now. Expected response: < 24h.",
        icon: MessageSquare,
        color: 'text-fuchsia-500'
    }
];

interface TemplateSelectorProps {
    onSelect: (templateId: string) => void;
    selectedId?: string;
}

export function TemplateSelector({ onSelect, selectedId }: TemplateSelectorProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | Template['type']>('all');

    const filteredTemplates = TEMPLATES.filter(t => 
        (filter === 'all' || t.type === filter) &&
        (t.name.toLowerCase().includes(search.toLowerCase()) || 
         t.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 mt-4">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Neural Architect</p>
                    <h3 className="text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Select Logic Blueprint</h3>
                    <p className="text-sm font-medium text-zinc-500 max-w-md mt-2">Initialize your agent with a pre-conditioned cognitive framework tailored to your specific workflows.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search archetypes..."
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-11 pr-6 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {filteredTemplates.map((template) => {
                    const isSelected = selectedId === template.id;
                    const Icon = template.icon;
                    
                    return (
                        <motion.div
                            key={template.id}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(template.id)}
                            className={`group relative flex flex-col p-8 border cursor-pointer transition-all duration-300 ${
                                isSelected 
                                    ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-500 shadow-2xl' 
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            {/* Selected Badge */}
                            {isSelected && (
                                <div className="absolute top-0 right-0 py-2 px-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Check className="w-3 h-3" />
                                    Active Blueprint
                                </div>
                            )}

                            {/* Icon & Type */}
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 border group-hover:scale-110 transition-transform ${isSelected ? 'border-orange-500/30' : 'border-zinc-100 dark:border-zinc-800'}`}>
                                    <Icon className={`w-6 h-6 ${template.color}`} />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{template.type}</span>
                            </div>

                            {/* Info */}
                            <div className="space-y-4 mb-10 flex-grow">
                                <h4 className={`text-xl font-serif font-bold ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-800 dark:text-zinc-200'} group-hover:text-orange-500 transition-colors`}>
                                    {template.name}
                                </h4>
                                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                    {template.description}
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="bg-zinc-50 dark:bg-zinc-950/50 p-5 mt-auto border border-zinc-100 dark:border-zinc-800 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-orange-400" />
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Payload Preview</span>
                                </div>
                                <p className="text-[11px] font-mono leading-relaxed text-zinc-500 line-clamp-2">
                                    {template.preview}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Advanced Option */}
            <button
                onClick={() => onSelect('custom')}
                className="w-full py-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group hover:border-orange-500/30 transition-all"
            >
                <div className="flex items-center justify-center gap-4">
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Construct Custom Neural Matrix</span>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 rotate-180 transition-colors" />
                </div>
            </button>
        </div>
    );
}

