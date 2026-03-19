import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import UserProfileModal from '../components/UserProfileModal';
import api from '../api/api';

interface LostItem {
  _id: string;
  title: string;
  description: string;
  category: 'lost' | 'found';
  itemType: string;
  location: string;
  date: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  imageUrl?: string;
  status: 'open' | 'resolved' | 'closed';
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn`}>
      {type === 'success' && (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="text-sm sm:text-base flex-1">{message}</span>
    </div>
  );
};

// Report Item Modal
const ReportItemModal = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  onReport
}: {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  onReport: (reason: string) => void;
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }
    setSubmitting(true);
    onReport(reason);
    setTimeout(() => {
      setReason('');
      setSubmitting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[70]" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Report Item</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Reporting: <span className="font-medium">{itemTitle}</span>
          </p>
          
          <textarea
            className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you're reporting this item..."
            disabled={submitting}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:bg-red-400"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format phone number
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    return `+91 ${cleanNumber}`;
  }
  return phone;
};

export default function LostFound() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingItem, setReportingItem] = useState<{ id: string; title: string } | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'lost' as 'lost' | 'found',
    itemType: '',
    location: '',
    date: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    imageUrl: '',
    status: 'open'
  });

  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');
  const isAdmin = user?.role === 'admin';

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const load = async () => {
    try {
      let url = '/lost-items';
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += '?' + params.toString();
      
      const { data } = await api.get(url);
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      showToast('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterCategory, filterStatus, searchQuery]);

  // Start editing
  const startEdit = (item: LostItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      itemType: item.itemType,
      location: item.location,
      date: item.date,
      contactName: item.contactName,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail || '',
      imageUrl: item.imageUrl || '',
      status: item.status
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      category: 'lost',
      itemType: '',
      location: '',
      date: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      imageUrl: '',
      status: 'open'
    });
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.itemType.trim() || 
        !form.location.trim() || !form.date.trim() || !form.contactName.trim() || 
        !form.contactPhone.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (editingItem) {
        await api.put(`/lost-items/${editingItem._id}`, form);
        showToast('Item updated successfully!', 'success');
      } else {
        await api.post('/lost-items', form);
        showToast('Item posted successfully!', 'success');
      }

      await load();
      cancelEdit();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Submit failed:', error);
      showToast(error.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/lost-items/${id}`);
      showToast('Item deleted successfully', 'success');
      await load();
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast(error.response?.data?.message || 'Failed to delete item', 'error');
    }
  };

  const markResolved = async (id: string) => {
    try {
      await api.put(`/lost-items/${id}/resolve`);
      showToast('Item marked as resolved!', 'success');
      await load();
    } catch (error: any) {
      console.error('Failed to mark resolved:', error);
      showToast(error.response?.data?.message || 'Failed to mark resolved', 'error');
    }
  };

  const openWhatsApp = (phone: string, itemTitle: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`Hi, I'm interested in your item: ${itemTitle}`);
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  const handleViewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  const handleReportItem = (itemId: string, itemTitle: string) => {
    setReportingItem({ id: itemId, title: itemTitle });
    setShowReportModal(true);
  };

  const submitReport = async (reason: string) => {
    if (!reportingItem) return;
    
    try {
      showToast('Report submitted successfully! Admin will review it.', 'success');
      
      if (isAdmin) {
        if (confirm('As an admin, you can delete this item immediately. Delete it?')) {
          await deleteItem(reportingItem.id);
        }
      }
    } catch (error) {
      showToast('Failed to submit report', 'error');
    }
  };

  const canModify = (itemUserId: string) => {
    return user && (String(itemUserId) === user._id || user.role === 'admin');
  };

  // Mobile Filter Component
  const MobileFilter = () => (
    <div className="sm:hidden w-full mb-4">
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 flex items-center justify-between shadow-sm"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Items
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isFilterOpen && (
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-lg">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsFilterOpen(false);
              }}
              placeholder="Search items..."
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setIsFilterOpen(false);
              }}
            >
              <option value="">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setIsFilterOpen(false);
              }}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterStatus('');
              setSearchQuery('');
              setIsFilterOpen(false);
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout
      title="Lost & Found"
      subtitle="Report items or help others"
      action={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Desktop Filters */}
          <div className="hidden sm:flex gap-2 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-40 text-sm py-1.5 border border-slate-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500"
            />
            <select
              className="w-28 text-sm py-1.5 border border-slate-300 rounded-lg px-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select
              className="w-28 text-sm py-1.5 border border-slate-300 rounded-lg px-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              setForm({
                title: '',
                description: '',
                category: 'lost',
                itemType: '',
                location: '',
                date: '',
                contactName: '',
                contactPhone: '',
                contactEmail: '',
                imageUrl: '',
                status: 'open'
              });
              if (!showForm) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Report Item'}
          </button>
        </div>
      }
    >

      {/* About Lost & Found - Simple & Professional */}
