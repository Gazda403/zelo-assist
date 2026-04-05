const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0/me';

export async function getLastEmails(
    accessToken: string,
    limit: number = 20,
    pageToken?: string,
    query: string = ''
) {
    try {
        // $select limits the fields returned — much smaller payload
        const SELECT = '$select=id,conversationId,subject,sender,bodyPreview,receivedDateTime,isRead,labelIds';
        let url = `${GRAPH_API_BASE}/messages?${SELECT}&$top=${limit}`;
        
        // If pageToken is provided, it's usually the full nextLink URL or base64 encoded
        // But for simplicity, we'll try to handle it. Graph API pagination uses full URLs.
        if (pageToken) {
            if (pageToken.startsWith('http')) {
                url = pageToken;
            } else {
                url = Buffer.from(pageToken, 'base64').toString('utf-8');
            }
        } else if (query) {
            url += `&$search=${encodeURIComponent(`"${query}"`)}`;
        }

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error('Failed to list messages. Status:', res.status, 'Body:', errorBody);
            throw new Error(`Failed to list messages: ${res.status} ${errorBody}`);
        }
        
        const data = await res.json();
        const messages = data.value || [];
        // Encode nextLink as base64 so it can safely pass through URLs if needed
        const nextPageToken = data['@odata.nextLink'] ? Buffer.from(data['@odata.nextLink']).toString('base64') : undefined;

        const emails = messages.map((msg: any) => {
            const subject = msg.subject || '(No Subject)';
            const fromName = msg.sender?.emailAddress?.name || 'Unknown';
            const fromEmail = msg.sender?.emailAddress?.address || 'Unknown';
            const date = new Date(msg.receivedDateTime).toISOString();

            return {
                id: msg.id,
                threadId: msg.conversationId,
                subject,
                sender: { name: fromName, email: fromEmail },
                snippet: msg.bodyPreview || '',
                date,
                read: msg.isRead,
                urgencyScore: 5,
                urgencyReason: "Pending Analysis"
            };
        });

        return { emails, nextPageToken };
    } catch (error) {
        console.error('Outlook API Error:', error);
        throw error;
    }
}

export async function createDraft(accessToken: string, to: string, subject: string, body: string) {
    const res = await fetch(`${GRAPH_API_BASE}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subject: subject,
            body: {
                contentType: "HTML",
                content: body
            },
            toRecipients: [
                { emailAddress: { address: to } }
            ]
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to create draft: ${JSON.stringify(err)}`);
    }

    return res.json();
}

export async function sendEmail(accessToken: string, to: string, subject: string, body: string) {
    const res = await fetch(`${GRAPH_API_BASE}/sendMail`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: {
                subject: subject,
                body: {
                    contentType: "HTML",
                    content: body
                },
                toRecipients: [
                    { emailAddress: { address: to } }
                ]
            },
            saveToSentItems: "true"
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to send email: ${err}`);
    }

    // sendMail typically returns 202 Accepted with no body
    return { success: true };
}

export async function getSentEmails(accessToken: string, limit: number = 20) {
    try {
        const SELECT = '$select=id,conversationId,subject,toRecipients,bodyPreview,sentDateTime,createdDateTime';
        const url = `${GRAPH_API_BASE}/mailFolders/sentitems/messages?${SELECT}&$top=${limit}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to list sent messages');
        const data = await res.json();
        const messages = data.value || [];

        return messages.map((msg: any) => {
            const subject = msg.subject || '(No Subject)';
            const toRecipients = msg.toRecipients || [];
            const toEmail = toRecipients.length > 0 ? toRecipients[0].emailAddress?.address : 'Unknown';
            const toName = toRecipients.length > 0 ? toRecipients[0].emailAddress?.name : 'Unknown';
            const date = new Date(msg.sentDateTime || msg.createdDateTime).toISOString();

            return {
                id: msg.id,
                threadId: msg.conversationId,
                subject,
                sender: { name: 'Me', email: '' },
                recipient: { name: toName, email: toEmail },
                snippet: msg.bodyPreview || '',
                date,
            };
        });
    } catch (error) {
        console.error('Outlook API Error (Sent):', error);
        throw error;
    }
}

