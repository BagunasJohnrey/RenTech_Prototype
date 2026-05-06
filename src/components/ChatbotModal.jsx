import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MessageCircle } from 'lucide-react';

// Simple keyword‑based FAQ + styling responses
const FAQ_ANSWERS = {
  'hello': "Hi there! 👋 I'm your RENTECH stylist. How can I help you today?",
  'hi': "Hello! Looking for the perfect outfit? Tell me about your event!",
  'help': "I can help you with:\n\n• Outfit recommendations (e.g., prom, wedding, gala)\n• Sizing questions\n• Booking process\n• Return policy\n• Payment options\n\nJust ask!",
  'size': "We carry sizes XS to XXL, plus custom measurements for tailored fits. You can select your size during booking.",
  'booking': "To book an item:\n1. Browse our Collection\n2. Click 'Rent Now' on any available item\n3. Fill in your details and select size\n4. Pay 50% downpayment\n5. Receive a QR code for pickup!\n\nIt's that simple!",
  'return': "Returns are due on the agreed date. Late returns are subject to a penalty of ₱500 per day. Please return items in good condition to avoid damage fees.",
  'payment': "We accept GCash and bank cards. A minimum 50% downpayment is required to secure your booking. The remaining balance is paid when you pick up the item.",
  'gown': "We have a stunning collection of evening gowns! Popular picks: Crimson Red Ballgown, Emerald Velvet Evening Gown, Vintage Gatsby Sequin Dress. Tell me your event type for a personalized suggestion!",
  'suit': "Our classic suits are perfect for formal events. Check out the Classic Navy Slim Fit Suit or Charcoal Grey Tuxedo. They're available in multiple sizes!",
  'wedding': "For weddings, we recommend elegant gowns like the Crimson Red Ballgown or the Vintage Gatsby Sequin Dress. We also offer suits for grooms and entourage. Ask about our wedding package!",
  'prom': "Prom season is here! ✨ The Emerald Velvet Evening Gown and Vintage Gatsby Sequin Dress are perfect choices. Book early—they rent out fast!",
  'default': "I'm not sure about that. Could you rephrase? I can help with style advice, booking, sizing, and more. Or type 'help' to see what I can do.",
};

const SUGGESTIONS = [
  'What gowns are available?',
  'How do I book?',
  'What is the return policy?',
  'Payment methods?',
  'Sizing guide',
];

export default function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm your AI stylist 👗🤵\nAsk me anything about our collection, sizing, booking, or payment." },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userText) => {
    const lower = userText.toLowerCase();
    for (const [keyword, answer] of Object.entries(FAQ_ANSWERS)) {
      if (keyword === 'default') continue;
      if (lower.includes(keyword)) {
        return answer;
      }
    }
    return FAQ_ANSWERS.default;
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    // Simulate bot thinking
    setTimeout(() => {
      const botReply = getBotResponse(text);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[90vh] max-h-[600px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#bf4a53] rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Stylist</h3>
              <p className="text-xs text-gray-500">Fashion & FAQ Assistant</p>
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
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#bf4a53] text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
          {SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
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
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#bf4a53]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="p-2.5 bg-[#bf4a53] text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}