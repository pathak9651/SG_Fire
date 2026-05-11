'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';

const APPOINTMENTS = [
  { 
    id: 'APP-001', 
    customer: 'Amit Sharma', 
    phone: '+91 98765 43210',
    service: 'Fire Safety Audit', 
    date: '12 May 2026', 
    time: '10:30 AM', 
    address: 'Phase 7, Mohali',
    status: 'Confirmed'
  },
  { 
    id: 'APP-002', 
    customer: 'Vikram Singh', 
    phone: '+91 99887 76655',
    service: 'Extinguisher Refilling', 
    date: '12 May 2026', 
    time: '02:00 PM', 
    address: 'Sector 17, Chandigarh',
    status: 'Pending'
  },
  { 
    id: 'APP-003', 
    customer: 'Riya Gupta', 
    phone: '+91 88776 55443',
    service: 'Smoke Detector Install', 
    date: '13 May 2026', 
    time: '11:00 AM', 
    address: 'Panchkula, Haryana',
    status: 'In Progress'
  }
];

export default function AdminAppointments() {
  return (
    <AdminLayout title="Appointments Management">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/20">All Appointments</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Today</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Upcoming</button>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {APPOINTMENTS.map((app) => (
            <div key={app.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{app.customer}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        app.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><User size={14} /> {app.service}</span>
                      <span className="flex items-center gap-1.5"><Phone size={14} /> {app.phone}</span>
                      <span className="flex items-center gap-1.5 font-bold text-red-500"><Clock size={14} /> {app.date} | {app.time}</span>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2 italic"><MapPin size={12} /> {app.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 lg:flex-none px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Confirm
                  </button>
                  <button className="flex-1 lg:flex-none px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> Reschedule
                  </button>
                  <button className="flex-1 lg:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancel">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
