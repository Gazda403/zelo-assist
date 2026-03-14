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
        async jwt({ token, account, user }) {
            if (account && user) {
                if (account.refresh_token) {
                    try {
                        const { saveUserTokens } = await import("@/lib/db/user-storage");
                        await saveUserTokens(
                            token.sub as string,
                            user.email as string,
                            {
                                refreshToken: account.refresh_token,
                                accessToken: account.access_token,
                                expiresAt: Math.floor(Date.now() / 1000) + (account.expires_in as number)
                            }
                        );
                    } catch (err) {
                        console.error("Failed to save tokens:", err);
                    }
                }
                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + (account.expires_in as number),
                    refresh_token: account.refresh_token,
                }
            }
            if (Date.now() < (token.expires_at as number) * 1000) return token;
            // Token refresh logic omitted for brevity in sync, assuming handled by next-auth
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.accessToken = token.access_token as string;
            }
            return session;
        },
    },
})
