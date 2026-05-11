'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'My Profile', icon: User, href: '/dashboard' },
  { label: 'Order History', icon: ShoppingBag, href: '/dashboard/orders' },
  { label: 'My Wishlist', icon: Heart, href: '/dashboard/wishlist' },
  { label: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
  { label: 'Account Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
  };

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Navigation Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Menu</p>
        </div>
        
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between group px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                  isActive 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-red-500")} />
                  {item.label}
                </div>
                <ChevronRight size={14} className={cn("transition-transform", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-50 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Support Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-3xl -mr-16 -mt-16 group-hover:bg-red-600/30 transition-all duration-700" />
        <h4 className="font-outfit font-black text-lg mb-2 relative z-10">Need Help?</h4>
        <p className="text-xs text-gray-400 mb-4 relative z-10">Our safety experts are available 24/7 for emergency support.</p>
        <Link href="/contact" className="inline-block px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all relative z-10">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
