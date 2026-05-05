'use server';

import { auth } from '@/auth';
import * as gmailClient from '@/lib/gmail';
import * as outlookClient from '@/lib/outlook';

function getClient(provider?: string) {
    return provider === 'microsoft-entra-id' ? outlookClient : gmailClient;
}
import { rateEmailFlow } from '@/ai/flows/email-rater';
import { refineDraftFlow } from '@/ai/flows/draft-refiner';
import { generateDraftFlow } from '@/ai/flows/draft-generator';
import { composeNewEmailFlow } from '@/ai/flows/email-composer';

interface AIResult {
    urgencyScore: number;
    reasoning: string;
    confidence: 'low' | 'medium' | 'high';
}

const EMAIL_AI_LIMIT = 3; // Keep small to avoid rate-limit bursts
const XELOFLOW_SIGNATURE = "\n\n---\nSent with Xelo Flow — Your AI Inbox Companion. Get it here: https://www.xeloflow.com";

/**
 * Gets the signature based on the user's plan type.
 * Only appended for 'free' users.
 */
async function getPlanAwareSignature(userId: string): Promise<string> {
    try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', userId)
            .single();

        const planType = profile?.plan_type ?? 'free';
        return planType === 'free' ? XELOFLOW_SIGNATURE : "";
    } catch (err) {
        console.error("[Signature] Failed to fetch plan type:", err);
        return XELOFLOW_SIGNATURE; // Fallback to safe side
    }
}


// import { getCachedEmailRatings, trackEmailRating } from '@/lib/analytics';
import { getEmailRatings, saveEmailRating, getGeneratedDraft, saveGeneratedDraft } from '@/lib/db/email-storage';

// --- FILM MODE: Toggle this to TRUE for your promotional video recording! ---
const FILM_MODE = false;

const MOCK_EMAILS_FOR_FILMING = [
    {
        id: "mock-investor-1",
        threadId: "thread-i1",
        subject: "Interest in XeloFlow Seed Round",
        sender: { name: "Sarah Jenkins @ Sequoia", email: "sarah.j@sequoia.com" },
        snippet: "Hi, I'm a partner at Sequoia. We've been tracking XeloFlow's growth and we're extremely impressed with your AI agent architecture. We'd like to discuss a potential lead for your Seed round. Are you available for a brief call next Tuesday?",
        date: new Date().toISOString(),
        read: false,
        urgencyScore: 10,
        urgencyReason: "Critical: High-tier VC interest detected. Potential for institutional funding.",
        aiConfidence: 'high'
    },
    {
        id: "mock-sales-1",
        threadId: "thread-s1",
        subject: "SEO Services for xeloflow.com — Page 1 Guaranteed",
        sender: { name: "Mark @ GrowthHacks", email: "mark@growthhacks.biz" },
        snippet: "Hey, I noticed xeloflow.com isn't ranking for 'AI Gmail Assistant'. We can get you to the top of Google for just $500/month. No contracts, results in 30 days. When can we talk?",
        date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: false,
        urgencyScore: 2,
        urgencyReason: "Low: Cold sales outreach with generic value proposition.",
        aiConfidence: 'high'
    },
    {
        id: "mock-support-1",
        threadId: "thread-sp1",
        subject: "Question about my account billing",
        sender: { name: "John Doe", email: "john.doe@gmail.com" },
        snippet: "Hi XeloFlow Team, I'm trying to update my credit card but the 'Save' button is greyed out. Can you please look into this? I don't want my subscription to lapse.",
        date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        read: false,
        urgencyScore: 7,
        urgencyReason: "Medium: Billing issue from a paying user. Requires intervention.",
        aiConfidence: 'medium'
    },
    {
        id: "mock-hiring-1",
        threadId: "thread-h1",
        subject: "Senior Fullstack Engineer Application — Alex Rivera",
        sender: { name: "Alex Rivera", email: "alex.riv@dev.io" },
        snippet: "Dear XeloFlow Team, I've been following your progress in the AI space and would love to join as a Senior Engineer. I have 8 years of experience with Next.js and LLM integrations. Attached is my resume.",
        date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        read: true,
        urgencyScore: 4,
        urgencyReason: "Standard: Recruitment inquiry from qualified talent.",
        aiConfidence: 'high'
    },
    {
        id: "mock-legal-1",
        threadId: "thread-l1",
        subject: "URGENT: Notice of Compliance Audit",
        sender: { name: "Compliance Dept", email: "compliance@global-reg.org" },
        snippet: "OFFICIAL NOTICE: XeloFlow is scheduled for a routine data privacy compliance audit on May 1st. Please review the attached documentation and confirm your point of contact.",
        date: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        read: true,
        urgencyScore: 9,
        urgencyReason: "High: Regulatory compliance notice requires immediate founder review.",
        aiConfidence: 'high'
    }
];

