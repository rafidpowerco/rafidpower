import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuoteDialog from './QuoteDialog';
import { useLanguage } from '@/contexts/LanguageContext';


/**
 * Header Component - Ultra Professional Premium Design
 * Features: Dynamic Glassmorphism on Scroll, Logo, Navigation
 * Design: Transparent at top, frosted dark glass when scrolling
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A0E17]/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/10' : 'bg-transparent pt-4'}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative overflow-hidden rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-white/5 backdrop-blur-sm p-1 border border-white/20">
            <img src="/logo.png" alt="Rafid Scale Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 leading-none tracking-tight">RAFID POWER</h1>
            <p className="text-xs text-[#c99339] font-bold tracking-[0.2em] uppercase mt-1">
               {language === 'ar' ? 'للموازين والأتمتة' : language === 'ku' ? 'تەرازوو' : 'SCALES & AUTOMATION'}
            </p>
          </div>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-gray-300 font-medium hover:text-[#c99339] transition-all duration-300 hover:-translate-y-0.5"
            >
              {t(item.translationKey)}
            </a>
          ))}
          
          <div className="flex items-center gap-2 border-l border-white/20 pl-4 ml-2">
            <button onClick={() => setLanguage('ar')} className={`text-sm font-bold transition-colors ${language === 'ar' ? 'text-[#c99339]' : 'text-gray-500 hover:text-white'}`}>AR</button>
            <button onClick={() => setLanguage('ku')} className={`text-sm font-bold transition-colors ${language === 'ku' ? 'text-[#c99339]' : 'text-gray-500 hover:text-white'}`}>KU</button>
            <button onClick={() => setLanguage('en')} className={`text-sm font-bold transition-colors ${language === 'en' ? 'text-[#c99339]' : 'text-gray-500 hover:text-white'}`}>EN</button>
          </div>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <QuoteDialog />
        </div>


        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-[#c99339] transition-colors bg-white/5 p-2 rounded-lg border border-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#0A0E17]/95 backdrop-blur-2xl border-t border-white/10 py-6 absolute w-full shadow-2xl">
          <div className="container mx-auto px-4 flex flex-col gap-5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 font-medium hover:text-[#c99339] transition-colors text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.translationKey)}
              </a>
            ))}
            <div className="flex items-center justify-start gap-6 py-6 border-t border-white/10 mt-2">
              <button onClick={() => { setLanguage('ar'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'ar' ? 'text-[#c99339]' : 'text-gray-500'}`}>عربي</button>
              <button onClick={() => { setLanguage('ku'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'ku' ? 'text-[#c99339]' : 'text-gray-500'}`}>کوردی</button>
              <button onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} className={`text-lg font-bold ${language === 'en' ? 'text-[#c99339]' : 'text-gray-500'}`}>English</button>
            </div>
            <div className="pt-4">
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
