import { Facebook } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FacebookButton() {
  const { isRTL } = useLanguage();
  const facebookUrl = 'https://www.facebook.com/rafid.scale/';

  return (
    <a
      href={facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-40 right-8 z-50 group flex items-center justify-center w-14 h-14"
      title={isRTL ? 'تابعنا على فيسبوك' : 'Follow us on Facebook'}
      aria-label="تابعنا على فيسبوك"
    >
      <div className="absolute inset-0 bg-[#1877F2] rounded-full animate-ping opacity-60"></div>
      <div className="absolute inset-0 bg-[#1877F2] rounded-full opacity-20 blur-xl"></div>
      <div className="relative w-full h-full bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(24,119,242,0.6)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(24,119,242,0.8)] transition-all duration-300">
        <Facebook size={30} strokeWidth={1.5} />
      </div>
      <span className={`absolute ${isRTL ? 'right-full mr-4' : 'left-full ml-4'} bg-[#1a3a52] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 ${isRTL ? 'translate-x-2' : '-translate-x-2'} whitespace-nowrap border border-blue-500/30`}>
        {isRTL ? 'تفضل بزيارة صفحتنا الرسمية' : 'Visit our official page'}
        <span className={`absolute top-1/2 -mt-2 w-4 h-4 bg-[#1a3a52] border border-blue-500/30 transform rotate-45 ${isRTL ? '-right-2 border-l-0 border-b-0' : '-left-2 border-r-0 border-t-0'}`}></span>
      </span>
    </a>
  );
}
