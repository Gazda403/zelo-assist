import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, Copy, Check } from 'lucide-react';
import { generateEmailReply } from '../services/geminiService';
import { Tone } from '../types';

const DemoSection: React.FC = () => {
  const [input, setInput] = useState("Hey, are we still on for the meeting tomorrow at 10 AM? I might need to reschedule to 2 PM.");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>(Tone.Professional);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput(""); // Clear previous
    const result = await generateEmailReply(input, tone);
    setOutput(result);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-24 bg-[#FAFAF9] relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-30 bg-mesh blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See it in action</h2>
          <p className="text-gray-600">Paste an email and watch InboxZen draft the perfect reply.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Input Card */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-200 flex flex-col h-full">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>Incoming Email</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Step 1</span>
            </label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full flex-grow p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none transition-all font-body text-gray-700"
              placeholder="Paste an email here..."
              rows={8}
            />
            
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Tone</label>
              <div className="flex gap-2 mb-6">
                {Object.values(Tone).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      tone === t 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={loading || !input}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                {loading ? (
                  <RefreshCw className="animate-spin w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {loading ? 'Thinking...' : 'Generate Draft'}
              </button>
            </div>
          </div>

          {/* Output Card */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-200 flex flex-col h-full relative overflow-hidden">
             {/* Decor Beam */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>AI Draft</span>
                {output && <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-md">Generated</span>}
              </label>
              {output && (
                <button 
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              )}
            </div>

            <div className="flex-grow bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
              <AnimatePresence mode='wait'>
                {output ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
                  >
                    {output}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-gray-400"
                  >
                    {loading ? (
                       <div className="space-y-3 w-full max-w-xs">
                         <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                         <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
                         <div className="h-2 bg-gray-200 rounded animate-pulse w-5/6 mx-auto"></div>
                       </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Send className="text-gray-300 w-8 h-8" />
                        </div>
                        <p className="text-sm">Your generated email will appear here.</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
               <p className="text-xs text-gray-400">AI generated content may require review.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DemoSection;