import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '+9647725549994'; // Primary AsiaCell Number
  const message = 'مرحباً شركة الرافدين، أود الاستفسار عن...';
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-8 z-50 group flex items-center justify-center w-14 h-14"
      title="تواصل معنا عبر واتساب"
      aria-label="تواصل معنا عبر واتساب"
    >
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75"></div>
      <div className="relative w-full h-full bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
        <MessageCircle size={32} />
      </div>
      <span className="absolute right-full mr-3 bg-white text-[#1a3a52] px-3 py-1 rounded-lg text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
        تحدث معنا الآن
      </span>
    </a>
  );
}
