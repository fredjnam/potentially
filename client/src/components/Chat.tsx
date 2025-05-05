import { useState, useEffect, useRef } from 'react';
import { chatService, type Message } from '../services/api';
import { Send, User, Bot, Loader } from 'lucide-react';

interface ChatProps {
  username: string;
}

const Chat = ({ username }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await chatService.getMessages(username);
        if (response.messages) {
          setMessages(response.messages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [username]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    try {
      setIsSending(true);
      setError(null);
      
      // Send user message
      const response = await chatService.sendMessage(username, inputValue);
      
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
        setInputValue('');
        
        // Prepare message history for AI
        const messageHistory = [
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { 
            role: 'user', 
            content: inputValue 
          }
        ];
        
        // Get AI response
        try {
          const aiResponse = await chatService.chatWithAI(username, messageHistory);
          
          if (aiResponse.message) {
            // The backend now handles saving the AI response and returns it
            setMessages(prev => [...prev, aiResponse.message]);
          } else {
            setError('No response from assistant');
          }
        } catch (aiErr) {
          console.error('Error getting AI response:', aiErr);
          setError('Failed to get AI response');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 border-b border-white/20">
          <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/70">
              <Bot className="h-12 w-12 text-white/50 mb-3" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-white/20 text-white backdrop-blur-md'
                      : 'bg-white/10 text-white backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender === 'user' ? (
                      <>
                        <span className="font-medium">You</span>
                        <User className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-1" />
                        <span className="font-medium">Assistant</span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white/60' : 'text-white/60'
                    }`}
                  >
                    {message.timestamp ? 
                      new Date(typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toString()).toLocaleTimeString() 
                      : ''}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-white/20 p-4">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              className="w-full px-3 py-2 border border-white/30 rounded-l-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/50"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || isSending}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-r-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/20 text-white hover:bg-white/30 focus:ring-white/40 flex items-center"
              disabled={isLoading || isSending || !inputValue.trim()}
            >
              {isSending ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="mr-1">Send</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-2 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