export async function fetchEmailsAction(
    pageToken?: string,
    filter: '1d' | '7d' | '30d' | 'all' = '7d',
    limit: number = 10
) {
    const session = await auth() as any;
    if (!session || !session.accessToken || session.error === 'RefreshAccessTokenError') {
        return { emails: [], nextPageToken: undefined, unreadCount: 0, error: 'Unauthorized', message: 'Session expired. Please sign in again.' };
    }

    // --- FILM MODE: Return mocks if enabled ---
    if (FILM_MODE) {
        console.log("🎬 FILM MODE ACTIVE: Returning mock emails for recording.");

        // Trigger bots for mocks in background if this is the first page load
        if (!pageToken && session.user?.email) {
            (async () => {
                try {
                    const { executeBots } = await import('@/lib/bots/engine/orchestrator');
                    for (const email of MOCK_EMAILS_FOR_FILMING) {
                        const emailEvent = {
                            type: 'new_email' as const,
                            emailId: email.id,
                            sender: email.sender,
                            subject: email.subject,
                            body: email.snippet,
                            snippet: email.snippet,
                            date: email.date,
                            read: email.read,
                            urgencyScore: email.urgencyScore,
                            threadId: email.threadId,
                        };
                        // @ts-ignore - Mock execution
                        executeBots(emailEvent, session.user.email!).catch(err => {
                            console.error('[Bots] Mock background execution failed:', err);
                        });
                    }
                } catch (err) {
                    console.error('[Bots] Mock bot trigger setup failed:', err);
                }
            })().catch(err => console.error('[Bots] Mock bot trigger loop crashed:', err));
        }

        return {
            emails: MOCK_EMAILS_FOR_FILMING,
            nextPageToken: undefined,
            unreadCount: 3
        };
    }

    try {
        const userEmail = session.user?.email;
        let query = session.provider === 'microsoft-entra-id' 
            ? (userEmail ? `NOT from:${userEmail}` : '') 
            : '-from:me';
            
        if (filter !== 'all') {
            query += query ? ` newer_than:${filter}` : `newer_than:${filter}`;
        }

        const client = getClient(session.provider);
        // Fetch emails and unread count in parallel — saves one extra round-trip
        const [{ emails, nextPageToken }, unreadCount] = await Promise.all([
            client.getLastEmails(session.accessToken, limit, pageToken, query),
            client.getUnreadCount(session.accessToken, query).catch(() => 0),
        ]);

        // 1. Fetch ratings from Supabase DB
        const emailIds = emails.map((e: any) => e.id);
        const cachedRatings = await getEmailRatings(emailIds);

        // Filter for emails needing rating (not in cache)
        const unratedEmails = emails.filter((e: any) => !cachedRatings[e.id]);

        // Check if user is active (trial not expired or paid)
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type, subscription_status, first_login_at')
            .eq('id', session.user.id!)
            .single();

        const planType = profile?.plan_type ?? "free";
        const subscriptionStatus = profile?.subscription_status ?? "inactive";
        const createdAt = profile?.first_login_at || new Date().toISOString();
        const trialDays = 7;
        const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const isTrialExpired = planType === "free" && daysSinceCreation > trialDays;
        const ADMIN_EMAIL = "brankovicaleksandar2404@gmail.com";
        const isAdmin = session.user.email === ADMIN_EMAIL;
        const isActive = isAdmin || subscriptionStatus === "active" || (planType === "free" && !isTrialExpired);

        // Process a subset to avoid rate limits/timeouts
        const batchToRate = isActive ? unratedEmails.slice(0, EMAIL_AI_LIMIT) : [];

        if (!isActive && unratedEmails.length > 0) {
            console.log("[AI] Trial expired / inactive, skipping background rating.");
        }

        if (batchToRate.length > 0) {
            console.log(`[AI] Rating ${batchToRate.length} new emails sequentially in background...`);
            // Fire-and-forget: don't await — inbox returns immediately with cached data.
            // Sequential processing (not Promise.all) to avoid bursting rate limits on
            // both Gemini (5 req/min free tier) and Groq (tokens/min limit).
            (async () => {
                for (const email of batchToRate) {
                    try {
                        const rating = await rateEmailFlow({
                            subject: email.subject,
                            snippet: email.snippet,
                            sender: email.sender.name
                        });

                        if (rating) {
                            const saved = await saveEmailRating(email.id, session.user.id!, rating as any);
                            if (!saved) {
                                console.warn(`[AI] Failed to save rating for ${email.id}`);
                            } else {
                                console.log(`[AI] Rated email ${email.id}: score ${rating.urgencyScore}`);
                            }
                        }
                    } catch (err) {
                        console.error(`[AI] Failed to rate email ${email.id}:`, err);
                    }
                    // Small delay between requests to stay within rate limits
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                console.log(`[AI] Background rating batch complete.`);
            })().catch(err => console.error('[AI] Background rating batch crashed:', err));
        }

        // Merge ratings into response
        const enrichedEmails = emails.map((email: any) => {
            const cached = cachedRatings[email.id];
            if (cached) {
                return {
                    ...email,
                    urgencyScore: cached.urgencyScore,
                    urgencyReason: cached.reasoning,
                    // We can add confidence if the UI supports it later
                    aiConfidence: cached.confidence
                };
            }
            return email;
        });

        // Only trigger bots on the first page load (not pagination scroll).
        // This avoids re-firing bots against emails the user is just browsing historically.
        if (!pageToken) {
            try {
                const { executeBots } = await import('@/lib/bots/engine/orchestrator');

                for (const email of enrichedEmails) {
                    const emailEvent = {
                        type: 'new_email' as const,
                        emailId: email.id,
                        sender: email.sender,
                        subject: email.subject,
                        body: email.snippet,
                        snippet: email.snippet,
                        date: email.date,
                        read: email.read,
                        urgencyScore: cachedRatings[email.id]?.urgencyScore,
                        threadId: email.threadId,
                    };

                    executeBots(emailEvent, session.user.email!).catch(err => {
                        console.error('[Bots] Background execution failed:', err);
                    });
                }
            } catch (error) {
                console.error('[Bots] Failed to trigger bots:', error);
            }
        }

        return { emails: enrichedEmails, nextPageToken, unreadCount };

    } catch (error: any) {
        console.error("Fetch Emails Action Error:", error);

        // Check for specific auth errors from the Gmail API
        if (error.message?.includes('401') || error.message?.includes('invalid_grant')) {
            return { emails: [], nextPageToken: undefined, unreadCount: 0, error: 'Unauthorized', message: 'Gmail access revoked or expired.' };
        }

        throw new Error(`Failed to fetch emails: ${error.message}`);
    }
}

export async function createDraftAction(to: string, subject: string, body: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        const draft = await client.createDraft(session.accessToken, to, subject, body);
        return draft;
    } catch (error) {
        console.error("Create Draft Action Error:", error);
        throw new Error("Failed to create draft");
    }
}

