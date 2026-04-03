import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuoteDialog from './QuoteDialog';


/**
 * Header Component - Modern Industrial Design
 * Features: Logo, Navigation, Mobile Menu
 * Design: Navy blue background with red accent, clean typography
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'الخدمات', href: '#services' },
    { label: 'المنتجات', href: '#products' },
    { label: 'المشاريع', href: '#projects' },
    { label: 'من نحن', href: '#about' },
    { label: 'اتصل بنا', href: '#contact' },
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
            <h1 className="text-2xl font-black text-[#1a3a52] leading-tight tracking-tight">الرافدين</h1>
            <p className="text-xs text-[#e63946] font-bold tracking-[0.15em] uppercase">Rafidain Scales Co.</p>
          </div>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[#1a3a52] font-medium hover:text-[#e63946] transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
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
                className="text-[#1a3a52] font-medium hover:text-[#e63946] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
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
