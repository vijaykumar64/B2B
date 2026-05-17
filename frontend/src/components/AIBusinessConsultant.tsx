import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIBusinessConsultantProps {
  opportunities: any[];
  user?: any;
  onLoginClick?: () => void;
  inlineMode?: boolean;
}

export default function AIBusinessConsultant({
  user,
  onLoginClick,
  inlineMode = false,
}: AIBusinessConsultantProps) {
  const [isOpen, setIsOpen] = useState(inlineMode);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I'm your AI Business Consultant. Tell me about your budget and preferred industry. I'll help you find the perfect brand opportunity in Bharat.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Send last 10 messages as history for context (excluding the welcome message)
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage, conversationHistory }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'AI service unavailable');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.message === 'AI service temporarily unavailable. Please try again shortly.'
            ? "Our AI consultant is temporarily unavailable. Please try again in a moment!"
            : "I encountered a slight technical glitch. Let's try again in a moment!"
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const ChatBody = () => (
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none'
                : 'bg-slate-100 text-slate-800 rounded-tl-none font-medium'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
              <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );

  const ChatInput = () => (
    <div className="p-6 pt-0">
      {!user && (
        <div className="mb-4 text-center">
          <p className="text-xs text-slate-400 font-bold mb-2">Sign in to save this consultation to your profile</p>
          <Button variant="outline" size="sm" onClick={onLoginClick} className="rounded-xl h-8 text-[10px] uppercase tracking-widest font-black">
            Sign In Now
          </Button>
        </div>
      )}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="e.g. Budget ₹10L, food brand in Tier 3 city..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-3 outline-none"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 h-10 w-10 rounded-xl shadow-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const ChatHeader = ({ onClose }: { onClose?: () => void }) => (
    <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-tighter">AI Business Consultant</h3>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400">LIVE ASSISTANT • SCALEUP BHARAT</span>
          </div>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="hover:bg-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 group/close"
          aria-label="Close Chat"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/close:text-white transition-colors">Close</span>
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  if (inlineMode) {
    return (
      <div className="w-full">
        <Card className="flex flex-col h-[600px] overflow-hidden border-slate-200 shadow-xl rounded-[2rem] bg-white">
          <ChatHeader />
          <ChatBody />
          <ChatInput />
        </Card>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[99] bg-black/5 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="mb-4 w-[380px] origin-bottom-right"
            >
              <Card className="flex flex-col h-[550px] overflow-hidden border-slate-200 shadow-2xl rounded-[2rem] bg-white">
                <ChatHeader onClose={() => setIsOpen(false)} />
                <ChatBody />
                <ChatInput />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-16 w-16 items-center justify-center rounded-[2rem] shadow-2xl transition-all group relative z-[101] ${
            isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
          }`}
        >
          {!isOpen && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-500 rounded-full border-2 border-white animate-ping" />
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="flex items-center justify-center">
                <MessageSquare className="h-6 w-6 group-hover:hidden" />
                <Sparkles className="h-6 w-6 hidden group-hover:block" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
