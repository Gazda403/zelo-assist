export const BOT_TEMPLATES = { customer_support: { name: 'Support', description: 'Auto-reply', enabled: false, isPremium: false, trigger: {}, conditions: [], actions: [], safety: {}, stats: {} } };
export const getAllTemplates = () => Object.entries(BOT_TEMPLATES).map(([id, t]) => ({ id, name: t.name, description: t.description, isPremium: t.isPremium }));
export const getTemplate = (id: string) => BOT_TEMPLATES[id as keyof typeof BOT_TEMPLATES] || null;
