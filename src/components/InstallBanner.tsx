"use client";

import { usePWA } from "./providers/PWAProvider";
import { Download, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function InstallBanner() {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const dismissedAt = localStorage.getItem('pwa_banner_dismissed_at');
      const now = new Date().getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (!dismissedAt || now - parseInt(dismissedAt) > sevenDays) {
        // Initial delay for smoother entry
        const showTimer = setTimeout(() => setIsVisible(true), 2000);
        
        // Auto-dismiss after 10 seconds of visibility
        const hideTimer = setTimeout(() => setIsVisible(false), 12000); 
        
        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }
    } else {
      setIsVisible(false);
    }
  }, [isInstallable]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_banner_dismissed_at', new Date().getTime().toString());
  };

  const handleInstall = async () => {
    await installApp();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-sm"
        >
          <div className="relative overflow-hidden bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-5 group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/30 transition-colors duration-500" />
            
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                   <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-foreground font-bold text-sm tracking-tight">Install Zelo Assist</h4>
                  <p className="text-muted-foreground text-[11px] leading-tight font-medium">Get the premium app experience on your device</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-accent/10 active:scale-95"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
