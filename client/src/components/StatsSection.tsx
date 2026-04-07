import { useEffect, useState, useRef } from 'react';
import { Truck, Users, Award, Briefcase, Facebook, TrendingUp, Hexagon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useInView } from 'framer-motion';

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
}

const StatItem = ({ icon: Icon, value, label, suffix = '' }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const domRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(domRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    // Longer duration for a more dramatic, premium feel
    const duration = 2500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [isInView, value]);

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      ref={domRef} 
      className="relative flex flex-col items-center p-8 bg-gradient-to-b from-[#1a3a52]/80 to-[#0A1218] backdrop-blur-xl rounded-3xl border border-white/5 hover:border-[#F5060B]/50 transition-all duration-500 group overflow-hidden shadow-2xl"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-[#F5060B]/0 group-hover:bg-[#F5060B]/10 transition-colors duration-500 z-0"></div>
      
      {/* Icon Hexagon Container */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-6 z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">
        <Hexagon size={96} className="absolute inset-0 text-white/5 group-hover:text-[#F5060B]/20 transition-colors stroke-[0.5]" />
        <div className="w-16 h-16 bg-gradient-to-br from-[#F5060B] to-[#b30408] rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_20px_rgba(245,6,11,0.5)] flex items-center justify-center">
          <Icon size={32} className="text-white -rotate-3 group-hover:-rotate-12 transition-transform duration-500" />
        </div>
      </div>

      <div className="text-5xl md:text-6xl font-black mb-3 text-white tabular-nums z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {count.toLocaleString()}<span className="text-[#F5060B] text-4xl">{suffix}+</span>
      </div>
      
      <div className="text-gray-300 font-bold uppercase tracking-[0.2em] text-xs text-center z-10 bg-black/30 px-4 py-1.5 rounded-full border border-white/10 group-hover:border-[#F5060B]/30 transition-colors">
        {label}
      </div>
    </motion.div>
  );
};

export default function StatsSection() {
  const { t, isRTL } = useLanguage();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
    }
  };

  return (
    <section className="py-32 bg-[#0A1218] relative overflow-hidden">
      {/* Premium Dark Tech Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      {/* Glowing Energy Lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5060B]/50 to-transparent shadow-[0_0_15px_rgba(245,6,11,0.8)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2d5a7b]/50 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#2d5a7b]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a3a52] border border-[#2d5a7b] mb-6">
            <TrendingUp size={16} className="text-[#F5060B]" />
            <span className="text-white text-sm font-bold tracking-widest uppercase">{t('stat.title') || "أرقام تتحدث عن نفسها"}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {/* Using 10,000 for Facebook followers accurately based on the company's real metrics */}
          <StatItem icon={Briefcase} value={35} label={t('stat.1')} suffix="" />
          <StatItem icon={Truck} value={1800} label={t('stat.2')} suffix="" />
          <StatItem icon={Users} value={540} label={t('stat.3')} suffix="" />
          <StatItem icon={Award} value={18} label={t('stat.4')} suffix="" />
          <StatItem icon={Facebook} value={10340} label={t('stat.5')} suffix="" />
        </motion.div>
      </div>
    </section>
  );
}
