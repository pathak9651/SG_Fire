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
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Flame,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wrench,
  X,
  Sparkles,
  Info,
  ChevronRight,
  Edit2,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const serviceOptions = [
  {
    value: 'Fire Safety Audit',
    title: 'Safety Audit',
    description: 'Compliance review, risk report, and safety recommendations.',
    icon: ShieldCheck,
    color: 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  },
  {
    value: 'System Installation',
    title: 'Installation',
    description: 'Fire alarms, extinguishers, hydrants, and suppression setup.',
    icon: Wrench,
    color: 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
  },
  {
    value: 'AMC & Maintenance',
    title: 'AMC & Maintenance',
    description: 'Routine inspections, refilling, and service contracts.',
    icon: Calendar,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  {
    value: 'Corporate Training',
    title: 'Training',
    description: 'Employee drills, extinguisher handling, and response training.',
    icon: Building2,
    color: 'border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
  },
  {
    value: 'Emergency Consultation',
    title: 'Emergency Help',
    description: 'Priority response for urgent fire safety concerns.',
    icon: AlertTriangle,
    color: 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500';

const WIZARD_STEPS = [
  { id: 1, name: 'Service', icon: Wrench },
  { id: 2, name: 'Schedule', icon: Calendar },
  { id: 3, name: 'Location', icon: MapPin },
  { id: 4, name: 'Photos', icon: Camera },
  { id: 5, name: 'Confirm', icon: CheckCircle },
];

function AppointmentFormContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading: bookingLoading } = useSelector((state: RootState) => state.appointment);

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

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

  // Quick schedule generation helper
  const [nextDays, setNextDays] = useState<{ isoDate: string; dayName: string; dayNum: string; monthName: string }[]>([]);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);

  useEffect(() => {
    // Generate next 5 working days (skipping Sunday)
    const days = [];
    let added = 0;
    let offset = 1;
    while (added < 5) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      if (d.getDay() !== 0) { // Skip Sunday
        days.push({
          isoDate: d.toISOString().split('T')[0],
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.toLocaleDateString('en-US', { day: 'numeric' }),
          monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        });
        added++;
      }
      offset++;
    }
    setNextDays(days);
  }, []);

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
    setFormData((prev) => {
      const isEmergencyNow = serviceType === 'Emergency Consultation' ? true : prev.isEmergency;
      return {
        ...prev,
        serviceType,
        isEmergency: isEmergencyNow,
      };
    });
  };

  const handleEmergencyToggle = () => {
    setFormData((prev) => {
      const nextEmergency = !prev.isEmergency;
      // If toggled on, and service is not emergency, automatically select Emergency Consultation for user convenience
      const nextService = nextEmergency ? 'Emergency Consultation' : prev.serviceType === 'Emergency Consultation' ? 'Fire Safety Audit' : prev.serviceType;
      
      // If emergency is selected, set slot ASAP
      const nextTime = nextEmergency ? 'Urgent / ASAP' : prev.preferredTime === 'Urgent / ASAP' ? '' : prev.preferredTime;
      
      return {
        ...prev,
        isEmergency: nextEmergency,
        serviceType: nextService,
        preferredTime: nextTime,
      };
    });
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

  // Simple validation checks for moving between steps
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.serviceType;
      case 2:
        return !!formData.preferredDate && !!formData.preferredTime;
      case 3:
        return (
          !!formData.serviceAddress.trim() &&
          !!formData.contactName.trim() &&
          !!formData.contactPhone.trim()
        );
      case 4:
        return true; // Notes & Photos optional
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
    } else {
      // Highlight what is missing with descriptive feedback
      if (currentStep === 2) {
        toast.error('Please select both a Preferred Date and Time slot');
      } else if (currentStep === 3) {
        toast.error('Please fill in Address, Contact Name, and Phone Number');
      }
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleJumpToStep = (stepId: number) => {
    if (stepId < currentStep || isStepValid(stepId - 1)) {
      setDirection(stepId > currentStep ? 1 : -1);
      setCurrentStep(stepId);
    } else {
      toast.error('Please complete the current step first');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid(3)) {
      setCurrentStep(3);
      toast.error('Please provide a valid Address, Contact Name, and Phone Number');
      return;
    }
    if (!isStepValid(2)) {
      setCurrentStep(2);
      toast.error('Please schedule a Preferred Date and Time');
      return;
    }

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



  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
          <h2 className="mb-3 font-outfit text-3xl font-black text-gray-950 dark:text-white">Booking Confirmed!</h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Your appointment has been successfully requested. Our technical team is reviewing your details and will assign a certified professional shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard/appointments')} className="btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <FileText size={18} />
              View My Appointments
            </button>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-500 transition-colors hover:text-red-600 py-2">
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Predefined timeslots
  const timeSlots = [
    { value: '09:00 AM - 12:00 PM', label: 'Morning visit', details: 'Best for cool outdoor audits (9 AM - 12 PM)' },
    { value: '12:00 PM - 03:00 PM', label: 'Afternoon visit', details: 'Lunchtime & midday service (12 PM - 3 PM)' },
    { value: '03:00 PM - 06:00 PM', label: 'Evening visit', details: 'Late-day routine maintenance (3 PM - 6 PM)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Visual Header */}
      <section className="relative overflow-hidden bg-gray-950 py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-2.png"
            alt="Fire safety technician"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-red-400 backdrop-blur-sm"
          >
            <Flame size={14} className="text-red-500 animate-pulse" />
            Reliable Fire Protection
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-outfit text-3xl font-black leading-tight text-white sm:text-5xl"
          >
            Schedule a Fire Safety Visit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-gray-300"
          >
            Our simple 5-step wizard helps you request inspections, installations, or urgent emergency services in under 2 minutes.
          </motion.p>
        </div>
      </section>

      {/* Main Wizard Form Container */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Step Indicator Progress Bar */}
        <section className="mb-10 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-gray-900/50 backdrop-blur-md">
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 h-[3px] -translate-y-1/2 bg-gray-100 dark:bg-gray-800 z-0 rounded-full" />
            {/* Animated Active Line */}
            <div
              className="absolute left-6 top-1/2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-red-500 to-rose-600 z-0 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 96}%` }}
            />

            {WIZARD_STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => handleJumpToStep(step.id)}
                  type="button"
                  className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-black transition-all duration-300 shadow-md',
                      isCompleted
                        ? 'border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500'
                        : isActive
                        ? 'border-red-500 bg-white text-red-600 scale-110 ring-8 ring-red-500/10 dark:bg-gray-950 dark:text-red-400'
                        : 'border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500'
                    )}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={cn(
                      'mt-2 hidden text-xs font-black uppercase tracking-wider sm:block transition-colors',
                      isActive ? 'text-red-600 dark:text-red-400 font-extrabold' : isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'
                    )}
                  >
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Wizard Form Frame */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28 }}
              className="rounded-3xl border border-gray-200 bg-white card-responsive-p shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* STEP 1: SERVICE TYPE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-850">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-500">Step 1 of 5</p>
                      <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Choose Service Type</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Select the safety service your property requires.</p>
                    </div>
                    {/* Emergency Switch */}
                    <button
                      type="button"
                      onClick={handleEmergencyToggle}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-sm font-black transition-all shadow-sm focus:outline-none',
                        formData.isEmergency
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400 animate-pulse'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-850'
                      )}
                    >
                      <AlertTriangle size={18} className={formData.isEmergency ? 'text-red-500' : 'text-gray-400'} />
                      <span>🚨 Emergency Request</span>
                    </button>
                  </div>

                  {formData.isEmergency && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-2xl border border-red-200 bg-red-55/10 p-4 dark:border-red-900/40 dark:bg-red-950/15"
                    >
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <h4 className="text-sm font-black text-red-950 dark:text-red-300">Urgent Dispatch Mode Triggered</h4>
                          <p className="mt-1 text-xs leading-relaxed text-red-800 dark:text-red-400">
                            We automatically selected "Emergency Consultation" and priority dispatch slot. We prioritize emergency calls and typically dispatch technicians within 2 hours.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {serviceOptions.map(({ value, title, description, icon: Icon, color }) => {
                      const isSelected = formData.serviceType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleServiceSelect(value)}
                          className={cn(
                            'relative rounded-2xl border-2 p-5 text-left transition-all duration-300 group focus:outline-none flex flex-col justify-between h-48',
                            isSelected
                              ? 'border-red-500 bg-red-50/20 shadow-md ring-4 ring-red-500/5 dark:bg-red-950/25'
                              : 'border-gray-100 bg-white hover:border-red-200 hover:shadow-md hover:scale-[1.01] dark:border-gray-800 dark:bg-gray-950 dark:hover:border-red-900/60'
                          )}
                        >
                          <div>
                            <div className="mb-4 flex items-center justify-between">
                              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105', isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400')}>
                                <Icon size={22} />
                              </span>
                              {isSelected && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold dark:bg-red-500">
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span className="block text-sm font-black text-gray-950 dark:text-white">{title}</span>
                            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">{description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: PREFERRED VISIT TIME */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-5 dark:border-gray-850">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">Step 2 of 5</p>
                    <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Select Preferred Schedule</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Pick a convenient date and time range for our visit.</p>
                  </div>

                  {/* 1. Date Selection Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel>1. Pick a Date</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setIsCustomDate(!isCustomDate)}
                        className="text-xs font-black text-red-500 hover:text-red-600 transition"
                      >
                        {isCustomDate ? 'Show Quick Dates' : 'Select Custom Date'}
                      </button>
                    </div>

                    {!isCustomDate ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {nextDays.map((day) => {
                          const isSelected = formData.preferredDate === day.isoDate;
                          return (
                            <button
                              key={day.isoDate}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, preferredDate: day.isoDate }))}
                              className={cn(
                                'flex flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all duration-300 focus:outline-none',
                                isSelected
                                  ? 'border-red-500 bg-red-50/20 text-red-600 ring-4 ring-red-500/5 dark:bg-red-950/20 dark:text-red-400'
                                  : 'border-gray-150 bg-white hover:border-red-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-red-900/50 text-gray-700 dark:text-gray-300'
                              )}
                            >
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">{day.dayName}</span>
                              <span className="mt-1 text-2xl font-black font-outfit">{day.dayNum}</span>
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{day.monthName}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
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
                      </motion.div>
                    )}
                  </div>

                  {/* 2. Time Selection Options */}
                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-850">
                    <div className="flex items-center justify-between">
                      <FieldLabel>2. Pick a Time Window</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setIsCustomTime(!isCustomTime)}
                        className="text-xs font-black text-red-500 hover:text-red-600 transition"
                      >
                        {isCustomTime ? 'Show Predefined Slots' : 'Type Custom Time'}
                      </button>
                    </div>

                    {!isCustomTime ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {formData.isEmergency && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, preferredTime: 'Urgent / ASAP' }))}
                            className={cn(
                              'col-span-1 sm:col-span-3 flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-300 focus:outline-none border-red-500 bg-red-500/10 text-red-600 animate-pulse dark:border-red-800 dark:bg-red-950/20 dark:text-red-400'
                            )}
                          >
                            <AlertTriangle size={18} className="text-red-500" />
                            <div>
                              <span className="block text-sm font-black">Urgent / ASAP Dispatch</span>
                              <span className="text-xs text-red-700/80 dark:text-red-400/80">Immediate attention. Certified personnel routed immediately.</span>
                            </div>
                          </button>
                        )}
                        {timeSlots.map((slot) => {
                          const isSelected = formData.preferredTime === slot.value;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, preferredTime: slot.value }))}
                              className={cn(
                                'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-300 focus:outline-none',
                                isSelected
                                  ? 'border-red-500 bg-red-50/20 text-red-600 ring-4 ring-red-500/5 dark:bg-red-950/20 dark:text-red-400'
                                  : 'border-gray-150 bg-white hover:border-red-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-red-900/50 text-gray-700 dark:text-gray-300'
                              )}
                            >
                              <Clock size={18} className={isSelected ? 'text-red-500' : 'text-gray-400'} />
                              <div>
                                <span className="block text-sm font-black">{slot.label}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{slot.details}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type="text"
                          name="preferredTime"
                          placeholder="e.g. 10:00 AM - 12:00 PM or Late Evening"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className={cn(inputClass, 'pl-12')}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: SITE & CONTACT DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-5 dark:border-gray-850">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">Step 3 of 5</p>
                    <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Contact & Site Details</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Tell us who to contact and where to send the technician.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FieldLabel>Service Address (Exact Site Location)</FieldLabel>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <textarea
                          required
                          name="serviceAddress"
                          rows={3}
                          value={formData.serviceAddress}
                          onChange={handleInputChange}
                          placeholder="Unit, Floor, Building Name, Street Landmark, Pincode"
                          className={cn(inputClass, 'min-h-24 resize-none pl-12 pt-3')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <FieldLabel>On-site Contact Name</FieldLabel>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            required
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="Name of contact"
                            className={cn(inputClass, 'pl-12')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Mobile Phone Number</FieldLabel>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            required
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            placeholder="Phone number"
                            className={cn(inputClass, 'pl-12')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Email Address (Optional)</FieldLabel>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder="Email address"
                            className={cn(inputClass, 'pl-12')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PHOTOS & EXTRA CONTEXT */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-5 dark:border-gray-850">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">Step 4 of 5</p>
                    <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Add Site Context (Optional)</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Help us understand the layout or upload photos of fire panels, alarms, or extinguishers.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* File Dropzone */}
                    <div className="space-y-3">
                      <FieldLabel>Upload Site / Equipment Photos</FieldLabel>
                      <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-red-400 hover:bg-red-50/20 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-red-900/60 dark:hover:bg-red-950/10">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                        <Camera className="mb-3 h-10 w-10 text-gray-400" />
                        <span className="text-sm font-black text-gray-800 dark:text-gray-100">Upload Site Photos</span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Multiple images allowed. Max 5MB per file.</span>
                      </label>

                      {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {previews.map((src, idx) => (
                            <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 group shadow-sm">
                              <img src={src} alt="Site preview" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePreview(idx)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-950/75 text-white transition hover:bg-red-600 focus:outline-none"
                                aria-label="Remove image"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Special Instructions */}
                    <div className="space-y-3">
                      <FieldLabel>Additional Visit Notes / Special Instructions</FieldLabel>
                      <textarea
                        name="notes"
                        rows={7}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Mention any building access codes, specific alarm models, site hazards, or safety passes needed for technician entry..."
                        className={cn(inputClass, 'min-h-48 resize-none')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & CONFIRM */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-5 dark:border-gray-850">
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">Step 5 of 5</p>
                    <h2 className="mt-1 font-outfit text-2xl font-black text-gray-950 dark:text-white">Review Booking Request</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Please review your site information and booking schedule below before confirming.</p>
                  </div>

                  {/* Summary Sheet Container */}
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-150 bg-gray-50 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950/50">
                    {/* Item 1: Service */}
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Service Selection</span>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                            {formData.serviceType}
                            {formData.isEmergency && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                Emergency
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleJumpToStep(1)} className="text-gray-400 hover:text-red-500 transition">
                        <Edit2 size={16} />
                      </button>
                    </div>

                    {/* Item 2: Schedule */}
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visit Schedule</span>
                          <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                            {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No date set'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={12} />
                            {formData.preferredTime || 'No time window set'}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleJumpToStep(2)} className="text-gray-400 hover:text-red-500 transition">
                        <Edit2 size={16} />
                      </button>
                    </div>

                    {/* Item 3: Contact & Address */}
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                          <MapPin size={20} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Location & Primary Contact</span>
                          <p className="text-sm font-black text-gray-900 dark:text-white leading-normal max-w-md">
                            {formData.serviceAddress}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {formData.contactName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {formData.contactPhone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleJumpToStep(3)} className="text-gray-400 hover:text-red-500 transition">
                        <Edit2 size={16} />
                      </button>
                    </div>

                    {/* Item 4: Photos & Context */}
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                          <Camera size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Photos & Additional Info</span>
                          <p className="text-sm font-black text-gray-950 dark:text-white mt-0.5">
                            {files.length > 0 ? `${files.length} Photo${files.length > 1 ? 's' : ''} uploaded` : 'No photos attached'}
                          </p>
                          {formData.notes ? (
                            <p className="text-xs text-gray-500 mt-1 italic line-clamp-1 max-w-md">"{formData.notes}"</p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">No instructions or access notes provided.</p>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleJumpToStep(4)} className="text-gray-400 hover:text-red-500 transition">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4">
                    <Info className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400/90 font-semibold">
                      This represents an official safety service booking request. Once confirmed, a designated engineer will contact you directly. Preferred timing is subject to final scheduling confirmation.
                    </p>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls Footer */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex h-12 items-center gap-2 rounded-xl border border-gray-250 px-5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-98 dark:border-gray-750 dark:text-gray-300 dark:hover:bg-gray-950"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < WIZARD_STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-black shadow-md focus:outline-none"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    disabled={bookingLoading}
                    type="submit"
                    className="btn-primary flex h-13 items-center gap-2 rounded-xl px-8 text-base font-black shadow-lg dark:shadow-red-950/20"
                  >
                    {bookingLoading ? (
                      <Spinner className="w-5 h-5 border-white" />
                    ) : (
                      <>
                        Confirm Booking
                        <Check size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </main>
    </div>
  );
}

export default function AppointmentBookingPage() {
  return <AppointmentFormContent />;
}
