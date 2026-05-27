'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCart, clearCart } from '@/redux/slices/cartSlice';
import { createRazorpayOrder, placeOrder } from '@/redux/slices/orderSlice';
import { ShoppingBag, ArrowLeft, ShieldCheck, MapPin, Phone, User, CreditCard, Banknote } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cart, isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated, isLoading: authLoading, isInitialized } = useSelector((state: RootState) => state.auth);
  const { isLoading: orderLoading } = useSelector((state: RootState) => state.order);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  useEffect(() => {
    if (isInitialized && !authLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/login?returnUrl=/checkout');
        return;
      }
      dispatch(fetchCart());
    }
  }, [dispatch, isInitialized, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill in all required address fields');
      return false;
    }
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const validItems = cart?.validItems;
    if (!validItems?.length) {
      toast.error('Your cart is empty');
      return;
    }

    if (paymentMethod === 'cod') {
      try {
        const orderPayload = {
          shippingAddress,
          paymentMethod: 'cod',
          cartItems: validItems,
          orderNotes
        };
        const finalOrder = await dispatch(placeOrder(orderPayload)).unwrap();
        dispatch(clearCart());
        toast.success('Order placed with Cash on Delivery!');
        router.push(`/checkout/success?orderId=${finalOrder.data.orderNumber}`);
      } catch (err) {
        toast.error(err as string || 'Failed to place order');
      }
      return;
    }

    // Online Payment (Razorpay)
    try {
      const finalAmount = (cart?.totalAmount || 0) - (cart?.appliedCoupon?.discount || 0);
      
      const rzpOrderData = await dispatch(createRazorpayOrder(finalAmount)).unwrap();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_p0y8S9K9S9K9S9',
        amount: rzpOrderData.data.amount,
        currency: rzpOrderData.data.currency,
        name: 'SG Fire Safety',
        description: 'Purchase of Fire Safety Equipment',
        order_id: rzpOrderData.data.id,
        handler: async (response: any) => {
          const paymentDetails = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          const orderPayload = {
            shippingAddress,
            paymentMethod: 'razorpay',
            paymentDetails,
            cartItems: validItems,
            orderNotes
          };

          try {
            const finalOrder = await dispatch(placeOrder(orderPayload)).unwrap();
            dispatch(clearCart());
            toast.success('Order placed successfully!');
            router.push(`/checkout/success?orderId=${finalOrder.data.orderNumber}`);
          } catch (err) {
            toast.error(err as string || 'Failed to place order');
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#dc2626',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error(error as string || 'Failed to initiate payment');
    }
  };

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.validItems?.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link href="/products">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const finalTotal = (cart.totalAmount || 0) - (cart.appliedCoupon?.discount || 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/cart" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="House No, Building Name, Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="6-digit PIN"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Order Notes (Optional)</label>
                  <textarea
                    name="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium h-24 resize-none"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Select Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <div 
                  onClick={() => setPaymentMethod('razorpay')}
                  className={cn(
                    "p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between",
                    paymentMethod === 'razorpay' 
                      ? "border-red-600 bg-red-50 dark:bg-red-950/20" 
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <CreditCard className={cn("w-6 h-6", paymentMethod === 'razorpay' ? "text-red-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Online Payment</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Cards/UPI/Netbanking</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 border-2 rounded-full flex items-center justify-center",
                    paymentMethod === 'razorpay' ? "border-red-600" : "border-gray-300"
                  )}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                  </div>
                </div>

                {/* COD Option */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between",
                    paymentMethod === 'cod' 
                      ? "border-red-600 bg-red-50 dark:bg-red-950/20" 
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                      <Banknote className={cn("w-6 h-6", paymentMethod === 'cod' ? "text-red-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Pay when you receive</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 border-2 rounded-full flex items-center justify-center",
                    paymentMethod === 'cod' ? "border-red-600" : "border-gray-300"
                  )}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                {cart.validItems?.map((item) => (
                  <div key={item.product} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1 text-red-600">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">₹{cart.itemsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={cart.shippingCharge === 0 ? "text-green-600 font-bold" : "font-bold"}>
                    {cart.shippingCharge === 0 ? 'Free' : `₹${cart.shippingCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-bold">₹{cart.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                {cart.appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({cart.appliedCoupon.code})</span>
                    <span className="font-bold">-₹{(cart.appliedCoupon.discount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-red-600">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>

                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handlePayment}
                  disabled={orderLoading}
                  className="mt-6 bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 py-4 h-auto text-lg"
                >
                  {orderLoading ? <Spinner size="sm" /> : (
                    paymentMethod === 'razorpay' ? `Pay Online ₹${finalTotal.toLocaleString('en-IN')}` : `Place COD Order`
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-gray-400 mt-4 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
                  <ShieldCheck size={12} className="text-green-500" />
                  {paymentMethod === 'razorpay' ? 'Secure Checkout by Razorpay' : 'Trusted Fire Safety Provider'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
