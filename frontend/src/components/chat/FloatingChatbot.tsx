'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  CheckCircle,
  MessageSquare,
  ShieldAlert,
  Flame,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  createdAt: Date;
  isStreaming?: boolean;
  recommendedProducts?: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating?: number;
  }>;
}

const PRESET_PROMPTS = [
  {
    label: "Kitchen Safety",
    icon: Flame,
    prompt: "Which fire extinguisher is recommended for a home kitchen?"
  },
  {
    label: "Smoke Alarms",
    icon: ShieldCheck,
    prompt: "Where should I install smoke detectors in my house?"
  },
  {
    label: "Grease Fires",
    icon: AlertTriangle,
    prompt: "What are the immediate steps to take if a grease fire starts?"
  },
  {
    label: "Equipment Checks",
    icon: FileText,
    prompt: "How often should I test my residential fire safety equipment?"
  }
];

const ROUTE_PRESETS: Record<string, typeof PRESET_PROMPTS> = {
  default: PRESET_PROMPTS,
  products: [
    {
      label: "Extinguisher Types",
      icon: Flame,
      prompt: "Explain the difference between Class A, B, C, and F fire extinguishers."
    },
    {
      label: "Installation Guide",
      icon: ShieldCheck,
      prompt: "What is the recommended mounting height for a fire extinguisher?"
    },
    {
      label: "Fire Blanket Use",
      icon: AlertTriangle,
      prompt: "How do you use a fire blanket for small stovetop flames?"
    },
    {
      label: "Maintenance Help",
      icon: FileText,
      prompt: "How often should I professionally service my home safety equipment?"
    }
  ],
  cart: [
    {
      label: "Bulk Discounts",
      icon: Sparkles,
      prompt: "Do you offer bulk discounts for corporate or housing complexes?"
    },
    {
      label: "Certification Info",
      icon: ShieldCheck,
      prompt: "Are these fire safety products officially NFPA or ISI certified?"
    },
    {
      label: "Shipping Safety",
      icon: HelpCircle,
      prompt: "How safely are pressurized gas canisters shipped to residential homes?"
    },
    {
      label: "Refund Policy",
      icon: FileText,
      prompt: "What is the return and testing warranty period on fire alarms?"
    }
  ],
  appointments: [
    {
      label: "Service Area",
      icon: Sparkles,
      prompt: "What geographical areas do your technicians cover for fire safety audits?"
    },
    {
      label: "Inspection Routine",
      icon: ShieldCheck,
      prompt: "What is checked during a standard residential fire safety audit?"
    },
    {
      label: "Tech Profile",
      icon: HelpCircle,
      prompt: "Are your audit technicians certified professionals?"
    },
    {
      label: "Rescheduling Bookings",
      icon: FileText,
      prompt: "How can I reschedule or cancel a technician inspection?"
    }
  ],
  orders: [
    {
      label: "Track Delivery",
      icon: Sparkles,
      prompt: "How can I track my shipped fire safety package real-time?"
    },
    {
      label: "Order Issues",
      icon: AlertTriangle,
      prompt: "What should I do if my package arrived with a damaged pressure indicator?"
    },
    {
      label: "Invoice Request",
      icon: FileText,
      prompt: "Where can I download tax-compliant invoices for my business?"
    },
    {
      label: "Live Assistance",
      icon: HelpCircle,
      prompt: "How do I reach a live technician support representative?"
    }
  ]
};

