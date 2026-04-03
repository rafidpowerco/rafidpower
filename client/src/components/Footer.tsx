import { Facebook, Phone, Mail, MapPin } from 'lucide-react';

/**
 * Footer Component - Modern Industrial Design
 * Features: Company info, links, social media, copyright
 * Design: Dark background with light text
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a3a52] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#e63946] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">RF</span>
              </div>
              <h3 className="text-lg font-bold">الرافدين</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              متخصصون في تصنيع وصيانة الموازين الجسرية والمعدات الصناعية الدقيقة منذ عام 1988.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">الروابط السريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  الخدمات
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  المنتجات
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  اتصل بنا
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">خدماتنا</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  موازين جسرية
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  الصيانة والإصلاح
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  التركيب والتشغيل
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  الضمان والدعم
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">معلومات الاتصال</h4>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Phone size={18} className="text-[#e63946] flex-shrink-0 mt-1" />
                <a href="tel:+964770165994" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  +964 770 165 9994
                </a>
              </li>
              <li className="flex gap-2">
                <Mail size={18} className="text-[#e63946] flex-shrink-0 mt-1" />
                <a href="mailto:rafidcompany@gmail.com" className="text-gray-300 hover:text-[#e63946] transition-colors">
                  rafidcompany@gmail.com
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin size={18} className="text-[#e63946] flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  Erbil, Iraq
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              جميع الحقوق محفوظة &copy; {currentYear} الرافدين للموازين. All rights reserved.
            </p>

            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/rafid.scale/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#e63946] rounded-full flex items-center justify-center hover:bg-[#d62828] transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
