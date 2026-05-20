'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  CheckCircle,
  MessageSquare,
  ShieldAlert,
  Flame,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  createdAt: Date;
  isStreaming?: boolean;
}

const PRESET_PROMPTS = [
  {
    label: "Kitchen Extinguishers",
    icon: Flame,
    prompt: "Which fire extinguisher is recommended for a home kitchen?"
  },
  {
    label: "Smoke Detector Placement",
    icon: ShieldCheck,
    prompt: "Where should I install smoke detectors in my house?"
  },
  {
    label: "Grease Fire Protocol",
    icon: AlertTriangle,
    prompt: "What are the immediate steps to take if a grease fire starts?"
  },
  {
    label: "Equipment Testing Schedule",
    icon: FileText,
    prompt: "How often should I test my residential fire safety equipment?"
  }
];

const AI_RESPONSES: Record<string, string> = {
  "Which fire extinguisher is recommended for a home kitchen?": 
    "### 🧯 Recommended Home Kitchen Extinguisher: Class F / Wet Chemical or CO2\n\nA home kitchen is one of the most common locations for fires. Selecting the correct extinguisher is critical, as using the wrong one can escalate the danger.\n\n#### 1. Kitchen Extinguisher Types:\n* **Class F (Wet Chemical) Extinguisher:**\n  * **The Gold Standard for Kitchens:** Specifically designed for cooking oil, fat, and deep fryer fires (Class F/K).\n  * **Mechanism:** It releases a soapy chemical foam that cools the oil and smothers the fire via a process called *saponification*.\n* **Carbon Dioxide (CO2) Gas Extinguisher:**\n  * **Safe for Electricals:** Recommended if an electrical appliance (microwave, toaster, stovetop) catches fire.\n  * **Mechanism:** Displaces oxygen. Leaves zero messy chemical residue, protecting electrical circuits.\n* **Dry Powder (ABC) Extinguisher:**\n  * **Emergency Alternate:** Can be used on wood/fabric or small oil fires, but *caution* is required: high-pressure spray can spread liquid oil.\n\n#### ⚠️ Critical Hazard Alert:\n> [!WARNING]\n> **NEVER USE WATER ON A GREASE OR ELECTRICAL FIRE!**\n> Water will vaporize instantly, exploding the burning grease into a massive fireball and spreading the fire across the room.",

  "Where should I install smoke detectors in my house?":
    "### 🚨 Residential Smoke Detector Placement Guide\n\nTo ensure early warning and robust safety, detectors must be strategically positioned across your living areas according to international safety standards (NFPA 72).\n\n#### 1. Essential Locations (Where to Install):\n* **Inside Every Bedroom:** Ensures sleepers are woken up even if doors are closed.\n* **Outside Every Sleeping Area:** Install in common corridors leading to bedrooms.\n* **Every Floor Level:** Put at least one detector on every single level of the house, including basements.\n* **Living and Dining Rooms:** Near entryways and stairwells.\n\n#### 2. Prohibited Locations (Where to Avoid):\n* **Within 10 feet (3 meters) of Cooking Appliances:** Steam and cooking fumes trigger false alarms.\n* **Bathrooms or High-Humidity Areas:** Moisture can damage internal photoelectric sensors.\n* **Near Drafts, Fans, or Vents:** Moving air blows smoke away from the detector.\n\n#### 💡 Optimal Mounting Tips:\n> [!TIP]\n> Mount smoke detectors on ceilings, keeping them at least **4 inches (10 cm)** away from adjacent walls. If mounting on a wall, position them **4 to 12 inches** below the ceiling to avoid dead-air spaces.",

  "What are the immediate steps to take if a grease fire starts?":
    "### 🔥 Immediate Action Plan: Grease Fire Emergency\n\nA grease fire is highly volatile and spreads rapidly. Follow this strict 4-step emergency sequence to control it safely:\n\n#### 1. Cut the Heat Source Immediately:\n* Carefully reach for the stove knob and turn the burner **OFF**. If safe, unplug electric deep fryers. Do not move the burning pan.\n\n#### 2. Smother the Flame:\n* Slide a large **metal pan lid** or baking sheet over the pan to cut off oxygen.\n* You can also dump a generous amount of **baking soda** or salt onto the flame (do NOT use flour, which is highly explosive!).\n\n#### 3. Do NOT Move the Pan:\n* Trying to carry a burning, oil-filled pan to the sink or outdoors will cause severe skin burns and splash fire across your kitchen.\n\n#### 4. Evacuate & Call Emergency Services:\n* If the fire is not completely smothered within 30 seconds, evacuate the building immediately and dial the emergency line (101 / 112).\n\n#### 🧯 Emergency Fire Checklist:\n| Safe Actions | Dangerous Actions |\n| :--- | :--- |\n| Turn burner OFF | Throw Water on the pan |\n| Cover with a metal lid | Wave kitchen towels to fan flames |\n| Pour Baking Soda | Try to carry the pan outside |\n| Use a Class F / CO2 extinguisher | Use flour or baking powder |",

  "How often should I test my residential fire safety equipment?":
    "### 🛠️ Residential Safety Equipment Maintenance Schedule\n\nContinuous testing guarantees your home defense works when it matters most. Follow this NFPA-compliant residential schedule:\n\n#### 1. Smoke and Heat Detectors:\n* **Test (Monthly):** Press the physical test button to verify the alarm horn works.\n* **Batteries (Every 6 Months):** Replace standard 9V batteries twice a year, or use 10-year sealed lithium battery detectors.\n* **Replacement (Every 10 Years):** Photoelectric sensors degrade over time. Replace the entire detector unit after 10 years of use.\n\n#### 2. Portable Fire Extinguishers:\n* **Visual Inspection (Monthly):** Check that the pressure gauge needle is in the **GREEN** zone. Ensure the nozzle is clear and the safety pin is intact.\n* **Shaking (Every 6 Months):** Turn dry powder extinguishers upside down and shake them to prevent the powder from compacting.\n* **Hydrostatic Testing (Every 5-10 Years):** Professional pressure test of the metal cylinder shell.\n\n#### 3. Escape Plan Drill:\n* **Family Drill (Every 6 Months):** Run dry run escape drills with children and elderly relatives. Establish an outdoor meeting point."
};

