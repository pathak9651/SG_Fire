'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
  hasMega?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products', hasMega: true },
  { label: 'Categories', href: '/categories' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

interface NavLinksProps {
  onMouseEnterMega: () => void;
  onMouseLeaveMega: () => void;
  showMegaMenu: boolean;
}

export default function NavLinks({ onMouseEnterMega, onMouseLeaveMega, showMegaMenu }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-2">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        
        return (
          <div
            key={link.href}
            className="relative"
            onMouseEnter={() => link.hasMega && onMouseEnterMega()}
            onMouseLeave={() => link.hasMega && onMouseLeaveMega()}
          >
            <Link
              href={link.href}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-300",
                isActive 
                  ? "text-red-600 font-semibold" 
                  : "text-gray-700 dark:text-gray-300 hover:text-red-600"
              )}
            >
              {link.label}
              {link.hasMega && (
                <ChevronDown 
                  size={14} 
                  className={cn(
                    "transition-transform duration-300",
                    showMegaMenu ? "rotate-180" : ""
                  )} 
                />
              )}
              
              {/* Animated Underline */}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-600 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