const AI_RESPONSES: Record<string, string> = {
  "Which fire extinguisher is recommended for a home kitchen?": 
    "### 🧯 Recommended Home Kitchen Extinguisher: Class F or CO2\n\n#### 1. Kitchen Extinguisher Types:\n* **Class F (Wet Chemical) Extinguisher:**\n  * **Best for Kitchens:** Specifically designed for cooking oil, fat, and deep fryer fires (Class F/K).\n  * **Mechanism:** It releases a soapy chemical foam that cools the oil and smothers the fire via a process called *saponification*.\n* **Carbon Dioxide (CO2) Gas Extinguisher:**\n  * **Safe for Electricals:** Recommended if an electrical appliance (microwave, toaster, stovetop) catches fire.\n  * **Mechanism:** Displaces oxygen. Leaves zero messy chemical residue, protecting electrical circuits.\n\n#### ⚠️ Critical Hazard Alert:\n> [!WARNING]\n> **NEVER USE WATER ON A GREASE OR ELECTRICAL FIRE!**\n> Water will vaporize instantly, exploding the burning grease into a massive fireball and spreading the fire across the room.",

  "Where should I install smoke detectors in my house?":
    "### 🚨 Residential Smoke Detector Placement Guide\n\nDetectors must be strategically positioned across your living areas according to international safety standards (NFPA 72).\n\n#### 1. Essential Locations (Where to Install):\n* **Inside Every Bedroom:** Ensures sleepers are woken up even if doors are closed.\n* **Outside Every Sleeping Area:** Install in common corridors leading to bedrooms.\n* **Every Floor Level:** Put at least one detector on every single level of the house, including basements.\n\n#### 2. Prohibited Locations (Where to Avoid):\n* **Within 10 feet of Cooking Appliances:** Cooking fumes trigger false alarms.\n* **Bathrooms or High-Humidity Areas:** Moisture can damage internal photoelectric sensors.\n\n#### 💡 Optimal Mounting Tips:\n> [!TIP]\n> Mount smoke detectors on ceilings, keeping them at least **4 inches (10 cm)** away from adjacent walls.",

  "What are the immediate steps to take if a grease fire starts?":
    "### 🔥 Immediate Action Plan: Grease Fire Emergency\n\nA grease fire is highly volatile and spreads rapidly. Follow this strict 4-step emergency sequence to control it safely:\n\n#### 1. Cut the Heat Source Immediately:\n* Turn the burner **OFF**. If safe, unplug electric deep fryers. Do not move the burning pan.\n\n#### 2. Smother the Flame:\n* Slide a large **metal pan lid** or baking sheet over the pan to cut off oxygen.\n* You can also dump a generous amount of **baking soda** onto the flame.\n\n#### 3. Do NOT Move the Pan:\n* Carrying a burning, oil-filled pan to the sink or outdoors will cause severe skin burns and splash fire across your kitchen.\n\n#### 4. Evacuate & Call Emergency Services:\n* If the fire is not completely smothered within 30 seconds, evacuate the building immediately and dial the emergency line (101 / 112).\n\n#### 🧯 Emergency Fire Checklist:\n| Safe Actions | Dangerous Actions |\n| :--- | :--- |\n| Turn burner OFF | Throw Water on the pan |\n| Cover with a metal lid | Wave kitchen towels to fan flames |\n| Pour Baking Soda | Try to carry the pan outside |\n| Use a Class F / CO2 extinguisher | Use flour or baking powder |",

  "How often should I test my residential fire safety equipment?":
    "### 🛠️ Residential Safety Equipment Maintenance Schedule\n\nContinuous testing guarantees your home defense works when it matters most. Follow this NFPA-compliant residential schedule:\n\n#### 1. Smoke and Heat Detectors:\n* **Test (Monthly):** Press the physical test button to verify the alarm horn works.\n* **Batteries (Every 6 Months):** Replace standard 9V batteries twice a year.\n* **Replacement (Every 10 Years):** Replace the entire detector unit after 10 years of use.\n\n#### 2. Portable Fire Extinguishers:\n* **Visual Inspection (Monthly):** Check that the pressure gauge needle is in the **GREEN** zone. Ensure the nozzle is clear and the safety pin is intact.\n* **Shaking (Every 6 Months):** Turn dry powder extinguishers upside down and shake them to prevent the powder from compacting.\n* **Hydrostatic Testing (Every 5-10 Years):** Professional pressure test of the metal cylinder shell."
};

const DEFAULT_AI_ANSWER = "### 🧠 SG Fire Safety AI Co-Pilot\n\nI am currently analyzing your query. As your dedicated safety assistant, I can help you research home safety guidelines, fire extinguisher ratings, residential escape route planning, or equipment checks.\n\n**To get a precise reply, please try asking:**\n* \"Which fire extinguisher is recommended for a home kitchen?\"\n* \"Where should I install smoke detectors in my house?\"\n* \"What are the immediate steps to take if a grease fire starts?\"\n* \"How often should I test my residential fire safety equipment?\"";

const getWelcomeMessage = (path: string): string => {
  if (path.startsWith('/products')) {
    return "Hello! I see you are browsing our **SG Fire Safety Products catalog**. \n\nI can help you understand fire ratings (Class A, B, C, D, F), verify NFPA certification compliance, or suggest the exact extinguisher sizes you need. Ask me anything!";
  }
  if (path.startsWith('/cart') || path.startsWith('/checkout')) {
    return "Welcome! Preparing to secure your home or business? \n\nI am here to answer any questions about our shipping guidelines, bulk-order certifications, warranty coverage, or tax invoices before you finalize your safety package!";
  }
  if (path.startsWith('/appointments')) {
    return "Planning a professional inspection? \n\nI can answer questions about our fire safety audits, technician certifications, scheduling, or what you need to prepare for the audit checklist!";
  }
  if (path.startsWith('/dashboard/orders') || path.startsWith('/dashboard')) {
    return "Hello! Accessing your account portal? \n\nI can help you track your orders, explain delivery stages, assist in downloading invoices, or connect you with premium maintenance resources!";
  }
  return "Hello! I am your **SG Fire Safety AI Assistant**. I can help you with home safety precautions, equipment installations, troubleshooting false alarms, or drafting family emergency escape plans. \n\nSelect one of the quick prompts below or type your safety questions to begin!";
};

