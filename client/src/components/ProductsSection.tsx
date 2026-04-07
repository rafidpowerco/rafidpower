import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuoteDialog from './QuoteDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

/**
 * Products Section - Modern Industrial Design
 * Features: Product showcase with images and descriptions
 * Design: Grid layout with hover effects
 */
export default function ProductsSection() {
  const { t } = useLanguage();

  const products = [
    {
      title: t('product.1.title'),
      description: t('product.1.desc'),
      image: '/images/industrial_truck_scale.png',
      capacity: t('product.1.cap'),
      accuracy: t('product.1.acc'),
    },
    {
      title: t('product.2.title'),
      description: t('product.2.desc'),
      image: '/images/precision_weighing.png',
      capacity: t('product.2.cap'),
      accuracy: t('product.2.acc'),
    },
    {
      title: t('product.3.title'),
      description: t('product.3.desc'),
      image: '/images/factory_weighing_system.png',
      capacity: t('product.3.cap'),
      accuracy: t('product.3.acc'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring' as const, stiffness: 50, damping: 20 }
    }
  };

  return (
    <section id="products" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#1a3a52]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a3a52] mb-4">
            {t('products.tag')}
          </h2>
          <div className="w-20 h-1.5 bg-[#e63946] mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            {t('products.desc')}
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className="border border-gray-100/50 shadow-xl overflow-hidden hover:shadow-[0_20px_50px_rgba(26,58,82,0.15)] transition-all duration-500 group bg-white/80 backdrop-blur-sm"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <CardHeader>
                  <CardTitle className="text-[#1a3a52] text-xl font-bold group-hover:text-[#e63946] transition-colors duration-300">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {product.description}
                  </CardDescription>

                  {/* Specs */}
                  <div className="space-y-3 py-4 border-t border-b border-gray-100">
                    <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded">
                      <span className="text-sm text-gray-500 font-medium">{t('product.lbl.cap')}</span>
                      <span className="font-bold text-[#1a3a52]">{product.capacity}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded">
                      <span className="text-sm text-gray-500 font-medium">{t('product.lbl.acc')}</span>
                      <span className="font-bold text-[#e63946]">{product.accuracy}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <QuoteDialog 
                    productTitle={product.title} 
                    triggerChild={
                      <Button className="w-full bg-gradient-to-r from-[#1a3a52] to-[#2d5a7b] hover:from-[#e63946] hover:to-[#c1272d] text-white font-bold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                        {t('product.lbl.btn')}
                      </Button>
                    } 
                  />

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
