'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import io, { Socket } from 'socket.io-client';
import api from '@/services/api';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
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
}

export default function UserSupportPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init Ticket & Messages
  useEffect(() => {
    const initChat = async () => {
      try {
        const { data: ticketData } = await api.get('/support/my-ticket');
        setTicket(ticketData.data);
        
        if (ticketData.data?._id) {
          const { data: msgData } = await api.get(`/support/tickets/${ticketData.data._id}/messages`);
          setMessages(msgData.data);
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
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

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
    return <div className="p-8 text-center text-gray-500">Loading support chat...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="mr-3 text-red-500" />
          Help & Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Chat directly with our support team. We usually reply within a few minutes.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="font-bold text-red-600 dark:text-red-400">SG</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">SG Fire Support Team</h3>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> Online
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-950">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={48} className="mb-4 text-gray-300 dark:text-gray-800" />
              <p>No messages yet. Send a message to start the conversation!</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.sender._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-red-600 text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-red-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-2 text-sm outline-none transition-all"
          />
          <Button type="submit" disabled={!inputText.trim()} className="px-5">
            <Send size={18} className="mr-2" /> Send
          </Button>
        </form>
      </div>
    </div>
  );
}
