import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, user, profile }) {
            if (account && user) {
                if (account.refresh_token) {
                    try {
                        const { saveUserTokens } = await import("@/lib/db/user-storage");
                        await saveUserTokens(token.sub as string, user.email as string, {
                            refreshToken: account.refresh_token,
                            accessToken: account.access_token,
                            expiresAt: Math.floor(Date.now() / 1000) + (account.expires_in as number)
                        });
                    } catch (err) { console.error(err); }
                }
                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + (account.expires_in as number),
                    refresh_token: account.refresh_token,
                    role: 'user',
                }
            }
            if (Date.now() < (token.expires_at as number) * 1000) return token;
            try {
                const response = await fetch("https://oauth2.googleapis.com/token", {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: process.env.AUTH_GOOGLE_ID!,
                        client_secret: process.env.AUTH_GOOGLE_SECRET!,
                        grant_type: "refresh_token",
                        refresh_token: token.refresh_token as string,
                    }),
                    method: "POST",
                });
                const tokens = await response.json();
                if (!response.ok) throw tokens;
                return {
                    ...token,
                    access_token: tokens.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
                    refresh_token: tokens.refresh_token ?? token.refresh_token,
                }
            } catch (error) { return { ...token, error: "RefreshAccessTokenError" } }
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string || 'user';
                session.accessToken = token.access_token as string;
            }
            return session;
        },
    },
})
