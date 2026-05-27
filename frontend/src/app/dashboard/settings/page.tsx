'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { updateProfile, updatePassword, updateUser } from '@/redux/slices/authSlice';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  User as UserIcon, 
  Lock, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Home, 
  Briefcase, 
  Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  _id?: string;
  type: 'home' | 'office' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export default function ClientSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'addresses'>('profile');

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

  // Address Management State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // Address Form Fields
  const [addrType, setAddrType] = useState<'home' | 'office' | 'other'>('home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

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
      if (newPassword) setNewPassword('');
      if (confirmPassword) setConfirmPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err || 'Failed to update password' });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Open Form to Add New Address
  const handleAddNewClick = () => {
    setEditingAddressId(null);
    setAddrType('home');
    setAddrFullName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(user?.addresses?.length === 0);
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing Address
  const handleEditClick = (addr: Address) => {
    setEditingAddressId(addr._id || null);
    setAddrType(addr.type);
    setAddrFullName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.addressLine1);
    setAddrLine2(addr.addressLine2 || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(addr.isDefault);
    setIsFormOpen(true);
  };

  // Submit Add or Edit Address Form
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setAddressLoading(true);
    const addressPayload = {
      type: addrType,
      fullName: addrFullName,
      phone: addrPhone,
      addressLine1: addrLine1,
      addressLine2: addrLine2 || undefined,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addrIsDefault
    };

    try {
      let response;
      if (editingAddressId) {
        // Edit existing address
        response = await api.put(`/users/addresses/${editingAddressId}`, addressPayload);
        toast.success('Address updated successfully');
      } else {
        // Add new address
        response = await api.post('/users/addresses', addressPayload);
        toast.success('Address added successfully');
      }

      if (response.data?.success) {
        // Update Redux state immediately so changes reflect everywhere in-app
        dispatch(updateUser({ addresses: response.data.data }));
        setIsFormOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  // Delete Address Action
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this saved address?')) return;
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      if (response.data?.success) {
        toast.success('Address deleted successfully');
        dispatch(updateUser({ addresses: response.data.data }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const getAddressIcon = (type: string) => {
    if (type === 'office') return <Briefcase size={16} className="text-orange-500" />;
    if (type === 'home') return <Home size={16} className="text-red-500" />;
    return <Globe size={16} className="text-blue-500" />;
  };

  return (
    <DashboardLayout 
      title="Account Settings" 
      subtitle="Manage your personal profile, secure password, and delivery addresses."
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-250 dark:border-gray-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => { setActiveTab('profile'); setIsFormOpen(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'profile' ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <UserIcon size={18} />
            Personal Info
            {activeTab === 'profile' && (
              <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" layoutId="client-tab-indicator" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('security'); setIsFormOpen(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'security' ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Lock size={18} />
            Security
            {activeTab === 'security' && (
              <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" layoutId="client-tab-indicator" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('addresses'); setIsFormOpen(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'addresses' ? 'text-red-600 dark:text-red-500 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <MapPin size={18} />
            Saved Addresses
            {activeTab === 'addresses' && (
              <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500" layoutId="client-tab-indicator" />
            )}
          </button>
        </div>

        {/* Content Panel */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-850 p-6 md:p-8 max-w-3xl shadow-sm">
          
          {/* 1. PROFILE INFORMATION TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-outfit">Personal Information</h2>
              
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
                  <Button type="submit" isLoading={profileLoading} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-red-600/10 active:scale-95 transition-all">
                    <Save size={18} className="mr-2" /> Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 2. SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-outfit">Change Password</h2>
              
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
                  <Button type="submit" isLoading={securityLoading} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-red-600/10 active:scale-95 transition-all">
                    <Lock size={18} className="mr-2" /> Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 3. SAVED ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              <AnimatePresence mode="wait">
                {/* Form View (Add / Edit address) */}
                {isFormOpen ? (
                  <motion.div
                    key="address-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">
                        {editingAddressId ? 'Edit Address' : 'Add New Saved Address'}
                      </h3>
                      <button 
                        onClick={() => setIsFormOpen(false)}
                        className="text-xs font-bold text-gray-500 hover:text-red-500"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      {/* Address Type Selection Buttons */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Address Tag</label>
                        <div className="flex gap-2.5">
                          {(['home', 'office', 'other'] as const).map(type => (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setAddrType(type)}
                              className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                                addrType === type 
                                  ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-950/20' 
                                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-950 dark:hover:text-white'
                              }`}
                            >
                              {getAddressIcon(type)}
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Recipient's Full Name *"
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                        <Input
                          label="Contact Phone Number *"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="9876543210"
                          required
                        />
                      </div>

                      <Input
                        label="Flat, House No., Building Name *"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        placeholder="House No 4B, Emerald Heights"
                        required
                      />

                      <Input
                        label="Street, Area, Locality (Optional)"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        placeholder="Sector 15, Near Central Park"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="City *"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          placeholder="Mumbai"
                          required
                        />
                        <Input
                          label="State *"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          placeholder="Maharashtra"
                          required
                        />
                        <Input
                          label="Pincode / Postal Code *"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          placeholder="400001"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          id="default_addr"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="w-4.5 h-4.5 accent-red-600 rounded border-gray-250"
                        />
                        <label htmlFor="default_addr" className="text-xs font-bold text-gray-700 dark:text-gray-300 select-none">
                          Set this as my default delivery address
                        </label>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsFormOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" isLoading={addressLoading} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all">
                          <Save size={16} className="mr-1.5" /> Save Address
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* List View */
                  <motion.div
                    key="address-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">My Saved Addresses</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Quickly select addresses during checkout.</p>
                      </div>
                      <button
                        onClick={handleAddNewClick}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-red-600/10 active:scale-95 transition-all"
                      >
                        <Plus size={14} /> Add Address
                      </button>
                    </div>

                    {user?.addresses && user.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((addr) => (
                          <div 
                            key={addr._id} 
                            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                              addr.isDefault 
                                ? 'bg-red-50/10 border-red-500 shadow-sm' 
                                : 'bg-gray-50/20 dark:bg-gray-850/10 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                          >
                            <div>
                              {/* Tag Label and Default badge */}
                              <div className="flex justify-between items-center mb-3">
                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                  addr.isDefault 
                                    ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-900/50' 
                                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                }`}>
                                  {getAddressIcon(addr.type)}
                                  {addr.type}
                                </span>
                                
                                {addr.isDefault && (
                                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">
                                    Default Delivery
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{addr.fullName}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{addr.addressLine1}</p>
                              {addr.addressLine2 && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{addr.addressLine2}</p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal mb-3">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>

                            {/* Actions bar */}
                            <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-3.5 mt-2">
                              <button
                                onClick={() => handleEditClick(addr)}
                                className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-600 hover:text-red-500 transition-colors"
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id || '')}
                                className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-600 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-250 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-650 bg-gray-50/20 dark:bg-gray-850/5">
                        <MapPin size={32} className="mb-2 opacity-40 text-red-500 animate-bounce" />
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 mb-1">No Saved Addresses</h4>
                        <p className="text-xs text-gray-500 max-w-xs mb-4">You have not added any delivery addresses yet. Add one to accelerate your checkout!</p>
                        <Button 
                          onClick={handleAddNewClick}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                          <Plus size={14} className="mr-1" /> Add Address
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
