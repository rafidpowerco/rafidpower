import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

/**
 * About Section - Modern Industrial Design
 * Features: Company history, values, achievements
 * Design: Two-column layout with text and image
 */
export default function AboutSection() {
  const { t } = useLanguage();

  const achievements = [
    t('about.item1'),
    t('about.item2'),
    t('about.item3'),
    t('about.item4'),
    t('about.item5'),
    t('about.item6'),
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 space-y-8 animate-slide-up">
            <div className="inline-block px-4 py-1.5 border border-[#e63946]/20 bg-[#e63946]/5 rounded-full text-[#e63946] text-sm font-bold uppercase tracking-wider">
              {t('about.title')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a3a52] leading-tight drop-shadow-sm">
              {t('about.subtitle')}
            </h2>
            <div className="w-24 h-1.5 bg-[#e63946] rounded-full"></div>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {t('about.desc')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {achievements.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <CheckCircle2 className="text-[#e63946] mt-1 shrink-0 bg-white" size={22} />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="relative lg:w-1/2"
          >
            {/* Decorative background element behind image */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#1a3a52]/20 to-[#e63946]/20 rounded-2xl blur-xl transform -rotate-3"></div>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-2xl border border-white/40 relative z-10">
              <img
                src="/images/factory_weighing_system.png"
                alt="شركة الرافدين للموازين"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a52]/80 via-transparent to-transparent"></div>
            </div>

            {/* Stats Overlay */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-3 md:gap-4 mt-6 md:absolute md:-bottom-10 md:left-10 md:right-10 z-20"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 text-center border-b-4 border-[#e63946] shadow-xl hover:-translate-y-2 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-black text-[#1a3a52]"><span className="text-[#e63946]">35</span>+</div>
                <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">سنة خبرة</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 text-center border-b-4 border-[#e63946] shadow-xl hover:-translate-y-2 transition-transform duration-300 delay-75">
                <div className="text-3xl md:text-4xl font-black text-[#1a3a52]"><span className="text-[#e63946]">1K</span>+</div>
                <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">عميل راضي</div>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 text-center border-b-4 border-[#e63946] shadow-xl hover:-translate-y-2 transition-transform duration-300 delay-150">
                <div className="text-3xl md:text-4xl font-black text-[#1a3a52]"><span className="text-[#e63946]">100</span>%</div>
                <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">ضمان الجودة</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
