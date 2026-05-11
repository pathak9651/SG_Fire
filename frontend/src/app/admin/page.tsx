'use client';

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
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminLayout title="System Overview">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Revenue" 
          value="₹1,24,500" 
          icon={TrendingUp} 
          trend={{ value: 12.5, isUp: true }}
          color="green"
        />
        <StatCard 
          label="Active Orders" 
          value="42" 
          icon={ShoppingCart} 
          trend={{ value: 8, isUp: true }}
          color="blue"
        />
        <StatCard 
          label="Pending Appointments" 
          value="15" 
          icon={Calendar} 
          trend={{ value: 2, isUp: false }}
          color="amber"
        />
        <StatCard 
          label="Low Stock Items" 
          value="8" 
          icon={AlertTriangle} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg dark:text-white">Recent Orders</h3>
              <button className="text-xs font-bold text-red-600 hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <th className="pb-4 font-bold uppercase tracking-wider">Order ID</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Customer</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Amount</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    { id: '#ORD-9902', name: 'John Doe', amount: '₹4,500', status: 'Delivered', color: 'bg-green-100 text-green-700' },
                    { id: '#ORD-9903', name: 'Rahul Smith', amount: '₹12,200', status: 'Processing', color: 'bg-blue-100 text-blue-700' },
                    { id: '#ORD-9904', name: 'Anita Singh', amount: '₹1,500', status: 'Pending', color: 'bg-amber-100 text-amber-700' },
                    { id: '#ORD-9905', name: 'Karan Mehra', amount: '₹8,900', status: 'Shipped', color: 'bg-purple-100 text-purple-700' },
                  ].map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="py-4 font-bold text-gray-900 dark:text-white">{order.id}</td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">{order.name}</td>
                      <td className="py-4 font-black text-gray-900 dark:text-white">{order.amount}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.color}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Activity Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-bold text-lg dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { icon: CheckCircle2, text: 'Order #9902 confirmed', time: '5 mins ago', color: 'text-green-500' },
                { icon: Clock, text: 'New appointment request', time: '12 mins ago', color: 'text-blue-500' },
                { icon: Package, text: 'Stock update: Fire Extinguisher', time: '45 mins ago', color: 'text-red-500' },
                { icon: Users, text: 'New user registered', time: '1 hour ago', color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-1 ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-300 leading-tight">{item.text}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
