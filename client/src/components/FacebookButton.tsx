import { useState } from 'react';
import { Facebook, ExternalLink, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacebookButton() {
  const { isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const facebookUrl = 'https://www.facebook.com/rafid.scale/';

  return (
    <div className="fixed bottom-[110px] sm:bottom-40 right-6 sm:right-8 z-50">
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center justify-end relative group cursor-pointer drop-shadow-2xl"
        title={isRTL ? 'صفحة رافد باور الرسمية' : 'Rafid Power Official Page'}
        aria-label="Visit Facebook"
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, width: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: isRTL ? -20 : 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`absolute overflow-hidden whitespace-nowrap bg-gradient-to-r from-[#1877F2] to-[#0A56CA] text-white py-2.5 px-4 h-14 flex items-center shadow-lg ${isRTL ? 'right-6 rounded-r-full rounded-l-2xl' : 'left-6 rounded-l-full rounded-r-2xl'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ paddingRight: isRTL ? '40px' : '16px', paddingLeft: isRTL ? '16px' : '40px' }}
            >
              <div className="flex flex-col relative z-20">
                <span className="font-bold text-[13px] tracking-wide flex items-center gap-1.5">
                  <Activity size={14} className="animate-pulse text-blue-200" />
                  {isRTL ? 'آخر الإنجازات الصناعية' : 'Latest Industrial Projects'}
                </span>
                <span className="text-[10px] text-blue-100 uppercase tracking-widest font-mono flex items-center gap-1 mt-0.5">
                  {isRTL ? 'تابعنا على فيسبوك' : 'Follow on Facebook'}
                  <ExternalLink size={10} />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Icon Itself */}
        <div className="relative w-14 h-14 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1877F2] rounded-full animate-ping opacity-30 group-hover:opacity-60 duration-1000"></div>
          <div className="absolute inset-[-4px] bg-gradient-to-tr from-[#1877F2] to-blue-400 rounded-full opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300"></div>
          
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-full h-full bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(24,119,242,0.5)] group-hover:shadow-[0_0_30px_rgba(24,119,242,0.8)] border border-blue-400/30 transition-all"
          >
            <Facebook size={28} strokeWidth={1.5} className="fill-current" />
          </motion.div>
        </div>
      </a>
    </div>
  );
}
