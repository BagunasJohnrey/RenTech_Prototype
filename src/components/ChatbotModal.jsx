import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Local FAQ answers (used as fallback when API fails)
const FAQ_ANSWERS = {
  hello: "Hi there! 👋 I'm your RENTECH stylist. How can I help you today?",
  hi: "Hello! Looking for the perfect outfit? Tell me about your event!",
  help: "I can help you with:\n\n- Outfit recommendations (prom, wedding, gala)\n- Sizing questions\n- Booking process\n- Return policy\n- Payment options\n\nJust ask!",
  size: "We carry sizes XS to XXL, plus custom measurements for tailored fits. You can select your size during booking.",
  booking: "To book an item:\n\n1. Browse our Collection\n2. Click 'Rent Now' on any available item\n3. Fill in your details and select size\n4. Pay 50% downpayment\n5. Receive a QR code for pickup!\n\nIt's that simple!",
  return: "Returns are due on the agreed date. Late returns are subject to a penalty of ₱500 per day. Please return items in good condition to avoid damage fees.",
  payment: "We accept GCash and bank cards. A minimum 50% downpayment is required to secure your booking. The remaining balance is paid when you pick up the item.",
  gown: "We have a stunning collection of evening gowns! Popular picks: Crimson Red Ballgown, Emerald Velvet Evening Gown, Vintage Gatsby Sequin Dress. Tell me your event type for a personalized suggestion!",
  suit: "Our classic suits are perfect for formal events. Check out the Classic Navy Slim Fit Suit or Charcoal Grey Tuxedo. They're available in multiple sizes!",
  wedding: "For weddings, we recommend elegant gowns like the Crimson Red Ballgown or the Vintage Gatsby Sequin Dress. We also offer suits for grooms and entourage. Ask about our wedding package!",
  prom: "Prom season is here! ✨ The Emerald Velvet Evening Gown and Vintage Gatsby Sequin Dress are perfect choices. Book early—they rent out fast!",
  default: null,
};

const SUGGESTIONS = [
  'What gowns are available?',
  'How do I book?',
  'What is the return policy?',
  'Payment methods?',
  'Sizing guide',
];

const SYSTEM_PROMPT = `You are a helpful, friendly AI stylist for RENTECH, a formal-wear rental boutique.
Your goal is to assist customers with:
- Recommending outfits (gowns, suits, tuxedos, barong) for various events (prom, wedding, gala, etc.)
- Explaining the booking process (select item, pick size, pay 50% downpayment, receive QR code, pickup & return)
- Answering FAQs about sizing (XS–XXL, custom measurements), late return penalties (₱500/day), damage fees, payment methods (GCash, card)
- Giving style advice based on event type

Keep answers concise, friendly, and on topic. Do not make up prices or items not mentioned.
If the question is outside your knowledge, politely redirect to the RENTECH staff.`;

export default function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your AI stylist 👗🤵\nAsk me anything about our collection, sizing, booking, or payment.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Separate conversation history for Gemini (starts empty)
  const chatHistoryRef = useRef([]);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  
  // FIX: Moved systemInstruction to the model initialization
  const model = genAI?.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT 
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 1. Try Gemini → 2. fallback to local FAQ
  const getResponse = async (userText) => {
    if (!model) {
      return getLocalFAQResponse(userText);
    }

    try {
      // FIX: Start chat with ONLY the previous history
      const chat = model.startChat({
        history: chatHistoryRef.current,
      });

      // sendMessage automatically handles appending the new prompt internally
      const result = await chat.sendMessage(userText);
      const response = await result.response;
      const botText = response.text();

      // FIX: Update our persistent ref with both the user's prompt and the bot's response
      chatHistoryRef.current = [
        ...chatHistoryRef.current,
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: botText }] },
      ];

      return botText;
    } catch (error) {
      // Log the exact error to the console for easier debugging
      console.error('Gemini API Error:', error);
      console.warn('Gemini API error – falling back to local FAQ');
      return getLocalFAQResponse(userText);
    }
  };

  // Simple keyword-based fallback FAQ
  const getLocalFAQResponse = (text) => {
    const lower = text.toLowerCase();
    for (const [keyword, answer] of Object.entries(FAQ_ANSWERS)) {
      if (keyword !== 'default' && lower.includes(keyword)) {
        return answer;
      }
    }
    return FAQ_ANSWERS.default || "I'm having trouble connecting. Try asking about booking, sizing, or gowns!";
  };

  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botText = await getResponse(userText);
      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => sendMessage(suggestion);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[90vh] max-h-[600px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#bf4a53] rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Stylist</h3>
              <p className="text-xs text-gray-500">
                {model ? 'Powered by Gemini' : 'Offline Mode'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 hide-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#bf4a53] text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.sender === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#bf4a53] disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#bf4a53] text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}