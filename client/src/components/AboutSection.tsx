import { CheckCircle } from 'lucide-react';

/**
 * About Section - Modern Industrial Design
 * Features: Company history, values, achievements
 * Design: Two-column layout with text and image
 */
export default function AboutSection() {
  const achievements = [
    'تأسيس الشركة عام 1988 بخبرة تزيد عن 35 سنة',
    'تصنيع وصيانة آلاف الموازين الجسرية',
    'فريق متخصص من المهندسين والفنيين',
    'ضمان جودة عالي على جميع المنتجات',
    'خدمة عملاء متميزة وسريعة الاستجابة',
    'استخدام أحدث التقنيات الصناعية',
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-r from-[#1a3a52] to-[#2d5a7b]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              عن الرافدين
            </h2>
            <div className="w-20 h-1 bg-[#e63946]"></div>

            <p className="text-lg text-gray-100 leading-relaxed">
              شركة الرافدين للموازين متخصصة في تصنيع وصيانة الموازين الجسرية والمعدات الصناعية الدقيقة منذ عام 1988. نحن نقدم حلولاً موثوقة وعالية الجودة لقطاع النقل والصناعة.
            </p>

            <p className="text-lg text-gray-100 leading-relaxed">
              بفضل خبرتنا الطويلة وفريقنا المتخصص، نضمن أفضل الخدمات والمنتجات لعملائنا الكرام في جميع أنحاء العراق والمنطقة.
            </p>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle className="text-[#e63946] flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-100">{achievement}</span>
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
