'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Save,
  CheckCircle,
  BarChart3,
  Database
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getAdminProducts, updateProductStock } from '@/redux/slices/productSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';
import { Category } from '@/types';

export default function InventoryPage() {
  const getCategoryName = (category: string | Category | undefined | null): string => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'object' && 'name' in category) {
      return category.name;
    }
    return typeof category === 'string' ? category : 'Uncategorized';
  };

  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.product);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  const handleUpdateStock = async (id: string) => {
    if (newStock < 0) return toast.error('Stock cannot be negative');
    
    setIsUpdating(true);
    try {
      const result = await dispatch(updateProductStock({ id, stock: newStock }));
      if (updateProductStock.fulfilled.match(result)) {
        toast.success('Stock updated successfully');
        setEditingId(null);
      } else {
        toast.error(result.payload as string || 'Update failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (product: any) => {
    setEditingId(product._id);
    setNewStock(product.stock);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(p.category).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = products.filter(p => p.stock <= 10).length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <AdminLayout title="Inventory & Stock">
      <div className="space-y-6">
        {/* Inventory Stats */}
        <div className="grid-responsive-admin-stats">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                <Database size={16} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
            </div>
            <h4 className="text-2xl font-black dark:text-white">{products.length}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600">
                <AlertTriangle size={16} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
            </div>
            <h4 className="text-2xl font-black dark:text-white">{lowStockItems}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                <Package size={16} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Items</p>
            </div>
            <h4 className="text-2xl font-black dark:text-white">{totalItems.toLocaleString()}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                <TrendingUp size={16} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Value</p>
            </div>
            <h4 className="text-2xl font-black dark:text-white">₹{(totalStockValue / 100000).toFixed(2)}L</h4>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm"
            />
          </div>

          <button 
            onClick={() => dispatch(getAdminProducts())}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Stock Table */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 dark:border-gray-800">
                  <th className="px-4 sm:px-8 py-6">Product</th>
                  <th className="px-4 sm:px-6 py-6">Current Stock</th>
                  <th className="px-4 sm:px-6 py-6">Quick Adjustment</th>
                  <th className="px-4 sm:px-6 py-6 hidden sm:table-cell">Total Sold</th>
                  <th className="px-4 sm:px-6 py-6">Stock Status</th>
                  <th className="px-4 sm:px-8 py-6 text-right hidden md:table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                <AnimatePresence>
                  {filteredProducts.map((product, i) => (
                    <motion.tr 
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
                    >
                      <td className="px-4 sm:px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-1 group-hover:scale-105 transition-transform flex-shrink-0">
                            <img src={product.images?.[0]?.url || 'https://placehold.co/100x100/red/white?text=Fire'} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1 max-w-[200px]">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">{getCategoryName(product.category)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-6">
                        <span className={`text-sm font-black ${product.stock <= 10 ? 'text-red-600' : 'dark:text-white'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-6">
                        {editingId === product._id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={newStock}
                              onChange={(e) => setNewStock(parseInt(e.target.value))}
                              className="w-20 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <button 
                              onClick={() => handleUpdateStock(product._id)}
                              disabled={isUpdating}
                              className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                            >
                              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEditing(product)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Update Stock <ArrowRight size={12} />
                          </button>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-6 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-gray-400" />
                          <span className="text-sm font-bold dark:text-gray-300">{product.totalSold || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-6">
                        {product.stock <= 0 ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">Out of Stock</span>
                        ) : product.stock <= 10 ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">Low Stock</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">Healthy</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-8 py-6 text-right hidden md:table-cell">
                        <p className="text-[10px] text-gray-500 font-medium">
                          {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
