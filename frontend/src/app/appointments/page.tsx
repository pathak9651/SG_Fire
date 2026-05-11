'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { bookAppointment } from '@/redux/slices/appointmentSlice';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldCheck,
  AlertTriangle,
  Upload,
  ArrowRight,
  Flame,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

function AppointmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { isLoading: bookingLoading } = useSelector((state: RootState) => state.appointment);

  const [formData, setFormData] = useState({
    serviceType: searchParams.get('service') || 'Fire Safety Audit',
    preferredDate: '',
    preferredTime: '',
    serviceAddress: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    notes: '',
    isEmergency: false
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to book an appointment');
      router.push(`/auth/login?returnUrl=/appointments?service=${formData.serviceType}`);
    }
  }, [isAuthenticated, authLoading, router, formData.serviceType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    files.forEach(file => {
      data.append('siteImages', file);
    });

    try {
      const result = await dispatch(bookAppointment(data));
      if (bookAppointment.fulfilled.match(result)) {
        setIsSuccess(true);
        toast.success('Appointment booked successfully!');
        setTimeout(() => router.push('/dashboard/appointments'), 3000);
      } else {
        toast.error(result.payload as string || 'Booking failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-12 h-12 border-red-600" /></div>;
  if (!isAuthenticated) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 text-center shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
            <CheckCircle size={48} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-black dark:text-white mb-4">Request Sent!</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Your appointment has been successfully booked. Our team will review your request and get back to you shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard/appointments')} className="btn-primary py-4">
              View My Appointments
            </button>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Info & Guidance */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/20 mb-6">
                <Flame size={32} />
              </div>
              <h1 className="text-4xl font-black dark:text-white mb-4">Book Your Service</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Schedule a professional site visit for fire safety audits, equipment maintenance, or installation consultations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Certified Experts</h4>
                  <p className="text-xs text-gray-500">All visits are conducted by certified fire safety engineers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white text-sm">Emergency Support</h4>
                  <p className="text-xs text-gray-500">Fast-track response for critical safety issues.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-6 border border-red-100 dark:border-red-900/30">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">Notice</p>
              <p className="text-sm text-red-800 dark:text-red-400 leading-relaxed">
                Site visits are usually scheduled within 24-48 business hours of your request.
              </p>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 space-y-10">
              
              {/* Section 1: Service Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    <User size={16} />
                  </div>
                  <h3 className="font-outfit font-black text-xl dark:text-white uppercase tracking-wider">Service Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Service Type</label>
                    <select 
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Fire Safety Audit">Fire Safety Audit</option>
                      <option value="System Installation">System Installation</option>
                      <option value="AMC & Maintenance">AMC & Maintenance</option>
                      <option value="Corporate Training">Corporate Training</option>
                      <option value="Emergency Consultation">Emergency Consultation</option>
                    </select>
                  </div>
                  <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          name="isEmergency"
                          checked={formData.isEmergency}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-red-600 transition-all duration-300"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-all duration-300"></div>
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-red-600 transition-colors">Mark as Emergency</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Date & Time */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <h3 className="font-outfit font-black text-xl dark:text-white uppercase tracking-wider">Schedule</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Preferred Date</label>
                    <input 
                      required
                      type="date" 
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Preferred Time</label>
                    <input 
                      required
                      type="text" 
                      name="preferredTime"
                      placeholder="e.g. 10:00 AM - 12:00 PM"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Location & Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <h3 className="font-outfit font-black text-xl dark:text-white uppercase tracking-wider">Location & Contact</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Service Address</label>
                    <textarea 
                      required
                      name="serviceAddress"
                      rows={3}
                      value={formData.serviceAddress}
                      onChange={handleInputChange}
                      placeholder="Building name, Street, Landmark, City, State, ZIP"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Name</label>
                      <input 
                        required
                        type="text" 
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                      <input 
                        required
                        type="tel" 
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Site Photos & Notes */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    <Upload size={16} />
                  </div>
                  <h3 className="font-outfit font-black text-xl dark:text-white uppercase tracking-wider">Site Context (Optional)</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Upload Site Photos</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center group-hover:border-red-500/50 transition-all">
                        <Upload className="text-gray-300 dark:text-gray-700 mb-2 group-hover:text-red-500 transition-colors" size={32} />
                        <p className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Click or drag photos to upload</p>
                      </div>
                    </div>
                    
                    {previews.length > 0 && (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                        {previews.map((src, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Additional Notes</label>
                    <textarea 
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any specific instructions or details about the site..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={bookingLoading}
                  type="submit" 
                  className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 group text-lg"
                >
                  {bookingLoading ? <Spinner className="w-6 h-6 border-white" /> : (
                    <>
                      Confirm Booking
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner className="w-12 h-12 border-red-600" /></div>}>
      <AppointmentFormContent />
    </Suspense>
  );
}
