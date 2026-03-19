import React, { useState } from 'react';
import API from '../services/api';
import { MarketplaceItem, CreateItemDTO } from '../types/marketplace.types';

interface MarketplaceUploadProps {
  onSuccess?: (item: MarketplaceItem) => void;
  onClose?: () => void;
}

export default function MarketplaceUpload({ onSuccess, onClose }: MarketplaceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    price: '',
    description: '',
    image: ''
  });

  // 📤 Handle Image Upload to Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setErrors({ ...errors, image: '' });

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'File 5MB se bada hai!' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Sirf images allowed hain (JPEG, PNG, WEBP)' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await API.post('/marketplace/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setImageUrl(response.data.imageUrl); // 👈 URL store karo
        console.log('✅ Image uploaded, URL:', response.data.imageUrl);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors({ 
        ...errors, 
        image: error.response?.data?.error || 'Upload failed!' 
      });
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      title: '',
      price: '',
      description: '',
      image: ''
    };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title required hai!';
      isValid = false;
    }

    if (!formData.price) {
      newErrors.price = 'Price required hai!';
      isValid = false;
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price 0 se zyada hona chahiye!';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description required hai!';
      isValid = false;
    }

    if (!imageUrl) {
      newErrors.image = 'Image upload karna zaroori hai!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 📝 Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.post('/marketplace', {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl // 👈 Sirf URL bhej rahe ho
      });

      if (response.data.success) {
        alert('✅ Item successfully posted!');
        
        // Reset form
        setFormData({ title: '', price: '', description: '' });
        setImageUrl('');
        setPreviewUrl('');
        
        if (onSuccess) onSuccess(response.data.item);
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('❌ Failed to post: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Marketplace Item</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl('');
                        setImageUrl('');
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Image
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Max 5MB (JPEG, PNG, WEBP)
                    </p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mt-2 text-blue-600 flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              )}

              {imageUrl && (
                <div className="mt-2 text-green-600 text-sm">
                  ✅ Image uploaded! (URL saved in DB)
                </div>
              )}

              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., iPhone 12, Books, etc."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 500"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your item..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}