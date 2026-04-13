import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, posts } from '../posts';
import type { Metadata } from 'next';
import BlogLayoutClient from '../BlogLayoutClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found' };
    return {
        title: `${post.title} — XeloFlow Blog`,
        description: post.description,
    };
}

export async function generateStaticParams() {
    return posts.map((post) => ({ slug: post.slug }));
}

function renderContent(content: string): React.ReactNode[] {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={key++} className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
                    {line.replace('## ', '')}
                </h2>
            );
        } else if (line.startsWith('### ')) {
            elements.push(
                <h3 key={key++} className="text-xl font-bold text-gray-800 dark:text-zinc-200 mt-8 mb-3">
                    {line.replace('### ', '')}
                </h3>
            );
        } else if (line.startsWith('---')) {
            elements.push(
                <hr key={key++} className="my-8 border-gray-100 dark:border-white/5" />
            );
        } else if (line.startsWith('| ')) {
            // Table: collect all table rows
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            i--; // step back one since the loop will increment

            const [header, , ...rows] = tableLines;
            const headers = header.split('|').filter(Boolean).map(h => h.trim());
            const dataRows = rows.map(r => r.split('|').filter(Boolean).map(c => c.trim()));

            elements.push(
                <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5">
                                {headers.map((h, idx) => (
                                    <th key={idx} className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-zinc-300 border-b border-gray-100 dark:border-white/10">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/50 dark:bg-white/[0.02]'}>
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-3 text-gray-600 dark:text-zinc-400 border-b border-gray-50 dark:border-white/5">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (line.startsWith('- ')) {
            // Collect all list items
            const listItems: string[] = [];
            while (i < lines.length && lines[i].startsWith('- ')) {
                listItems.push(lines[i].replace('- ', ''));
                i++;
            }
            i--;

            elements.push(
                <ul key={key++} className="my-4 space-y-2 pl-0">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-zinc-400">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-violet-600 dark:text-violet-400 underline hover:text-violet-800 dark:hover:text-violet-300">$1</a>') }} />
                        </li>
                    ))}
                </ul>
            );
        } else if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={key++} className="my-6 border-l-4 border-violet-400 pl-5 py-2 bg-violet-50/50 dark:bg-violet-900/10 rounded-r-xl text-gray-700 dark:text-zinc-300 italic">
                    {line.replace('> ', '')}
                </blockquote>
            );
        } else if (line.trim() === '') {
            // skip empty lines (whitespace)
        } else {
            // Regular paragraph — handle inline bold/italic/links
            const html = line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-violet-600 dark:text-violet-400 underline hover:text-violet-800 dark:hover:text-violet-300">$1</a>');

            elements.push(
                <p key={key++} className="text-gray-600 dark:text-zinc-400 leading-relaxed my-4"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            );
        }
    }

    return elements;
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const otherPosts = posts.filter(p => p.slug !== post.slug);

    return (
        <BlogLayoutClient>
            <div className="min-h-screen bg-[#FAFAF9] dark:bg-zinc-950">
                {/* Gradient Hero */}
                <div className={`bg-gradient-to-br ${post.coverGradient} pt-32 sm:pt-40 pb-20 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 text-sm font-medium group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            All Posts
                        </Link>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                                {post.category}
                            </span>
                            <span className="text-white/70 text-xs">{post.readTime}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                            {post.title}
                        </h1>

                        <p className="text-white/80 text-lg leading-relaxed mb-6">
                            {post.description}
                        </p>

                        <div className="flex items-center gap-3 mt-6">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white border border-white/30">
                                Z
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">XeloFlow Team</p>
                                <p className="text-white/60 text-xs">{post.date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Body */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-8 sm:p-12 prose-lg">
                        {renderContent(post.content)}
                    </div>

                    {/* CTA */}
                    <div className="mt-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 p-8 text-white text-center relative overflow-hidden shadow-xl shadow-orange-500/20">
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                backgroundSize: '30px 30px'
                            }}
                        />
                        <div className="relative">
                            <p className="text-4xl mb-2">⚡</p>
                            <h3 className="text-xl font-bold mb-2">Let AI do the heavy lifting</h3>
                            <p className="text-orange-100 text-sm mb-5">
                                XeloFlow automatically scores, sorts, and drafts replies for your Gmail inbox.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg"
                            >
                                Try it Free — No card needed →
                            </Link>
                        </div>
                    </div>

                    {/* More Posts */}
                    {otherPosts.length > 0 && (
                        <div className="mt-16">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">More from the Blog</h3>
                            <div className="grid gap-6">
                                {otherPosts.map(other => (
                                    <Link
                                        key={other.slug}
                                        href={`/blog/${other.slug}`}
                                        className="group flex gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${other.coverGradient} shrink-0 flex items-center justify-center text-2xl`}>
                                            {other.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{other.category}</span>
                                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors line-clamp-2 text-sm mt-0.5">
                                                {other.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-1">{other.date} · {other.readTime}</p>
                                        </div>
                                        <span className="text-gray-300 dark:text-zinc-600 group-hover:text-violet-400 transition-colors self-center">→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-white/5 py-8 text-center text-sm text-gray-400">
                    <Link href="/blog" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">← All Posts</Link>
                    <span className="mx-3">·</span>
                    <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">XeloFlow</Link>
                    <span className="mx-3">·</span>
                    <span>© 2026 XeloFlow</span>
                </div>
            </div>
        </BlogLayoutClient>
    );
}
