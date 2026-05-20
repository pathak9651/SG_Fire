'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setCredentials } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import api from '@/services/api';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const userId = searchParams.get('userId');

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Protect route if no userId is present
  useEffect(() => {
    if (!userId) {
      router.push('/auth/login');
    }
  }, [userId, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      
      if (data.success) {
        setSuccessMessage('Email verified successfully!');
        
        if (data.user) {
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        }

        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      if (data.success) {
        setSuccessMessage('A new OTP has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit one-time password to your email address. Please enter it below to verify your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left rounded-r-lg flex items-center">
            <ShieldAlert className="h-5 w-5 text-red-500 mr-3 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 text-left rounded-r-lg flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="••••••"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} disabled={!!successMessage}>
            {successMessage ? 'Verified!' : 'Verify Account'}
          </Button>
        </form>

        <div className="mt-6 text-sm">
          <span className="text-gray-500">Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !!successMessage}
            className="font-medium text-red-600 hover:text-red-500 focus:outline-none disabled:opacity-50 transition-colors"
          >
            {isResending ? 'Sending...' : 'Click to resend'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
