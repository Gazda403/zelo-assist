'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
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
                            <Scale className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Legal</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
                    <p className="text-gray-500">Last updated: March 12, 2026</p>
                </div>

                <div className="prose prose-gray prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-semibold
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-li:text-gray-600
                    prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                ">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Zelo Assist (&quot;the Service&quot;), you agree to be bound by these Terms of Service
                        (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
                    </p>
                    <p>
                        These Terms constitute a legally binding agreement between you and Zelo Assist (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Zelo Assist is an AI-powered email productivity application that integrates with Gmail to provide:
                    </p>
                    <ul>
                        <li>Email urgency scoring and prioritization</li>
                        <li>AI-generated draft replies</li>
                        <li>Automated email bots (auto-reply, follow-up, labeling, forwarding)</li>
                        <li>Email organization and management tools</li>
                    </ul>

                    <h2>3. User Accounts</h2>
                    <h3>3.1 Registration</h3>
                    <p>
                        You must sign in using a valid Google account to use the Service. You are responsible for maintaining
                        the security of your Google account credentials.
                    </p>
                    <h3>3.2 Account Responsibility</h3>
                    <p>
                        You are responsible for all activity that occurs under your account. You agree to notify us immediately
                        at <a href="mailto:zelosupport@gmail.com">zelosupport@gmail.com</a> if you suspect unauthorized use of your account.
                    </p>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Send spam, bulk unsolicited emails, or phishing messages</li>
                        <li>Harass, abuse, or harm other individuals</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Impersonate another person or entity</li>
                        <li>Interfere with or disrupt the integrity or performance of the Service</li>
                        <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                        <li>Use the automated bot features to circumvent Gmail&apos;s terms of service or sending limits</li>
                    </ul>
                    <p>
                        We reserve the right to suspend or terminate your account if we believe you are violating these Terms.
                    </p>

                    <h2>5. Subscription & Payments</h2>
                    <h3>5.1 Free Tier</h3>
                    <p>
                        Zelo Assist offers a free tier with limited features. No payment information is required to use the free tier.
                    </p>
                    <h3>5.2 Paid Plans</h3>
                    <p>
                        Premium features are available through paid subscription plans. Pricing and feature details are
                        available on our <Link href="/#pricing">Pricing page</Link>.
                    </p>
                    <h3>5.3 Billing</h3>
                    <p>
                        Subscriptions are billed on a recurring basis (monthly or yearly) through PayPal. You authorize
                        us to charge your selected payment method for the applicable subscription fees.
                    </p>
                    <h3>5.4 Cancellation & Refunds</h3>
                    <p>
                        You may cancel your subscription at any time. Upon cancellation, you will retain access to paid
                        features until the end of your current billing period. We do not offer refunds for partial billing periods.
                    </p>

                    <h2>6. AI-Generated Content</h2>
                    <p>
                        Zelo Assist uses artificial intelligence to generate email drafts, urgency scores, and other content.
                        You acknowledge that:
                    </p>
                    <ul>
                        <li>AI-generated content may not always be accurate, appropriate, or complete</li>
                        <li>You are solely responsible for reviewing and approving any content before it is sent</li>
                        <li>When using auto-send bot features, you accept full responsibility for emails sent automatically on your behalf</li>
                        <li>We are not liable for any consequences arising from AI-generated content</li>
                    </ul>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8 not-prose">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">⚠️ Auto-Send Disclaimer</h3>
                        <p className="text-gray-700 leading-relaxed">
                            When you enable auto-send on any bot, emails will be sent <strong>without manual review</strong>.
                            You are fully responsible for configuring appropriate safety guards (daily limits, cooldowns,
                            recipient filters) and for any emails sent automatically by your bots.
                        </p>
                    </div>

                    <h2>7. Intellectual Property</h2>
                    <p>
                        The Service, including its design, features, and codebase, is owned by Zelo Assist. You retain
                        ownership of your email content and bot configurations. By using the Service, you grant us a
                        limited license to process your data solely for the purpose of providing the Service.
                    </p>

                    <h2>8. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, Zelo Assist shall not be liable for:
                    </p>
                    <ul>
                        <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                        <li>Any loss of data, profits, revenue, or business opportunities</li>
                        <li>Any damages arising from emails sent by automated bots</li>
                        <li>Any interruption or downtime of the Service</li>
                        <li>Any third-party actions or services (Google, PayPal, etc.)</li>
                    </ul>
                    <p>
                        Our total liability to you for any claims arising from or related to the Service shall not exceed
                        the amount you paid us in the 12 months preceding the claim.
                    </p>

                    <h2>9. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express
                        or implied, including but not limited to implied warranties of merchantability, fitness for a
                        particular purpose, and non-infringement.
                    </p>

                    <h2>10. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your access at any time, with or without cause, and
                        with or without notice. Upon termination, your right to use the Service will cease immediately.
                    </p>
                    <p>
                        You may also terminate your account at any time by contacting us at{' '}
                        <a href="mailto:zelosupport@gmail.com">zelosupport@gmail.com</a> and requesting account deletion.
                    </p>

                    <h2>11. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify you of material changes by
                        posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
                        Continued use of the Service after changes constitutes your acceptance of the revised Terms.
                    </p>

                    <h2>12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with applicable laws.
                        Any disputes arising from these Terms shall be resolved through good-faith negotiation
                        before pursuing any legal remedies.
                    </p>

                    <h2>13. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:
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
                        <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-violet-600 font-medium">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
