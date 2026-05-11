'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { motion } from 'framer-motion';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 text-center shadow-xl border border-gray-100 dark:border-gray-800"
      >
        <div className="mx-auto w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-8 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
          <div className="absolute -inset-2 bg-green-500/10 rounded-full animate-ping opacity-30" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
          Thank you for choosing SG Fire. Your fire safety equipment is being prepared for dispatch.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-bold text-red-600">{orderId || 'SGF-XXXXXXX'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-full tracking-wider">
              Processing
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard/orders">
            <Button fullWidth size="lg" className="h-14 rounded-2xl">
              Track Order
              <Package className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/">
              <Button variant="outline" fullWidth className="h-12 rounded-2xl border-2">
                <Home className="mr-2 w-4 h-4" />
                Home
              </Button>
            </Link>
            <Button variant="outline" fullWidth className="h-12 rounded-2xl border-2">
              <Download className="mr-2 w-4 h-4" />
              Invoice
            </Button>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-400 font-medium italic">
          A confirmation email has been sent to your registered address.
        </p>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
