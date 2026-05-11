'use client';

import { useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { 
  Users, 
  ShoppingCart, 
  Calendar, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getAllAdminOrders } from '@/redux/slices/orderSlice';
import { getAdminProducts } from '@/redux/slices/productSlice';
import Link from 'next/link';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, totalOrders } = useSelector((state: RootState) => state.order);
  const { products } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    dispatch(getAllAdminOrders({ page: 1 }));
    dispatch(getAdminProducts());
  }, [dispatch]);

  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const processingOrders = orders.filter(o => o.orderStatus === 'processing').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title="System Overview">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend={{ value: 12.5, isUp: true }}
          color="green"
        />
        <StatCard 
          label="Total Orders" 
          value={totalOrders.toString()} 
          icon={ShoppingCart} 
          trend={{ value: 8, isUp: true }}
          color="blue"
        />
        <StatCard 
          label="Pending Orders" 
          value={processingOrders.toString()} 
          icon={Clock} 
          trend={{ value: 2, isUp: false }}
          color="amber"
        />
        <StatCard 
          label="Low Stock Items" 
          value={lowStockCount.toString()} 
          icon={AlertTriangle} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-outfit font-black text-xl dark:text-white">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 dark:border-gray-800">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                      <td className="py-5 font-bold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</td>
                      <td className="py-5">
                        <p className="text-sm font-bold dark:text-gray-300">{order.user?.name}</p>
                        <p className="text-[10px] text-gray-500">{order.user?.email}</p>
                      </td>
                      <td className="py-5 font-black text-gray-900 dark:text-white text-sm">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400 text-sm italic">No recent orders to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Activity Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="font-outfit font-black text-xl dark:text-white mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/products/upload" className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col items-center gap-2 group hover:bg-red-600 transition-all">
                <Package size={24} className="text-red-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-900 dark:text-red-400 group-hover:text-white">Add Product</span>
              </Link>
              <Link href="/admin/appointments" className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center gap-2 group hover:bg-blue-600 transition-all">
                <Calendar size={24} className="text-blue-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 dark:text-blue-400 group-hover:text-white">Schedule</span>
              </Link>
            </div>

            <div className="mt-8 space-y-4">
               <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold dark:text-white">System Status</p>
                      <p className="text-[10px] text-gray-500">All modules operational</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
