import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en' | 'ku';

type TranslationsDictionary = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: TranslationsDictionary = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.services': 'الخدمات',
    'nav.products': 'المنتجات',
    'nav.videos': 'الفيديوهات',
    'nav.projects': 'المشاريع',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'btn.quote': 'طلب عرض سعر',
    'hero.motto': 'الدقة في الوزن، والتميز في الخدمة',
    'hero.badge': 'القوة والدقة منذ عام 1988',
    'hero.title.1': 'الرافدين',
    'hero.title.2': 'للموازين',
    'hero.subtitle': 'الريادة في تصنيع وصيانة الموازين الجسرية والحلول الصناعية المتكاملة',
    'hero.desc': 'نجمع بين الخبرة الطويلة وأحدث التقنيات لنقدم لك دقة لا تضاهى في قياس وتوزين الشاحنات',
    'hero.explore': 'استكشف خدماتنا',
    'hero.scrollDown': 'اسحب للأسفل',
    'about.title': 'قصتنا',
    'about.subtitle': 'بناء الثقة منذ 1988',
    'about.desc': 'نحن في شركة الرافدين للموازين، نفخر بكوننا الرواد في مجال تصنيع وصيانة الموازين الجسرية. نلتزم بأعلى معايير الجودة العالمية لنقدم لعملائنا دقة متناهية وحلولاً تدوم طويلاً.',
    'about.item1': 'التأسيس عام 1988 بشعار دائم: (دقة وأمان)',
    'about.item2': 'تصنيع، صيانة، ومعايرة جميع الموازين الجسرية',
    'about.item3': 'استخدام أفضل الحساسات الرقمية (Load Cells)',
    'about.item4': 'الربط بأنظمة الأتمتة الحديثة (PLC)',
    'about.item5': 'ضمان شامل وحقيقي يصل إلى 10 سنوات للموازين الجسرية',
    'about.item6': 'بإدارة الخبير المهندس عبد الوهاب ذنون',
    'products.tag': 'منتجاتنا',
    'products.title': 'حلول توزين',
    'products.title2': 'متطورة',
    'products.desc': 'نقدم مجموعة متكاملة من المنتجات الصناعية لدعم أعمالكم',
    'product.1.title': 'موازين الشاحنات (الموازين الجسرية)',
    'product.1.desc': 'تصنيع هياكل حديدية جبارة لتوزين الشاحنات، مصممة لتحمل أقصى وأقسى ظروف العمل الصناعية.',
    'product.1.cap': 'تصل إلى 150 طن',
    'product.1.acc': 'ضمان 10 سنوات',
    'product.2.title': 'خلايا الوزن الرقمية (Load Cells)',
    'product.2.desc': 'حساسات ومنظومات وزن إلكترونية دقيقة جداً ومضادة للتذبذب لضمان القراءة الصحيحة في كل مرة.',
    'product.2.cap': 'دقة متناهية',
    'product.2.acc': 'اعتمادية عالمية',
    'product.3.title': 'أنظمة الأتمتة (PLC Control)',
    'product.3.desc': 'حلول التحكم المنطقي المبرمج لربط الموازين بخطوط الإنتاج والتعبئة الآلية بمنتهى السلاسة.',
    'product.3.cap': 'تحكم ذكي بالكامل',
    'product.3.acc': 'أداء مستقر',
    'product.lbl.cap': 'السعة:',
    'product.lbl.acc': 'الدقة/الضمان:',
    'product.lbl.btn': 'اطلب المزيد من المعلومات',
    'features.title1': 'لماذا تختار ',
    'features.title2': 'الرافدين؟',
    'features.desc': 'نحن لا نبيع موازين فحسب، بل نقدم حلولاً هندسية متكاملة تضمن دقة أعمالكم واستمراريتها.',
    'feat.1.t': 'دقة متناهية',
    'feat.1.d': 'نستخدم أحدث تقنيات التحويل الرقمي لضمان أدق نتائج التوزين في السوق.',
    'feat.2.t': 'جودة معتمدة',
    'feat.2.d': 'جميع منتجاتنا تخضع لمعايير الجودة العالمية OIML وتأتي مع ضمان شامل.',
    'feat.3.t': 'خبرة طويلة',
    'feat.3.d': 'أكثر من 35 عاماً في خدمة القطاع الصناعي العراقي والإقليمي.',
    'feat.4.t': 'سرعة التنفيذ',
    'feat.4.d': 'نلتزم بجداول زمنية صارمة في التركيب والصيانة لضمان عدم توقف أعمالكم.',
    'feat.5.t': 'تقنيات حديثة',
    'feat.5.d': 'نواكب أحدث الابتكارات في مجال الموازين الجسرية وأنظمة الأتمتة.',
    'feat.6.t': 'دعم فني متميز',
    'feat.6.d': 'فريق فني جاهز للاستجابة السريعة وتوفير قطع الغيار الأصلية دائماً.',
    'stat.1': 'عاماً من الخبرة',
    'stat.2': 'ميزان تم تركيبه',
    'stat.3': 'عميل سعيد',
    'stat.4': 'شهادة جودة',
    'contact.title': 'اتصل بنا',
    'contact.desc': 'نحن هنا للإجابة على جميع أسئلتك والمساعدة في احتياجاتك',
    'form.send': 'أرسل لنا رسالة',
    'form.name': 'الاسم',
    'form.email': 'البريد الإلكتروني',
    'form.phone': 'رقم الهاتف',
    'form.msg': 'الرسالة',
    'form.submit': 'إرسال الرسالة',
    'info.title': 'معلومات الاتصال',
    'info.1': 'خدمة العملاء',
    'info.2': 'الصيانة والدعم',
    'info.3': 'البريد الإلكتروني',
    'info.4': 'العنوان',
    'info.5': 'الموقع الإلكتروني',
    'info.6': 'ساعات العمل',
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.videos': 'Videos',
    'nav.projects': 'Projects',
    'nav.about': 'About Us',
    'nav.contact': 'Contact Us',
    'btn.quote': 'Get a Quote',
    'hero.motto': 'Precision in Weighing, Excellence in Service',
    'hero.badge': 'Power and Precision since 1988',
    'hero.title.1': 'RAFIDAIN',
    'hero.title.2': 'SCALES',
    'hero.subtitle': 'Leading in Manufacturing and Maintenance of Weighbridges',
    'hero.desc': 'We combine profound experience with modern technology to provide unmatchable accuracy in truck weighing',
    'hero.explore': 'Explore Our Services',
    'hero.scrollDown': 'Scroll Down',
    'about.title': 'Our Story',
    'about.subtitle': 'Building Trust Since 1988',
    'about.desc': 'At Rafidain Scales Co., we pride ourselves on being the pioneers in manufacturing and maintaining weighbridges. We adhere to the highest global quality standards to provide our customers with ultimate precision and long-lasting solutions.',
    'about.item1': 'Established in 1988 with an enduring motto: (Precision and Safety)',
    'about.item2': 'Manufacturing, maintenance, and calibration of all weighbridges',
    'about.item3': 'Utilizing the best digital Load Cells',
    'about.item4': 'Integration with modern PLC automation systems',
    'about.item5': 'Comprehensive and genuine warranty up to 10 years for weighbridges',
    'about.item6': 'Managed by Expert Engineer Abdulwahab Dhannoon',
    'products.tag': 'Our Products',
    'products.title': 'Advanced Weighing',
    'products.title2': 'Solutions',
    'products.desc': 'We offer a comprehensive range of industrial products to support your business',
    'product.1.title': 'Truck Scales (Weighbridges)',
    'product.1.desc': 'Manufacturing massive steel structures for truck weighing, designed to withstand the harshest industrial working conditions.',
    'product.1.cap': 'Up to 150 Tons',
    'product.1.acc': '10-Year Warranty',
    'product.2.title': 'Digital Load Cells',
    'product.2.desc': 'Highly precise electronic weighing sensors and systems, anti-oscillation to ensure correct reading every time.',
    'product.2.cap': 'Ultimate Precision',
    'product.2.acc': 'Global Reliability',
    'product.3.title': 'Automation Systems (PLC Control)',
    'product.3.desc': 'Programmable Logic Controller solutions to seamlessly connect scales with production and automated packaging lines.',
    'product.3.cap': 'Fully Smart Control',
    'product.3.acc': 'Stable Performance',
    'product.lbl.cap': 'Capacity:',
    'product.lbl.acc': 'Precision/Warranty:',
    'product.lbl.btn': 'Request More Info',
    'features.title1': 'Why Choose ',
    'features.title2': 'RAFIDAIN?',
    'features.desc': 'We don’t just sell scales; we provide integrated engineering solutions ensuring your business accuracy and continuity.',
    'feat.1.t': 'Ultimate Precision',
    'feat.1.d': 'We use the latest digital conversion technologies to ensure the most accurate weighing results in the market.',
    'feat.2.t': 'Certified Quality',
    'feat.2.d': 'All our products undergo OIML global quality standards and come with a comprehensive warranty.',
    'feat.3.t': 'Long Experience',
    'feat.3.d': 'Over 35 years serving the Iraqi and regional industrial sector.',
    'feat.4.t': 'Fast Execution',
    'feat.4.d': 'We strictly commit to timelines in installation and maintenance to ensure zero downtime.',
    'feat.5.t': 'Modern Tech',
    'feat.5.d': 'We keep pace with the latest innovations in weighbridges and automation systems.',
    'feat.6.t': 'Premium Support',
    'feat.6.d': 'A technical team ready for rapid response, always providing original spare parts.',
    'stat.1': 'Years of Experience',
    'stat.2': 'Scales Installed',
    'stat.3': 'Happy Clients',
    'stat.4': 'Quality Certificates',
    'contact.title': 'Contact Us',
    'contact.desc': 'We are here to answer all your questions and assist with your needs.',
    'form.send': 'Send us a message',
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone Number',
    'form.msg': 'Message',
    'form.submit': 'Send Message',
    'info.title': 'Contact Information',
    'info.1': 'Customer Service',
    'info.2': 'Maintenance & Support',
    'info.3': 'Email',
    'info.4': 'Address',
    'info.5': 'Website',
    'info.6': 'Working Hours',
  },
  ku: {
    'nav.home': 'سەرەکی',
    'nav.services': 'خزمەتگوزارییەکان',
    'nav.products': 'بەرهەمەکان',
    'nav.videos': 'ڤیدیۆکان',
    'nav.projects': 'پڕۆژەکان',
    'nav.about': 'دەربارەی ئێمە',
    'nav.contact': 'پەیوەندیمان پێوە بکە',
    'btn.quote': 'داواکردنی نرخ',
    'hero.motto': 'وردی لە کێشان، نایابی لە خزمەتگوزاری',
    'hero.badge': 'هێز و وردبینی لە ساڵی ١٩٨٨ەوە',
    'hero.title.1': 'ڕافیدەین',
    'hero.title.2': 'بۆ تەرازوو',
    'hero.subtitle': 'پێشەنگ لە دروستکردن و چاککردنی تەرازووی پردی و چارەسەری پیشەسازی',
    'hero.desc': 'ئێمە ئەزموونی درێژخایەن و تەکنەلۆجیای سەردەم کۆدەکەینەوە بۆ پێشکەشکردنی وردبینییەکی بێوێنە',
    'hero.explore': 'بەدواداچوون بۆ خزمەتگوزارییەکانمان',
    'hero.scrollDown': 'ڕابکێشە خوارەوە',
    'about.title': 'چیرۆکی ئێمە',
    'about.subtitle': 'بنیاتنانی متمانە لە ساڵی ١٩٨٨ەوە',
    'about.desc': 'ئێمە لە کۆمپانیای ڕافیدەین بۆ تەرازوو، شانازی دەکەین بەوەی پێشەنگین لە دروستکردن و چاککردنەوەی تەرازووی پردی (قەپان). بەرزترین پێوەرەکانی کوالێتی جیهانی جێبەجێ دەکەین بۆ دەستەبەرکردنی وردبینی و چارەسەری درێژخایەن.',
    'about.item1': 'دامەزراندن لە ساڵی ١٩٨٨ بە دروشمی هەمیشەیی: (وردبینی و سەلامەتی)',
    'about.item2': 'دروستکردن، چاککردنەوە و پێوانەکردنی هەموو جۆرە تەرازوویەکی پردی',
    'about.item3': 'بەکارهێنانی باشترین هەستەوەرە دیجیتاڵییەکان (Load Cells)',
    'about.item4': 'پەیوەستکردن بە سیستەمە نوێیەکانی ئۆتۆمەیشن (PLC)',
    'about.item5': 'گەرەنتییەکی گشتگیر و ڕاستەقینە تاوەکو ١٠ ساڵ',
    'about.item6': 'بەڕێوەبردن لەلایەن ئەندازیاری شارەزا عەبدولوەهاب زەننون',
    'products.tag': 'بەرهەمەکانمان',
    'products.title': 'چارەسەری پێشکەوتووی',
    'products.title2': 'کێشان',
    'products.desc': 'کۆمەڵەیەکی گشتگیر لە بەرهەمی پیشەسازی پێشکەش دەکەین',
    'product.1.title': 'تەرازووی بارهەڵگر (قەپان)',
    'product.1.desc': 'دروستکردنی پێکهاتەی ئاسنی زەبەلاح بۆ کێشانی بارهەڵگر، نەخشێنراو بۆ بەرگەگرتنی سەختترین بارودۆخەکان.',
    'product.1.cap': 'تا ١٥٠ تۆن',
    'product.1.acc': 'گەرەنتی ١٠ ساڵ',
    'product.2.title': 'هەستەوەری دیجیتاڵی (Load Cells)',
    'product.2.desc': 'هەستەوەر و سیستەمی ئەلیکترۆنی زۆر ورد بۆ دڵنیابوون لە خوێندنەوەی دروست.',
    'product.2.cap': 'وردبینی بێوێنە',
    'product.2.acc': 'متمانەی جیهانی',
    'product.3.title': 'سیستەمی ئۆتۆمەیشن (PLC Control)',
    'product.3.desc': 'چارەسەری کۆنترۆڵی زیرەک بۆ بەستنەوەی تەرازوو بە هێڵی بەرهەمهێنانەوە.',
    'product.3.cap': 'کۆنترۆڵی زیرەکی تەواو',
    'product.3.acc': 'ئەدای جێگیر',
    'product.lbl.cap': 'توانا:',
    'product.lbl.acc': 'وردبینی/گەرەنتی:',
    'product.lbl.btn': 'زانیاری زیاتر داوا بکە',
    'features.title1': 'بۆچی ',
    'features.title2': 'ڕافیدەین؟',
    'features.desc': 'ئێمە تەنیا تەرازوو نافرۆشین، بەڵکو چارەسەری ئەندازیاری گشتگیر پێشکەش دەکەین.',
    'feat.1.t': 'وردبینی پێوانەیی',
    'feat.1.d': 'نوێترین تەکنەلۆجیای گۆڕینی دیجیتاڵی بەکاردەهێنین بۆ دەستەبەرکردنی وردترین ئەنجامەکان.',
    'feat.2.t': 'کوالێتی باوەڕپێکراو',
    'feat.2.d': 'هەموو بەرهەمەکانمان پێوەری OIMLی جیهانی تێپەڕ دەکەن و گەرەنتییەکی گشتگیر لەخۆدەگرن.',
    'feat.3.t': 'ئەزموونی درێژخایەن',
    'feat.3.d': 'زیاتر لە ٣٥ ساڵ خزمەتکردن بە کەرتی پیشەسازی.',
    'feat.4.t': 'جێبەجێکردنی خێرا',
    'feat.4.d': 'پابەندین بە کاتەکانی دانان و چاککردنەوە بۆ دڵنیابوون لەوەی کارەکانتان نەوەستێت.',
    'feat.5.t': 'تەکنەلۆجیای نوێ',
    'feat.5.d': 'چاودێری نوێترین داهێنانەکان دەکەین لە بواری تەرازووی پردی و سیستەمی ئۆتۆمەیشن.',
    'feat.6.t': 'پشتگیری تیکنیکی',
    'feat.6.d': 'تیمێکی تیکنیکی ئامادە بۆ وەڵامدانەوەی خێرا بە پارچەی یەدەکی ئەسڵی.',
    'stat.1': 'ساڵ ئەزموون',
    'stat.2': 'تەرازوو دانراوە',
    'stat.3': 'کڕیاری دڵخۆش',
    'stat.4': 'بڕوانامەی کوالێتی',
    'contact.title': 'پەیوەندیمان پێوە بکە',
    'contact.desc': 'ئێمە لێرەین بۆ وەڵامدانەوەی پرسیارەکانتان.',
    'form.send': 'نامەیەکمان بۆ بنێرە',
    'form.name': 'ناو',
    'form.email': 'ئیمەیڵ',
    'form.phone': 'ژمارەی مۆبایل',
    'form.msg': 'نامە',
    'form.submit': 'ناردنی نامە',
    'info.title': 'زانیاری پەیوەندیکردن',
    'info.1': 'خزمەتگوزاری کڕیاران',
    'info.2': 'چاککردنەوە و پشتگیری',
    'info.3': 'ئیمەیڵ',
    'info.4': 'ناونیشان',
    'info.5': 'ماڵپەڕ',
    'info.6': 'کاتەکانی کارکردن',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en' || savedLanguage === 'ku')) {
      setLanguage(savedLanguage);
    } else {
      setLanguage('ar'); // Default
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
