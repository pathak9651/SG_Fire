'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { updateProfile, updatePassword } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Clock,
  Package,
  Calendar,
  X,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const stats = [
    { label: 'Total Orders', value: '12', icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Wishlist', value: user?.wishlist?.length || '0', icon: ShieldCheck, color: 'bg-pink-100 text-pink-600' },
    { label: 'Appointments', value: '2', icon: Calendar, color: 'bg-amber-100 text-amber-600' },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage(null);
    try {
      await dispatch(updateProfile({ name, phone })).unwrap();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPasswordLoading(true);
    try {
      await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title={`Welcome, ${user?.name?.split(' ')[0]}`}
      subtitle="Manage your personal information and account security."
    >
      <div className="space-y-8">
        {/* Stats Grid - Hide for Admins since they have a separate admin dashboard */}
        {user?.role !== 'admin' && (
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
        )}

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
            <button 
              onClick={() => {
                setName(user?.name || '');
                setPhone(user?.phone || '');
                setMessage(null);
                setIsEditProfileOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
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
                  <p className="text-sm font-bold dark:text-white">
                    {user?.addresses && user.addresses.length > 0 
                      ? `${user.addresses[0].city}, ${user.addresses[0].state}`
                      : 'No address saved'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Member Since</p>
                  <p className="text-sm font-bold dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                  </p>
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
          <button 
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setMessage(null);
              setIsChangePasswordOpen(true);
            }}
            className="px-6 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 active:scale-95"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white">Edit Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                {message && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed."
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button type="submit" fullWidth isLoading={profileLoading} className="mt-2">
                  <Save size={16} className="mr-2" /> Save Changes
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white">Change Password</h3>
                <button onClick={() => setIsChangePasswordOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {message && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth isLoading={passwordLoading} className="mt-2">
                  <Lock size={16} className="mr-2" /> Update Password
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
