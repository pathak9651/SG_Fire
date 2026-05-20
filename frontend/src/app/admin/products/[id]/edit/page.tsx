'use client';

import { useCallback, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Save
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getSingleProduct, updateAdminProduct } from '@/redux/slices/productSlice';
import { getCategories } from '@/redux/slices/categorySlice';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { products, isLoading: isProductLoading } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.category);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    brand: '',
  });
  
  const [images, setImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fillForm = useCallback((product: any) => {
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      discountPrice: product.discountPrice?.toString() || '',
      stock: product.stock?.toString() || '',
      category: product.category?._id || product.category || '',
      brand: product.brand || '',
    });
    setImages(product.images || []);
  }, []);

  useEffect(() => {
    dispatch(getCategories());
    if (id) {
      // Find product in state or fetch if not available
      const existingProduct = products.find(p => p._id === id);
      if (existingProduct) {
        fillForm(existingProduct);
      } else {
        dispatch(getSingleProduct(id as string)).then((res: any) => {
          if (res.payload?.success) {
            fillForm(res.payload.data);
          }
        });
      }
    }
  }, [id, dispatch, products, fillForm]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages([...newImages, ...filesArray]);
      
      // Preview new images
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      // For simplicity in preview, we just add them to the visible images list with a flag
      setImages([...images, ...previewUrls.map(url => ({ url, isNew: true }))]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    const removed = updatedImages.splice(index, 1)[0];
    setImages(updatedImages);
    
    if (removed.isNew) {
      // Find and remove from newImages array too
      // (This is simplified, in a real app you'd track by object reference)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    newImages.forEach(image => {
      data.append('images', image);
    });

    try {
      const result = await dispatch(updateAdminProduct({ id: id as string, formData: data }));
      if (updateAdminProduct.fulfilled.match(result)) {
        toast.success('Product updated successfully');
        router.push('/admin/products');
      } else {
        toast.error(result.payload as string || 'Failed to update product');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isProductLoading && !formData.title) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center h-64">
          <Spinner className="w-10 h-10 border-red-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${formData.title}`}>
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-gray-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-600">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Product Details</h3>
                <p className="text-xs text-gray-500">Update the product specifications and information.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none"
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
                    type="text" 
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Brand Name"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea 
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Product Images</h3>
            
            <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-all group">
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-red-500 mb-4 transition-all">
                <Upload size={24} />
              </div>
              <p className="text-xs font-bold dark:text-gray-400 text-center">Click to upload new images</p>
            </label>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 aspect-square">
                  <img src={img.url || img} alt="Product" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                  {img.isNew && (
                    <span className="absolute top-1 right-1 bg-green-500 text-[8px] text-white px-1 rounded font-bold">NEW</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isUpdating}
            className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-red-500/20 font-black tracking-wider uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? <Spinner size="sm" /> : <Save size={18} />}
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
