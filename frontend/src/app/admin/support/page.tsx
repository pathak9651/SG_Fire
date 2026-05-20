'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import io, { Socket } from 'socket.io-client';
import api from '@/services/api';
import { Send, MessageSquare, AlertCircle, CheckCircle, Power, User as UserIcon, Loader2 } from 'lucide-react';
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
  ticket: string;
}

export default function AdminSupportPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeTicketRef = useRef<SupportTicket | null>(null);

  useEffect(() => {
    activeTicketRef.current = activeTicket;
  }, [activeTicket]);

  // Scroll to bottom of container when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Fetch Tickets
  const fetchTicketsList = async () => {
    try {
      const { data } = await api.get('/support/tickets');
      setTickets(data.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  useEffect(() => {
    fetchTicketsList();
  }, []);

  // Fetch Messages when active ticket changes
  useEffect(() => {
    if (!activeTicket) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/support/tickets/${activeTicket._id}/messages`);
        const uniqueMessages: ChatMessage[] = [];
        const seenIds = new Set<string>();
        for (const msg of data.data) {
          if (!seenIds.has(msg._id)) {
            seenIds.add(msg._id);
            uniqueMessages.push(msg);
          }
        }
        setMessages(uniqueMessages);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, [activeTicket]);

  // Socket Setup
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
    const socketUrl = apiUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    newSocket.on('connect', () => console.log('Socket connected'));
    
    newSocket.on('receiveMessage', (message: ChatMessage) => {
      // ONLY append the message if it is for the currently selected active ticket!
      if (activeTicketRef.current && message.ticket === activeTicketRef.current._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    newSocket.on('ticketUpdated', (updatedTicket: SupportTicket) => {
      setTickets((prev) => {
        const existing = prev.find((t) => t._id === updatedTicket._id);
        
        // If this is the active ticket currently being viewed, update its status/fields in real-time
        if (activeTicketRef.current && activeTicketRef.current._id === updatedTicket._id) {
          setActiveTicket((current) => current ? { ...current, ...updatedTicket } : null);
        }

        if (existing) {
          return prev.map((t) => t._id === updatedTicket._id ? { ...t, ...updatedTicket } : t)
                     .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        } else {
          // Re-fetch to get user populated data if new ticket is created
          fetchTicketsList();
          return prev;
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAcceptChat = async () => {
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/support/tickets/${activeTicket._id}/accept`);
      setActiveTicket(data.data);
    } catch (err) {
      console.error('Failed to accept chat request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseChat = async () => {
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/support/tickets/${activeTicket._id}/close`);
      setActiveTicket(data.data);
    } catch (err) {
      console.error('Failed to close chat request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col lg:flex-row transition-all">
      
      {/* Sidebar: Tickets List */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col h-1/3 lg:h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare size={20} className="mr-2 text-red-600 animate-pulse" />
            Support Desk
          </h2>
          <span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 px-2 py-0.5 rounded-full">
            {tickets.filter(t => t.status !== 'closed').length} Active
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white dark:bg-gray-900">
          {tickets.map((ticket) => {
            const isSelected = activeTicket?._id === ticket._id;
            return (
              <button
                key={ticket._id}
                onClick={() => setActiveTicket(ticket)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                  isSelected 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-bold text-gray-950 dark:text-white text-sm truncate pr-2">
                    {ticket.user?.name || 'Unknown User'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                    {new Date(ticket.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                  {ticket.lastMessage || 'No messages in session'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                    ticket.status === 'open' 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse' 
                      : ticket.status === 'in_progress'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {ticket.status === 'open' ? 'Requested' : ticket.status === 'in_progress' ? 'Live Chatting' : 'Closed'}
                  </span>
                </div>
              </button>
            );
          })}
          {tickets.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-gray-600">
              <MessageSquare size={32} className="mb-2 opacity-50" />
              <p className="text-xs">No support requests yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-2/3 lg:h-full bg-gray-50 dark:bg-gray-950">
        {activeTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 shadow-inner">
                  {activeTicket.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                    {activeTicket.user?.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeTicket.user?.email}
                  </p>
                </div>
              </div>
              
              {activeTicket.status === 'in_progress' && (
                <button
                  onClick={handleCloseChat}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1 text-xs font-bold"
                >
                  <Power size={14} /> End Chat
                </button>
              )}
            </div>

            {/* Accept Request Screen Overlay / Banner */}
            {activeTicket.status === 'open' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <AlertCircle size={40} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                  Live Chat Request
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8 text-center leading-relaxed">
                  <strong>{activeTicket.user?.name}</strong> is online and has requested a live connection. Click Accept to join the live support chat.
                </p>
                <Button 
                  onClick={handleAcceptChat}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/25 flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Accept Support Request
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Chat Closed State Screen */}
            {activeTicket.status === 'closed' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Power size={28} className="text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">
                  Chat Session Closed
                </h3>
                <p className="text-xs text-gray-400 max-w-xs text-center mb-6">
                  This chat session has ended. To start another session, the user must submit another support request.
                </p>
              </div>
            )}

            {/* Messaging Chat Frame */}
            {activeTicket.status === 'in_progress' && (
              <>
                {/* Messages list */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                      <MessageSquare size={36} className="mb-2 opacity-50" />
                      <p className="text-xs">No messages yet. Send a greeting to the client!</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.sender._id === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-red-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                        }`}>
                          {!isMe && (
                            <div className="text-[10px] font-bold mb-1 text-red-500">
                              {msg.sender.name}
                            </div>
                          )}
                          <p className="leading-relaxed break-words">{msg.text}</p>
                          <div className={`text-[9px] mt-1.5 ${isMe ? 'text-red-200' : 'text-gray-400'} text-right`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your reply to the user..."
                    className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:border-red-500 focus:bg-white dark:focus:bg-gray-950 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <Button type="submit" disabled={!inputText.trim()} className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transform active:scale-95 transition-all">
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-950/20">
            <MessageSquare size={48} className="mb-4 text-gray-300 dark:text-gray-800 animate-pulse" />
            <p className="text-sm font-semibold">Select a support ticket to start live chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
