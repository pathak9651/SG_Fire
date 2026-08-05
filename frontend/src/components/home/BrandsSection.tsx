'use client';

const BRANDS = [
  { name: 'Kanex Fire', category: 'Extinguishers', color: 'from-red-500 to-rose-600' },
  { name: 'Minimax', category: 'Fire Systems', color: 'from-orange-500 to-red-500' },
  { name: 'Ceasefire', category: 'Fire Safety', color: 'from-amber-500 to-orange-600' },
  { name: 'Safex', category: 'Alarms', color: 'from-red-600 to-orange-500' },
  { name: 'Honeywell', category: 'Detectors', color: 'from-blue-500 to-cyan-600' },
  { name: 'Hochiki', category: 'Alarms', color: 'from-violet-500 to-purple-600' },
  { name: 'Bosch', category: 'Security', color: 'from-gray-600 to-gray-800' },
  { name: 'Johnson Controls', category: 'Fire Control', color: 'from-emerald-500 to-green-600' },
  { name: 'Nitco', category: 'Safety Equipment', color: 'from-rose-500 to-red-600' },
  { name: 'Amerex', category: 'Extinguishers', color: 'from-orange-600 to-red-600' },
];

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function BrandCard({ brand }: { brand: typeof BRANDS[0] }) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 min-w-[180px] shadow-sm hover:shadow-md dark:hover:border-gray-700 transition-all duration-200 cursor-default">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm`}>
        {getInitials(brand.name)}
      </div>
      <div>
        <p className="font-outfit font-bold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
          {brand.name}
        </p>
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{brand.category}</p>
      </div>
    </div>
  );
}

export default function BrandsSection() {
  return (
    <section className="py-14 border-t border-b border-gray-200/70 dark:border-gray-800/80 bg-slate-50 dark:bg-gray-950 overflow-hidden">
      <div className="container-main mb-8 text-center">
        <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-[0.3em] font-extrabold mb-1">
          Trusted Partner Brands
        </p>
        <h3 className="font-outfit text-2xl font-extrabold text-gray-900 dark:text-white">
          India's Leading Fire Safety Manufacturers
        </h3>
      </div>

      {/* Dual-direction marquee */}
      <div className="space-y-4">
        {/* Row 1 — scrolls left */}
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          <div className="brands-marquee-left flex gap-4 items-center">
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <BrandCard key={`a-${index}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-slate-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-slate-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          <div className="brands-marquee-right flex gap-4 items-center">
            {[...BRANDS.slice(5), ...BRANDS.slice(0, 5), ...BRANDS.slice(5), ...BRANDS.slice(0, 5)].map((brand, index) => (
              <BrandCard key={`b-${index}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>

      {/* Certification badges */}
      <div className="container-main mt-10 flex flex-wrap justify-center gap-3">
        {['ISI Certified', 'BIS Approved', 'ISO 9001:2015', 'CE Marked', 'NBC Compliant'].map((badge) => (
          <div
            key={badge}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs"
          >
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[8px] font-black">✓</span>
            </div>
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
