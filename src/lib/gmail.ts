const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
export async function getLastEmails(token: string) {
    const res = await fetch(`${GMAIL_API_BASE}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    return res.json();
}
export async function sendEmail(token: string, to: string, subject: string, body: string) {
    return fetch(`${GMAIL_API_BASE}/messages/send`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ raw: btoa(`To: ${to}\nSubject: ${subject}\n\n${body}`) }) });
}
