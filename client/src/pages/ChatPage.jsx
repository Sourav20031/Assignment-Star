import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation from URL param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) loadConversation(id);
  }, [searchParams]);

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations);
    } catch (err) {
      toast.error('Failed to load conversations.');
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadConversation = async (id) => {
    setLoadingMessages(true);
    setActiveConvId(id);
    try {
      const { data } = await api.get(`/chat/conversations/${id}`);
      setMessages(data.conversation.messages);
    } catch {
      toast.error('Failed to load conversation.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    textareaRef.current?.focus();
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    // Optimistically add user message
    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post('/chat/message', {
        message: msg,
        conversationId: activeConvId || undefined,
      });

      // Add AI response
      const aiMsg = { role: 'model', content: data.aiResponse, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);

      // Update conversation ID if new
      if (!activeConvId) {
        setActiveConvId(data.conversationId);
        await loadConversations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
      // Remove optimistic message
      setMessages((prev) => prev.slice(0, -1));
      setInput(msg);
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted.');
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  // Voice input using Web Speech API
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in your browser. Try Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = () => toast.error('Voice recognition error. Please try again.');
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    'Help me plan a wedding for 200 guests in Mumbai with a budget of ₹10 lakhs',
    'What are the best themes for a corporate dinner?',
    'Suggest vendors for a birthday party in Bangalore',
    'How do I create a timeline for my event?',
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 280 }}
            exit={{ opacity: 0, width: 0 }}
            className="hidden sm:flex flex-col w-72 card overflow-hidden flex-shrink-0"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <button
                onClick={startNewConversation}
                className="btn-primary w-full"
                id="chat-new-conversation-btn"
              >
                <PlusIcon className="w-4 h-4" />
                New Conversation
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loadingConvs ? (
                <div className="flex justify-center mt-8"><LoadingSpinner size="sm" /></div>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center mt-8 px-4">No conversations yet. Start chatting!</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`w-full text-left p-3 rounded-xl mb-1 group flex items-center gap-2 transition-colors ${
                      activeConvId === conv._id
                        ? 'bg-brand-50 dark:bg-brand-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{conv.title}</p>
                      <p className="text-xs text-slate-400 truncate">{conv.messageCount} messages</p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                      aria-label="Delete conversation"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow flex-shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-slate-900 dark:text-white">EventGenius AI</h1>
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              Online · Expert Event Planner
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="ml-auto btn-ghost text-xs hidden sm:flex"
          >
            {sidebarOpen ? '← Hide' : '→ History'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex justify-center mt-20"><LoadingSpinner /></div>
          ) : messages.length === 0 ? (
            <WelcomeScreen prompts={suggestedPrompts} onPromptClick={(p) => { setInput(p); textareaRef.current?.focus(); }} />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-brand-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="chat-bubble-ai flex items-center gap-2">
                    <TypingDots />
                    <span className="text-xs text-slate-400">EventGenius is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about event planning, themes, budgets, vendors..."
                rows={1}
                className="input resize-none pr-12 py-3 min-h-[46px] max-h-32"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                id="chat-input"
                disabled={sending}
              />
            </div>
            <button
              onClick={toggleVoice}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              aria-label="Voice input"
              id="chat-voice-btn"
            >
              {isListening ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-primary p-3 flex-shrink-0"
              aria-label="Send message"
              id="chat-send-btn"
            >
              {sending ? <LoadingSpinner size="sm" /> : <PaperAirplaneIcon className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line · 🎤 for voice input
          </p>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function WelcomeScreen({ prompts, onPromptClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow mb-4 animate-bounce-gentle">
        <SparklesIcon className="w-8 h-8 text-white" />
      </div>
      <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-2">
        Hi! I'm EventGenius AI 👋
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        I'm your expert AI event planning assistant. Ask me anything about themes, budgets, vendors, timelines, or let me help you plan your perfect event!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPromptClick(p)}
            className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all text-sm text-slate-600 dark:text-slate-400"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
