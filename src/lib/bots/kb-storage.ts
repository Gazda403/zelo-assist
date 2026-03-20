/**
 * Knowledge Base Storage Layer
 * Handles CRUD operations for bot knowledge base entries
 */

import { createAdminClient } from '@/lib/supabase/admin';

export interface KBEntry {
    id: string;
    bot_id: string;
    category: 'brand' | 'policy' | 'faq' | 'product';
    title: string;
    content: string;
    keywords: string[];
    enabled: boolean;
    usage_count: number;
    created_at: Date;
    updated_at: Date;
}

export type KBEntryInput = Omit<KBEntry, 'id' | 'created_at' | 'updated_at' | 'usage_count'>;

/**
 * Get all knowledge base entries for a bot
 */
export async function getBotKnowledgeBase(botId: string): Promise<KBEntry[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_knowledge_base')
        .select('*')
        .eq('bot_id', botId)
        .order('category')
        .order('title');

    if (error) {
        console.error('[KB] Error fetching knowledge base:', error);
        throw new Error(`Failed to fetch knowledge base: ${error.message}`);
    }

    return data || [];
}

/**
 * Get knowledge base entries by category
 */
export async function getKBByCategory(
    botId: string,
    category: KBEntry['category']
): Promise<KBEntry[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_knowledge_base')
        .select('*')
        .eq('bot_id', botId)
        .eq('category', category)
        .eq('enabled', true)
        .order('title');

    if (error) {
        console.error('[KB] Error fetching entries by category:', error);
        throw new Error(`Failed to fetch entries: ${error.message}`);
    }

    return data || [];
}

/**
 * Search knowledge base by keywords or content
 */
export async function searchKnowledgeBase(
    botId: string,
    query: string
): Promise<KBEntry[]> {
    const supabase = createAdminClient();

    const searchTerm = query.toLowerCase();

    const { data, error } = await supabase
        .from('bot_knowledge_base')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);

    if (error) {
        console.error('[KB] Error searching knowledge base:', error);
        throw new Error(`Failed to search knowledge base: ${error.message}`);
    }

    // Also filter by keywords array if any keywords match
    const filtered = (data || []).filter((entry) => {
        const keywordMatch = entry.keywords?.some((kw: string) =>
            kw.toLowerCase().includes(searchTerm)
        );
        return keywordMatch || true; // Already filtered by title/content in query
    });

    return filtered;
}

/**
 * Create a new knowledge base entry
 */
export async function createKBEntry(entry: KBEntryInput): Promise<KBEntry> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_knowledge_base')
        .insert(entry)
        .select()
        .single();

    if (error) {
        console.error('[KB] Error creating entry:', error);
        throw new Error(`Failed to create entry: ${error.message}`);
    }

    return data;
}

/**
 * Update a knowledge base entry
 */
export async function updateKBEntry(
    entryId: string,
    updates: Partial<KBEntryInput>
): Promise<KBEntry> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_knowledge_base')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

    if (error) {
        console.error('[KB] Error updating entry:', error);
        throw new Error(`Failed to update entry: ${error.message}`);
    }

    return data;
}

/**
 * Delete a knowledge base entry
 */
export async function deleteKBEntry(entryId: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('bot_knowledge_base')
        .delete()
        .eq('id', entryId);

    if (error) {
        console.error('[KB] Error deleting entry:', error);
        throw new Error(`Failed to delete entry: ${error.message}`);
    }
}

/**
 * Increment usage count for a KB entry
 */
export async function incrementKBUsage(entryId: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase.rpc('increment_kb_usage', { entry_id: entryId });

    if (error) {
        // Fallback to manual increment if RPC doesn't exist
        const { data: current } = await supabase
            .from('bot_knowledge_base')
            .select('usage_count')
            .eq('id', entryId)
            .single();

        if (current) {
            await supabase
                .from('bot_knowledge_base')
                .update({ usage_count: (current.usage_count || 0) + 1 })
                .eq('id', entryId);
        }
    }
}

/**
 * Get relevant KB entries for an email context
 * This is used by the bot engine to inject knowledge into AI prompts
 */
export async function getRelevantKBForEmail(
    botId: string,
    emailSubject: string,
    emailBody: string
): Promise<KBEntry[]> {
    // Combine subject and body for search
    const searchText = `${emailSubject} ${emailBody}`.toLowerCase();

    // Extract potential keywords (simple approach)
    const words = searchText
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 10); // Top 10 words

    const supabase = createAdminClient();
    const { data } = await supabase
        .from('bot_knowledge_base')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true);

    if (!data) return [];

    // Score each entry based on keyword relevance
    const scored = data.map((entry) => {
        let score = 0;

        // Check title match
        if (searchText.includes(entry.title.toLowerCase())) score += 10;

        // Check keyword matches
        entry.keywords?.forEach((kw: string) => {
            if (searchText.includes(kw.toLowerCase())) score += 5;
        });

        // Check if any search words appear in content
        words.forEach((word) => {
            if (entry.content.toLowerCase().includes(word)) score += 1;
        });

        return { ...entry, score };
    });

    // Return top 3 most relevant entries
    return scored
        .filter((e) => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}
