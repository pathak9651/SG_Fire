import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { ShieldCheck, Award, Users, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | SG Fire',
  description: 'Learn about SG Fire, our mission, and our commitment to providing top-tier fire safety solutions since 2010.',
};

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-900 py-20 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply" />
          {/* Subtle grid pattern */}
          <div className="h-full w-full opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight mb-4 sm:mb-6">
            Defending What Matters Most
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            At SG Fire, we believe that safety is not a luxury, but a fundamental right. 
            For over a decade, we have been India's trusted partner in comprehensive fire protection.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Founded in 2010, SG Fire began with a simple mission: to provide reliable, high-quality fire safety equipment to businesses and homes across the country. 
              </p>
              <p>
                What started as a small local supplier of fire extinguishers has grown into a comprehensive fire safety engineering firm. Today, we don't just sell equipment; we design, install, and maintain end-to-end suppression and alarm systems for corporate campuses, industrial facilities, and residential complexes.
              </p>
              <p>
                Our growth is driven by our unwavering commitment to quality. Every product we stock is rigorously tested and certified to meet or exceed national and international safety standards (IS, CE, UL).
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl h-48 sm:h-64 overflow-hidden relative border border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent z-10" />
                <Image src="/images/placeholder.png" alt="Fire safety installation" fill className="object-cover" />
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-6 rounded-2xl flex flex-col justify-center h-32 sm:h-48">
                <span className="text-4xl font-black text-red-600 dark:text-red-500 mb-1">500+</span>
                <span className="text-sm font-medium text-red-900 dark:text-red-300 uppercase tracking-wide">Projects Completed</span>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center h-32 sm:h-48 border border-gray-800">
                <span className="text-4xl font-black text-white mb-1">15+</span>
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Years Experience</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl h-48 sm:h-64 overflow-hidden relative border border-gray-200 dark:border-gray-800">
                <Image src="/images/placeholder.png" alt="Fire safety training" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 py-20 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">The principles that guide every installation, audit, and product we deliver.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'Uncompromising Quality', desc: 'We only supply certified equipment that we would trust in our own homes.' },
              { icon: Target, title: 'Precision Engineering', desc: 'Every system is custom-designed for the specific thermal and architectural risks of your building.' },
              { icon: Users, title: 'Human-Centric', desc: 'Equipment is useless if people don\'t know how to use it. We prioritize usability and training.' },
              { icon: Award, title: 'Regulatory Compliance', desc: 'We ensure 100% compliance with local fire codes and National Building Code standards.' },
            ].map((value, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-red-900/10 transition-shadow">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/50">
                  <value.icon className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