export async function getTrashEmails(accessToken: string, limit: number = 20) {
    try {
        const SELECT = '$select=id,conversationId,subject,sender,toRecipients,bodyPreview,receivedDateTime,isRead';
        const url = `${GRAPH_API_BASE}/mailFolders/deleteditems/messages?${SELECT}&$top=${limit}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to list trash messages');
        const data = await res.json();
        const messages = data.value || [];

        return messages.map((msg: any) => {
            const subject = msg.subject || '(No Subject)';
            const fromName = msg.sender?.emailAddress?.name || 'Unknown';
            const fromEmail = msg.sender?.emailAddress?.address || 'Unknown';
            const toRecipients = msg.toRecipients || [];
            const toEmail = toRecipients.length > 0 ? toRecipients[0].emailAddress?.address : 'Unknown';
            const toName = toRecipients.length > 0 ? toRecipients[0].emailAddress?.name : 'Unknown';
            const date = new Date(msg.receivedDateTime).toISOString();

            return {
                id: msg.id,
                threadId: msg.conversationId,
                subject,
                sender: { name: fromName, email: fromEmail },
                recipient: { name: toName, email: toEmail },
                snippet: msg.bodyPreview || '',
                date,
            };
        });
    } catch (error) {
        console.error('Outlook API Error (Trash):', error);
        throw error;
    }
}

export async function searchEmails(accessToken: string, query: string, limit: number = 10) {
    try {
        const SELECT = '$select=id,conversationId,subject,sender,bodyPreview,receivedDateTime,isRead';
        const url = `${GRAPH_API_BASE}/messages?$search=${encodeURIComponent(`"${query}"`)}&${SELECT}&$top=${limit}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to search messages');
        const data = await res.json();
        const messages = data.value || [];

        return messages.map((msg: any) => {
            const subject = msg.subject || '(No Subject)';
            const fromName = msg.sender?.emailAddress?.name || 'Unknown';
            const fromEmail = msg.sender?.emailAddress?.address || 'Unknown';
            const date = new Date(msg.receivedDateTime).toISOString();

            return {
                id: msg.id,
                threadId: msg.conversationId,
                subject,
                sender: { name: fromName, email: fromEmail },
                snippet: msg.bodyPreview || '',
                date,
                read: msg.isRead,
            };
        });
    } catch (error) {
        console.error('Outlook API Error (Search):', error);
        throw error;
    }
}

export async function getEmailBody(accessToken: string, messageId: string) {
    try {
        const res = await fetch(`${GRAPH_API_BASE}/messages/${messageId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch message details');
        const msg = await res.json();

        // Microsoft Graph provides the body directly
        const bodyContent = msg.body?.content || '';
        return bodyContent || msg.bodyPreview || '';
    } catch (error) {
        console.error('Outlook API Error (Body):', error);
        throw error;
    }
}

export async function getUnreadCount(accessToken: string, query?: string) {
    try {
        // Option 1: Basic Unread count from Inbox
        if (!query) {
            const res = await fetch(`${GRAPH_API_BASE}/mailFolders/inbox`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error('Failed to fetch inbox details');
            const data = await res.json();
            return data.unreadItemCount || 0;
        }

        // Option 2: Search with unread filter
        // Note: Graph API $search requires consistency level eventual and Top=1 requires special handling for counting
        // We will do a $filter instead if it's a simple query, but $search doesn't mix well with $filter.
        // For simplicity, we just filter by isRead eq false
        const filterStr = query ? `&$search=${encodeURIComponent(`"${query}" AND isRead:false`)}` : `?$filter=isRead eq false`;
        const res = await fetch(`${GRAPH_API_BASE}/messages${filterStr}`, {
            headers: { 
                Authorization: `Bearer ${accessToken}`,
                ConsistencyLevel: 'eventual'
            },
        });

        if (!res.ok) throw new Error('Failed to fetch filtered unread messages');
        const data = await res.json();
        return data.value?.length || 0;
    } catch (error) {
        console.error('Outlook API Error (Unread Count):', error);
        // Fallback to 0 if we hit query limitations
        return 0;
    }
}

export async function getLabels(accessToken: string) {
    try {
        const res = await fetch(`${GRAPH_API_BASE}/masterCategories`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch categories (labels)');
        const data = await res.json();
        
        // Map Master Categories to "Labels"
        return (data.value || []).map((cat: any) => ({
            id: cat.displayName, // Categories don't have UUIDs in the same way, displayName is the identifier
            name: cat.displayName
        }));
    } catch (error) {
        console.error('Outlook API Error (Get Labels):', error);
        // Sometimes MasterCategories requires mailbox access that might be missing, fail silently
        return [];
    }
}

export async function createLabel(accessToken: string, name: string) {
    try {
        const res = await fetch(`${GRAPH_API_BASE}/masterCategories`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                displayName: name,
                color: "preset1" // default color
            })
        });

        if (!res.ok) {
            const err = await res.json();
            // If it already exists, just return it
            if (err.error?.code === 'ErrorCategoryExists') {
                return { id: name, name: name };
            }
            throw new Error(`Failed to create category: ${JSON.stringify(err)}`);
        }

        const data = await res.json();
        return { id: data.displayName, name: data.displayName };
    } catch (error) {
        console.error('Outlook API Error (Create Label):', error);
        throw error;
    }
}

export async function getOrCreateLabel(accessToken: string, name: string): Promise<string> {
    const labels = await getLabels(accessToken);
    const existing = labels.find((l: any) => l.name.toLowerCase() === name.toLowerCase());

    if (existing) {
        return existing.id;
    }

    const newLabel = await createLabel(accessToken, name);
    return newLabel.id;
}

export async function modifyMessage(
    accessToken: string,
    messageId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
) {
    try {
        // First get the message to see existing categories
        const getRes = await fetch(`${GRAPH_API_BASE}/messages/${messageId}?$select=categories`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!getRes.ok) throw new Error('Failed to get message for modification');
        const msg = await getRes.json();
        let categories = new Set<string>(msg.categories || []);

        // Apply changes
        addLabelIds.forEach(id => categories.add(id));
        removeLabelIds.forEach(id => categories.delete(id));

        const res = await fetch(`${GRAPH_API_BASE}/messages/${messageId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categories: Array.from(categories)
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Failed to modify message: ${JSON.stringify(err)}`);
        }

        return await res.json();
    } catch (error) {
        console.error('Outlook API Error (Modify Message):', error);
        throw error;
    }
}
