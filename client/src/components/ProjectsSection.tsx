import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProjectsSection() {
  const { t } = useLanguage();
  
  const projects = [
    {
      id: 1,
      title: t('proj1.title'),
      location: t('proj1.loc'),
      image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&q=80&w=800',
      category: t('proj1.cat'),
      delayClass: ''
    },
    {
      id: 2,
      title: t('proj2.title'),
      location: t('proj2.loc'),
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      category: t('proj2.cat'),
      delayClass: 'delay-[150ms]'
    },
    {
      id: 3,
      title: t('proj3.title'),
      location: t('proj3.loc'),
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
      category: t('proj3.cat'),
      delayClass: 'delay-[300ms]'
    },
    {
      id: 4,
      title: t('proj4.title'),
      location: t('proj4.loc'),
      image: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?auto=format&fit=crop&q=80&w=800',
      category: t('proj4.cat'),
      delayClass: 'delay-[450ms]'
    },
    {
      id: 5,
      title: t('proj5.title'),
      location: t('proj5.loc'),
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
      category: t('proj5.cat'),
      delayClass: 'delay-[600ms]'
    },
    {
      id: 6,
      title: t('proj6.title'),
      location: t('proj6.loc'),
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
      category: t('proj6.cat'),
      delayClass: 'delay-[750ms]'
    },
  ];

  return (
    <section id="projects" className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="animate-fade-in">
            <span className="text-[#e63946] font-bold tracking-widest uppercase mb-2 block">{t('projects.label')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a3a52]">{t('projects.title1')} <span className="text-[#e63946]">{t('projects.title2')}</span></h2>
            <div className="w-20 h-1.5 bg-[#e63946] mt-4"></div>
          </div>
          <p className="text-gray-500 max-w-md text-lg leading-relaxed animate-fade-in delay-200">
            {t('projects.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`group relative overflow-hidden rounded-2xl shadow-xl bg-white animate-scale-in opacity-0 animate-fill-forwards ${project.delayClass}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a52] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <span className="text-[#e63946] font-bold text-sm mb-2">{project.category}</span>
                <h3 className="text-white text-2xl font-bold mb-1">{project.title}</h3>
                <p className="text-gray-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {project.location}
                </p>
              </div>
              
              {/* Simple info for non-hover (mobile) */}
              <div className="p-6 md:group-hover:hidden">
                <span className="text-[#e63946] font-bold text-xs mb-1 block uppercase">{project.category}</span>
                <h3 className="text-[#1a3a52] text-xl font-bold">{project.title}</h3>
                <p className="text-gray-500 text-sm">{project.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
