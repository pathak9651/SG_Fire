'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getOrderDetails } from '@/redux/slices/orderSlice';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  CreditCard, 
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function OrderTracking() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, isLoading } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    if (params.id) {
      dispatch(getOrderDetails(params.id));
    }
  }, [dispatch, params.id]);

  if (isLoading) {
    return (
      <DashboardLayout title="Track Order">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Spinner className="w-12 h-12 border-red-600" />
          <p className="text-sm font-bold text-gray-400 animate-pulse">Retrieving tracking details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentOrder) {
    return (
      <DashboardLayout title="Order Not Found">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
            <XCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Order Not Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            The order you are trying to track does not exist or you do not have permission to view it.
          </p>
          <button onClick={() => router.push('/dashboard/orders')} className="btn-primary px-8 py-4 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to My Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Determine standard tracking steps
  const steps = [
    { status: 'pending', label: 'Order Placed', desc: 'Awaiting confirmation', icon: Package },
    { status: 'processing', label: 'Preparing', desc: 'Packing & processing', icon: Clock },
    { status: 'shipped', label: 'Shipped', desc: 'In transit to destination', icon: Truck },
    { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'With the local courier', icon: Truck },
    { status: 'delivered', label: 'Delivered', desc: 'Received successfully', icon: CheckCircle },
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex(s => s.status === status);
  };

  const currentStepIndex = getStepIndex(currentOrder.orderStatus);
  const isCancelled = currentOrder.orderStatus === 'cancelled';
  const isRefunded = ['refund_requested', 'refunded'].includes(currentOrder.orderStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout 
      title="Track Order"
      subtitle={`View timeline and tracking details for order #${currentOrder.orderNumber}`}
    >
      <div className="space-y-8">
        {/* Header Action */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(currentOrder.orderStatus)}`}>
              {currentOrder.orderStatus}
            </div>
            {currentOrder.invoiceUrl && (
              <a 
                href={currentOrder.invoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-full text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
              >
                <FileText size={14} /> Download Invoice
              </a>
            )}
          </div>
        </div>

        {/* Order Details Briefing */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <h5 className="font-black dark:text-white">#{currentOrder.orderNumber}</h5>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Placed</p>
              <h5 className="font-black dark:text-white">
                {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Delivery</p>
              <h5 className="font-black dark:text-white">
                {currentOrder.estimatedDelivery ? new Date(currentOrder.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending'}
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
              <h5 className="font-black uppercase dark:text-white">{currentOrder.paymentInfo?.method}</h5>
            </div>
          </div>
        </div>

        {/* Dynamic Visual Timeline */}
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-12">
          <h4 className="text-sm font-black uppercase tracking-[0.25em] text-gray-400">Delivery Status Timeline</h4>

          {isCancelled ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <XCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-700 dark:text-red-400">Order Cancelled</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This order was cancelled. No further courier transits will occur.
                </p>
              </div>
            </div>
          ) : isRefunded ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-8 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <Clock size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-700 dark:text-amber-400">Refund Processing</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Refund session initiated. The status of this transaction is listed as **{currentOrder.orderStatus.replace('_', ' ')}**.
                </p>
              </div>
            </div>
          ) : (
            /* Horizontal Timeline (Large screens) / Vertical List (Mobile) */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
              {/* Process line for horizontal view */}
              <div className="absolute left-0 top-[28px] h-1 w-full bg-gray-100 dark:bg-gray-800 hidden lg:block -z-10">
                <div 
                  className="h-full bg-red-600 transition-all duration-500" 
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex lg:flex-col items-center lg:text-center gap-4 lg:gap-6 group">
                    {/* Step Bubble */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shrink-0",
                      isCompleted ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400",
                      isActive && "ring-4 ring-red-100 dark:ring-red-950/40 animate-pulse"
                    )}>
                      <StepIcon size={24} />
                    </div>

                    {/* Step details */}
                    <div>
                      <h5 className={cn(
                        "text-sm font-black transition-colors",
                        isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400"
                      )}>
                        {step.label}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1 max-w-[150px] lg:mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Logistics Box (Only if tracking detail is present) */}
          {(currentOrder.trackingNumber || currentOrder.trackingUrl) && (
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logistics & Tracking</p>
                <h4 className="text-lg font-black dark:text-white">Transit via Delhivery Express</h4>
                <p className="text-sm text-gray-500">
                  Tracking Number: <span className="font-mono font-bold text-gray-900 dark:text-white">{currentOrder.trackingNumber || 'Pending'}</span>
                </p>
              </div>
              {currentOrder.trackingUrl && (
                <a 
                  href={currentOrder.trackingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary px-8 py-4 inline-flex items-center gap-2 text-xs"
                >
                  Track on Courier Site <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Address, Billing, Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address & Payments */}
          <div className="space-y-8 lg:col-span-1">
            {/* Delivery address */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Shipping Details</h4>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" /> {currentOrder.shippingAddress.fullName}
                </p>
                <p className="text-gray-600 dark:text-gray-400 pl-6">{currentOrder.shippingAddress.addressLine1}</p>
                {currentOrder.shippingAddress.addressLine2 && <p className="text-gray-600 dark:text-gray-400 pl-6">{currentOrder.shippingAddress.addressLine2}</p>}
                <p className="text-gray-600 dark:text-gray-400 pl-6">
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.pincode}
                </p>
                <p className="text-red-600 font-bold pl-6 mt-2">
                  Phone: {currentOrder.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Payment Breakdown</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Payment Method</span>
                  <span className="font-black uppercase flex items-center gap-1.5 dark:text-white">
                    <CreditCard size={14} className="text-red-600" /> {currentOrder.paymentInfo.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Payment Status</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    currentOrder.paymentInfo.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {currentOrder.paymentInfo.status}
                  </span>
                </div>
                {currentOrder.paymentInfo?.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Paid Timestamp</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(currentOrder.paymentInfo.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items & Invoice Totals */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Ordered Equipment</h4>

              {/* Items List */}
              <div className="space-y-4">
                {currentOrder.items.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl group hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black dark:text-white line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-red-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-gray-50 dark:border-gray-800 pt-6 space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Cart Subtotal</span>
                  <span className="font-bold">₹{currentOrder.itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Shipping Fee</span>
                  <span className="font-bold">{currentOrder.shippingCharge === 0 ? 'FREE' : `₹${currentOrder.shippingCharge}`}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>GST (18%)</span>
                  <span className="font-bold">₹{currentOrder.taxAmount.toLocaleString()}</span>
                </div>
                {currentOrder.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Coupon Discount {currentOrder.coupon?.code && `(${currentOrder.coupon.code})`}</span>
                    <span className="font-bold">-₹{currentOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-4 text-lg font-black text-gray-900 dark:text-white">
                  <span>Total Paid</span>
                  <span className="text-2xl text-red-600 font-black">₹{currentOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
