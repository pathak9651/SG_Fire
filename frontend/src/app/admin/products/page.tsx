'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getAdminProducts, deleteAdminProduct } from '@/redux/slices/productSlice';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.product);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action will permanently remove it from the database.')) {
      try {
        const result = await dispatch(deleteAdminProduct(id));
        if (deleteAdminProduct.fulfilled.match(result)) {
          toast.success('Product deleted successfully');
        } else {
          toast.error(result.payload as string || 'Failed to delete product');
        }
      } catch (err) {
        toast.error('An error occurred while deleting');
      }
    }
  };

  // Filtering logic
  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || selectedCategory === 'All' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <AdminLayout title="Products Management">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option>All Categories</option>
                <option>Extinguishers</option>
                <option>Detectors</option>
                <option>Safety Gear</option>
                <option>Alarms</option>
              </select>
            </div>
          </div>

          <Link href="/admin/products/upload" className="btn-primary py-3 px-6 flex items-center gap-2 shadow-xl shadow-red-500/20 text-sm">
            <Plus size={18} /> Add New Product
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 dark:border-gray-800">
                    <th className="px-8 py-5">Product Details</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Price</th>
                    <th className="px-6 py-5">Stock</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  <AnimatePresence>
                    {filteredProducts.map((product, i) => (
                      <motion.tr 
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-1 group-hover:scale-110 transition-transform">
                              <img src={product.images?.[0]?.url || 'https://placehold.co/100x100/red/white?text=Fire'} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                                {product.title}
                              </p>
                              <p className="text-[10px] text-gray-500 font-medium">SKU: {product.sku || `SG-FR-${product._id.slice(-5)}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full uppercase tracking-widest scale-90 inline-block">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-sm font-black dark:text-white">₹{product.discountPrice || product.price}</p>
                            {product.discountPrice && (
                              <p className="text-[10px] text-gray-400 line-through">₹{product.price}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${product.stock <= 10 ? 'text-red-600' : 'dark:text-white'}`}>
                              {product.stock}
                            </span>
                            {product.stock <= 10 && product.stock > 0 && (
                              <AlertTriangle size={14} className="text-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/slug/${product.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="View Public">
                              <Eye size={18} />
                            </Link>
                            <Link href={`/admin/products/${product._id}/edit`} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Edit">
                              <Edit size={18} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" 
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 italic">Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      </div>
    </AdminLayout>
  );
}
