import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
         <div className="absolute top-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
         <div className="absolute top-40 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
        >
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-600">Powered by Gemini 3 Flash</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
        >
          Email calmness, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            delivered instantly.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Turn chaotic inboxes into structured peace. InboxZen writes your replies, prioritizes your day, and gives you back your time.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a 
            href="#demo"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:-translate-y-1 shadow-lg shadow-orange-500/30"
          >
            Try it Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Border Beam Effect (simplified with CSS for performance) */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
          </a>
          
          <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:text-gray-900 hover:-translate-y-1 shadow-sm hover:shadow-md">
            View Pricing
          </button>
        </motion.div>

        {/* Hero Image / Visualization */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 40 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
           className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200">
             <div className="absolute top-0 w-full h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
             </div>
             <img 
               src="https://picsum.photos/1200/600?grayscale" 
               alt="App Dashboard" 
               className="w-full h-auto pt-12 opacity-90"
             />
             {/* Floating Badge */}
             <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
             >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Time Saved</p>
                  <p className="text-lg font-bold text-gray-900">2h 14m</p>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;