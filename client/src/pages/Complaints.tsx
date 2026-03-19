import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import UserProfileModal from '../components/UserProfileModal';
import api from '../api/api';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: 'hostel' | 'campus' | 'mess' | 'security' | 'maintenance' | 'other';
  location: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  adminRemarks?: string;
  resolvedAt?: string;
  createdAt: string;
  timeElapsed?: string;
}

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn`}>
      {type === 'success' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <div>
        <p className="font-medium">{message}</p>
        <p className="text-sm opacity-90">We'll notify you when there's an update.</p>
      </div>
    </div>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose, complaintId }: { isOpen: boolean; onClose: () => void; complaintId: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h3>
        <p className="text-slate-600 mb-4">
          Your complaint has been submitted successfully. Our team will review it and take necessary action.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
          <p className="text-sm text-blue-800 font-medium mb-1">Complaint ID:</p>
          <p className="text-xs text-blue-600 font-mono">{complaintId}</p>
          <p className="text-xs text-blue-600 mt-2">You can track the status in your profile.</p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition-colors"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

// Complaint Form Component
const ComplaintForm = ({ onSuccess }: { onSuccess: (id: string) => void }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'hostel',
    location: '',
    imageUrl: '',
    priority: 'medium'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'hostel', label: '🏠 Hostel', color: 'blue' },
    { value: 'campus', label: '🌳 Campus', color: 'green' },
    { value: 'mess', label: '🍽️ Mess', color: 'orange' },
    { value: 'security', label: '🛡️ Security', color: 'purple' },
    { value: 'maintenance', label: '🔧 Maintenance', color: 'yellow' },
    { value: 'other', label: '📌 Other', color: 'gray' }
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    
    if (!form.description.trim()) newErrors.description = 'Description is required';
    else if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    
    if (!form.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const { data } = await api.post('/complaints', form);
      
      if (data.success) {
        onSuccess(data.complaint._id);
        // Reset form
        setForm({
          title: '',
          description: '',
          category: 'hostel',
          location: '',
          imageUrl: '',
          priority: 'medium'
        });
        setPreviewUrl(null);
      }
    } catch (error: any) {
      console.error('Submit failed:', error);
      alert(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Complaint Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="e.g. Water leakage in room 203"
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.location ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="e.g. Hostel Block A, Room 203"
        />
        {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Please provide detailed description of the issue..."
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Image (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="complaint-image"
          />
          <label htmlFor="complaint-image" className="cursor-pointer">
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                <p className="text-sm text-green-600 mt-2">✓ Image ready</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-600">Click to upload an image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </label>
        </div>
        {uploading && (
          <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-4 rounded-lg text-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Complaint'
        )}
      </button>

      <p className="text-xs text-center text-slate-400">
        Your complaint will be reviewed by the admin team. You'll be notified of any updates.
      </p>
    </form>
  );
};

// Main Component
export default function Complaints() {
  const [showForm, setShowForm] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSuccess = (complaintId: string) => {
    setSubmittedId(complaintId);
    setShowSuccessModal(true);
    setShowForm(false);
    setToast({
      message: 'Complaint submitted successfully! Thank you for your feedback.',
      type: 'success'
    });
  };

  return (
    <DashboardLayout
      title="Complaint System"
      subtitle="Report issues about hostel, campus, mess, or security"
      action={
        !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + New Complaint
          </button>
        ) : null
      }
    >
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        complaintId={submittedId}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-blue-700 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-3">We're Here to Help! 🤝</h1>
        <p className="text-blue-100 text-lg mb-4">
          Your feedback helps us make campus life better. Submit your complaint and we'll resolve it as soon as possible.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="bg-white/20 rounded-lg px-4 py-2">⏱️ Response within 24hrs</div>
          <div className="bg-white/20 rounded-lg px-4 py-2">🔒 Completely confidential</div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-3">📝</div>
          <h3 className="font-semibold text-slate-800 mb-1">Be Specific</h3>
          <p className="text-sm text-slate-500">Provide clear details about the issue including location and time.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl mb-3">📸</div>
          <h3 className="font-semibold text-slate-800 mb-1">Add Photos</h3>
          <p className="text-sm text-slate-500">Images help us understand the issue better and faster.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl mb-3">⚡</div>
          <h3 className="font-semibold text-slate-800 mb-1">Track Status</h3>
          <p className="text-sm text-slate-500">Check your profile to see the status of your complaints.</p>
        </div>
      </div>

      {/* Complaint Form */}
      {showForm ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Submit New Complaint</h2>
          <ComplaintForm onSuccess={handleSuccess} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Complaint Submitted!</h3>
          <p className="text-slate-600 mb-6">
            Thank you for your feedback. Our team will review it and take necessary action.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Submit Another Complaint
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}