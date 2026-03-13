"use client";
import React from 'react';
import { Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';

const Navbar = ({ onGetStarted }: any) => {
    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="h-14 px-12 flex items-center justify-between bg-white/45 backdrop-blur-xl border rounded-full w-full max-w-4xl">
                <div className="flex items-center space-x-2">
                    <Mail className="text-primary" />
                    <span className="font-bold">Zelo Assist</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onGetStarted} className="px-5 py-2 text-sm bg-gray-900 text-white rounded-full">Get Started</button>
                    <button onClick={() => signIn('google')} className="px-5 py-2 text-sm bg-primary text-white rounded-full">Log In</button>
                </div>
            </nav>
        </div>
    );
};
export default Navbar;
