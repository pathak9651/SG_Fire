'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setCredentials } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const { data } = await api.post(`/auth/reset-password/${params.token}`, {
        password: values.password,
      });

      if (data.user) {
        dispatch(setCredentials({ user: data.user }));
      }

      setSuccessMessage('Password updated successfully. Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
      setServerError(error?.response?.data?.message || 'Unable to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a strong password for your SG Fire account.
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              disabled={isLoading || !!successMessage}
              {...register('password')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              disabled={isLoading || !!successMessage}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" fullWidth isLoading={isLoading} disabled={!!successMessage} size="lg">
            {successMessage ? 'Password updated' : 'Reset password'}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
