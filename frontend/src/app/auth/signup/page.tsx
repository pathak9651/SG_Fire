'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { registerUser } from '@/redux/slices/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(15, 'Phone number is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');

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
    
    try {
      const resultAction = await dispatch(registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password
      }));

      if (registerUser.fulfilled.match(resultAction)) {
        setSuccessMessage(resultAction.payload.message);
        setRegisteredUserId(resultAction.payload.userId);
        
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          router.push(`/auth/verify?userId=${resultAction.payload.userId}`);
        }, 2000);
      } else {
        if (resultAction.payload) {
          setServerError(resultAction.payload as string);
        } else {
          setServerError('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setServerError('An unexpected error occurred.');
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
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join SG Fire to shop and book safety services
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center">
            <ShieldAlert className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-sm text-green-700">{successMessage}</p>
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
              disabled={!!successMessage || isLoading}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              disabled={!!successMessage || isLoading}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              icon={<Phone className="h-5 w-5" />}
              error={errors.phone?.message}
              disabled={!!successMessage || isLoading}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              disabled={!!successMessage || isLoading}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              disabled={!!successMessage || isLoading}
              {...register('confirmPassword')}
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading} 
            disabled={!!successMessage}
            size="lg"
          >
            {successMessage ? 'Redirecting...' : 'Sign up'}
          </Button>
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
