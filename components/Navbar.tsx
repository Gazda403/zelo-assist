import React from 'react';
import { Mail } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Mail size={24} />
            </div>
            <span className="font-sans font-bold text-xl text-gray-900 tracking-tight">InboxZen</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Live Demo</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Testimonials</a>
          </div>
          <button className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;