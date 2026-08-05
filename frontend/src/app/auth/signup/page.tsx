'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ShieldAlert, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { registerUser } from '@/redux/slices/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Phone validation: must be a 10-digit Indian mobile number (starts with 6–9).
// Accepts optional +91 or 91 prefix — we strip it before validation.
const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .transform((val) => val.replace(/^\+?91[-\s]?/, '').replace(/\s/g, ''))
    .refine((val) => INDIAN_PHONE_RE.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: reduxLoading } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = mounted ? reduxLoading : false;

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(''); // For "already exists but unverified"
  const [registeredUserId, setRegisteredUserId] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError('');
    setSuccessMessage('');
    setInfoMessage('');
    setDebugOtp('');

    // Strip +91 prefix before sending to backend (backend expects bare 10-digit)
    const phone = data.phone.replace(/^\+?91[-\s]?/, '').replace(/\s/g, '');

    try {
      const resultAction = await dispatch(registerUser({
        name: data.name,
        email: data.email,
        phone,
        password: data.password,
      }));

      if (registerUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        setRegisteredUserId(payload.userId);

        if (payload.debugOtp) {
          setDebugOtp(payload.debugOtp);
        }

        if (payload.alreadyExists) {
          setInfoMessage(payload.message);
        } else {
          setSuccessMessage(payload.message);
        }

        // Automatically redirect to verification page after a short delay
        const emailParam = encodeURIComponent(data.email);
        setTimeout(() => {
          router.push(`/auth/verify?userId=${payload.userId}&email=${emailParam}`);
        }, 1000);
      } else {
        // rejected — payload is the error string from rejectWithValue
        const errorMsg =
          typeof resultAction.payload === 'string'
            ? resultAction.payload
            : 'Registration failed. Please try again.';
        setServerError(errorMsg);
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoToVerify = () => {
    router.push(`/auth/verify?userId=${registeredUserId}`);
  };

  const isRegistered = !!(successMessage || infoMessage) && !!registeredUserId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join SG Fire to shop and book safety services
          </p>
        </div>

        {/* ── Error notification ── */}
        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {/* ── Success notification ── */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            {registeredUserId && (
              <button
                onClick={handleGoToVerify}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue to Verification <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Info notification (account existed but unverified) ── */}
        {infoMessage && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{infoMessage}</p>
            </div>
            {registeredUserId && (
              <button
                onClick={handleGoToVerify}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Verification <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Dev OTP debug box ── */}
        {debugOtp && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-left">
            <p className="text-sm font-semibold text-amber-900">Development OTP</p>
            <p className="text-sm text-amber-800 mt-1">
              Use this code on the verification page:{' '}
              <span className="font-mono font-bold">{debugOtp}</span>
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              disabled={isRegistered || isLoading}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              disabled={isRegistered || isLoading}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              icon={<Phone className="h-5 w-5" />}
              error={errors.phone?.message}
              disabled={isRegistered || isLoading}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              disabled={isRegistered || isLoading}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              disabled={isRegistered || isLoading}
              {...register('confirmPassword')}
            />
          </div>

          {!isRegistered && (
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              size="lg"
            >
              Sign up
            </Button>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/login">
              <Button variant="outline" fullWidth size="lg">
                Sign in instead
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

