import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const videos = [
  {
    id: 1,
    title: 'موازين الشاحنات الإلكترونية - دقة وجودة',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D376483162791653&show_text=false&width=560&t=0',
    description: 'استعراض لعمليات التوزين الدقيقة لشاحنات النقل الثقيل'
  },
  {
    id: 2,
    title: 'تصنيع وصيانة الموازين الجسرية',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D10153231339946729&show_text=false&width=560&t=0',
    description: 'خطوات التصنيع في معاملنا بأحدث التقنيات العالمية'
  },
  {
    id: 3,
    title: 'حلول ذكية للمصانع والمنشآت',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D337678129994672&show_text=false&width=560&t=0',
    description: 'تكامل أنظمة التوزين مع البرمجيات المحاسبية والرقابية'
  },
  {
    id: 4,
    title: 'تركيب ميزان 80 طن - مشروع جديد',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D10154091339946729&show_text=false&width=560&t=0',
    description: 'توثيق عملية التركيب الكاملة لأحد مشاريعنا في البصرة'
  },
  {
    id: 5,
    title: 'معايرة الموازين بأوزان قياسية',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D10153281339946729&show_text=false&width=560&t=0',
    description: 'ضمان دقة القراءة بنسبة 100% باستخدام أوزان معايرة معتمدة'
  },
  {
    id: 6,
    title: 'أنظمة التوزين الأوتوماتيكية',
    url: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D10153232339946729&show_text=false&width=560&t=0',
    description: 'توفير الوقت والجهد من خلال أنظمة التوزين الذكية'
  }
];

export default function VideoGallery() {
  return (
    <section id="videos" className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-4 py-1 border border-[#1a3a52]/20 bg-[#1a3a52]/5 rounded-full text-[#1a3a52] text-sm font-semibold uppercase tracking-wider mb-4">
            الرافدين في الميدان
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a3a52] mb-6 tracking-tight">
            معرض <span className="text-[#e63946]">الفيديوهات</span>
          </h2>
          <div className="w-24 h-1.5 bg-[#e63946] rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            شاهد خبرتنا في العمل من خلال فيديوهات توضيحية لعمليات التركيب، المعايرة، والصيانة لمشاريعنا المختلفة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-50/50"
            >
              {/* Facebook Video Embed Container */}
              <div className="relative aspect-video overflow-hidden">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full border-none overflow-hidden"
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e63946]/10 flex items-center justify-center text-[#e63946]">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a3a52] group-hover:text-[#e63946] transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed font-light">
                  {video.description}
                </p>
                <div className="pt-4">
                  <Button 
                    variant="ghost" 
                    className="p-0 text-[#1a3a52] hover:text-[#e63946] font-semibold flex items-center gap-2 group/btn"
                  >
                    شاهد المزيد على فيسبوك
                    <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover/btn:translate-x-1 transition-transform rtl:rotate-180">
                      →
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note for User */}
        <div className="mt-20 p-8 rounded-2xl bg-[#1a3a52]/5 border border-[#1a3a52]/10 text-center max-w-3xl mx-auto">
          <p className="text-[#1a3a52] font-medium opacity-80 backdrop-blur-sm">
            💡 ملاحظة: يمكنك تغيير هذه الفيديوهات بسهولة من خلال نسخ رابط الفيديو من فيسبوك ولصقه في ملف المكون (Component).
          </p>
        </div>
      </div>
    </section>
  );
}