export async function refineDraftAction(
    currentDraft: string,
    instruction: string,
    emailContext?: { sender?: string; subject?: string; originalEmail?: string }
) {
    const session = await auth() as any;
    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const result = await refineDraftFlow({
            draft: currentDraft,
            instruction,
            emailContext
        });
        return result;
    } catch (error: any) {
        console.error("Refine Draft Action Error:", error);

        // Handle Quota Exceeded errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("Quota exceeded") || errorMessage.includes("429")) {
            throw new Error("AI Quota Exceeded (Free Tier Limit). Please try again in ~30 seconds.");
        }

        throw new Error("Failed to refine draft");
    }
}

export async function generateDraftAction(
    emailId: string,
    sender: string,
    senderEmail: string,
    subject: string,
    emailBody: string,
    botId?: string,
    intent?: string,
    instructions?: string
) {
    const session = await auth() as any;
    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        console.log('[Generate Draft Action] Generating draft for:', subject);

        // Detect if email is non-English (contains non-Latin/Cyrillic/etc. characters).
        // If so, skip the cache — old cached drafts may be in English (pre-multilingual update).
        const nonLatinPattern = /[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0590-\u05FF\u0900-\u097F]/;
        const isNonLatinEmail = nonLatinPattern.test(subject) || nonLatinPattern.test(emailBody);

        // 1. Check cache first (skip for non-Latin emails — avoids stale English drafts)
        if (!isNonLatinEmail) {
            const existingDraft = await getGeneratedDraft(emailId);
            if (existingDraft) {
                console.log('[Generate Draft Action] Cache hit for:', emailId);
                return existingDraft;
            }
        } else {
            console.log('[Generate Draft Action] Non-Latin email detected — bypassing cache to ensure correct language draft.');
        }

        console.log('[Generate Draft Action] Cache miss for:', emailId);

        // 2. Fetch Knowledge Base & Instructions if botId provided
        let knowledgeBase = '';
        let botInstructions = instructions || '';

        if (botId && session.user.id) {
            try {
                const { getBotById } = await import('@/lib/bots/storage');
                const bot = await getBotById(botId, session.user.id);

                if (bot) {
                    // Update instructions if none provided
                    if (!botInstructions) botInstructions = bot.prompt || '';

                    // Load KB
                    if (bot.policyConfig?.enabled && bot.policyConfig.policies.length > 0) {
                        knowledgeBase = bot.policyConfig.policies
                            .map(p => `[${p.title}]\n${p.content}`)
                            .join('\n\n');
                        console.log(`[Generate Draft Action] Loaded ${bot.policyConfig.policies.length} policies for context.`);
                    }
                }
            } catch (err) {
                console.warn('[Generate Draft Action] Failed to load Bot/KB context:', err);
            }
        }

        const result = await generateDraftFlow({
            sender,
            senderEmail,
            subject,
            emailBody,
            knowledgeBase,
            intent,
            instructions: botInstructions
        });

        // 3. Save to cache (non-blocking) — only cache Latin-script emails
        if (!isNonLatinEmail) {
            saveGeneratedDraft(emailId, session.user.id!, result).catch(err => {
                console.error('[Generate Draft Action] Failed to save draft to cache:', err);
            });
        }

        console.log('[Generate Draft Action] Draft generated successfully');
        const signature = await getPlanAwareSignature(session.user.id!);
        result.draft = result.draft + signature;
        return result;
    } catch (error) {
        console.error("Generate Draft Action Error:", error);

        // Return fallback instead of throwing to prevent UI crashes
        const signature = await getPlanAwareSignature(session.user.id!);
        return {
            draft: `Dear ${sender},\n\nThank you for your email. I've received your message and will respond shortly.${signature}`,
            tone: "professional"
        };
    }
}

