import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
          <div className="relative">
            <div className="bg-white/10 backdrop-blur rounded-lg overflow-hidden shadow-2xl border border-white/20">
              <img
                src="/images/about.png"
                alt="شركة الرافدين للموازين"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />

            </div>

            {/* Stats Overlay */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[#e63946]">35+</div>
                <div className="text-sm text-gray-100 mt-2">سنة خبرة</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[#e63946]">1000+</div>
                <div className="text-sm text-gray-100 mt-2">عميل راضي</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[#e63946]">100%</div>
                <div className="text-sm text-gray-100 mt-2">ضمان الجودة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
