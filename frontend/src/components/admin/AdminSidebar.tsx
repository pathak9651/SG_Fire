'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  PlusCircle, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Appointments', icon: Calendar, href: '/admin/appointments' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Upload Product', icon: PlusCircle, href: '/admin/products/upload' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Inventory', icon: BarChart3, href: '/admin/stock' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-950 text-white h-screen fixed left-0 top-0 z-[100] flex flex-col border-r border-gray-800">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-fire-gradient rounded-lg flex items-center justify-center">
          <Flame size={18} className="text-white" />
        </div>
        <span className="font-outfit font-bold text-lg">
          Admin <span className="text-red-500">Panel</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-red-400")} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-gray-800 space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Site
        </Link>
        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