/**
 * Send an email using the Gmail API.
 * @param to recipient email
 * @param subject email subject
 * @param body email body
 * @returns Gmail API response
 */
export async function sendEmailAction(to: string, subject: string, body: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized: No access token");
    }

    try {
        const client = getClient(session.provider);
        const signature = await getPlanAwareSignature(session.user.id!);
        const bodyWithSignature = body + signature;
        const result = await client.sendEmail(session.accessToken, to, subject, bodyWithSignature);
        return result;
    } catch (error: any) {
        console.error("Send Email Action Error:", error);
        throw new Error(`Failed to send email to ${to}: ${error.message || JSON.stringify(error)}`);
    }
}

/**
 * Composes a brand new outbound email from the user's natural language instruction.
 * This is used by the /send page — NOT for replying to existing emails.
 */
export async function composeNewEmailAction(
    recipientEmail: string,
    recipientName: string,
    subject: string,
    userInstruction: string
) {
    const session = await auth() as any;
    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const result = await composeNewEmailFlow({
            recipientEmail,
            recipientName,
            subject,
            userInstruction,
        });
        return result;
    } catch (error) {
        console.error("Compose New Email Action Error:", error);
        throw new Error("Failed to compose email");
    }
}


export async function fetchSentEmailsAction() {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        return null;
    }

    try {
        const client = getClient(session.provider);
        const emails = await client.getSentEmails(session.accessToken);
        return emails;
    } catch (error) {
        console.error("Fetch Sent Emails Action Error:", error);
        throw new Error("Failed to fetch sent emails");
    }
}

export async function fetchTrashEmailsAction() {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        return { emails: [], error: 'Unauthorized', message: 'Session expired.' };
    }

    try {
        const client = getClient(session.provider);
        const emails = await client.getTrashEmails(session.accessToken);
        return { emails };
    } catch (error: any) {
        console.error("Fetch Trash Emails Action Error:", error);
        if (error.message?.includes('401') || error.message?.includes('invalid_grant')) {
            return { emails: [], error: 'Unauthorized', message: 'Gmail access revoked or expired.' };
        }
        throw new Error("Failed to fetch trash emails");
    }
}


export async function searchEmailsAction(query: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        const results = await client.searchEmails(session.accessToken, query);
        return results;
    } catch (error) {
        console.error("Search Emails Action Error:", error);
        throw new Error("Failed to search emails");
    }
}

export async function fetchEmailBodyAction(messageId: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        const body = await client.getEmailBody(session.accessToken, messageId);
        return body;
    } catch (error) {
        console.error("Fetch Email Body Action Error:", error);
        throw new Error("Failed to fetch email body");
    }
}

