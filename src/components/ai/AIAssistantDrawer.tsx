import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Loader2, MessageSquare, ShieldCheck, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { getWhatsAppSupportUrl, ZENVO_WHATSAPP_RAW } from '../../lib/whatsapp';
import { ROUTES } from '../../constants/routes';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'model',
    content: `Assalam-o-Alaikum! Main Zenvo AI Assistant hoon. 🌟

Main aapki madad kar sakta hoon:
• **WhatsApp Orders:** Official number **${ZENVO_WHATSAPP_RAW}** par foran order bhejna
• **Admin Panel:** Username: \`admin\` | Password: \`admin123@#\`
• **Showcase & Product Images:** Image URL ya file upload se tasveerein lagana
• **Cash on Delivery:** Pure Pakistan mein baghair advance payment ke doorstep delivery

Aap mujh se Urdu, Roman Urdu, ya English mein koi bhi sawal pooch sakte hain!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  'WhatsApp par order kaise karein? (03027628552)',
  'Admin panel ka username aur password?',
  'Image URL aur file upload kaise karein?',
  'Cash on Delivery kaise kaam karta hai?',
  'Authentic handcrafted leather products',
];

export const AIAssistantDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const modelReply = data.reply || 'Khushamdeed! Main aapki kis tarah mazeed rehnumai kar sakta hoon?';

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_model`,
          role: 'model',
          content: modelReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      // Graceful local fallback response
      let localReply = `Assalam-o-Alaikum! Zenvo marketplace par aapka order official WhatsApp number **${ZENVO_WHATSAPP_RAW}** par direct bheja ja sakta hai. Admin credentials hain: Username \`admin\` aur password \`admin123@#\`. Product images ko URL aur device upload dono tareeqon se add kiya ja sakta hai.`;

      if (userText.toLowerCase().includes('admin') || userText.toLowerCase().includes('login')) {
        localReply = `🔒 *Admin Credentials:*\n• **Username:** \`admin\`\n• **Password:** \`admin123@#\`\n\nAap Login page par direct access kar sakte hain.`;
      } else if (userText.toLowerCase().includes('whatsapp') || userText.toLowerCase().includes('order')) {
        localReply = `📱 *WhatsApp Order Helpline (03027628552):*\nCart ya Checkout page par "Direct WhatsApp Order" button se foran order WhatsApp **03027628552** par send ho jata hai!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_local`,
          role: 'model',
          content: localReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <a
          href={getWhatsAppSupportUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center group"
          title={`WhatsApp Helpline: ${ZENVO_WHATSAPP_RAW}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
            WhatsApp: {ZENVO_WHATSAPP_RAW}
          </span>
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-4 py-3 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-full shadow-xl transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#6C47FF] rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-bold font-display hidden sm:inline">Zenvo AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      {/* AI Assistant Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6C47FF] flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display">Zenvo AI Assistant</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Urdu · Roman Urdu · English Assistance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-2 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6C47FF]" />
              Admin: <code className="font-bold">admin</code> / <code className="font-bold">admin123@#</code>
            </span>
            <Link
              to={ROUTES.LOGIN}
              onClick={() => setIsOpen(false)}
              className="text-[#6C47FF] hover:underline font-bold"
            >
              Sign In
            </Link>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6C47FF] text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 px-1 pt-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#6C47FF]" />
                <span>Zenvo AI soch raha hai...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Questions:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSendMessage(sug)}
                  className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-[#6C47FF] border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Urdu ya English mein sawal likhein..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
