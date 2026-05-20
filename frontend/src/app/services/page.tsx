import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { ClipboardCheck, Wrench, GraduationCap, Flame, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Services | SG Fire',
  description: 'Professional fire safety services including audits, installation, maintenance, and training.',
};

const services = [
  {
    id: 'audit',
    title: 'Fire Safety Audits',
    description: 'Comprehensive risk assessments and compliance audits by certified professionals to identify vulnerabilities and ensure regulatory compliance.',
    icon: ClipboardCheck,
    image: '/images/hero-3.png',
    features: ['Regulatory Compliance Check', 'Risk Assessment Report', 'Evacuation Plan Review', 'Actionable Recommendations']
  },
  {
    id: 'installation',
    title: 'System Installation',
    description: 'End-to-end installation of fire alarms, hydrant systems, and automated suppression systems tailored to your infrastructure.',
    icon: Wrench,
    image: '/images/hero-2.png',
    features: ['Turnkey Projects', 'NBC Compliant Design', 'Testing & Commissioning', '1-Year Warranty']
  },
  {
    id: 'maintenance',
    title: 'AMC & Maintenance',
    description: 'Annual Maintenance Contracts (AMC) to keep your fire safety equipment fully operational and ready for emergencies.',
    icon: Flame,
    image: '/images/hero-1.png',
    features: ['Scheduled Inspections', 'Extinguisher Refilling', 'Mock Drill Assistance', '24/7 Emergency Support']
  },
  {
    id: 'training',
    title: 'Corporate Training',
    description: 'Hands-on fire safety training for employees, teaching proper extinguisher usage and emergency evacuation protocols.',
    icon: GraduationCap,
    image: '/images/hero-2.png',
    features: ['Live Fire Demonstrations', 'Evacuation Drills', 'First Aid Basics', 'Certification Provided']
  }
];

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-2.png"
            alt="Firefighter background" 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight mb-6">
            Professional Fire Safety Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Beyond premium equipment, SG Fire provides expert installation, maintenance, and compliance auditing to keep your people and property secure.
          </p>
          <Link href="/appointments">
            <Button size="lg" className="text-lg px-8 shadow-lg shadow-red-600/30">
              Book a Consultation
            </Button>
          </Link>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;
            return (
              <div key={service.id} className={`flex flex-col lg:flex-row gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                <div className="w-full lg:w-1/2">
                  <div className="bg-red-50 dark:bg-red-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/50">
                    <Icon className="w-10 h-10 text-red-600 dark:text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/appointments?service=${service.id}`}>
                    <span className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors">
                      Book this service <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </Link>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl dark:shadow-black/50 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                    <div className="absolute left-6 bottom-6 right-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300 mb-2">SG Fire Service</p>
                        <h3 className="font-outfit text-2xl font-black text-white">{service.title}</h3>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800 py-16 mt-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Need a Custom Solution?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Every building is unique. Contact our engineering team for a custom-designed fire safety architecture.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700">
                Contact Us
              </Button>
            </Link>
            <Link href="/appointments">
              <Button size="lg">Schedule Site Visit</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
