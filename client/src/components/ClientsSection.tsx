import { motion } from 'framer-motion';

const clients = [
  "وزارة الصناعة والمعادن",
  "وزارة التجارة العراقية",
  "شركة نفط البصرة",
  "مصانع الأسمنت العراقية",
  "معامل الحديد والصلب",
  "موانئ العراق",
  "شركات النقل البري",
  "المنافذ الحدودية",
  "صوامع الحبوب (السايلوات)",
  "شركات المقاولات الكبرى"
];

export default function ClientsSection() {
  // We duplicate the array to create a seamless infinite loop
  const duplicatedClients = [...clients, ...clients];

  return (
    <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">
          شركاء النجاح
        </h3>
        <p className="text-[#1a3a52] font-semibold mt-2">
          نفخر بثقة كبرى المؤسسات والشركات العراقية
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Gradient fades for the edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <motion.div
          className="flex whitespace-nowrap items-center min-w-full"
          animate={{ x: ["0%", "100%"] }} // Moving right to left for RTL? Actually, in Framer Motion x: [0, 100] moves right. In RTL we want it to flow naturally. Wait, "0%" to "100%" means moving visually to the right. Let's use left-to-right flow which looks like right-to-left scrolling in LTR, but in RTL it's reversed. Let's use explicit pixels or percentages carefully.
          // For RTL infinite scroll, moving from 0 to 100% of half width is standard if the container is LTR.
          // Let's use a simpler CSS-based or framer motion trick.
          initial={{ x: 0 }}
          animate={{ x: "50%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
        >
          {duplicatedClients.map((client, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl shadow-sm text-[#1a3a52] font-bold text-xl min-w-[200px] text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {client}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
