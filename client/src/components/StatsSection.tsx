import { useEffect, useState, useRef } from 'react';
import { Truck, Users, Award, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
}

const StatItem = ({ icon: Icon, value, label, suffix = '' }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = value;
    const duration = 2000;
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
  }, [isVisible, value]);

  return (
    <div ref={domRef} className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#e63946]/50 transition-all duration-500 group">
      <div className="w-16 h-16 bg-[#e63946] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#e63946]/20">
        <Icon size={32} className="text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-black mb-2 text-white tabular-nums">
        {count}{suffix}+
      </div>
      <div className="text-gray-400 font-bold uppercase tracking-wider text-sm">
        {label}
      </div>
    </div>
  );
};

export default function StatsSection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-[#12263a] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e63946]/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatItem icon={Briefcase} value={35} label={t('stat.1')} suffix="" />
          <StatItem icon={Truck} value={1200} label={t('stat.2')} suffix="" />
          <StatItem icon={Users} value={500} label={t('stat.3')} suffix="" />
          <StatItem icon={Award} value={15} label={t('stat.4')} suffix="" />
        </div>
      </div>
    </section>
  );
}
