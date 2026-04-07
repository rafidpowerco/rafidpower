import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Scale, Truck, Network, Wrench, Activity, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsSection() {
  const { t } = useLanguage();
  
  const projects = [
    {
      id: 1,
      title: t('proj1.title'),
      location: t('proj1.loc'),
      Icon: Scale,
      category: t('proj1.cat'),
    },
    {
      id: 2,
      title: t('proj2.title'),
      location: t('proj2.loc'),
      Icon: Network,
      category: t('proj2.cat'),
    },
    {
      id: 3,
      title: t('proj3.title'),
      location: t('proj3.loc'),
      Icon: Wrench,
      category: t('proj3.cat'),
    },
    {
      id: 4,
      title: t('proj4.title'),
      location: t('proj4.loc'),
      Icon: Truck,
      category: t('proj4.cat'),
    },
    {
      id: 5,
      title: t('proj5.title'),
      location: t('proj5.loc'),
      Icon: Activity,
      category: t('proj5.cat'),
    },
    {
      id: 6,
      title: t('proj6.title'),
      location: t('proj6.loc'),
      Icon: HardHat,
      category: t('proj6.cat'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: 'spring' as const, stiffness: 60, damping: 15 }
    }
  };

  return (
    <section id="projects" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
      <div className="absolute -left-32 top-10 w-[600px] h-[600px] bg-[#e63946]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 border border-[#e63946]/20 bg-[#e63946]/10 rounded-full text-[#e63946] font-bold tracking-widest uppercase mb-4 shadow-sm">{t('projects.label')}</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a3a52] leading-tight">{t('projects.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#c1272d]">{t('projects.title2')}</span></h2>
            <div className="w-20 h-1.5 bg-[#e63946] mt-6 rounded-full"></div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 max-w-md text-lg leading-relaxed"
          >
            {t('projects.desc')}
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project, index) => {
            const IconComponent = project.Icon;
            return (
              <motion.div 
                key={project.id} 
                variants={itemVariants}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl bg-white border border-gray-100 transition-all duration-500"
              >
                <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-[#1a3a52]/5 to-[#1a3a52]/10 group-hover:from-[#1a3a52]/80 group-hover:to-[#1a3a52] transition-colors duration-700 ease-in-out relative overflow-hidden">
                  {/* Decorative rotating background element */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  
                  <IconComponent 
                    size={90} 
                    strokeWidth={1.5}
                    className="text-[#1a3a52]/40 group-hover:scale-125 group-hover:rotate-[15deg] group-hover:text-white transition-all duration-700 ease-out z-10" 
                  />
                  
                  {/* Glowing orb behind icon on hover */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#e63946]/0 group-hover:bg-[#e63946]/40 blur-2xl rounded-full transition-all duration-700"></div>
                </div>
                
                {/* Overlay info */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 ease-out z-20">
                  <span className="text-[#e63946] font-bold text-sm mb-2 uppercase tracking-wide">{project.category}</span>
                  <h3 className="text-white text-3xl font-extrabold mb-2 leading-tight">{project.title}</h3>
                  <p className="text-gray-300 flex items-center gap-2 font-medium">
                    <MapPin size={20} className="text-[#e63946]" />
                    {project.location}
                  </p>
                </div>
                
                {/* Simple info for non-hover (mobile) */}
                <div className="p-8 md:group-hover:opacity-0 transition-opacity duration-300 relative z-10 bg-white">
                  <span className="text-[#e63946] font-bold text-xs mb-2 block uppercase tracking-wider bg-[#e63946]/10 inline-block px-3 py-1 rounded-full">{project.category}</span>
                  <h3 className="text-[#1a3a52] text-2xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                    <MapPin size={16} />
                    {project.location}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
