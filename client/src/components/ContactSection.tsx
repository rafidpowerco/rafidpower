import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      label: t('info.1'),
      value: '+964 772 554 9994',
      href: 'tel:+9647725549994',
    },
    {
      icon: Phone,
      label: t('info.2'),
      value: '+964 770 188 6017',
      href: 'tel:+9647701886017',
    },
    {
      icon: Mail,
      label: t('info.3'),
      value: 'rafidcompany@gmail.com',
      href: 'mailto:rafidcompany@gmail.com',
    },
    {
      icon: MapPin,
      label: t('info.4'),
      value: 'Villa 472 / Zin City, Erbil, Iraq',
      href: '#',
    },
    {
      icon: Globe,
      label: t('info.5'),
      value: 'www.rafidpower.xyz',
      href: 'https://www.rafidpower.xyz',
    },
    {
      icon: Clock,
      label: t('info.6'),
      value: 'السبت - الخميس: 8:00 - 17:00',
      href: '#',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a3a52] mb-4">
            {t('contact.title')}
          </h2>
          <div className="w-20 h-1 bg-[#e63946] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f3f4f6] rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#1a3a52] mb-6">{t('form.send')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a3a52] mb-2">
                  {t('form.name')}
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل اسمك"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a3a52] mb-2">
                  {t('form.email')}
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a3a52] mb-2">
                  {t('form.phone')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a3a52] mb-2">
                  {t('form.msg')}
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full min-h-32"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#e63946] hover:bg-[#d62828] text-white font-bold text-lg py-6"
              >
                {t('form.submit')}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#1a3a52] mb-8">{t('info.title')}</h3>

            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.href}
                  className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-[#f8f9fa] to-[#f3f4f6] hover:from-[#e63946] hover:to-[#d62828] hover:text-white transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-[#1a3a52] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white">
                    <Icon className="text-white group-hover:text-[#e63946]" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a3a52] group-hover:text-white">
                      {info.label}
                    </p>
                    <p className="text-gray-600 group-hover:text-white/90 font-mono" dir="ltr">
                      <bdi>{info.value}</bdi>
                    </p>
                  </div>
                </a>
              );
            })}

            {/* Map */}
            <div className="mt-8 rounded-lg overflow-hidden shadow-lg h-64 bg-gray-200 border-0">
              <iframe
                title="موقع شركة الرافدين للموازين في أربيل"
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3215.11894954316!2d44.0298516!3d36.2145326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzYuMjE0NSIgTiA0NC4wMjk4IiBFOA!5e0!3m2!1sar!2siq!4v1712140000000"
              ></iframe>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
