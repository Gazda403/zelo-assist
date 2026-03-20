'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Zelo Assist</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-violet-100 p-1.5 rounded-lg">
                            <Shield className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Legal</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: March 12, 2026</p>
                </div>

                <div className="prose prose-gray prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-semibold
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-li:text-gray-600
                    prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                ">
                    <h2>1. Introduction</h2>
                    <p>
                        Zelo Assist (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, and safeguard your information when you use
                        our email productivity application (&quot;the Service&quot;).
                    </p>
                    <p>
                        By using Zelo Assist, you agree to the collection and use of information in accordance with this policy.
                        If you do not agree with this policy, please do not use our Service.
                    </p>

                    <h2>2. Information We Collect</h2>

                    <h3>2.1 Account Information</h3>
                    <p>When you sign in with Google, we receive:</p>
                    <ul>
                        <li>Your name and email address</li>
                        <li>Your Google profile picture</li>
                        <li>An OAuth access token to interact with Gmail on your behalf</li>
                    </ul>

                    <h3>2.2 Email Data</h3>
                    <p>
                        To provide our Service, we access your Gmail data through the Gmail API. This includes:
                    </p>
                    <ul>
                        <li>Email metadata (sender, subject, date, labels)</li>
                        <li>Email body content (for AI-powered features like draft generation and urgency scoring)</li>
                        <li>Thread information (for follow-up tracking)</li>
                    </ul>
                    <p>
                        <strong>We do not store the full content of your emails on our servers.</strong> Email data is processed
                        in real-time and only metadata (subject lines, sender info, urgency scores) may be cached temporarily
                        to improve performance.
                    </p>

                    <h3>2.3 Bot Configuration Data</h3>
                    <p>
                        When you create email bots, we store your bot configurations, rules, templates, and execution logs
                        in our secure database to provide personalized automation.
                    </p>

                    <h3>2.4 Usage Analytics</h3>
                    <p>
                        We may collect anonymized usage data such as feature usage frequency, bot execution counts,
                        and general app performance metrics to improve our Service.
                    </p>

                    {/* Google API Services User Data Policy - CRITICAL for verification */}
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 my-8 not-prose">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-600" />
                            Google API Services User Data Policy
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Zelo Assist&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                            <a
                                href="https://developers.google.com/terms/api-services-user-data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-600 font-medium hover:underline"
                            >
                                Google API Services User Data Policy
                            </a>
                            , including the Limited Use requirements.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Specifically, Zelo Assist:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Only uses Gmail data to provide and improve the email automation features you explicitly configure.</li>
                            <li>Does <strong>not</strong> use Gmail data for serving advertisements.</li>
                            <li>Does <strong>not</strong> sell or transfer your email data to third parties.</li>
                            <li>Does <strong>not</strong> use your email data for purposes unrelated to the Service.</li>
                            <li>Allows human access to your data only with your explicit consent, for security purposes, to comply with applicable law, or for our internal operations (limited to aggregated, anonymized data).</li>
                        </ul>
                    </div>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Authenticate you and provide secure access to the Service</li>
                        <li>Enable AI-powered email features (urgency scoring, draft generation, sentiment analysis)</li>
                        <li>Execute email bots and automation rules you configure</li>
                        <li>Send follow-up reminders and notifications based on your bot settings</li>
                        <li>Improve and optimize the Service</li>
                    </ul>

                    <h2>4. Data Storage & Security</h2>
                    <p>
                        Your account data and bot configurations are stored securely using <strong>Supabase</strong>, which
                        provides enterprise-grade security including encryption at rest and in transit.
                    </p>
                    <p>
                        OAuth tokens are stored securely and are never exposed to the client-side application.
                        We use industry-standard HTTPS encryption for all data transmission.
                    </p>

                    <h2>5. Third-Party Services</h2>
                    <p>We use the following third-party services:</p>
                    <ul>
                        <li><strong>Google Gmail API</strong> — to read, draft, and send emails on your behalf</li>
                        <li><strong>Google Gemini AI</strong> — to power AI features (urgency scoring, draft generation)</li>
                        <li><strong>Supabase</strong> — for authentication and data storage</li>
                        <li><strong>PayPal</strong> — for subscription payment processing</li>
                    </ul>
                    <p>Each of these services has their own privacy policies, and we encourage you to review them.</p>

                    <h2>6. Data Retention & Deletion</h2>
                    <p>
                        We retain your data only as long as your account is active. You may request deletion of your account
                        and all associated data at any time by contacting us at{' '}
                        <a href="mailto:zelosupport@gmail.com">zelosupport@gmail.com</a>.
                    </p>
                    <p>
                        Upon account deletion, we will remove all your personal data, bot configurations, and cached
                        metadata within 30 days.
                    </p>

                    <h2>7. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Access</strong> — request a copy of your personal data</li>
                        <li><strong>Rectification</strong> — request correction of inaccurate data</li>
                        <li><strong>Deletion</strong> — request deletion of your account and data</li>
                        <li><strong>Portability</strong> — receive your data in a structured format</li>
                        <li><strong>Revoke Access</strong> — disconnect Zelo Assist from your Google account at any time via{' '}
                            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                                Google Account Permissions
                            </a>
                        </li>
                    </ul>

                    <h2>8. Children&apos;s Privacy</h2>
                    <p>
                        Zelo Assist is not intended for use by children under the age of 13. We do not knowingly collect
                        personal information from children under 13.
                    </p>

                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                        the new policy on this page and updating the &quot;Last updated&quot; date.
                    </p>

                    <h2>10. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <ul>
                        <li>Email: <a href="mailto:zelosupport@gmail.com">zelosupport@gmail.com</a></li>
                    </ul>
                </div>
            </main>

            {/* Mini Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">© 2026 Zelo Assist. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link href="/privacy" className="text-violet-600 font-medium">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
