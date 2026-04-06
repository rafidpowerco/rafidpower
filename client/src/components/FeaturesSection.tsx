import { ShieldCheck, Target, Zap, Clock, ThumbsUp, Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Scale,
      title: t('feat.1.t'),
      description: t('feat.1.d'),
    },
    {
      icon: ShieldCheck,
      title: t('feat.2.t'),
      description: t('feat.2.d'),
    },
    {
      icon: Target,
      title: t('feat.3.t'),
      description: t('feat.3.d'),
    },
    {
      icon: Clock,
      title: t('feat.4.t'),
      description: t('feat.4.d'),
    },
    {
      icon: Zap,
      title: t('feat.5.t'),
      description: t('feat.5.d'),
    },
    {
      icon: ThumbsUp,
      title: t('feat.6.t'),
      description: t('feat.6.d'),
    },
  ];

  return (
    <section className="py-24 bg-[#0A0E17] text-white overflow-hidden relative border-t border-white/5">
      {/* Premium Background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c99339]/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a3a52]/20 rounded-full -ml-48 -mb-48 blur-[120px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in relative">
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight text-white">
            {t('features.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c99339] to-[#f5d061]">{t('features.title2')}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c99339] to-transparent mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            {t('features.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const delays = ['[animation-delay:0ms]', '[animation-delay:100ms]', '[animation-delay:200ms]', '[animation-delay:300ms]', '[animation-delay:400ms]', '[animation-delay:500ms]'];
            return (
              <div 
                key={index} 
                className={`p-8 bg-[#0F1522] border border-white/5 rounded-2xl hover:bg-[#161E2E] transition-all duration-500 group animate-slide-up hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(201,147,57,0.1)] relative overflow-hidden ${delays[index] || ''}`}
              >
                {/* Minimalist Top Glow Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c99339] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-14 h-14 bg-gradient-to-br from-[#c99339] to-[#8a6221] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#c99339]/20 relative z-10">
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#f5d061] transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors relative z-10">
                  {feature.description}
                </p>
              </div>
            );

          })}
        </div>
      </div>
    </section>
  );
}
