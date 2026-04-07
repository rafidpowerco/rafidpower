import { Button } from '@/components/ui/button';
import { Play, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const videos = [
  {
    id: 1,
    title: 'تصنيع هياكل الموازين الجسرية',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F949154934237996&show_text=false&width=560&t=0',
    description: 'نظرة من داخل مصنعنا على مراحل تصنيع وتجهيز هياكل الموازين الجسرية الفولاذية.'
  },
  {
    id: 2,
    title: 'ضمان الجودة والمتانة',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F1925941884796056&show_text=false&width=560&t=0',
    description: 'نركز على أدق التفاصيل لضمان عمل الميزان بكفاءة عالية لمدة تزيد عن 10 سنوات.'
  },
  {
    id: 3,
    title: 'خدمات المعايرة والتصليح',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F1658819828578717&show_text=false&width=560&t=0',
    description: 'فريقنا الفني متخصص في معايرة وصيانة جميع أنواع الموازين الجسرية والإلكترونية.'
  },
  {
    id: 4,
    title: 'الرافدين للطاقة والموازين',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F1195594075289144&show_text=false&width=560&t=0',
    description: 'فيديو ترويجي يستعرض تكامل حلول الطاقة والموازين الصناعية التي نقدمها.'
  },
  {
    id: 5,
    title: 'استعراض المنتجات والخدمات',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F894070559859703&show_text=false&width=560&t=0',
    description: 'جولة سريعة على أهم الموازين الجسرية والأنظمة الإلكترونية التي نقوم بتجهيزها.'
  },
  {
    id: 6,
    title: 'دقة الوزن مع الرافدين',
    url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Frafid.scale%2Fvideos%2F739656488525943&show_text=false&width=560&t=0',
    description: 'لماذا يختار العملاء الرافدين؟ لأن الدقة والموثوقية هي أساس عملنا منذ 1988.'
  }
];

export default function VideoGallery() {
  const { isRTL } = useLanguage();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 15 } }
  };

  return (
    <section id="videos" className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Abstract Background Aesthetic Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1877F2]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e63946]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-[#1877F2]/30 bg-[#1877F2]/10 rounded-full text-[#1877F2] text-sm font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(24,119,242,0.15)] hover:shadow-[0_0_30px_rgba(24,119,242,0.3)] transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            أكثر من 10,000 متابع يثقون بنا
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a3a52] mb-6 tracking-tight">
            {isRTL ? 'معرض' : 'Video' } <span className="text-[#1877F2] relative">
              {isRTL ? 'الفيديوهات' : 'Gallery'}
              <svg className="absolute -bottom-2 w-full h-3 text-[#1877F2]/30" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 C30,20 70,0 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
            </span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-light">
            {isRTL 
              ? 'استكشف أحدث مشاريعنا مباشرة من صفحتنا على فيسبوك، شاهد خبرتنا في عمليات التركيب والمعايرة بدقة هندسية عالية.' 
              : 'Explore our latest projects directly from our Facebook page. Witness our expertise in installation and calibration with high engineering precision.'}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12"
        >
          {videos.map((video) => (
            <motion.div 
              variants={itemVariants}
              key={video.id} 
              className="group relative bg-white/60 backdrop-blur-lg rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(26,58,82,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(24,119,242,0.2)] transition-all duration-500 border border-white"
            >
              {/* Glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none z-10"></div>
              
              {/* Facebook Video Embed Container */}
              <div className="relative aspect-video overflow-hidden bg-gray-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out z-20">
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

              <div className="p-8 relative z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/20 flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
                    <Play size={20} fill="currentColor" className="translate-x-[1px]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a3a52] leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                </div>
                <div className="w-12 h-1 bg-gray-100 rounded-full mt-5 mb-4 group-hover:bg-[#1877F2] group-hover:w-20 transition-all duration-500"></div>
                <p className="text-gray-500 text-sm leading-relaxed font-light mb-6 line-clamp-3">
                  {video.description}
                </p>
                <div className="pt-2 border-t border-gray-100/50">
                  <Button 
                    variant="ghost" 
                    className="p-0 text-[#1a3a52] hover:text-[#1877F2] hover:bg-transparent font-semibold flex items-center gap-2 group/btn"
                  >
                    {isRTL ? 'شاهد على فيسبوك' : 'Watch on Facebook'}
                    <div className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover/btn:bg-[#1877F2] group-hover/btn:border-[#1877F2] group-hover/btn:text-white transition-all duration-300`}>
                      <ExternalLink size={14} />
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
