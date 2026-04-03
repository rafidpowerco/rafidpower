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
    <section id="services" className="py-20 bg-gradient-to-b from-white to-[#f8f9fa]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a3a52] mb-4">
            خدماتنا
          </h2>
          <div className="w-20 h-1 bg-[#e63946] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white hover:translate-y-[-4px] group"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52] to-[#2d5a7b] rounded-lg flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-[#e63946] group-hover:to-[#d62828] transition-all duration-300">
                    <Icon className="text-white" size={32} />
                  </div>
                  <CardTitle className="text-[#1a3a52] text-xl">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-[#e63946] rounded-full"></div>
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
