'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Save,
  RotateCw,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { 
  getAllAdminAppointments, 
  approveAppointment, 
  rejectAppointment, 
  rescheduleAppointment 
} from '@/redux/slices/appointmentSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function AdminAppointments() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, isLoading, totalPages, currentPage, isError, message } = useSelector((state: RootState) => state.appointment);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [rescheduleData, setRescheduleData] = useState<{ id: string, date: string, time: string } | null>(null);

  const fetchAppointments = useCallback(() => {
    dispatch(getAllAdminAppointments({ page: 1, status: statusFilter }));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message || 'Failed to retrieve appointments');
    }
  }, [isError, message]);

  const handleApprove = async (id: string) => {
    try {
      const result = await dispatch(approveAppointment(id));
      if (approveAppointment.fulfilled.match(result)) {
        toast.success('Appointment approved');
        fetchAppointments(); // Re-fetch to synchronize state
      }
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      const result = await dispatch(rejectAppointment({ id, reason }));
      if (rejectAppointment.fulfilled.match(result)) {
        toast.success('Appointment rejected');
        fetchAppointments(); // Re-fetch to synchronize state
      }
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData) return;
    try {
      const result = await dispatch(rescheduleAppointment({ 
        id: rescheduleData.id, 
        preferredDate: rescheduleData.date, 
        preferredTime: rescheduleData.time 
      }));
      if (rescheduleAppointment.fulfilled.match(result)) {
        toast.success('Appointment rescheduled');
        setRescheduleData(null);
        fetchAppointments(); // Re-fetch to synchronize state
      }
    } catch (err) {
      toast.error('Reschedule failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sortedAppointments = [...(appointments || [])].sort((a, b) => {
    const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
    const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA; // Latest/newest visit dates at the top
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <AdminLayout title="Appointments Management">
      <div className="space-y-6">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <button
              onClick={fetchAppointments}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 hover:border-red-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RotateCw size={14} className={cn("text-gray-400 transition-all", isLoading && "animate-spin text-red-500")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Spinner className="w-12 h-12 border-red-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {sortedAppointments.map((apt, i) => (
                <motion.div 
                  key={apt._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all group relative overflow-hidden"
                >
                  {apt.isEmergency && (
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
                  )}
                  
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Client Info */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 font-black">
                          {apt.contactName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {apt.contactName}
                            {apt.isEmergency && <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">EMERGENCY</span>}
                          </h4>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{apt.appointmentNumber}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Phone size={14} className="text-red-500" /> {apt.contactPhone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Mail size={14} className="text-red-500" /> {apt.contactEmail}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin size={14} className="text-red-500" /> {apt.serviceAddress}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Service Info */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Type</p>
                        <p className="text-sm font-bold dark:text-white">{apt.serviceType}</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                          <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                            <CalendarDays size={14} className="text-red-500" />
                            {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
                          <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                            <Clock size={14} className="text-red-500" />
                            {apt.preferredTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="lg:w-1/3 flex flex-col justify-between items-end gap-6">
                      <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${getStatusColor(apt.status)}`}>
                        {apt.status === 'approved' ? <CheckCircle size={14} /> : 
                         apt.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                        {apt.status}
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        {apt.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(apt._id)}
                              className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/10 cursor-pointer"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleReject(apt._id)}
                              className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setRescheduleData({ id: apt._id, date: apt.preferredDate ? apt.preferredDate.split('T')[0] : '', time: apt.preferredTime })}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reschedule Inline Form */}
                  {rescheduleData?.id === apt._id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">New Date</label>
                        <input 
                          type="date" 
                          value={rescheduleData!.date}
                          onChange={(e) => setRescheduleData((prev) => prev ? { ...prev, date: e.target.value } : null)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold dark:text-white border border-gray-150 dark:border-gray-700 outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">New Time</label>
                        <input 
                          type="text" 
                          value={rescheduleData!.time}
                          onChange={(e) => setRescheduleData((prev) => prev ? { ...prev, time: e.target.value } : null)}
                          placeholder="e.g. 10:00 AM"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold dark:text-white border border-gray-150 dark:border-gray-700 outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <button 
                          onClick={handleReschedule}
                          className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setRescheduleData(null)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {sortedAppointments.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                <Calendar size={64} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-black dark:text-white">No appointments found</h3>
                <p className="text-sm text-gray-500 mt-2">No bookings match your current filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
