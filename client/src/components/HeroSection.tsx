import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Hero Section - Modern Industrial Design
 * Features: Large background image, compelling headline, CTA buttons
 * Design: Dark overlay with white text for contrast
 */
export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center pt-20"
      style={{
        backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663444897836/WmNVZbhDTyPDbF89RZeceN/hero-background-czgpzoZa584zXmWvRuHAWF.webp)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            الرافدين للموازين
          </h1>
          <p className="text-xl md:text-2xl font-light">
            موازين جسرية دقيقة وموثوقة منذ عام 1988
          </p>
          <p className="text-lg md:text-xl text-gray-100">
            نوفر حلولاً صناعية متقدمة لقياس وتوزين الشاحنات والمركبات الثقيلة
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="bg-[#e63946] hover:bg-[#d62828] text-white font-bold text-lg px-8"
            >
              استكشف الخدمات
              <ArrowRight className="mr-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8"
            >
              اتصل بنا الآن
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-1 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
