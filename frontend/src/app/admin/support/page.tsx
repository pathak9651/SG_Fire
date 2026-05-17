'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import io, { Socket } from 'socket.io-client';
import api from '@/services/api';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SupportTicket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: { url: string };
  };
  subject: string;
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

export default function AdminSupportPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch Tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/support/tickets');
        setTickets(data.data);
      } catch (err) {
        console.error('Failed to fetch tickets', err);
      }
    };
    fetchTickets();
  }, []);

  // Fetch Messages when a ticket is selected
  useEffect(() => {
    if (!activeTicket) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/support/tickets/${activeTicket._id}/messages`);
        setMessages(data.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, [activeTicket]);

  // Socket Setup
  useEffect(() => {
    // Determine socket URL from API URL (strip out /api)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const socketUrl = apiUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      withCredentials: true, // Sends HTTP-only cookies
    });

    newSocket.on('connect', () => console.log('Socket connected'));
    
    newSocket.on('receiveMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('ticketUpdated', (updatedTicket: SupportTicket) => {
      setTickets((prev) => {
        const existing = prev.find((t) => t._id === updatedTicket._id);
        if (existing) {
          return prev.map((t) => t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t)
                     .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        } else {
          // fetch tickets again to get the user populated data if new ticket
          api.get('/support/tickets').then(res => setTickets(res.data.data));
          return prev;
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeTicket) return;

    socket.emit('sendMessage', {
      ticketId: activeTicket._id,
      text: inputText,
    });

    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col lg:flex-row">
      
      {/* Sidebar: Tickets List */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col h-1/3 lg:h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare size={20} className="mr-2 text-red-500" />
            Support Tickets
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => setActiveTicket(ticket)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                activeTicket?._id === ticket._id 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                  {ticket.user?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(ticket.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {ticket.lastMessage || 'No messages yet'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </button>
          ))}
          {tickets.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">No support tickets found.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-2/3 lg:h-full bg-gray-50 dark:bg-gray-950">
        {activeTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                {activeTicket.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{activeTicket.user?.name}</h3>
                <p className="text-xs text-gray-500">{activeTicket.user?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender._id === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      isMe 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                    }`}>
                      {!isMe && (
                        <div className="text-xs font-semibold mb-1 text-red-500">{msg.sender.name}</div>
                      )}
                      <p>{msg.text}</p>
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to the user..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl px-4 py-2 text-sm outline-none transition-all"
              />
              <Button type="submit" disabled={!inputText.trim()} className="px-4">
                <Send size={18} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-300 dark:text-gray-700" />
            <p>Select a ticket to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
