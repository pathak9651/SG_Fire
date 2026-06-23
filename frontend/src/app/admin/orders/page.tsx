'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Package,
  Phone
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getAllAdminOrders, updateOrderStatus } from '@/redux/slices/orderSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, totalPages, currentPage } = useSelector((state: RootState) => state.order);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    dispatch(getAllAdminOrders({ page: 1, status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handlePageChange = (page: number) => {
    dispatch(getAllAdminOrders({ page, status: statusFilter }));
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await dispatch(updateOrderStatus({ id, status: newStatus }));
      if (updateOrderStatus.fulfilled.match(result)) {
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(result.payload as string || 'Failed to update status');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'processing': return <Clock size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        {/* Statistics Overview (Mini) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Orders</p>
            <h4 className="text-2xl font-black dark:text-white">{orders.length * totalPages || 0}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Processing</p>
            <h4 className="text-2xl font-black dark:text-white">{orders.filter(o => o.orderStatus === 'processing').length}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Shipped</p>
            <h4 className="text-2xl font-black dark:text-white">{orders.filter(o => o.orderStatus === 'shipped').length}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Delivered</p>
            <h4 className="text-2xl font-black dark:text-white">{orders.filter(o => o.orderStatus === 'delivered').length}</h4>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order #, Email or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <Spinner className="w-12 h-12 border-red-600" />
              <p className="text-sm font-bold text-gray-400 animate-pulse">Fetching orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 dark:border-gray-800">
                    <th className="px-4 sm:px-8 py-6">Order Details</th>
                    <th className="px-4 sm:px-6 py-6 hidden sm:table-cell">Customer</th>
                    <th className="px-4 sm:px-6 py-6">Amount</th>
                    <th className="px-4 sm:px-6 py-6">Status</th>
                    <th className="px-4 sm:px-6 py-6 hidden md:table-cell">Date</th>
                    <th className="px-4 sm:px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  <AnimatePresence>
                    {orders.map((order, i) => (
                      <motion.tr 
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
                      >
                        <td className="px-4 sm:px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                              #{order.orderNumber}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {order.paymentInfo?.method}
                            </p>
                            {/* Show customer name inline on mobile */}
                            <p className="text-[10px] text-gray-400 mt-1 sm:hidden">{order.user?.name}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-6 hidden sm:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-[10px] font-black">
                              {order.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{order.user?.name}</p>
                              <p className="text-[10px] text-gray-500">{order.user?.email}</p>
                              <p className="text-[10px] text-red-600 font-bold">{order.user?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-6">
                          <p className="text-sm font-black dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            <span className="hidden sm:inline">{order.orderStatus}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-6 hidden md:table-cell">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 sm:px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            >
                              <Eye size={18} />
                            </button>
                            <div className="relative group/status">
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                <MoreVertical size={18} />
                              </button>
                              <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 py-2 hidden group-hover/status:block z-50">
                                {['processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(order._id, status)}
                                    className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:text-gray-300 transition-colors"
                                  >
                                    Mark as {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">No orders found</h3>
                  <p className="text-sm text-gray-500">No orders match your current filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-8 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500 italic">Page {currentPage} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black dark:text-white">Order Details</h2>
                  <p className="text-xs font-bold text-red-600 mt-1 uppercase tracking-widest">#{selectedOrder.orderNumber}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-red-600 transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer & Shipping */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Customer Info</h4>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.user?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{selectedOrder.user?.email}</p>
                        <p className="text-sm text-red-600 font-black mt-2">{selectedOrder.user?.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Shipping Address</h4>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-1">
                        <p className="text-sm font-bold">{selectedOrder.shippingAddress.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress.addressLine1}</p>
                        {selectedOrder.shippingAddress.addressLine2 && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress.addressLine2}</p>}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                        </p>
                        <p className="text-sm text-red-600 font-bold mt-2 flex items-center gap-2">
                          <Phone size={14} /> {selectedOrder.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary & Status */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Payment & Status</h4>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Method</span>
                          <span className="text-xs font-black uppercase">{selectedOrder.paymentInfo.method}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Payment Status</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            selectedOrder.paymentInfo.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {selectedOrder.paymentInfo.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-xs font-bold text-gray-500">Order Status</span>
                          <select
                            value={selectedOrder.orderStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              handleStatusUpdate(selectedOrder._id, newStatus);
                              setSelectedOrder((prev: any) => prev ? { ...prev, orderStatus: newStatus } : null);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer focus:ring-2 focus:ring-red-500 transition-all dark:bg-gray-900",
                              getStatusColor(selectedOrder.orderStatus)
                            )}
                          >
                            <option value="pending" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Pending</option>
                            <option value="processing" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Processing</option>
                            <option value="shipped" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Shipped</option>
                            <option value="delivered" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Delivered</option>
                            <option value="cancelled" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.customerNotes && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Customer Notes</h4>
                        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedOrder.customerNotes}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Ordered Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black dark:text-white line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">₹{item.price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-red-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 sm:p-8 bg-gray-950 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Subtotal</p>
                      <p className="font-bold">₹{selectedOrder.itemsTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Shipping</p>
                      <p className="font-bold">₹{selectedOrder.shippingCharge.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">GST (18%)</p>
                      <p className="font-bold">₹{selectedOrder.taxAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Total Paid Amount</p>
                    <h3 className="text-4xl font-black">₹{selectedOrder.totalAmount.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
