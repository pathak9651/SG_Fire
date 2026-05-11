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
  Package
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getAllAdminOrders, updateOrderStatus } from '@/redux/slices/orderSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

export default function AdminOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, totalPages, currentPage } = useSelector((state: RootState) => state.order);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <th className="px-8 py-6">Order Details</th>
                    <th className="px-6 py-6">Customer</th>
                    <th className="px-6 py-6">Amount</th>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-6 py-6">Date</th>
                    <th className="px-8 py-6 text-right">Actions</th>
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
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                              #{order.orderNumber}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {order.paymentInfo?.method}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-[10px] font-black">
                              {order.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{order.user?.name}</p>
                              <p className="text-[10px] text-gray-500">{order.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-black dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
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
    </AdminLayout>
  );
}
