const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailMessage {
    id: string;
    threadId: string;
    payload: {
        headers: { name: string; value: string }[];
        body: { data?: string };
        parts?: { body: { data?: string }; mimeType: string }[];
    };
    snippet: string;
    internalDate: string;
}

export interface GmailThread {
    id: string;
    snippet: string;
    historyId: string;
}

export async function getLastEmails(
    accessToken: string,
    limit: number = 20,
    pageToken?: string,
    query: string = ''
) {
    try {
        // 1. List messages
        let url = `${GMAIL_API_BASE}/messages?maxResults=${limit}`;
        if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const listRes = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!listRes.ok) {
            const errorBody = await listRes.text();
            console.error('Failed to list messages. Status:', listRes.status, 'Body:', errorBody);
            throw new Error(`Failed to list messages: ${listRes.status} ${errorBody}`);
        }
        const listData = await listRes.json();
        const messages = listData.messages || [];
        const nextPageToken = listData.nextPageToken;

        // 2. Fetch details for each message
        const detailedMessages = await Promise.all(
            messages.map(async (msg: { id: string }) => {
                const detailRes = await fetch(`${GMAIL_API_BASE}/messages/${msg.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                return detailRes.json();
            })
        );

        // 3. Format for UI
        const emails = detailedMessages.map((msg: GmailMessage) => {
            const headers = msg.payload.headers;
            const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
            const date = new Date(parseInt(msg.internalDate)).toISOString();

            return {
                id: msg.id,
                threadId: msg.threadId,
                subject,
                sender: { name: from.split('<')[0].trim(), email: from },
                snippet: msg.snippet,
                date,
                read: !msg.payload?.headers?.find(h => h.name === 'LabelIds')?.value?.includes('UNREAD'),
                urgencyScore: 5,
                urgencyReason: "Pending Analysis"
            };
        });

        return { emails, nextPageToken };
    } catch (error) {
        console.error('Gmail API Error:', error);
        throw error;
    }
}

export async function createDraft(accessToken: string, to: string, subject: string, body: string) {
    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
    ].join('\n');

    // Base64url encode
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await fetch(`${GMAIL_API_BASE}/drafts`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: {
                raw: encodedMessage
            }
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to create draft: ${JSON.stringify(err)}`);
    }

    return res.json();
}

export async function sendEmail(accessToken: string, to: string, subject: string, body: string) {
    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
    ].join('\n');

    // Base64url encode
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            raw: encodedMessage
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to send email: ${JSON.stringify(err)}`);
    }

    return res.json();
}

/**
 * Fetch sent emails from Gmail.
 * @param accessToken User's OAuth access token
 * @param limit Max number of emails to fetch
 * @returns Array of sent email objects
 */
export async function getSentEmails(accessToken: string, limit: number = 20) {
    try {
        const listRes = await fetch(`${GMAIL_API_BASE}/messages?labelIds=SENT&maxResults=${limit}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!listRes.ok) throw new Error('Failed to list sent messages');
        const listData = await listRes.json();
        const messages = listData.messages || [];

        const detailedMessages = await Promise.all(
            messages.map(async (msg: { id: string }) => {
                const detailRes = await fetch(`${GMAIL_API_BASE}/messages/${msg.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                return detailRes.json();
            })
        );

        return detailedMessages.map((msg: GmailMessage) => {
            const headers = msg.payload.headers;
            const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
            const to = headers.find((h) => h.name === 'To')?.value || 'Unknown';
            const date = new Date(parseInt(msg.internalDate)).toISOString();

            return {
                id: msg.id,
                threadId: msg.threadId,
                subject,
                sender: { name: 'Me', email: '' },
                recipient: { name: to.split('<')[0].trim(), email: to },
                snippet: msg.snippet,
                date,
            };
        });
    } catch (error) {
        console.error('Gmail API Error (Sent):', error);
        throw error;
    }
}

/**
 * Fetch trash emails from Gmail.
 * @param accessToken User's OAuth access token
 * @param limit Max number of emails to fetch
 * @returns Array of trash email objects
 */
export async function getTrashEmails(accessToken: string, limit: number = 20) {
    try {
        const listRes = await fetch(`${GMAIL_API_BASE}/messages?labelIds=TRASH&maxResults=${limit}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!listRes.ok) throw new Error('Failed to list trash messages');
        const listData = await listRes.json();
        const messages = listData.messages || [];

        const detailedMessages = await Promise.all(
            messages.map(async (msg: { id: string }) => {
                const detailRes = await fetch(`${GMAIL_API_BASE}/messages/${msg.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                return detailRes.json();
            })
        );

        return detailedMessages.map((msg: GmailMessage) => {
            const headers = msg.payload.headers;
            const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
            const to = headers.find((h) => h.name === 'To')?.value || 'Unknown';
            const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
            const date = new Date(parseInt(msg.internalDate)).toISOString();

            return {
                id: msg.id,
                threadId: msg.threadId,
                subject,
                sender: { name: from.split('<')[0].trim(), email: from },
                recipient: { name: to.split('<')[0].trim(), email: to },
                snippet: msg.snippet,
                date,
            };
        });
    } catch (error) {
        console.error('Gmail API Error (Trash):', error);
        throw error;
    }
}
/**
 * Search emails by keyword, sender, or subject using Gmail's q parameter.
 * @param accessToken User's OAuth access token
 * @param query Search query
 * @param limit Max results
 */
export async function searchEmails(accessToken: string, query: string, limit: number = 10) {
    try {
        const listRes = await fetch(`${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${limit}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!listRes.ok) throw new Error('Failed to search messages');
        const listData = await listRes.json();
        const messages = listData.messages || [];

        const detailedMessages = await Promise.all(
            messages.map(async (msg: { id: string }) => {
                const detailRes = await fetch(`${GMAIL_API_BASE}/messages/${msg.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                return detailRes.json();
            })
        );

        return detailedMessages.map((msg: GmailMessage) => {
            const headers = msg.payload.headers;
            const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
            const date = new Date(parseInt(msg.internalDate)).toISOString();

            return {
                id: msg.id,
                threadId: msg.threadId,
                subject,
                sender: { name: from.split('<')[0].trim(), email: from },
                snippet: msg.snippet,
                date,
                read: !msg.payload?.headers?.find(h => h.name === 'LabelIds')?.value?.includes('UNREAD'),
            };
        });
    } catch (error) {
        console.error('Gmail API Error (Search):', error);
        throw error;
    }
}
/**
 * Fetches the full body of a specific email message.
 */
export async function getEmailBody(accessToken: string, messageId: string) {
    try {
        const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch message details');
        const msg = await res.json();

        // Gmail body can be in payload.body.data or in payload.parts
        let body = '';

        const getBody = (payload: any): string => {
            if (payload.body?.data) {
                return Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }

            if (payload.parts) {
                // First try to find HTML
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/html' && part.body?.data) {
                        return Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
                // Fallback to plain text
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body?.data) {
                        return Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
                // Check nested parts
                for (const part of payload.parts) {
                    if (part.parts) {
                        const result = getBody(part);
                        if (result) return result;
                    }
                }
            }
            return '';
        };

        body = getBody(msg.payload);
        return body || msg.snippet || '';
    } catch (error) {
        console.error('Gmail API Error (Body):', error);
        throw error;
    }
}
/**
 * Fetches the number of unread messages in the inbox, optionally filtered by a query.
 * @param accessToken User's OAuth access token
 * @param query Optional query to filter unread messages (e.g., newer_than:1d)
 * @returns Number of unread messages
 */
export async function getUnreadCount(accessToken: string, query?: string) {
    try {
        if (query) {
            // If there's a timeframe query, we need to search for unread messages within that timeframe
            const fullQuery = `label:UNREAD label:INBOX ${query}`;
            const url = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(fullQuery)}&maxResults=1`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error('Failed to fetch filtered unread count');
            const data = await res.json();

            // estimatedSize is the approximate total number of results
            return data.resultSizeEstimate || 0;
        }

        // Fast path for total unread count
        const res = await fetch(`${GMAIL_API_BASE}/labels/INBOX`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch unread count');
        const data = await res.json();
        return data.messagesUnread || 0;
    } catch (error) {
        console.error('Gmail API Error (Unread Count):', error);
        throw error;
    }
}

/**
 * Fetches all labels for the user's mailbox.
 */
export async function getLabels(accessToken: string) {
    try {
        const res = await fetch(`${GMAIL_API_BASE}/labels`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch labels');
        const data = await res.json();
        return data.labels || [];
    } catch (error) {
        console.error('Gmail API Error (Get Labels):', error);
        throw error;
    }
}

/**
 * Creates a new label in the user's mailbox.
 */
export async function createLabel(accessToken: string, name: string) {
    try {
        const res = await fetch(`${GMAIL_API_BASE}/labels`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show'
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Failed to create label: ${JSON.stringify(err)}`);
        }

        return await res.json();
    } catch (error) {
        console.error('Gmail API Error (Create Label):', error);
        throw error;
    }
}

/**
 * Helper to get a label ID by name, creating it if it doesn't exist.
 */
export async function getOrCreateLabel(accessToken: string, name: string): Promise<string> {
    const labels = await getLabels(accessToken);
    const existing = labels.find((l: any) => l.name.toLowerCase() === name.toLowerCase());

    if (existing) {
        return existing.id;
    }

    const newLabel = await createLabel(accessToken, name);
    return newLabel.id;
}

/**
 * Modifies the labels on a specific message.
 */
export async function modifyMessage(
    accessToken: string,
    messageId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
) {
    try {
        const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                addLabelIds,
                removeLabelIds
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Failed to modify message: ${JSON.stringify(err)}`);
        }

        return await res.json();
    } catch (error) {
        console.error('Gmail API Error (Modify Message):', error);
        throw error;
    }
}