<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-800 mb-1">About Lost & Found</h3>
      <p className="text-sm text-gray-600">
        Misplaced something on campus? Found an item belonging to someone else? 
        This is the place to report lost items or help others find their belongings. 
        From water bottles and books to laptops and ID cards - post here and help 
        the campus community reunite with their valuables.
      </p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>✓ Report lost items</span>
        <span>✓ Post found items</span>
        <span>✓ Reunite with belongings</span>
      </div>
      <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
        <span>✓ Books & stationery</span>
        <span>✓ Electronics & gadgets</span>
        <span>✓ ID cards & wallets</span>
      </div>
    </div>
  </div>
</div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* User Profile Modal */}
      {showUserModal && selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserId(null);
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && reportingItem && (
        <ReportItemModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingItem(null);
          }}
          itemId={reportingItem.id}
          itemTitle={reportingItem.title}
          onReport={submitReport}
        />
      )}

      {/* Mobile Filter */}
      <MobileFilter />

      {/* Admin Notice */}
      {isAdmin && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700 flex items-center gap-2">
            <span>👑</span>
            You are an admin. You can delete any suspicious items.
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {editingItem ? 'Edit Item' : 'Report New Item'}
          </h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Lost Black Laptop"
                required
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed description of the item..."
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as 'lost' | 'found' })}
                required
                disabled={submitting}
              >
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Item Type *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.itemType}
                onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                placeholder="e.g. Electronics"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Library"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. 15 March"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Contact Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="Your name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="10-digit number"
                required
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Contact Email (optional)</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="email@example.com"
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                disabled={submitting}
              />
            </div>

            {/* Compact Buttons */}
            <div className="md:col-span-2 flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:bg-blue-400"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Report')}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 sm:h-64 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative">
              {/* Admin Badge */}
              {isAdmin && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                  Admin
                </div>
              )}

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800 line-clamp-1">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.category === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.category === 'lost' ? 'Lost' : 'Found'}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="space-y-1.5 text-xs mb-3">
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <span>📦</span>
                    <span className="truncate">{item.itemType}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <span>📍</span>
                    <span className="truncate">{item.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <span>📅</span>
                    <span>{item.date}</span>
                  </p>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 rounded-lg p-2.5 mb-3">
                  <p className="text-[10px] font-semibold text-blue-800 mb-1">Contact</p>
                  <p className="text-xs font-medium text-blue-900">{item.contactName}</p>
                  <p className="text-[10px] text-blue-700 flex items-center gap-1 mt-0.5">
                    <span>📞</span> {formatPhoneNumber(item.contactPhone)}
                  </p>
                </div>

                {/* WhatsApp Button */}
                {item.status === 'open' && (
                  <button
                    onClick={() => openWhatsApp(item.contactPhone, item.title)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 mb-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                    </svg>
                    WhatsApp
                  </button>
                )}

                {/* Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleViewUserProfile(item.userId._id)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium truncate max-w-[100px]"
                  >
                    {item.userId.name}
                  </button>
                  
                  <button
                    onClick={() => handleReportItem(item._id, item.title)}
                    className="text-[10px] text-red-600 hover:text-red-700 font-medium flex items-center gap-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report
                  </button>
                </div>

                {/* Action Buttons for Creator/Admin */}
                {canModify(item.userId._id) && (
                  <div className="flex gap-1.5 mt-2">
                    {item.status === 'open' && (
                      <button
                        onClick={() => markResolved(item._id)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-medium px-2 py-1.5 rounded text-[10px] transition-colors"
                      >
                        ✓ Resolve
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-2 py-1.5 rounded text-[10px] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-2 py-1.5 rounded text-[10px] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Admin Delete Button */}
                {isAdmin && !canModify(item.userId._id) && (
                  <div className="mt-2">
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-1.5 rounded text-[10px] transition-colors"
                    >
                      🚫 Admin Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-12 sm:py-16 text-center bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-400 text-sm sm:text-base">No items found. Be the first to report!</p>
            </div>
          )}
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
        
        @media (max-width: 640px) {
          .animate-slideIn {
            left: 1rem;
            right: 1rem;
            transform: translateX(0);
            animation: slideInMobile 0.3s ease-out;
          }
          
          @keyframes slideInMobile {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
}