const DEFAULT_AI_ANSWER = "### 🧠 SG Fire Safety AI Co-Pilot\n\nI am currently analyzing your query. As your dedicated safety assistant, I can help you research home safety guidelines, fire extinguisher ratings, residential escape route planning, or equipment checks.\n\n**To get a precise reply, please try asking:**\n* \"Which fire extinguisher is recommended for a home kitchen?\"\n* \"Where should I install smoke detectors in my house?\"\n* \"What are the immediate steps to take if a grease fire starts?\"\n* \"How often should I test my residential fire safety equipment?\"";

export default function UserHelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **SG Fire Safety AI Assistant**. I can help you with home safety precautions, equipment installations, troubleshooting false alarms, or drafting family emergency escape plans. \n\nSelect one of the quick prompts below or type your safety questions to begin!",
      createdAt: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

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

    // Simulate AI Streaming text delivery
    const fullReply = AI_RESPONSES[textToSend.trim()] || DEFAULT_AI_ANSWER;
    let currentLength = 0;
    const intervalTime = 15; // ms per block
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
    let bg = 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-450';
    let label = 'Note';
    let Icon = HelpCircle;
    
    if (type === 'WARNING' || type === 'CAUTION') {
      bg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-400';
      label = 'Warning';
      Icon = AlertTriangle;
    } else if (type === 'IMPORTANT') {
      bg = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-400';
      label = 'Important';
      Icon = ShieldAlert;
    } else if (type === 'TIP') {
      bg = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-400';
      label = 'Tip';
      Icon = Sparkles;
    }
    
    return (
      <div key={key} className={`my-4 p-4 rounded-2xl border ${bg} flex gap-3 items-start`}>
        <Icon size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-outfit font-black text-[10px] uppercase tracking-wider block mb-1">{label}</span>
          <div className="text-[11px] leading-relaxed">
            {lines.map((line, lidx) => {
              const boldRegex = /\*\*(.*?)\*\*/g;
              if (boldRegex.test(line)) {
                const parts = line.split(boldRegex);
                return (
                  <p key={lidx} className="mb-1 last:mb-0">
                    {parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-bold">{part}</strong> : part)}
                  </p>
                );
              }
              return <p key={lidx} className="mb-1 last:mb-0">{line}</p>;
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
        elements.push(<h3 key={idx} className="font-outfit font-black text-sm text-red-600 dark:text-red-500 mt-4 mb-2 first:mt-0">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={idx} className="font-outfit font-bold text-xs text-gray-900 dark:text-white mt-3 mb-1">{line.replace('#### ', '')}</h4>);
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-4 border-gray-200 dark:border-gray-800" />);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          elements.push(
            <li key={idx} className="list-disc ml-5 mb-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white font-bold">{boldMatch[1]}</strong>{boldMatch[2]}
            </li>
          );
        } else {
          elements.push(<li key={idx} className="list-disc ml-5 mb-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">{content}</li>);
        }
      } else if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
        if (boldMatch) {
          elements.push(
            <div key={idx} className="flex gap-2 ml-1 mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              <span className="font-black text-red-500">{line.match(/^\d+/)?.[0]}.</span>
              <div>
                <strong className="text-gray-900 dark:text-white font-bold">{boldMatch[1]}</strong>{boldMatch[2]}
              </div>
            </div>
          );
        } else {
          elements.push(
            <div key={idx} className="flex gap-2 ml-1 mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
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
          <div key={idx} className={`grid grid-cols-2 gap-4 p-2 text-[11px] border-b border-gray-100 dark:border-gray-800/50 ${isHeader ? 'bg-gray-50 dark:bg-gray-800/40 font-black text-red-600 dark:text-red-500 rounded-t-xl' : 'text-gray-600 dark:text-gray-400'}`}>
            {cells.map((cell, cidx) => {
              const cleanCell = cell.replace(/\*\*/g, '');
              return <span key={cidx} className="break-words font-medium">{cleanCell}</span>;
            })}
          </div>
        );
      } else {
        const boldRegex = /\*\*(.*?)\*\"/g;
        if (boldRegex.test(line)) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          elements.push(
            <p key={idx} className="mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              {parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="text-gray-900 dark:text-white font-bold">{part}</strong> : part)}
            </p>
          );
        } else {
          elements.push(line.trim() ? <p key={idx} className="mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">{line}</p> : <div key={idx} className="h-2" />);
        }
      }
    }
    
    if (inAlert) {
      elements.push(renderAlert(alertType, alertLines, lines.length));
    }
    
    return elements;
  };

  return (
    <DashboardLayout title="AI Safety Co-Pilot" subtitle="Your interactive, smart residential safety advisor">
      <div className="h-[calc(100vh-20rem)] lg:h-[600px] flex flex-col gap-6">
        
        {/* Main Grid: Info Sidebar + Chat Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Preset Prompts Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-red-600 animate-pulse" />
                <h3 className="font-outfit font-black text-base dark:text-white">Quick Guides</h3>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Trigger simulated safety assistants and get beautiful residential guidelines or action plans instantly.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {PRESET_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(item.prompt)}
                    className="w-full text-left p-4 rounded-2xl bg-gray-50 dark:bg-gray-850 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-gray-100 dark:border-gray-800/40 hover:border-red-200 dark:hover:border-red-900/30 flex gap-3 items-start group transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-red-600 shadow-sm border border-gray-150 dark:border-gray-800 group-hover:scale-105 transition-all flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors mb-1 truncate">{item.label}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{item.prompt}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100/50 dark:border-red-950/20 flex gap-3 items-center">
              <Bot size={20} className="text-red-600 flex-shrink-0" />
              <div className="text-[10px] leading-relaxed text-red-900 dark:text-red-400 font-medium">
                <span className="font-bold">Pro-Tip:</span> The AI specializes in Indian household scenarios and NFPA placement requirements.
              </div>
            </div>
          </div>

          {/* AI Interactive Chat Console */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-sm">
            
            {/* Console Header */}
            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-600/10">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-sm dark:text-white flex items-center gap-1.5">
                    Safety Co-Pilot
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400">Offline Simulated AI Assistant</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-full text-[9px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                  <CheckCircle size={10} /> Active Session
                </div>
              </div>
            </div>

            {/* Chat Messages Frame */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/20 dark:bg-gray-950/10"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isAI = msg.sender === 'ai';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAI && (
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Bot size={16} />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-xs shadow-sm ${
                        isAI 
                          ? 'bg-white dark:bg-gray-800 text-gray-850 dark:text-gray-150 border border-gray-150 dark:border-gray-850 rounded-tl-none font-medium' 
                          : 'bg-red-600 text-white rounded-tr-none'
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
                              <div className="space-y-1">{renderMessageContent(msg.text)}</div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                            <div className={`text-[8px] mt-2.5 text-right font-medium opacity-60`}>
                              {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        )}
                      </div>

                      {!isAI && (
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <User size={16} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Chat Input Console Form */}
            <form 
              onSubmit={handleFormSubmit} 
              className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask SG Fire AI about home safety, kitchen extinguishers, smoke alarms..."
                className="flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-150 dark:border-gray-850 focus:border-red-500 focus:bg-white dark:focus:bg-gray-950 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()} 
                className="px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center transform active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all shadow-md shadow-red-600/10 flex-shrink-0"
              >
                <Send size={14} className="mr-1.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Send</span>
              </button>
            </form>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
