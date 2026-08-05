'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, KeyRound, Mail, ArrowRight, RotateCw } from 'lucide-react';
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
  const userEmail = searchParams.get('email');
  const initialDevOtp = searchParams.get('devOtp') || '';

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [debugOtp, setDebugOtp] = useState<string>(initialDevOtp);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Protect route if no userId is present
  useEffect(() => {
    if (!userId) {
      router.push('/auth/login');
    }
  }, [userId, router]);

  // Pre-fill if dev OTP is passed
  useEffect(() => {
    if (initialDevOtp && initialDevOtp.length === 6) {
      setOtpDigits(initialDevOtp.split(''));
    }
  }, [initialDevOtp]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue && value !== '') return;

    const newDigits = [...otpDigits];
    
    // Handle pasting multiple digits
    if (numericValue.length > 1) {
      const pastedDigits = numericValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = numericValue;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Focus previous input on backspace if current digit is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    const pastedArr = pastedData.split('');
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedArr[i] || '';
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(pastedArr.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullOtp = otpDigits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp: fullOtp });

      if (data.success) {
        setSuccessMessage('Email verified successfully! Redirecting...');
        
        if (data.user) {
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        }

        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setError('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      if (data.success) {
        setSuccessMessage(data.message || 'A new OTP has been sent to your email.');
        setResendTimer(60); // Reset 60s timer on resend
        
        if (data.debugOtp) {
          setDebugOtp(data.debugOtp);
          setOtpDigits(data.debugOtp.split(''));
        }
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
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We have sent a 6-digit One-Time Password (OTP) to your registered email address.
          </p>
          {userEmail && (
            <div className="mt-3 inline-flex items-center gap-2 bg-red-50 text-red-700 font-medium px-3 py-1.5 rounded-full text-xs">
              <Mail className="h-3.5 w-3.5" />
              <span>{userEmail}</span>
            </div>
          )}
        </div>

        {/* ── Error Notification ── */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left rounded-r-lg flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Success Notification ── */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 text-left rounded-r-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* ── Development / Fallback OTP Display ── */}
        {debugOtp && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-left rounded-r-lg space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Development OTP Code
            </p>
            <p className="text-sm text-amber-800">
              Use code: <span className="font-mono font-extrabold text-lg text-amber-950">{debugOtp}</span>
            </p>
          </div>
        )}

        {/* ── 6-Digit OTP Box Grid ── */}
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="flex justify-between items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isLoading || !!successMessage}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                  digit
                    ? 'border-red-600 bg-red-50/50 text-gray-900 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                }`}
              />
            ))}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={!!successMessage || fullOtp.length !== 6}
          >
            {successMessage ? 'Verified!' : 'Verify Account'}
          </Button>
        </form>

        {/* ── Resend Code Option ── */}
        <div className="mt-6 text-sm flex items-center justify-center gap-1.5 text-gray-600">
          <span>Didn't receive the email code?</span>
          {resendTimer > 0 ? (
            <span className="font-semibold text-gray-400">
              Resend in {resendTimer}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !!successMessage}
              className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors focus:outline-none"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Sending...' : 'Resend OTP'}</span>
            </button>
          )}
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
