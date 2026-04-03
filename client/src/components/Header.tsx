import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    { label: 'من نحن', href: '#about' },
    { label: 'اتصل بنا', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b-4 border-[#e63946]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1a3a52] to-[#2d5a7b] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">RF</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-[#1a3a52]">الرافدين</h1>
            <p className="text-xs text-[#e63946] font-semibold">Rafid Scale</p>
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
          <Button className="bg-[#e63946] hover:bg-[#d62828] text-white font-semibold">
            طلب عرض سعر
          </Button>
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
            <Button className="w-full bg-[#e63946] hover:bg-[#d62828] text-white">
              طلب عرض سعر
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
