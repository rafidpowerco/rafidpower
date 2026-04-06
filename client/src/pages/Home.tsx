import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ClientsSection from '@/components/ClientsSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import ServicesSection from '@/components/ServicesSection';
import ProductsSection from '@/components/ProductsSection';
import ProjectsSection from '@/components/ProjectsSection';
import VideoGallery from '@/components/VideoGallery';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Home Page - الرافدين للموازين
 * Modern Industrial Design
 * Complete website with all sections
 */
export default function Home() {
  const { isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <HeroSection />
      <ClientsSection />
      <FeaturesSection />
      <StatsSection />
      <ServicesSection />


      <ProductsSection />
      <ProjectsSection />
      
      <VideoGallery />
      
      <AboutSection />

      <ContactSection />
      <Footer />
    </div>
  );
}
