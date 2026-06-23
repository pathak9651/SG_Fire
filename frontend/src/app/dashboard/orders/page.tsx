'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getMyOrders } from '@/redux/slices/orderSlice';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';

export default function MyOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { myOrders, isLoading } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    dispatch(getMyOrders({ page: 1 }));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 'confirmed';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout 
      title="My Orders"
      subtitle="Track and manage your fire safety equipment orders."
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner className="w-12 h-12 border-red-600" />
            <p className="text-sm font-bold text-gray-400">Loading your orders...</p>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
              You haven't placed any orders with SG Fire yet. Start protecting your home today!
            </p>
            <Link href="/products" className="btn-primary px-8 py-4 inline-flex">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-red-500/5 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all flex-shrink-0">
                      <Package className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h4 className="font-black dark:text-white mb-1 text-sm sm:text-base">Order #{order.orderNumber}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • <span className="md:hidden text-red-600 dark:text-red-500 font-extrabold">₹{order.totalAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-lg font-black dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                    </div>

                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus === 'delivered' ? <CheckCircle size={14} /> : 
                       order.orderStatus === 'shipped' ? <Truck size={14} /> : <Clock size={14} />}
                      {getStatusLabel(order.orderStatus)}
                    </div>

                    <Link 
                      href={`/dashboard/orders/${order._id}`}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
