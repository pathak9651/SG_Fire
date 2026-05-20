'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { bookAppointment } from '@/redux/slices/appointmentSlice';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Flame,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const serviceOptions = [
  {
    value: 'Fire Safety Audit',
    title: 'Safety Audit',
    description: 'Compliance review, risk report, and safety recommendations.',
    icon: ShieldCheck,
  },
  {
    value: 'System Installation',
    title: 'Installation',
    description: 'Fire alarms, extinguishers, hydrants, and suppression setup.',
    icon: Wrench,
  },
  {
    value: 'AMC & Maintenance',
    title: 'AMC & Maintenance',
    description: 'Routine inspections, refilling, and service contracts.',
    icon: Calendar,
  },
  {
    value: 'Corporate Training',
    title: 'Training',
    description: 'Employee drills, extinguisher handling, and response training.',
    icon: Building2,
  },
  {
    value: 'Emergency Consultation',
    title: 'Emergency Help',
    description: 'Priority response for urgent fire safety concerns.',
    icon: AlertTriangle,
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-gray-600 dark:text-gray-300">
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500';

function AppointmentFormContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { isLoading: bookingLoading } = useSelector((state: RootState) => state.appointment);

  const [formData, setFormData] = useState({
    serviceType: 'Fire Safety Audit',
    preferredDate: '',
    preferredTime: '',
    serviceAddress: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    notes: '',
    isEmergency: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const serviceParam = new URLSearchParams(window.location.search).get('service');
    if (!serviceParam) return;

    const serviceMap: Record<string, string> = {
      audit: 'Fire Safety Audit',
      installation: 'System Installation',
      maintenance: 'AMC & Maintenance',
      amc: 'AMC & Maintenance',
      training: 'Corporate Training',
      emergency: 'Emergency Consultation',
      consultation: 'Emergency Consultation',
    };

    const serviceType = serviceMap[serviceParam] || serviceParam;
    setFormData((prev) => ({
      ...prev,
      serviceType,
      isEmergency: serviceType === 'Emergency Consultation' || serviceParam === 'emergency',
    }));
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to book an appointment');
      router.push(`/auth/login?returnUrl=/appointments?service=${formData.serviceType}`);
    }
  }, [isAuthenticated, authLoading, router, formData.serviceType]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      contactName: prev.contactName || user?.name || '',
      contactPhone: prev.contactPhone || user?.phone || '',
      contactEmail: prev.contactEmail || user?.email || '',
    }));
  }, [user]);

  useEffect(() => {
    return () => previews.forEach((src) => URL.revokeObjectURL(src));
  }, [previews]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleServiceSelect = (serviceType: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceType,
      isEmergency: serviceType === 'Emergency Consultation' ? true : prev.isEmergency,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...selectedFiles.map((file) => URL.createObjectURL(file))]);
    e.target.value = '';
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });

    files.forEach((file) => {
      data.append('siteImages', file);
    });

    try {
      const result = await dispatch(bookAppointment(data));
      if (bookAppointment.fulfilled.match(result)) {
        setIsSuccess(true);
        toast.success('Appointment booked successfully!');
        setTimeout(() => router.push('/dashboard/appointments'), 3000);
      } else {
        toast.error((result.payload as string) || 'Booking failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Spinner className="w-12 h-12 border-red-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
            <CheckCircle size={42} />
          </div>
          <h2 className="mb-3 font-outfit text-3xl font-black text-gray-950 dark:text-white">Request Sent</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Your appointment request is booked. Our team will review it and confirm the schedule shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard/appointments')} className="btn-primary py-3">
              View My Appointments
            </button>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-500 transition-colors hover:text-red-600">
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="relative overflow-hidden bg-gray-950">
        <Image
          src="/images/hero-2.png"
          alt="Fire safety technician"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/55" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <Flame size={16} className="text-orange-300" />
              Certified fire safety services
            </div>
            <h1 className="font-outfit text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Book Your Fire Safety Service
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
              Schedule audits, installations, AMC visits, or training with a clear request form built for quick review by our service team.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8 lg:py-12">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">What happens next</p>
            <div className="mt-5 space-y-5">
              {[
                ['Request review', 'We verify your site details and service need.'],
                ['Schedule confirmation', 'Our team confirms a technician slot.'],
                ['On-site visit', 'Certified professionals inspect or complete the work.'],
              ].map(([title, copy], index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-black text-red-600 dark:bg-red-950/40 dark:text-red-300">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-950 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-amber-950 dark:text-amber-100">Emergency requests</h3>
                <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                  Mark urgent safety issues as emergency so the team can prioritize your request.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Service</p>
                <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Choose service type</h2>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  name="isEmergency"
                  checked={formData.isEmergency}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Emergency
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {serviceOptions.map(({ value, title, description, icon: Icon }) => {
                const selected = formData.serviceType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleServiceSelect(value)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all',
                      selected
                        ? 'border-red-500 bg-red-50 shadow-sm ring-4 ring-red-500/10 dark:bg-red-950/30'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-red-800 dark:hover:bg-red-950/20'
                    )}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', selected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300')}>
                        <Icon size={20} />
                      </span>
                      <span className="text-sm font-black text-gray-950 dark:text-white">{title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Schedule</p>
              <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Preferred visit time</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Preferred date</FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(inputClass, 'pl-12')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>Preferred time</FieldLabel>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    name="preferredTime"
                    placeholder="10:00 AM - 12:00 PM"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className={cn(inputClass, 'pl-12')}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Site and contact</p>
              <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Where should we visit?</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel>Full service address</FieldLabel>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    required
                    name="serviceAddress"
                    rows={4}
                    value={formData.serviceAddress}
                    onChange={handleInputChange}
                    placeholder="Building, street, landmark, city, state, pincode"
                    className={cn(inputClass, 'min-h-28 resize-none pl-12')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <FieldLabel>Contact name</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input required type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className={cn(inputClass, 'pl-12')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Phone number</FieldLabel>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input required type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className={cn(inputClass, 'pl-12')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Email</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={cn(inputClass, 'pl-12')} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Context</p>
              <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Add notes or site photos</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Upload site photos</FieldLabel>
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-red-400 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-red-700 dark:hover:bg-red-950/20">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                  <Camera className="mb-3 h-8 w-8 text-gray-400" />
                  <span className="text-sm font-black text-gray-800 dark:text-gray-100">Upload photos</span>
                  <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Images help us assess the site faster.</span>
                </label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {previews.map((src, index) => (
                      <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <img src={src} alt="Site preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(index)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-950/75 text-white"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel>Additional notes</FieldLabel>
                <textarea
                  name="notes"
                  rows={8}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Mention access instructions, site size, equipment issues, or urgent concerns."
                  className={cn(inputClass, 'min-h-40 resize-none')}
                />
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6">
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:mb-0">
              By submitting, you are requesting a service appointment. Final timing is confirmed by the SG Fire team.
            </p>
            <button
              disabled={bookingLoading}
              type="submit"
              className="btn-primary h-14 w-full rounded-xl px-8 text-base font-black sm:w-auto"
            >
              {bookingLoading ? (
                <Spinner className="w-5 h-5 border-white" />
              ) : (
                <>
                  Confirm Booking
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function AppointmentBookingPage() {
  return <AppointmentFormContent />;
}
