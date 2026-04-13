# XeloFlow — AI-Powered Gmail Automation

> **Your intelligent inbox companion.** XeloFlow connects to your Gmail account and lets you build smart bots that auto-reply, follow up, label, and organize emails — powered by Google Gemini AI.

---

## ✨ Features

- **Email Urgency Scoring** — AI rates every incoming email 1–10 so you focus on what matters
- **AI Draft Generation** — One-click Gemini-powered reply drafts tailored to the email context
- **Email Bots** — Configure trigger-based bots that run automatically:
  - Auto-reply (customer support, sales inquiries, out-of-office)
  - Follow-up reminders for unanswered emails
  - Invoice/receipt organizer
  - Label, mark-as-read, and forward actions
- **Smart Inbox Dashboard** — Glassmorphic UI with real-time urgency, sentiment, and topic analysis
- **Subscription Tiers** — Free, Starter, and Pro plans via PayPal

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI | Google Gemini via Genkit |
| Auth | NextAuth v5 (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| Payments | PayPal Subscriptions |
| Styling | Tailwind CSS v4 + Framer Motion |
| Hosting | Vercel |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/xeloflow-assist.git
cd xeloflow-assist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials. See the [Environment Variables](#-environment-variables) section below.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for a full list of required variables. Key ones:

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for NextAuth — generate with `npx auth secret` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio API key |
| `PAYPAL_CLIENT_ID` | PayPal app client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal app client secret |
| `CRON_SECRET` | Secret used to authenticate Vercel cron jobs |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web Application)
3. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://YOUR_VERCEL_DOMAIN/api/auth/callback/google` (production)
4. Enable the **Gmail API** in the APIs & Services library

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Update Google OAuth redirect URI to your Vercel production URL
5. Deploy!

---

## 📄 Legal

- [Privacy Policy](/privacy)
- [Terms of Service](/terms)
- Contact: [xeloflow.support@gmail.com](mailto:xeloflow.support@gmail.com)

---

## 📝 License

Private — All rights reserved.
