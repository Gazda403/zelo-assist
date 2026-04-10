import React from 'react';
import Link from 'next/link';
import { posts } from './posts';
import type { Metadata } from 'next';
import BlogLayoutClient from './BlogLayoutClient';

export const metadata: Metadata = {
    title: 'Blog — Zelo Assist',
    description: 'Tips, guides, and insights on email productivity, AI tools, and inbox management for busy professionals.',
};

export default function BlogPage() {
    return (
        <BlogLayoutClient>
            <div className="min-h-screen bg-[#FAFAF9] dark:bg-zinc-950">
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-white/5 pt-32 sm:pt-40 pb-16 sm:pb-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-8 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            Back to Zelo Assist
                        </Link>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-1 w-10 rounded-full bg-gradient-to-r from-orange-400 to-violet-500" />
                            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">The Blog</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            Work Smarter.<br />
                            <span className="bg-gradient-to-r from-orange-400 to-violet-500 bg-clip-text text-transparent">
                                Own Your Inbox.
                            </span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl">
                            Practical guides for founders, recruiters, and operators who want to spend less time on email and more time on work that matters.
                        </p>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group block bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Cover */}
                                <div className={`h-48 bg-gradient-to-br ${post.coverGradient} relative overflow-hidden flex items-center justify-center`}>
                                    <span className="text-7xl select-none opacity-80">{post.emoji}</span>
                                    <div className="absolute inset-0 bg-black/10" />
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-gray-400">{post.readTime}</span>
                                    </div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                        {post.description}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{post.date}</span>
                                        <span className="text-sm font-semibold text-violet-600 group-hover:gap-2 flex items-center gap-1 transition-all">
                                            Read →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA Banner */}
                    <div className="mt-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 text-white text-center relative overflow-hidden shadow-xl shadow-violet-500/20">
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}
                        />
                        <div className="relative">
                            <p className="text-4xl mb-3">✉️</p>
                            <h3 className="text-2xl font-bold mb-2">Ready to take back your inbox?</h3>
                            <p className="text-violet-200 mb-6 text-sm">
                                Zelo Assist connects to your Gmail and automatically organizes, scores and drafts replies for you.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-6 py-3 rounded-full hover:bg-violet-50 transition-colors shadow-lg"
                            >
                                Try Zelo Assist Free →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-white/5 py-8 text-center text-sm text-gray-400">
                    <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">← Back to Zelo Assist</Link>
                    <span className="mx-3">·</span>
                    <span>© 2026 Zelo Assist. All rights reserved.</span>
                </div>
            </div>
        </BlogLayoutClient>
    );
}
