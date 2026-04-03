import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import QuoteDialog from './QuoteDialog';


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
        backgroundImage: 'url(/images/hero.png)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a52]/60 via-black/40 to-[#1a3a52]/60"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 border border-white/20 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            القوة والدقة منذ عام 1988
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight drop-shadow-xl animate-scale-in">
            الرافدين <span className="text-[#e63946]">للموازين</span>
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-gray-100 max-w-2xl mx-auto drop-shadow-md">
            الريادة في تصنيع وصيانة الموازين الجسرية والحلول الصناعية المتكاملة
          </p>
          <p className="text-lg md:text-xl text-gray-200/90 font-light max-w-xl mx-auto">
            نجمع بين الخبرة الطويلة وأحدث التقنيات لنقدم لك دقة لا تضاهى في قياس وتوزين الشاحنات
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
            <a href="#services">
              <Button
                size="lg"
                className="bg-[#e63946] hover:bg-[#d62828] text-white font-bold text-xl px-10 py-8 shadow-lg hover:shadow-[#e63946]/30 transition-all duration-300 w-full sm:w-auto"
              >
                استكشف خدماتنا
                <ArrowRight className="mr-2" size={24} />
              </Button>
            </a>
            <QuoteDialog 
              triggerChild={
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/80 text-white bg-white/5 backdrop-blur-sm hover:bg-white/20 font-bold text-xl px-10 py-8 transition-all duration-300 w-full sm:w-auto"
                >
                  اطلب عرض سعر
                </Button>
              }
            />
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 animate-pulse">
        <span className="text-xs uppercase tracking-[0.2em]">اسحب للأسفل</span>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-[#e63946] rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
}

