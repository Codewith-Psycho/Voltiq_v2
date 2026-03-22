'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useVoltStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';

const quickActions = [
  { icon: '💡', label: 'Aaj ka bill?', query: 'What is my bill today?' },
  { icon: '🔥', label: 'Geyser chalu karo', query: 'Turn on geyser' },
  { icon: '❄️', label: 'AC kyun band?', query: 'Why is AC off?' },
  { icon: '💰', label: 'Tips do', query: 'Give me savings tips' },
];

export default function ChatPage() {
  const { chatMessages, isTyping, sendMessage } = useVoltStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    // Send welcome message on first load
    if (chatMessages.length === 0) {
      const store = useVoltStore.getState();
      store.addBotMessage(
        '👋 Namaste! I\'m your VoltIQ AI assistant. I can help you with:\n\n• Check today\'s energy usage\n• Control your appliances\n• Get personalized savings tips\n• Understand your bill\n\nWhat would you like to know?'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ml-0 lg:ml-[260px] pt-16 h-screen bg-[#0a0f1c] flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex-shrink-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">VoltIQ Assistant</h1>
              <p className="text-sm text-gray-400">AI-powered energy advisor</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {chatMessages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex-shrink-0"
          >
            <p className="text-sm text-gray-400 mb-3">Quick actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-volt-cyan/50 hover:bg-volt-cyan/5 transition-all text-center"
                >
                  <span className="text-2xl mb-2 block">{action.icon}</span>
                  <span className="text-xs text-gray-300">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-volt-cyan text-gray-900 rounded-tr-none'
                      : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.type === 'data' && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs opacity-70">
                      💡 Tip: Ask me for more details!
                    </div>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-volt-blue flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                    <span className="text-sm">👤</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-volt-cyan to-volt-blue flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 border border-white/10">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0"
        >
          <GlassCard className="p-3">
            <div className="flex items-end gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your energy usage..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-2 px-2"
                disabled={isTyping}
              />
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-volt-cyan text-gray-900 hover:bg-volt-cyan/90 hover:scale-110'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>

          <p className="text-xs text-gray-500 text-center mt-3">
            VoltIQ AI is powered by advanced ML models. Responses are generated based on your usage data.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
