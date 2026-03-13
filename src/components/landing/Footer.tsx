import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Mail className="text-primary" />
                        <span className="font-bold">Zelo Assist</span>
                    </div>
                    <p className="text-sm text-gray-500">Your intelligent companion for a calmer, more productive inbox.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Legal</h4>
                    <ul className="text-sm space-y-2">
                        <li><Link href="/privacy">Privacy Policy</Link></li>
                        <li><Link href="/terms">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
