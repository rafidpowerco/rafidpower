import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Products Section - Modern Industrial Design
 * Features: Product showcase with images and descriptions
 * Design: Grid layout with hover effects
 */
export default function ProductsSection() {
  const products = [
    {
      title: 'موازين الشاحنات الجسرية',
      description: 'موازين دقيقة لقياس وزن الشاحنات الثقيلة والمركبات التجارية',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663444897836/WmNVZbhDTyPDbF89RZeceN/hero-background-czgpzoZa584zXmWvRuHAWF.webp',
      capacity: 'حتى 100 طن',
      accuracy: 'دقة ± 0.1%',
    },
    {
      title: 'لوحات التحكم الرقمية',
      description: 'لوحات تحكم حديثة مع شاشات عرض LED عالية الوضوح',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663444897836/WmNVZbhDTyPDbF89RZeceN/service-scales-BmpGzRznN5dmeSvax9CsoK.webp',
      capacity: 'متعددة السعات',
      accuracy: 'دقة ± 0.05%',
    },
    {
      title: 'أنظمة الصيانة والخدمة',
      description: 'خدمات صيانة شاملة وقطع غيار أصلية عالية الجودة',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663444897836/WmNVZbhDTyPDbF89RZeceN/maintenance-service-89EKeb8VKQcfojCvixC7FK.webp',
      capacity: 'جميع الموديلات',
      accuracy: 'ضمان شامل',
    },
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a3a52] mb-4">
            منتجاتنا
          </h2>
          <div className="w-20 h-1 bg-[#e63946] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            مجموعة متنوعة من الموازين والمعدات الصناعية عالية الجودة
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>

              {/* Content */}
              <CardHeader>
                <CardTitle className="text-[#1a3a52] text-xl">
                  {product.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-gray-600">
                  {product.description}
                </CardDescription>

                {/* Specs */}
                <div className="space-y-2 py-4 border-t border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">السعة:</span>
                    <span className="font-semibold text-[#1a3a52]">{product.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الدقة:</span>
                    <span className="font-semibold text-[#e63946]">{product.accuracy}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full bg-[#1a3a52] hover:bg-[#2d5a7b] text-white font-semibold">
                  اطلب المزيد من المعلومات
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
