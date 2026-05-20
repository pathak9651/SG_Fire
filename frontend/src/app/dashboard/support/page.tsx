'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import io, { Socket } from 'socket.io-client';
import api from '@/services/api';
import { Send, MessageSquare, AlertCircle, Sparkles, Loader2, Power } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SupportTicket {
  _id: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
}

interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  text: string;
  isAdmin: boolean;
  createdAt: string;
  ticket: string;
}

export default function UserSupportPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<SupportTicket | null>(null);

  useEffect(() => {
    ticketRef.current = ticket;
  }, [ticket]);

  // Scroll to bottom of container when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Init Ticket & Messages
  useEffect(() => {
    const initChat = async () => {
      try {
        const { data: ticketData } = await api.get('/support/my-ticket');
        setTicket(ticketData.data);
        
        if (ticketData.data?._id) {
          const { data: msgData } = await api.get(`/support/tickets/${ticketData.data._id}/messages`);
          const uniqueMessages: ChatMessage[] = [];
          const seenIds = new Set<string>();
          for (const msg of msgData.data) {
            if (!seenIds.has(msg._id)) {
              seenIds.add(msg._id);
              uniqueMessages.push(msg);
            }
          }
          setMessages(uniqueMessages);
        }
      } catch (err) {
        console.error('Failed to init support chat', err);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  // Socket Setup
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const socketUrl = apiUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    newSocket.on('connect', () => console.log('Support socket connected'));
    
    newSocket.on('receiveMessage', (message: ChatMessage) => {
      // Only append if this message belongs to the current ticket
      if (ticketRef.current && message.ticket === ticketRef.current._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    newSocket.on('chatAccepted', (updatedTicket: SupportTicket) => {
      if (ticketRef.current && updatedTicket._id === ticketRef.current._id) {
        setTicket(updatedTicket);
      }
    });

    newSocket.on('chatClosed', (updatedTicket: SupportTicket) => {
      if (ticketRef.current && updatedTicket._id === ticketRef.current._id) {
        setTicket(updatedTicket);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleRequestChat = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/support/request');
      setTicket(data.data);
      // Fetch messages (usually empty for new sessions)
      const { data: msgData } = await api.get(`/support/tickets/${data.data._id}/messages`);
      const uniqueMessages: ChatMessage[] = [];
      const seenIds = new Set<string>();
      for (const msg of msgData.data) {
        if (!seenIds.has(msg._id)) {
          seenIds.add(msg._id);
          uniqueMessages.push(msg);
        }
      }
      setMessages(uniqueMessages);
    } catch (err) {
      console.error('Failed to request chat', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseChat = async () => {
    if (!ticket) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/support/tickets/${ticket._id}/close`);
      setTicket(data.data);
    } catch (err) {
      console.error('Failed to close chat', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !ticket) return;

    socket.emit('sendMessage', {
      ticketId: ticket._id,
      text: inputText,
    });

    setInputText('');
  };

  if (isLoading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
        <p className="text-sm font-medium">Initializing live chat services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight">
          <MessageSquare className="mr-3 text-red-600 animate-pulse" size={32} />
          Help & Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
          Chat directly with our dedicated fire safety and technical support team in real-time.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col h-[600px] transition-all">
        
        {/* Idle State: Chat Closed or Not Requested Yet */}
        {(!ticket || ticket.status === 'closed') && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6 shadow-inner animate-bounce">
              <Sparkles size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-2">
              Need Professional Assistance?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
              Our safety experts are online and ready to support you with equipment usage, appointments, or general support questions.
            </p>
            <Button 
              onClick={handleRequestChat} 
              disabled={isSubmitting}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Connecting...
                </>
              ) : (
                <>
                  <MessageSquare size={18} /> Request Live Chat Connection
                </>
              )}
            </Button>
          </div>
        )}

        {/* Pending Request State: Connecting to an Agent */}
        {ticket && ticket.status === 'open' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-950">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-red-100 dark:border-red-950 flex items-center justify-center animate-pulse">
                <Loader2 size={36} className="text-red-600 animate-spin" />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-red-500 border-2 border-white dark:border-gray-950 animate-ping" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Connecting with Support...
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 text-xs md:text-sm">
              We are notifying our active support agents. Please stay on this screen. A representative will accept and join your chat shortly!
            </p>
            <button 
              onClick={handleCloseChat}
              disabled={isSubmitting}
              className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold flex items-center gap-1.5 transition-colors border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Cancel Chat Request
            </button>
          </div>
        )}

        {/* Active Chat State */}
        {ticket && ticket.status === 'in_progress' && (
          <>
            {/* Active Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shadow-md">
                    <span className="font-bold text-red-600 dark:text-red-400 text-sm">SG</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950 dark:text-white text-sm md:text-base">
                    SG Fire Support Representative
                  </h3>
                  <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-bold flex items-center">
                    Active Session • Live
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCloseChat}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-bold"
                title="End Support Chat"
              >
                <Power size={14} /> End Chat
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <MessageSquare size={48} className="mb-4 text-gray-300 dark:text-gray-800 animate-pulse" />
                  <p className="text-xs md:text-sm font-medium">Session started. Type a message below to begin!</p>
                </div>
              )}
              
              {messages.map((msg) => {
                const senderId = typeof msg.sender === 'object' && msg.sender ? msg.sender._id : msg.sender;
                const isMe = senderId === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-transform duration-200 ${
                      isMe 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-bold text-red-500 mb-1">
                          {typeof msg.sender === 'object' && msg.sender ? msg.sender.name : 'Support Agent'}
                        </p>
                      )}
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <div className={`text-[9px] mt-1.5 text-right font-medium ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to the agent..."
                className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:border-red-500 focus:bg-white dark:focus:bg-gray-950 rounded-xl px-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-red-500"
              />
              <Button type="submit" disabled={!inputText.trim()} className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all transform active:scale-95">
                <Send size={16} />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
