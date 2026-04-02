"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { getAiResponse } from "@/app/actions";
import { Message } from "@/lib/types";

export function AIChatbot() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', role: 'assistant', content: "Hi! I'm your AI email assistant. I can help you refine drafts, suggest replies, or answer questions about your emails." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const SUGGESTIONS = [
        "Summarize my recent emails",
        "How many unread emails do I have?",
        "Find emails from GitHub",
    ];

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll on messages or status change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        const currentInput = input;
        setInput("");

        try {
            const aiMessage = await getAiResponse(currentInput);
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error("Failed to get response:", err);
            setError("Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionSend = async (suggestionText: string) => {
        if (isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: suggestionText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const aiMessage = await getAiResponse(suggestionText);
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error("Failed to get response:", err);
            setError("Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = async () => {
        // Retry last user message if possible? 
        // For now just clear error and let user type again or logic to retry last message
        // Simplest to just clear error
        setError(null);
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        onClick={() => setIsChatOpen(true)}
                        id="tour-chatbot"
                        aria-label="Open chat assistant"
                        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-accent to-purple-500 text-white shadow-2xl shadow-accent/30 flex items-center justify-center hover:scale-110 transition-transform z-50"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-[80px] right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[65vh] sm:h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-purple-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                                    <p className="text-xs text-muted-foreground">Always here to help</p>
                                </div>                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                aria-label="Close chat assistant"
                                className="p-1.5 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                                            msg.role === "user"
                                                ? "bg-accent text-accent-foreground"
                                                : "bg-secondary text-foreground"
                                        )}
                                    >
                                        <div className="prose break-words">
                                            {/* Prior implementation had parts logic, removing that as new backend returns string content directly */}
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 text-xs bg-red-50 border border-red-200 rounded-lg"
                                >
                                    <p className="text-red-700 font-medium mb-2">Error: {error}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Retry
                                    </button>
                                </motion.div>
                            )}

                            {messages.length === 1 && !isLoading && (
                                <div className="flex flex-col gap-2 mt-4">
                                    <p className="text-xs text-muted-foreground ml-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTIONS.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setInput(suggestion);
                                                    // optionally we could auto-send, but let's just populate input for safety, 
                                                    // or actually, sending immediately is better UX:
                                                    handleSuggestionSend(suggestion);
                                                }}
                                                className="text-xs px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium rounded-full transition-colors text-left"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 bg-secondary border border-transparent focus:border-accent/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
