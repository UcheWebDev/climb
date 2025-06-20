import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  userId: string;
  userName?: string;
  avatarUrl?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, sendMessage, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastOpened, setLastOpened] = useState<string>(new Date().toISOString());

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update lastOpened when chat is opened
  useEffect(() => {
    if (isOpen) {
      setLastOpened(new Date().toISOString());
    }
  }, [isOpen]);

  // Count unseen messages
  const unseenCount = !isOpen
    ? messages.filter(m => m.user_id !== userId && m.created_at > lastOpened).length
    : 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="relative">
          {/* Close button positioned outside the chat box */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
          >
            <X size={20} className="text-white" />
          </button>
          {/* Chat box with animation */}
          <div className="bg-blue-950/90 rounded-2xl shadow-xl w-full h-96 flex flex-col border border-blue-900/30 animate-slide-up backdrop-blur-md">
            <div className="flex justify-between items-center p-4 border-b border-blue-900/30">
              <h3 className="text-lg font-semibold text-blue-100">Chat</h3>
              {/* No online users count here, as presence is handled in game layout */}
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="text-blue-300">No messages yet.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.user_id === userId ? 'items-end' : 'items-start'}`}>
                    <div className={`px-3 py-2 rounded-xl max-w-[80%] ${msg.user_id === userId ? 'bg-blue-600 text-white' : 'bg-blue-900/70 text-blue-100'} shadow-md`}>
                      <span className="block text-xs font-semibold mb-1 opacity-70">{msg.user_id === userId ? 'You' : msg.user_name}</span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-blue-900/30 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-blue-900/60 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!input.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-blue-900/80 p-4 text-blue-100 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-bounce-subtle"
        >
          <MessageCircle size={24} />
          {unseenCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-blue-900 animate-bounce">
              {unseenCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatBox; 