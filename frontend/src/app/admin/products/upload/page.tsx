'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Package, 
  Upload, 
  X, 
  Plus,
  Info,
  DollarSign,
  Layers,
  FileText,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { createAdminProduct } from '@/redux/slices/productSlice';
import { getCategories } from '@/redux/slices/categorySlice';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

export default function UploadProduct() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { categories } = useSelector((state: RootState) => state.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    brand: '',
    isFeatured: false,
    isNewArrival: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages([...images, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      return toast.error('Please select a category');
    }
    if (images.length === 0) {
      return toast.error('Please upload at least one image');
    }

    setIsSubmitting(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    images.forEach(image => {
      data.append('images', image);
    });

    try {
      const result = await dispatch(createAdminProduct(data));
      if (createAdminProduct.fulfilled.match(result)) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        toast.error(result.payload as string || 'Failed to create product');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Upload New Product">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-gray-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-600">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Product Information</h3>
                <p className="text-xs text-gray-500">Enter the core details of the safety equipment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Title</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. ABC Dry Powder Fire Extinguisher (4KG)"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text" 
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. SafeGuard"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Quantity</label>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea 
                    required
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide full technical specifications and usage instructions..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media & Publish */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Product Media</h3>
            
            <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50/10 transition-all group">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-red-500 mb-4 transition-all">
                <Upload size={24} />
              </div>
              <p className="text-xs font-bold dark:text-gray-400 text-center">Add product images</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest text-center">JPG, PNG up to 5MB</p>
            </label>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {previews.map((preview, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 aspect-square">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all backdrop-blur-[2px]"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold dark:text-gray-300">Featured Product</label>
              <input 
                type="checkbox" 
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 accent-red-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold dark:text-gray-300">New Arrival Badge</label>
              <input 
                type="checkbox" 
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleInputChange}
                className="w-5 h-5 accent-red-600"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-red-500/20 font-black tracking-wider uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? <Spinner size="sm" /> : <CheckCircle size={18} />}
            {isSubmitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