export default function FloatingChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: getWelcomeMessage(pathname || ''),
      createdAt: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic context awareness for welcome message updating when page changes (if chat hasn't started)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].id !== 'welcome') {
        return prev;
      }

      return [
        {
          id: 'welcome',
          sender: 'ai',
          text: getWelcomeMessage(pathname || ''),
          createdAt: new Date()
        }
      ];
    });
  }, [pathname]);

  // Set up Speech Recognition on mount if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // Auto-scroll inside container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Hide on admin routes or specific help directories
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/help')) {
    return null;
  }

  // Handle Speech-to-Text Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop TTS if speaking
      if (speakingMessageId) {
        window.speechSynthesis?.cancel();
        setSpeakingMessageId(null);
      }
      recognitionRef.current.start();
    }
  };

  // Handle Text-to-Speech (Read-Aloud)
  const speakMessage = (text: string, msgId: string) => {
    if (typeof window === 'undefined') return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    
    // Clean markdown characters out for cleaner text-to-speech output
    const cleanText = text
      .replace(/###\s+/g, '')
      .replace(/####\s+/g, '')
      .replace(/>\s+\[!(.*?)\]/g, '')
      .replace(/>\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\|/g, ' ')
      .replace(/:---/g, '')
      .replace(/---/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMessageId = Math.random().toString(36).substring(7);
    const newUserMessage: Message = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      createdAt: new Date()
    };

    // Add immediate AI placeholder message with streaming flag
    const aiMessageId = Math.random().toString(36).substring(7);
    const newAiMessage: Message = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      createdAt: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, newUserMessage, newAiMessage]);
    setInputText('');

    // Cancel any speaking audio
    if (speakingMessageId) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
    }

    try {
      // PHASE 2 & 3: Attempt backend live Gemini chat fetch
      const payloadHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await api.post('/support/ai-chat', {
        message: textToSend,
        history: payloadHistory,
        pathname: pathname || '/'
      });

      if (response.data?.success) {
        const replyText = response.data.reply;
        const products = response.data.products || [];

        setMessages(prev => 
          prev.map(m => m.id === aiMessageId ? { 
            ...m, 
            text: replyText, 
            recommendedProducts: products, 
            isStreaming: false 
          } : m)
        );
        return;
      }
    } catch (apiError) {
      console.warn("Gemini API endpoint unavailable or failed. Falling back to local responder.", apiError);
    }

    // PHASE 1: Simulate AI Streaming text delivery local fallback
    const fullReply = AI_RESPONSES[textToSend.trim()] || DEFAULT_AI_ANSWER;
    let currentLength = 0;
    const intervalTime = 10;
    const charsPerStep = 6;

    const timer = setInterval(() => {
      currentLength += charsPerStep;
      if (currentLength >= fullReply.length) {
        clearInterval(timer);
        setMessages(prev => 
          prev.map(m => m.id === aiMessageId ? { ...m, text: fullReply, isStreaming: false } : m)
        );
      } else {
        setMessages(prev => 
          prev.map(m => m.id === aiMessageId ? { ...m, text: fullReply.substring(0, currentLength) } : m)
        );
      }
    }, intervalTime);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendPrompt(inputText);
  };

  const renderAlert = (type: string, lines: string[], key: number) => {
    let bg = 'bg-blue-50 dark:bg-blue-955/10 border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-400';
    let label = 'Note';
    let Icon = HelpCircle;
    
    if (type === 'WARNING' || type === 'CAUTION') {
      bg = 'bg-amber-50 dark:bg-amber-955/10 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-400';
      label = 'Warning';
      Icon = AlertTriangle;
    } else if (type === 'IMPORTANT') {
      bg = 'bg-red-50 dark:bg-red-955/10 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-400';
      label = 'Important';
      Icon = ShieldAlert;
    } else if (type === 'TIP') {
      bg = 'bg-emerald-50 dark:bg-emerald-955/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-400';
      label = 'Tip';
      Icon = Sparkles;
    }
    
    return (
      <div key={key} className={`my-3 p-3 rounded-xl border ${bg} flex gap-2.5 items-start`}>
        <Icon size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-outfit font-black text-[9px] uppercase tracking-wider block mb-0.5">{label}</span>
          <div className="text-[10px] leading-relaxed">
            {lines.map((line, lidx) => {
              const boldRegex = /\*\*(.*?)\*\*/g;
              if (boldRegex.test(line)) {
                const parts = line.split(boldRegex);
                return (
                  <p key={lidx} className="mb-0.5 last:mb-0">
                    {parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-bold">{part}</strong> : part)}
                  </p>
                );
              }
              return <p key={lidx} className="mb-0.5 last:mb-0">{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    let inAlert = false;
    let alertType = '';
    let alertLines: string[] = [];
    const elements: React.ReactNode[] = [];
    
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      
      if (line.startsWith('> ')) {
        const content = line.substring(2).trim();
        if (content.startsWith('[!')) {
          inAlert = true;
          alertType = content.replace('[!', '').replace(']', '').toUpperCase();
          alertLines = [];
          continue;
        }
        if (inAlert) {
          alertLines.push(content);
          continue;
        }
      } else if (inAlert && !line.startsWith('> ')) {
        elements.push(renderAlert(alertType, alertLines, idx));
        inAlert = false;
        alertType = '';
        alertLines = [];
      }
      
      if (inAlert) continue;
      
      if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="font-outfit font-black text-xs text-red-600 dark:text-red-500 mt-3 mb-1.5 first:mt-0">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={idx} className="font-outfit font-bold text-[11px] text-gray-900 dark:text-white mt-2 mb-0.5">{line.replace('#### ', '')}</h4>);
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-3 border-gray-150 dark:border-gray-800" />);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          elements.push(
            <li key={idx} className="list-disc ml-4 mb-1 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white font-bold">{boldMatch[1]}</strong>{boldMatch[2]}
            </li>
          );
        } else {
          elements.push(<li key={idx} className="list-disc ml-4 mb-1 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">{content}</li>);
        }
      } else if (/^\d+\s*\.\s/.test(line)) {
        const content = line.replace(/^\d+\s*\.\s/, '');
        const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          elements.push(
            <div key={idx} className="flex gap-1.5 ml-1 mb-1.5 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
              <span className="font-black text-red-500">{line.match(/^\d+/)?.[0]}.</span>
              <div>
                <strong className="text-gray-900 dark:text-white font-bold">{boldMatch[1]}</strong>{boldMatch[2]}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={idx} className="flex gap-1.5 ml-1 mb-1.5 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
              <span className="font-black text-red-500">{line.match(/^\d+/)?.[0]}.</span>
              <span>{content}</span>
            </div>
          );
        }
      } else if (line.startsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (cells.every(c => c.startsWith('---') || c.startsWith(':---'))) continue;
        const isHeader = idx === 0 || lines[idx - 1].startsWith('###') || (lines[idx + 1] && lines[idx + 1].includes('---'));
        elements.push(
          <div key={idx} className={`grid grid-cols-2 gap-2 p-1.5 text-[10px] border-b border-gray-100 dark:border-gray-800/40 ${isHeader ? 'bg-gray-50 dark:bg-gray-850 font-black text-red-600 dark:text-red-500 rounded-t-lg' : 'text-gray-600 dark:text-gray-400'}`}>
            {cells.map((cell, cidx) => {
              const cleanCell = cell.replace(/\*\/g/g, '').replace(/\*\*/g, '');
              return <span key={cidx} className="break-words font-medium">{cleanCell}</span>;
            })}
          </div>
        );
      } else {
        const boldRegex = /\*\*(.*?)\*\*/g;
        if (boldRegex.test(line)) {
          const parts = line.split(boldRegex);
          elements.push(
            <p key={idx} className="mb-1 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">
              {parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="text-gray-900 dark:text-white font-bold">{part}</strong> : part)}
            </p>
          );
        } else {
          elements.push(line.trim() ? <p key={idx} className="mb-1 text-[10px] leading-relaxed text-gray-600 dark:text-gray-400">{line}</p> : <div key={idx} className="h-1.5" />);
        }
      }
    }
    
    if (inAlert) {
      elements.push(renderAlert(alertType, alertLines, lines.length));
    }
    
    return elements;
  };

  // Determine standard presets based on path
  const getRoutePresetsType = () => {
    if (pathname?.startsWith('/products')) return 'products';
    if (pathname?.startsWith('/cart') || pathname?.startsWith('/checkout')) return 'cart';
    if (pathname?.startsWith('/appointments')) return 'appointments';
    if (pathname?.startsWith('/dashboard')) return 'orders';
    return 'default';
  };

  const activePresets = ROUTE_PRESETS[getRoutePresetsType()];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Floating Chat Panel Wrapper */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[520px] mb-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col origin-bottom-right"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0px 0px 0px 0px rgba(255, 255, 255, 0.2)",
                      "0px 0px 10px 4px rgba(255, 255, 255, 0.4)",
                      "0px 0px 0px 0px rgba(255, 255, 255, 0.2)"
                    ]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-white backdrop-blur-md"
                >
                  <Bot size={18} />
                </motion.div>
                <div>
                  <h3 className="font-outfit font-black text-xs flex items-center gap-1.5">
                    Safety Co-Pilot
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                  </h3>
                  <p className="text-[9px] opacity-75">Live Fire Safety & Product Assistant</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-all active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-950/20"
            >
              {/* Message List */}
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0 shadow-sm self-start">
                        <Bot size={14} />
                      </div>
                    )}
                    
                    <div className="flex-1 max-w-[85%] flex flex-col items-start gap-1">
                      <div className={`w-full rounded-2xl px-4 py-3 text-[10.5px] shadow-sm leading-relaxed relative group ${
                        isAI 
                          ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-850 rounded-tl-none font-medium' 
                          : 'bg-red-600 text-white rounded-tr-none self-end'
                      }`}>
                        {msg.isStreaming && msg.text === '' ? (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <>
                            {isAI ? (
                              <div className="space-y-1 pr-6">{renderMessageContent(msg.text)}</div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                          </>
                        )}

                        {/* Text-to-Speech Safety Read Aloud button */}
                        {isAI && !msg.isStreaming && msg.text.trim() !== '' && (
                          <button
                            onClick={() => speakMessage(msg.text, msg.id)}
                            className="absolute right-2 top-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Read Aloud"
                          >
                            {speakingMessageId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        )}

                        {/* Render Dynamic Clickable In-Chat Product Cards */}
                        {isAI && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                              <ShoppingCart size={9} />
                              Recommended Products:
                            </p>
                            {msg.recommendedProducts.map((prod) => (
                              <div 
                                key={prod._id} 
                                className="p-2 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 flex gap-2 items-center hover:bg-red-50/20 dark:hover:bg-red-955/5 transition-all shadow-sm"
                              >
                                <img 
                                  src={prod.image || '/images/placeholder.png'} 
                                  alt={prod.name} 
                                  className="w-10 h-10 rounded-lg object-cover bg-white dark:bg-gray-955 border border-gray-150 dark:border-gray-800 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[9.5px] font-bold text-gray-800 dark:text-gray-200 truncate">{prod.name}</h4>
                                  <p className="text-[9.5px] font-black text-red-600 dark:text-red-500">₹{prod.price}</p>
                                </div>
                                <a 
                                  href={`/products/${prod.slug}`}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-[9px] font-black transition-all whitespace-nowrap active:scale-95 shadow-sm"
                                >
                                  View Product
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Presets - Render at the end if welcome screen is the only message */}
              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {activePresets.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendPrompt(item.prompt)}
                        className="text-left p-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-red-50/50 dark:hover:bg-red-955/10 border border-gray-150 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/30 flex gap-2 items-start group transition-all duration-300 active:scale-[0.98] shadow-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-red-600 border border-gray-100 dark:border-gray-800 group-hover:scale-105 transition-all flex-shrink-0">
                          <Icon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[9.5px] font-bold text-gray-850 dark:text-gray-200 group-hover:text-red-600 transition-colors mb-0.5 truncate">{item.label}</h4>
                          <p className="text-[8px] text-gray-400 line-clamp-1 leading-normal">{item.prompt}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleFormSubmit}
              className="p-3 bg-white dark:bg-gray-900 border-t border-gray-150 dark:border-gray-800 flex gap-1.5 items-center"
            >
              {/* Mic Icon for Speech input */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 ${
                  isListening 
                    ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-150 dark:border-gray-850 text-gray-450 dark:text-gray-500 hover:text-red-500'
                }`}
                title="Speak Question"
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask SG Fire AI a safety question..."}
                disabled={isListening}
                className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-150 dark:border-gray-850 focus:border-red-500 focus:bg-white dark:focus:bg-gray-950 rounded-xl px-3.5 py-2.5 text-[10.5px] outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()} 
                className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl flex items-center justify-center transform active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all shadow-md shadow-red-600/10 flex-shrink-0"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:shadow-red-600/30 transition-shadow relative"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white dark:border-gray-900"></span>
        </span>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Sparkles size={22} className="animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
