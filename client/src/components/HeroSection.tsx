import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import QuoteDialog from './QuoteDialog';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hero Section - Modern Industrial Design
 * Features: Large background image, compelling headline, CTA buttons, Framer Motion animations
 * Design: Dark overlay with white text for contrast
 */
export default function HeroSection() {
  const { t, isRTL } = useLanguage();

  return (
    <section
      id="home"
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center pt-20 overflow-hidden"
      style={{
        backgroundImage: 'url(/images/hero.png)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a52]/80 via-black/50 to-[#1a3a52]/80"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block px-4 py-1.5 border border-white/20 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold uppercase tracking-wider mb-4"
          >
            {t('hero.badge')}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight drop-shadow-2xl"
          >
            {t('hero.title.1')} <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#e63946] to-[#ff6b6b]">{t('hero.title.2')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-2xl md:text-3xl font-medium text-gray-100 max-w-2xl mx-auto drop-shadow-md"
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-300 font-light max-w-xl mx-auto"
          >
            {t('hero.desc')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-10"
          >
            <a href="#services">
              <Button
                size="lg"
                className="bg-[#e63946] hover:bg-[#d62828] text-white font-bold text-xl px-10 py-8 shadow-xl shadow-[#e63946]/20 hover:shadow-[#e63946]/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                {t('hero.explore')}
                <ArrowRight className={isRTL ? "mr-2 rotate-180" : "ml-2"} size={24} />
              </Button>
            </a>
            <QuoteDialog 
              triggerChild={
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/80 text-white bg-white/5 backdrop-blur-sm hover:bg-white/20 hover:-translate-y-1 font-bold text-xl px-10 py-8 transition-all duration-300 w-full sm:w-auto"
                >
                  {t('btn.quote')}
                </Button>
              }
            />
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60"
      >
        <span className="text-xs uppercase tracking-[0.2em]">{t('hero.scrollDown')}</span>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-2 bg-[#e63946] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

