import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
function debugLog(message: string, data: any) {
    const timestamp = new Date().toISOString();
    console.log(`[AUTH DEBUG][${timestamp}] ${message}:`, data);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
        {
            id: "microsoft-entra-id",
            name: "Microsoft",
            type: "oauth",
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            authorization: {
                url: "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
                params: {
                    scope: "User.Read Mail.Read Mail.ReadWrite Mail.Send offline_access",
                    prompt: "consent",
                    response_type: "code",
                },
            },
            token: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
            userinfo: "https://graph.microsoft.com/v1.0/me",
            profile(profile: any) {
                return {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.mail ?? profile.userPrincipalName,
                    image: null,
                }
            },
        } as any,
    ],
    callbacks: {
        async jwt({ token, account, user, profile }) {
            // Initial sign in
            if (account && user) {
                debugLog("JWT Initial Sign-In - Profile Picture", profile?.picture);
                debugLog("JWT Initial Sign-In - User Image", user.image);

                const { createAdminClient } = await import("@/lib/supabase/admin");
                const supabase = createAdminClient();

                let stableUserId = user.id;
                if (user.email) {
                    const { data: existingUsers } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .order('created_at', { ascending: false })
                        .limit(1);
                        
                    if (existingUsers && existingUsers.length > 0) {
                        stableUserId = existingUsers[0].id;
                    }
                }
                
                token.sub = stableUserId;

                // Save refresh token to Supabase for background jobs
                if (account.refresh_token) {
                    try {
                        const { saveUserTokens } = await import("@/lib/db/user-storage");
                        await saveUserTokens(
                            stableUserId,
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

                // Fetch role from profiles & detect first-time login
                let role = 'user';
                let isNewUser = false;
                try {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, onboarding_completed')
                        .eq('id', stableUserId)
                        .single();

                    if (profileError || !profileData) {
                        // No profile yet — this is a first-time login
                        isNewUser = true;
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: stableUserId, // Use stable UUID instead of email
                                full_name: user.name,
                                avatar_url: profile?.picture || user.image,
                                role: 'user',
                                onboarding_completed: false,
                                first_login_at: new Date().toISOString(),
                            });
                        if (insertError) {
                            console.error("Failed to create profile for new user:", insertError);
                        } else {
                            console.log("Created profile for new user:", stableUserId);
                        }
                    } else {
                        role = profileData.role || 'user';
                        // Returning user — show guide only if not yet completed
                        isNewUser = !profileData.onboarding_completed;
                    }
                } catch (err) {
                    console.error("Failed to fetch/create user profile:", err);
                }

                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: Math.floor(Date.now() / 1000) + (account.expires_in as number),
                    refresh_token: account.refresh_token,
                    picture: profile?.picture || user.image || token.picture,
                    role: role,
                    isNewUser: isNewUser,
                    provider: account.provider,
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

                let tokens;
                if (token.provider === "microsoft-entra-id") {
                    const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
                            client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
                            grant_type: "refresh_token",
                            refresh_token: token.refresh_token as string,
                        }),
                        method: "POST",
                    });
                    tokens = await response.json();
                    if (!response.ok) throw tokens;
                } else {
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
                    tokens = await response.json();
                    if (!response.ok) throw tokens;
                }

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
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.image = (token.picture || token.image || session.user.image) as string;
                session.user.role = token.role as string || 'user';
                session.user.isNewUser = (token.isNewUser as boolean) ?? false;
                session.accessToken = token.access_token as string;
                session.provider = token.provider as string;
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
        provider?: string
        error?: string
        user: {
            id?: string
            email?: string
            name?: string
            image?: string
            role?: string
            isNewUser?: boolean
        }
    }
}
