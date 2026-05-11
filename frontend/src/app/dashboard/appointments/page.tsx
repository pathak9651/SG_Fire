'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MapPin,
  MessageSquare,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getMyAppointments } from '@/redux/slices/appointmentSlice';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';

export default function MyAppointments() {
  const dispatch = useDispatch<AppDispatch>();
  const { myAppointments, isLoading } = useSelector((state: RootState) => state.appointment);

  useEffect(() => {
    dispatch(getMyAppointments());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout 
      title="My Appointments"
      subtitle="Track the status of your fire safety service bookings."
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner className="w-12 h-12 border-red-600" />
            <p className="text-sm font-bold text-gray-400">Loading your bookings...</p>
          </div>
        ) : myAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">No appointments yet</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
              Need a fire safety inspection or equipment maintenance? Book your first service today!
            </p>
            <Link href="/services" className="btn-primary px-8 py-4 inline-flex">
              Book Service Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myAppointments.map((apt, i) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-red-500/5 transition-all group relative overflow-hidden"
              >
                {apt.isEmergency && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl animate-pulse">
                    Emergency
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Wrench size={28} />
                    </div>
                    <div>
                      <h4 className="font-black dark:text-white mb-1">{apt.serviceType}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-red-500" /> {new Date(apt.preferredDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-red-500" /> {apt.preferredTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${getStatusColor(apt.status)}`}>
                      {apt.status === 'approved' ? <CheckCircle size={14} /> : 
                       apt.status === 'rejected' ? <XCircle size={14} /> : 
                       apt.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {apt.status}
                    </div>

                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Appointment ID</p>
                      <p className="text-xs font-black dark:text-white">#{apt.appointmentNumber}</p>
                    </div>
                  </div>
                </div>

                {apt.status === 'rejected' && apt.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex gap-3">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-red-900 dark:text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                      <p className="text-xs font-medium text-red-800 dark:text-red-300">{apt.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {apt.status === 'approved' && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 flex gap-3">
                    <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-green-900 dark:text-green-400 uppercase tracking-widest mb-1">Admin Message</p>
                      <p className="text-xs font-medium text-green-800 dark:text-green-300">Your appointment has been approved. A technician will visit your site at the scheduled time.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
