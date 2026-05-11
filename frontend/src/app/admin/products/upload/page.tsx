'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Package, 
  Upload, 
  X, 
  Image as ImageIcon,
  Plus,
  Info,
  DollarSign,
  Layers,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadProduct() {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = () => {
    // Mock upload
    setImages([...images, 'https://placehold.co/100x100/red/white?text=Product']);
    toast.success('Image added');
  };

  return (
    <AdminLayout title="Upload New Product">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-gray-800">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-600">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Product Information</h3>
                <p className="text-xs text-gray-500">Enter basic details about the fire safety equipment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. ABC Dry Powder Extinguisher"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none">
                    <option>Extinguishers</option>
                    <option>Smoke Detectors</option>
                    <option>Fire Alarms</option>
                    <option>Safety Gear</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Quantity</label>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea 
                    rows={4}
                    placeholder="Detailed technical specifications..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media Upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Media Gallery</h3>
            
            <div 
              onClick={handleImageUpload}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-red-500 mb-4 transition-all">
                <Upload size={24} />
              </div>
              <p className="text-xs font-bold dark:text-gray-400">Click to upload product image</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG up to 5MB</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 aspect-square">
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  <button className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-red-500/20 font-black tracking-wider uppercase text-sm">
            Publish Product
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
