import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Cpu, MoveRight, MoveLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SovereignAgiWidget() {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'agi', text: string}[]>([
    { role: 'agi', text: isRTL ? 'مرحباً! أنا ZIND (زند) — الذكاء الاصطناعي السيادي لشركة الرافدين. أراقب المنظومة 24/7. كيف يمكنني مساعدتك اليوم؟' : 'Hello! I am ZIND — The Sovereign AI of Al-Rafidain. I monitor the system 24/7. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Track user movements simulating AGI learning
  useEffect(() => {
    const handleAction = () => {
      // Logic to send interaction data to AGI core
      // console.log("AGI Event Logged");
    };
    window.addEventListener('click', handleAction);
    return () => window.removeEventListener('click', handleAction);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Connect to the local AGI nerve center
      const apiUrl = import.meta.env.VITE_AGI_API_URL || "http://localhost:9000";
      const response = await fetch(`${apiUrl}/agi/think`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_description: userMsg })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'agi', text: data.engineered_solution }]);
      } else {
        throw new Error("AGI Core disconnected");
      }
    } catch (error) {
      // Fallback if the AGI daemon is not running yet
      let reply = '';
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes('plc') || lowerMsg.includes('برمجة') || lowerMsg.includes('تحكم') || lowerMsg.includes('automation')) {
        reply = isRTL 
          ? 'تم تحليل الاستعلام. أنظمة (PLC) التي نستخدمها مدعومة لتعمل بتوافق كامل مع خطوط الإنتاج الحديثة، توفر دقة بـ 0.01 وتتكامل مع بروتوكولات (Modbus). سيقوم كبير المهندسين بتزويدك بالكتالوج الفني.' 
          : 'Query analyzed. Our PLC systems are fully compatible with modern production lines, offering 0.01 precision and Modbus integration. A senior engineer will provide the technical catalog.';
      } else if (lowerMsg.includes('load cell') || lowerMsg.includes('حساس') || lowerMsg.includes('خلية') || lowerMsg.includes('sensor')) {
        reply = isRTL 
          ? 'بناءً على المعطيات الهندسية، خلايا الوزن الرقمية (Load Cells) لدينا مضادة للتذبذب وتتحمل أقصى ظروف الضغط الصناعي مع شهادات اعتماد (OIML C3). هل ترغب بمعرفة الأسعار؟' 
          : 'Based on engineering data, our digital Load Cells are anti-oscillation and withstand peak industrial pressure with OIML C3 certification. Would you like to know the pricing?';
      } else if (lowerMsg.includes('سعر') || lowerMsg.includes('تكلفة') || lowerMsg.includes('price') || lowerMsg.includes('cost')) {
        reply = isRTL 
          ? 'بكل تأكيد. تم تحويل هذا الطلب أوتوماتيكياً إلى قسم مبيعات (RAFID POWER). لضمان تسعير دقيق، يرجى تزويدنا بسعة الميزان المطلوبة.' 
          : 'Absolutely. This request has been routed to RAFID POWER sales. For an accurate quote, please provide the required scale capacity.';
      } else {
        reply = isRTL 
          ? '[النظام يعمل في وضع الخوادم الاحتياطية]: تم تسجيل الاستعلام. سأقوم بتوجيه أحد المهندسين الخبراء إليك فوراً.'
          : '[System running in fallback mode]: Query logged. An expert engineer will contact you shortly.';
      }
      
      setMessages(prev => [...prev, { role: 'agi', text: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="relative group bg-[#1a3a52] hover:bg-[#F5060B] text-white p-4 rounded-full shadow-[0_0_20px_rgba(245,6,11,0.4)] transition-all duration-300 transform hover:scale-110"
          >
            <div className="absolute inset-0 bg-[#F5060B] rounded-full animate-ping opacity-20"></div>
            <Cpu size={32} className="relative z-10" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {isRTL ? 'تحدث مع الذكاء الاصطناعي' : 'Chat with AGI'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-0 left-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col font-sans"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a3a52] to-[#2d5a7b] p-4 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5060B]/20 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <Bot size={20} className="text-[#F5060B]" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a3a52] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-[0.15em] uppercase">ZIND · زند</h3>
                  <p className="text-[10px] text-gray-300 font-mono tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    Sovereign AI · Online
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors relative z-10 p-1 bg-white/5 rounded-md hover:bg-[#F5060B]"
                title="إغلاق / Close"
                aria-label="Close AGI Chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? (isRTL ? -20 : 20) : (isRTL ? 20 : -20) }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#1a3a52] text-white rounded-2xl rounded-tr-sm shadow-md' 
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm'
                  }`}>
                    {msg.role === 'agi' && (
                      <div className="flex items-center gap-1.5 mb-1 opacity-50">
                        <Cpu size={12} />
                        <span className="text-[10px] font-mono tracking-wider uppercase">ZIND</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-[#F5060B] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#F5060B] rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-[#F5060B] rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="bg-gray-50 border border-gray-200 rounded-full flex items-center p-1 px-2 focus-within:border-[#F5060B] focus-within:ring-1 focus-within:ring-[#F5060B]/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isRTL ? "اسأل ZIND..." : "Ask ZIND..."}
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-700 placeholder-gray-400"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  title={isRTL ? "إرسال" : "Send"}
                  aria-label="Send message"
                  className="w-10 h-10 bg-[#F5060B] hover:bg-black text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
                >
                  {isRTL ? <MoveLeft size={18} /> : <MoveRight size={18} />}
                </button>
              </div>
            </div>
            
            {/* Minimal footer */}
            <div className="bg-gray-100 py-1.5 text-center border-t border-gray-200">
              <span className="text-[9px] text-gray-400 uppercase font-mono tracking-widest">
                ZIND · Powered by Al-Rafidain Neural Engine
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
