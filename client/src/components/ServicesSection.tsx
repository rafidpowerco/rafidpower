import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Truck, Zap, Shield } from 'lucide-react';

/**
 * Services Section - Modern Industrial Design
 * Features: Service cards with icons, grid layout
 * Design: Light background with navy text and red accents
 */
export default function ServicesSection() {
  const services = [
    {
      icon: Truck,
      title: 'موازين جسرية',
      description: 'موازين دقيقة وموثوقة لقياس وزن الشاحنات والمركبات الثقيلة بدقة عالية',
      features: ['دقة عالية', 'متانة عالية', 'سهولة الاستخدام'],
    },
    {
      icon: Wrench,
      title: 'الصيانة والإصلاح',
      description: 'خدمات صيانة دورية واصلاح متقدمة للموازين والمعدات الصناعية',
      features: ['فريق متخصص', 'قطع أصلية', 'ضمان الجودة'],
    },
    {
      icon: Zap,
      title: 'التركيب والتشغيل',
      description: 'تركيب احترافي وتدريب شامل على استخدام الموازين والمعدات',
      features: ['تركيب احترافي', 'تدريب مجاني', 'دعم فني'],
    },
    {
      icon: Shield,
      title: 'الضمان والدعم',
      description: 'ضمان شامل ودعم فني متواصل لجميع منتجاتنا وخدماتنا',
      features: ['ضمان طويل', 'دعم 24/7', 'استجابة سريعة'],
    },
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-[#0A0E17] to-[#0F1522] relative overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c99339]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in relative">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
            {/* TODO: Add translation hooks if needed, but keeping original text structure */}
            خدماتنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c99339] to-[#f5d061]">الاحترافية</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c99339] to-transparent mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            نقدم مجموعة شاملة من الخدمات الصناعية المتقدمة لتلبية احتياجاتك
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="border border-white/5 shadow-2xl hover:shadow-[0_15px_50px_rgba(201,147,57,0.15)] transition-all duration-500 bg-[#0A0E17]/80 backdrop-blur-md hover:-translate-y-2 group relative overflow-hidden"
              >
                {/* Minimalist Top Glow Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c99339] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52]/50 to-[#2d5a7b]/50 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-[#c99339] group-hover:to-[#8a6221] group-hover:border-transparent group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg relative z-10">
                    <Icon className="text-white relative z-20" size={32} />
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-[#f5d061] transition-colors relative z-10">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-gray-400 mb-6 font-light">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                        <div className="w-1.5 h-1.5 bg-[#c99339] rounded-full shadow-[0_0_5px_rgba(201,147,57,0.8)]"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
