import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuoteDialog from './QuoteDialog';
import { useLanguage } from '@/contexts/LanguageContext';


/**
 * Header Component - Modern Industrial Design
 * Features: Logo, Navigation, Mobile Menu
 * Design: Navy blue background with red accent, clean typography
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  const navItems = [
    { label: 'الرئيسية', translationKey: 'nav.home', href: '#home' },
    { label: 'الخدمات', translationKey: 'nav.services', href: '#services' },
    { label: 'المنتجات', translationKey: 'nav.products', href: '#products' },
    { label: 'الفيديوهات', translationKey: 'nav.videos', href: '#videos' },
    { label: 'المشاريع', translationKey: 'nav.projects', href: '#projects' },
    { label: 'من نحن', translationKey: 'nav.about', href: '#about' },
    { label: 'اتصل بنا', translationKey: 'nav.contact', href: '#contact' },
  ];


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b-4 border-[#e63946]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative overflow-hidden rounded-xl shadow-inner bg-white/50 backdrop-blur-sm p-1 border border-gray-100">
            <img src="/logo.png" alt="Rafid Scale Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#F5060B] leading-none tracking-tight">RAFID POWER</h1>
            <p className="text-xs text-[#1a3a52] font-bold tracking-[0.1em] uppercase mt-1">
               {language === 'ar' ? 'للموازين' : language === 'ku' ? 'تەرازوو' : 'SCALES CO.'}
            </p>
          </div>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[#1a3a52] font-medium hover:text-[#F5060B] transition-colors duration-200"
            >
              {t(item.translationKey)}
            </a>
          ))}
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
            <button onClick={() => setLanguage('ar')} className={`text-sm font-bold ${language === 'ar' ? 'text-[#F5060B]' : 'text-gray-400'}`}>AR</button>
            <button onClick={() => setLanguage('ku')} className={`text-sm font-bold ${language === 'ku' ? 'text-[#F5060B]' : 'text-gray-400'}`}>KU</button>
            <button onClick={() => setLanguage('en')} className={`text-sm font-bold ${language === 'en' ? 'text-[#F5060B]' : 'text-gray-400'}`}>EN</button>
          </div>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <QuoteDialog />
        </div>


        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#1a3a52]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#1a3a52] font-medium hover:text-[#F5060B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.translationKey)}
              </a>
            ))}
            <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100">
              <button onClick={() => { setLanguage('ar'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'ar' ? 'text-[#F5060B]' : 'text-gray-400'}`}>عربي</button>
              <button onClick={() => { setLanguage('ku'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'ku' ? 'text-[#F5060B]' : 'text-gray-400'}`}>کوردی</button>
              <button onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'en' ? 'text-[#F5060B]' : 'text-gray-400'}`}>English</button>
            </div>
            <div className="pt-2">
              <QuoteDialog 
                triggerChild={
                  <Button className="w-full bg-[#1a3a52] hover:bg-[#2d5a7b] text-white">
                    طلب عرض سعر
                  </Button>
                }
              />
            </div>

          </div>
        </nav>
      )}
    </header>
  );
}
