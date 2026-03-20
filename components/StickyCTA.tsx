import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const StickyCTA: React.FC = () => {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 2, type: 'spring' }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto"
    >
      <a 
        href="#demo"
        className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-gray-900/40 border border-gray-700/50 backdrop-blur-md"
      >
        <span className="font-medium text-sm whitespace-nowrap">Start writing better emails</span>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
           <ArrowUpRight size={16} />
        </div>
      </a>
    </motion.div>
  );
};

export default StickyCTA;