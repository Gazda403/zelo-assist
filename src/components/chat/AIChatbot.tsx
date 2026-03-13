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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        const currentInput = input;
        setInput("");
        try {
            const aiMessage = await getAiResponse(currentInput);
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setError("Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-accent to-purple-500 text-white shadow-2xl z-50 flex items-center justify-center hover:scale-110">
                        <MessageCircle className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                        <div className="p-4 border-b bg-gradient-to-r from-accent/10 to-purple-500/10 flex items-center justify-between">
                            <h3 className="font-semibold text-sm">AI Assistant</h3>
                            <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                    <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground")}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-xs text-muted-foreground">AI is thinking...</div>}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                            <button type="submit" disabled={!input.trim() || isLoading} className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center"><Send className="w-4 h-4" /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
