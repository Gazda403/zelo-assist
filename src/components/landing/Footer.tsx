
import React from 'react';
import Link from 'next/link';
import { Mail, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Mail size={20} />
                            </div>
                            <span className="font-sans font-bold text-lg text-gray-900">Zelo Assist</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            Your intelligent companion for a calmer, more productive inbox.
                        </p>
                        <a
                            href="mailto:zelosupport@gmail.com"
                            className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium"
                        >
                            zelosupport@gmail.com
                        </a>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="mailto:zelosupport@gmail.com" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">© 2026 Zelo Assist. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Github size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

