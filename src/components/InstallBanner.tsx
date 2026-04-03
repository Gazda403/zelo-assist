"use client";

import { usePWA } from "./providers/PWAProvider";
import { Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallBanner() {
  const { isInstallable, installApp } = usePWA();

  return (
    <AnimatePresence>
      {isInstallable && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                 <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Install Zelo Assist</p>
                <p className="text-slate-400 text-xs">Add to your home screen for quick access</p>
              </div>
            </div>
            
            <button
              onClick={installApp}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Install
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
