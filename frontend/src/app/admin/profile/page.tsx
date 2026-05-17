'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { updateProfile, updatePassword } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User as UserIcon, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await dispatch(updateProfile({ name, phone })).unwrap();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSecurityLoading(true);
    setSecurityMsg({ type: '', text: '' });
    try {
      await dispatch(updatePassword({ currentPassword, newPassword })).unwrap();
      setSecurityMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err || 'Failed to update password' });
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and security.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'profile' ? 'text-red-600 dark:text-red-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <UserIcon size={18} />
          Personal Info
          {activeTab === 'profile' && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" layoutId="tab-indicator" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'security' ? 'text-red-600 dark:text-red-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Lock size={18} />
          Security
          {activeTab === 'security' && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" layoutId="tab-indicator" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 max-w-2xl shadow-sm">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            
            {profileMsg.text && (
              <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium ${
                profileMsg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email address cannot be changed."
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
              />
              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={profileLoading}>
                  <Save size={18} className="mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h2>
            
            {securityMsg.text && (
              <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium ${
                securityMsg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {securityMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {securityMsg.text}
              </div>
            )}

            <form onSubmit={handleSecuritySubmit} className="space-y-5">
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
              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={securityLoading}>
                  <Lock size={18} className="mr-2" /> Update Password
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