export async function applyLabelAction(messageId: string, labelName: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        const labelId = await client.getOrCreateLabel(session.accessToken, labelName);
        const result = await client.modifyMessage(session.accessToken, messageId, [labelId], []);
        return result;
    } catch (error) {
        console.error("Apply Label Action Error:", error);
        throw new Error("Failed to apply label");
    }
}

export async function markAsReadAction(messageId: string) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        // Removing UNREAD label marks it as read
        const result = await client.modifyMessage(session.accessToken, messageId, [], ['UNREAD']);
        return result;
    } catch (error) {
        console.error("Mark As Read Action Error:", error);
        throw new Error("Failed to mark email as read");
    }
}

export async function forwardEmailAction(
    messageId: string,
    to: string,
    subject: string,
    senderName: string,
    originalDate: string
) {
    const session = await auth() as any;

    if (!session || !session.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const client = getClient(session.provider);
        const originalBody = await client.getEmailBody(session.accessToken, messageId);

        const forwardedSubject = `Fwd: ${subject}`;
        const forwardedBody = `
---------- Forwarded message ---------
From: ${senderName}
Date: ${new Date(originalDate).toLocaleString()}
Subject: ${subject}

Subject: ${subject}

${originalBody}${await getPlanAwareSignature(session.user.id!)}
`;

        const result = await client.sendEmail(session.accessToken, to, forwardedSubject, forwardedBody);
        return result;
    } catch (error) {
        console.error("Forward Email Action Error:", error);
        throw new Error("Failed to forward email");
    }
}

export async function getDraftStatsAction() {
    const session = await auth() as any;

    if (!session || !session.accessToken || !session.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        const userId = session.user.id;

        // 1. Get Urgent Emails from last 7 days
        // We'll calculate a simple distribution based on all rated emails for the user
        const { data: ratingsData, error: ratingsError } = await supabase
            .from('email_ratings')
            .select('urgency_score, created_at')
            .eq('user_id', userId)
            // .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Optional time filter
            ;

        if (ratingsError) throw ratingsError;

        // Aggregate urgency distribution
        const urgencyDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        let totalUrgency = 0;
        let ratedCount = 0;

        // Group by day for the volume chart
        const dailyVolumes: Record<string, number> = {};

        // Initialize last 7 days including today
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyVolumes[days[d.getDay()]] = 0;
        }

        if (ratingsData && ratingsData.length > 0) {
            ratingsData.forEach(rating => {
                const score = rating.urgency_score;
                totalUrgency += score;
                ratedCount++;

                if (score <= 3) urgencyDistribution.Low++;
                else if (score <= 6) urgencyDistribution.Medium++;
                else if (score <= 8) urgencyDistribution.High++;
                else urgencyDistribution.Critical++;

                const dayName = days[new Date(rating.created_at).getDay()];
                if (dailyVolumes[dayName] !== undefined) {
                    dailyVolumes[dayName]++;
                }
            });
        }

        const avgUrgency = ratedCount > 0 ? (totalUrgency / ratedCount).toFixed(1) : "0.0";

        // Convert daily volumes to array format expected by Recharts
        const dailyDataArray = Object.keys(dailyVolumes).map(day => ({
            day,
            count: dailyVolumes[day]
        }));

        // Convert urgency to array
        const urgencyDataArray = [
            { name: 'Low', value: urgencyDistribution.Low },
            { name: 'Medium', value: urgencyDistribution.Medium },
            { name: 'High', value: urgencyDistribution.High },
            { name: 'Critical', value: urgencyDistribution.Critical },
        ].filter(d => d.value > 0); // Remove empty categories

        // If no data, provide a fallback ring so pie chart doesn't crash
        if (urgencyDataArray.length === 0) {
            urgencyDataArray.push({ name: 'No Data', value: 1 });
        }

        // 2. Count generated drafts
        const { count: draftsCount, error: draftsError } = await supabase
            .from('generated_drafts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (draftsError) console.warn("Failed to count drafts", draftsError);

        // 3. Get total unread count from Gmail
        const client = getClient(session.provider);
        let unreadCount = 0;
        try {
            unreadCount = await client.getUnreadCount(session.accessToken, '');
        } catch (e) {
            console.warn("Failed to get Gmail unread count", e);
        }

        return {
            dailyData: dailyDataArray,
            urgencyData: urgencyDataArray,
            metrics: {
                avgUrgency,
                draftsCount: draftsCount || 0,
                unreadCount
            }
        };

    } catch (error) {
        console.error("Get Draft Stats Action Error:", error);
        throw new Error("Failed to fetch draft stats");
    }
}
