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
        // Pop up after 5 seconds
        const showTimer = setTimeout(() => setIsVisible(true), 5000);
        
        // Hide after 7 seconds of visibility (5000 + 7000 = 12000)
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
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-6 z-[110]"
        >
          <div className="flex items-center gap-3 p-2 pr-4 bg-background/80 dark:bg-black/80 backdrop-blur-xl border border-border shadow-2xl rounded-full">
            <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/5 shrink-0 overflow-hidden border border-border/50">
               <img src="/logo.png" alt="XeloFlow" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col mr-2">
              <span className="text-sm font-bold leading-tight">Install App</span>
              <span className="text-[10px] text-muted-foreground font-medium">Faster experience</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <button
                onClick={handleInstall}
                className="text-xs font-bold px-3 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-full transition-all active:scale-95"
              >
                Add
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
