'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Clock,
  Package,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Total Orders', value: '12', icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Wishlist', value: '5', icon: ShieldCheck, color: 'bg-pink-100 text-pink-600' },
    { label: 'Appointments', value: '2', icon: Calendar, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <DashboardLayout 
      title={`Welcome, ${user?.name?.split(' ')[0]}`}
      subtitle="Manage your personal information and account security."
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-2xl font-black dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-fire-gradient rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white mb-1">{user?.name}</h2>
                <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-red-600" />
                  Verified Safety Partner
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95">
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-sm font-bold dark:text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                  <p className="text-sm font-bold dark:text-white">{user?.phone || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Primary Address</p>
                  <p className="text-sm font-bold dark:text-white">Punjab, India</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Member Since</p>
                  <p className="text-sm font-bold dark:text-white">May 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-outfit font-black text-xl text-red-900 dark:text-red-400">Account Security</h3>
              <p className="text-sm font-medium text-red-700/70 dark:text-red-500/70">Your account is protected by 256-bit encryption.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 active:scale-95">
            Change Password
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
