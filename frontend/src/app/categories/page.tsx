import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert, BellRing, Droplets, HardHat, Flame, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Product Categories | SG Fire',
  description: 'Browse all fire safety equipment categories offered by SG Fire.',
};

const categories = [
  {
    id: 'fire-extinguishers',
    name: 'Fire Extinguishers',
    description: 'ABC Powder, CO2, Water, and Foam extinguishers for all fire classes.',
    icon: Flame,
    color: 'bg-red-50 text-red-600 border-red-100',
    link: '/products?category=fire-extinguishers'
  },
  {
    id: 'fire-alarms',
    name: 'Fire Alarms & Detectors',
    description: 'Smoke detectors, heat sensors, and complete addressable alarm systems.',
    icon: BellRing,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    link: '/products?category=fire-alarms'
  },
  {
    id: 'hydrant-systems',
    name: 'Hydrant Systems',
    description: 'Hoses, nozzles, valves, and full hydrant network accessories.',
    icon: Droplets,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    link: '/products?category=hydrant-systems'
  },
  {
    id: 'safety-gear',
    name: 'Personal Protective Equipment',
    description: 'Fire suits, helmets, gloves, and breathing apparatus.',
    icon: HardHat,
    color: 'bg-green-50 text-green-600 border-green-100',
    link: '/products?category=safety-gear'
  },
  {
    id: 'suppression-systems',
    name: 'Suppression Systems',
    description: 'Automated clean agent and water sprinkler systems for server rooms and factories.',
    icon: ShieldAlert,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    link: '/products?category=suppression-systems'
  },
  {
    id: 'accessories',
    name: 'Spare Parts & Accessories',
    description: 'Signage, brackets, cabinets, and maintenance tools.',
    icon: Settings,
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    link: '/products?category=accessories'
  }
];

export default function CategoriesPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="bg-gray-900 dark:bg-black py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-red-900/20 dark:bg-red-900/10" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
            Shop by Category
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Find exactly what you need to keep your premises safe and compliant.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link 
                key={category.id} 
                href={category.link}
                className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-red-900/10 transition-all duration-300 hover:border-red-200 dark:hover:border-red-900/50"
              >
                <div className={`p-8 ${category.color} border-b dark:border-gray-800 flex justify-center items-center h-48 transition-colors group-hover:bg-red-50 dark:group-hover:bg-red-950/20`}>
                  <Icon className={`w-20 h-20 ${category.color.split(' ')[1]} transition-transform duration-300 group-hover:scale-110 group-hover:text-red-600 dark:group-hover:text-red-500`} />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-1">
                    {category.description}
                  </p>
                  <div className="mt-4 text-red-600 font-medium text-sm flex items-center">
                    Browse Category
                    <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
