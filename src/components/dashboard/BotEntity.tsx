"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function BotEntity({ className }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
            {/* Outer Glowing Ring */}
            <motion.div
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/40 via-purple-500/20 to-transparent blur-xl"
            />
            
            {/* The Main "Glass" Body */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-accent to-purple-500 p-[1px] shadow-lg shadow-accent/20 z-10"
            >
                <div className="w-full h-full rounded-2xl bg-card/40 backdrop-blur-md flex items-center justify-center overflow-hidden">
                    {/* Inner animated gradient */}
                    <motion.div
                        animate={{ 
                            x: [-20, 20, -20],
                            y: [-20, 20, -20]
                        }}
                        transition={{ 
                            duration: 10, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-500/20 blur-2xl"
                    />
                    
                    <Sparkles className="w-1/2 h-1/2 text-white relative z-20 animate-pulse" />
                </div>
            </motion.div>

            {/* Floating particles (Optional, adds "Life") */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [-10, 10, -10],
                        x: [-10, 10, -10],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                    }}
                    className="absolute w-1 h-1 bg-accent rounded-full blur-[1px]"
                    style={{
                        top: `${20 + i * 30}%`,
                        left: `${20 + i * 30}%`
                    }}
                />
            ))}
        </div>
    );
}
