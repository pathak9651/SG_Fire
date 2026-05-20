'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setCredentials } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const requestOTP = async (values: EmailFormValues) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const normalizedEmail = values.email.trim().toLowerCase();
      const { data } = await api.post('/auth/forgot-password', { email: normalizedEmail });
      setEmail(normalizedEmail);
      setStep('reset');
      setSuccessMessage(data.message || 'If that email exists, a reset OTP has been sent.');
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Unable to send reset OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (values: ResetFormValues) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const { data } = await api.post('/auth/reset-password-otp', {
        email,
        otp: values.otp,
        password: values.password,
      });

      if (data.user && data.accessToken) {
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      }

      setSuccessMessage('Password updated successfully. Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Unable to reset password. Please check the OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = () => {
    if (!email) return;
    requestOTP({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
            {step === 'email' ? <Mail className="h-8 w-8 text-red-600" /> : <KeyRound className="h-8 w-8 text-red-600" />}
          </div>
        </div>

        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' ? 'Reset your password' : 'Enter reset OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email'
              ? "Enter your account email and we'll send a 6-digit OTP."
              : `We sent a 6-digit OTP to ${email}. Enter it with your new password.`}
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center">
            <ShieldAlert className="h-5 w-5 text-red-500 mr-3 shrink-0" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(requestOTP)}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={emailForm.formState.errors.email?.message}
              disabled={isLoading}
              {...emailForm.register('email')}
            />

            <Button type="submit" fullWidth isLoading={isLoading} size="lg">
              Send reset OTP
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={resetForm.handleSubmit(resetPassword)}>
            <div className="space-y-4">
              <Input
                label="Reset OTP"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                icon={<KeyRound className="h-5 w-5" />}
                error={resetForm.formState.errors.otp?.message}
                disabled={isLoading || successMessage.startsWith('Password updated')}
                {...resetForm.register('otp', {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  },
                })}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                error={resetForm.formState.errors.password?.message}
                disabled={isLoading || successMessage.startsWith('Password updated')}
                {...resetForm.register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                error={resetForm.formState.errors.confirmPassword?.message}
                disabled={isLoading || successMessage.startsWith('Password updated')}
                {...resetForm.register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={successMessage.startsWith('Password updated')}
              size="lg"
            >
              Reset password
            </Button>

            <button
              type="button"
              onClick={resendOTP}
              disabled={isLoading || successMessage.startsWith('Password updated')}
              className="w-full text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
