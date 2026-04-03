import { ShieldCheck, Target, Zap, Clock, ThumbsUp, Scale } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Scale,
      title: 'دقة متناهية',
      description: 'نستخدم أحدث تقنيات التحويل الرقمي لضمان أدق نتائج التوزين في السوق.',
    },
    {
      icon: ShieldCheck,
      title: 'جودة معتمدة',
      description: 'جميع منتجاتنا تخضع لمعايير الجودة العالمية OIML وتأتي مع ضمان شامل.',
    },
    {
      icon: Target,
      title: 'خبرة طويلة',
      description: 'أكثر من 35 عاماً في خدمة القطاع الصناعي العراقي والإقليمي.',
    },
    {
      icon: Clock,
      title: 'سرعة التنفيذ',
      description: 'نلتزم بجداول زمنية صارمة في التركيب والصيانة لضمان عدم توقف أعمالكم.',
    },
    {
      icon: Zap,
      title: 'تقنيات حديثة',
      description: 'نواكب أحدث الابتكارات في مجال الموازين الجسرية وأنظمة الأتمتة.',
    },
    {
      icon: ThumbsUp,
      title: 'دعم فني متميز',
      description: 'فريق فني جاهز للاستجابة السريعة وتوفير قطع الغيار الأصلية دائماً.',
    },
  ];

  return (
    <section className="py-24 bg-[#1a3a52] text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#e63946]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e63946]/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
            لماذا تختار <span className="text-[#e63946]">الرافدين؟</span>
          </h2>
          <div className="w-24 h-1.5 bg-[#e63946] mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            نحن لا نبيع موازين فحسب، بل نقدم حلولاً هندسية متكاملة تضمن دقة أعمالكم واستمراريتها.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-[#e63946] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#e63946]/20">
                  <Icon size={30} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#e63946] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
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
