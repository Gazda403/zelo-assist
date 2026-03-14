import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import fs from "fs"
import path from "path"

const LOG_FILE = path.join(process.cwd(), "auth-debug.log");
function debugLog(message: string, data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}: ${JSON.stringify(data)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
}

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
            // Initial sign in
            if (account && user) {
                debugLog("JWT Initial Sign-In - Profile Picture", profile?.picture);
                debugLog("JWT Initial Sign-In - User Image", user.image);

                // Save refresh token to Supabase for background jobs
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
                        console.log("Saved refresh token for user:", user.email);
                    } catch (err) {
                        console.error("Failed to save refresh token:", err);
                    }
                }

                // Fetch role from profiles
                let role = 'user';
                try {
                    const { createAdminClient } = await import("@/lib/supabase/admin");
                    const supabase = createAdminClient();
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.email)
                        .single();

                    if (profileData?.role) {
                        role = profileData.role;
                    }
                } catch (err) {
                    console.error("Failed to fetch user role:", err);
                }

                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + (account.expires_in as number),
                    refresh_token: account.refresh_token,
                    picture: profile?.picture || user.image || token.picture,
                    role: role,
                }
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.expires_at as number) * 1000) {
                return token
            }

            // Access token has expired, try to update it
            try {
                // We need the refresh token to get a new access token
                if (!token.refresh_token) {
                    console.error("No refresh token available");
                    throw new Error("No refresh token available");
                }

                const response = await fetch("https://oauth2.googleapis.com/token", {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: process.env.AUTH_GOOGLE_ID!,
                        client_secret: process.env.AUTH_GOOGLE_SECRET!,
                        grant_type: "refresh_token",
                        refresh_token: token.refresh_token as string,
                    }),
                    method: "POST",
                })

                const tokens = await response.json()

                if (!response.ok) throw tokens

                // Update refresh token in DB if a new one was issued
                if (tokens.refresh_token) {
                    try {
                        const { saveUserTokens } = await import("@/lib/db/user-storage");
                        // We might not have email here easily unless we fetch it or store it in token
                        // But we have sub (token.sub)
                        // For email, we might need to rely on what's in the token already
                        await saveUserTokens(
                            token.sub as string,
                            token.email as string, // Assuming email is in token
                            {
                                refreshToken: tokens.refresh_token,
                                accessToken: tokens.access_token,
                                expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in
                            }
                        );
                        console.log("Updated refresh token for user:", token.sub);
                    } catch (err) {
                        console.error("Failed to update refresh token:", err);
                    }
                }

                return {
                    ...token,
                    access_token: tokens.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
                    // Fall back to old refresh token
                    refresh_token: tokens.refresh_token ?? token.refresh_token,
                }
            } catch (error) {
                console.error("Error refreshing access token", error)
                return { ...token, error: "RefreshAccessTokenError" }
            }
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.image = (token.picture || token.image || session.user.image) as string;
                session.user.role = token.role as string || 'user';
                session.accessToken = token.access_token as string;
                session.error = token.error as string | undefined;
                debugLog("Session Callback - Image", session.user.image);
            }
            return session
        },
    },
})

declare module "next-auth" {
    interface Session {
        accessToken?: string
        error?: string
        user: {
            id?: string
            email?: string
            name?: string
            image?: string
            role?: string
        }
    }
}
