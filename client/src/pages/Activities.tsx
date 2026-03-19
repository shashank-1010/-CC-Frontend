import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import UserProfileModal from '../components/UserProfileModal';
import api from '../api/api';

interface Activity {
  _id: string;
  title: string;
  description: string;
  requiredParticipants: number;
  deadline?: string;
  contact?: string;
  whatsappLink?: string;
  activityType?: 'whatsapp' | 'limited';
  maxParticipants?: number;
  status: string;
  userId: { 
    _id: string; 
    name: string; 
    email: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    achievements?: string[];
  };
  participants?: Array<{
    user: any;
    joinedAt: string;
    status: string;
  }>;
  joinRequests?: Array<{
    user: any;
    requestedAt: string;
    message?: string;
  }>;
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

// Helper function to format phone number
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    return `+91 ${cleanNumber}`;
  }
  return phone;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    requiredParticipants: '', 
    deadline: '', 
    contact: '', 
    whatsappLink: '',
    activityType: 'whatsapp',
    maxParticipants: '',
    status: 'open' 
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedParticipants, setExpandedParticipants] = useState<string | null>(null);
  
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const load = async () => {
    try {
      let url = '/activities';
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (params.toString()) url += '?' + params.toString();
      
      const { data } = await api.get(url);
      console.log('Loaded activities:', data);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      showToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [filterType, filterStatus]);

  // Start editing an activity
  const startEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setForm({
      title: activity.title,
      description: activity.description,
      requiredParticipants: String(activity.requiredParticipants),
      deadline: activity.deadline || '',
      contact: activity.contact || '',
      whatsappLink: activity.whatsappLink || '',
      activityType: activity.activityType || 'whatsapp',
      maxParticipants: activity.maxParticipants ? String(activity.maxParticipants) : '',
      status: activity.status
    });
    setShowForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingActivity(null);
    setForm({ 
      title: '', 
      description: '', 
      requiredParticipants: '', 
      deadline: '', 
      contact: '', 
      whatsappLink: '',
      activityType: 'whatsapp',
      maxParticipants: '',
      status: 'open' 
    });
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.title.trim() || !form.description.trim() || !form.requiredParticipants) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate participants number
    const participantsNum = parseInt(form.requiredParticipants);
    if (isNaN(participantsNum) || participantsNum < 1) {
      showToast('Please enter a valid number of participants', 'error');
      return;
    }

    // Validate maxParticipants for limited activities
    if (form.activityType === 'limited') {
      const maxNum = parseInt(form.maxParticipants);
      if (isNaN(maxNum) || maxNum < 1) {
        showToast('Please enter valid max participants for limited activity', 'error');
        return;
      }
    }

    setSubmitting(true);

    const payload: any = { 
      ...form, 
      requiredParticipants: participantsNum
    };

    if (form.activityType === 'limited') {
      payload.maxParticipants = parseInt(form.maxParticipants);
    }
    
    try {
      if (editingActivity) {
        // Update existing activity
        await api.put(`/activities/${editingActivity._id}`, payload);
        showToast('Activity updated successfully!', 'success');
      } else {
        // Create new activity
        await api.post('/activities', payload);
        showToast('Activity posted successfully!', 'success');
      }
      
      // Reload all activities from server
      await load();
      
      // Reset form
      cancelEdit();
      
      // Scroll to top after submission
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error: any) {
      console.error('Submit failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save activity';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('Delete this activity?')) return;
    
    try {
      await api.delete(`/activities/${id}`);
      showToast('Activity deleted successfully', 'success');
      await load();
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast(error.response?.data?.message || 'Failed to delete activity', 'error');
    }
  };

  const joinWhatsAppGroup = (link: string) => {
    window.open(link, '_blank');
  };

  const requestToJoin = async (activityId: string) => {
    try {
      const { data } = await api.post(`/activities/${activityId}/request`, {});
      showToast('Join request sent successfully!', 'success');
      
      // Update the activity in the list
      setActivities(prev => prev.map(a => 
        a._id === activityId ? data.activity : a
      ));
    } catch (error: any) {
      console.error('Failed to send join request:', error);
      showToast(error.response?.data?.message || 'Failed to send request', 'error');
    }
  };

  const leaveActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to leave this activity?')) return;
    
    try {
      const { data } = await api.delete(`/activities/${activityId}/leave`);
      showToast('Left activity successfully', 'success');
      
      // Update the activity in the list
      setActivities(prev => prev.map(a => 
        a._id === activityId ? data.activity : a
      ));
    } catch (error: any) {
      console.error('Failed to leave activity:', error);
      showToast(error.response?.data?.message || 'Failed to leave activity', 'error');
    }
  };

  const handleViewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  // Check if current user can edit/delete
  const canModify = (activityUserId: string) => {
    return user && (String(activityUserId) === user._id || user.role === 'admin');
  };

  // Check if user has already joined/requested
  const getUserStatus = (activity: Activity) => {
    if (!user) return null;
    
    // Check if participant
    const participant = activity.participants?.find(p => String(p.user?._id) === user._id);
    if (participant) {
      return { type: 'participant', status: participant.status };
    }
    
    // Check if requested
    const request = activity.joinRequests?.find(r => String(r.user?._id) === user._id);
    if (request) {
      return { type: 'requested', status: 'pending' };
    }
    
    return null;
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
          Filter Activities
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
            <label className="block text-xs font-medium text-slate-500 mb-1">Activity Type</label>
            <select
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setIsFilterOpen(false);
              }}
            >
              <option value="">All Types</option>
              <option value="whatsapp">WhatsApp Groups</option>
              <option value="limited">Limited Activities</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setIsFilterOpen(false);
              }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  

  return (
    <DashboardLayout
      title="Activity Board"
      subtitle="Events, hackathons, club recruitments and WhatsApp groups"
      action={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Desktop Filters */}
          <div className="hidden sm:flex gap-2 items-center">
            <select
              className="w-36 text-sm py-1.5 border border-slate-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="whatsapp">WhatsApp Groups</option>
              <option value="limited">Limited Activities</option>
            </select>
            <select
              className="w-32 text-sm py-1.5 border border-slate-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <button 
            onClick={() => { 
              setShowForm(!showForm); 
              setEditingActivity(null);
              setForm({ 
                title: '', 
                description: '', 
                requiredParticipants: '', 
                deadline: '', 
                contact: '', 
                whatsappLink: '',
                activityType: 'whatsapp',
                maxParticipants: '',
                status: 'open' 
              });
              // Scroll to top when opening form
              if (!showForm) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} 
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Post Activity'}
          </button>
        </div>
      }
    >
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

      {/* Mobile Filter */}
      <MobileFilter />

      {/* About Activities - Simple & Professional */}
<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-800 mb-1">About Activities</h3>
      <p className="text-sm text-gray-600">
        Discover and participate in campus events, workshops, hackathons, and cultural fests. 
        Stay updated with everything happening around you.
      </p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>✓ Never miss an event</span>
        <span>✓ Connect with organizers</span>
        <span>✓ Boost your resume</span>
      </div>
    </div>
  </div>
</div>

      {/* Form - Always at the top when visible */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {editingActivity ? 'Edit Activity' : 'Post New Activity'}
          </h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Title *</label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
                autoComplete="off"
                disabled={submitting}
                placeholder="e.g. Hackathon 2026"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Description *</label>
              <textarea 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows={3} 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                required 
                autoComplete="off"
                disabled={submitting}
                placeholder="Detailed description of the activity..."
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Required Participants *</label>
              <input 
                type="number" 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.requiredParticipants} 
                onChange={(e) => setForm({ ...form, requiredParticipants: e.target.value })} 
                required 
                min={1} 
                disabled={submitting}
                inputMode="numeric"
                placeholder="5"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Activity Type *</label>
              <select 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.activityType} 
                onChange={(e) => setForm({ ...form, activityType: e.target.value as 'whatsapp' | 'limited' })}
                disabled={submitting}
              >
                <option value="whatsapp">WhatsApp Group (Direct Join)</option>
                <option value="limited">Limited Members (Request to Join)</option>
              </select>
            </div>

            {form.activityType === 'limited' && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Max Participants *</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={form.maxParticipants} 
                  onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} 
                  required 
                  min={1} 
                  disabled={submitting}
                  inputMode="numeric"
                  placeholder="10"
                />
                <p className="text-xs text-slate-400 mt-1">Maximum number of people allowed</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Deadline <span className="text-slate-400 font-normal">(optional)</span></label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.deadline} 
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                placeholder="e.g. 30 June 2026"
                autoComplete="off"
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Contact Info <span className="text-slate-400 font-normal">(optional)</span></label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.contact} 
                onChange={(e) => setForm({ ...form, contact: e.target.value })} 
                placeholder="Email or phone number"
                autoComplete="off"
                disabled={submitting}
              />
              <p className="text-xs text-slate-400 mt-1">This will be displayed as contact info</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
                WhatsApp Group Link <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.whatsappLink} 
                onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })} 
                placeholder="https://chat.whatsapp.com/..."
                autoComplete="off"
                disabled={submitting}
              />
              <p className="text-xs text-slate-400 mt-1">
                Paste your WhatsApp group invite link here
              </p>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Status *</label>
              <select 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={submitting}
              >
                {['open', 'full', 'closed'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-3 sm:py-2 rounded-lg text-sm transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingActivity ? 'Update Activity' : 'Post Activity')}
              </button>
              <button 
                type="button" 
                onClick={cancelEdit}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-3 sm:py-2 rounded-lg text-sm transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      

      

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {activities.map((activity) => {
            const userStatus = getUserStatus(activity);
            const approvedCount = activity.participants?.filter(p => p.status === 'approved').length || 0;
            const isExpanded = expandedParticipants === activity._id;

            
            
            return (
              <div key={activity._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 flex-1">{activity.title}</h3>
                    <span className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      activity.status === 'open' ? 'bg-green-100 text-green-700' :
                      activity.status === 'full' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-3">{activity.description}</p>
                  
                  <div className="space-y-2 text-xs sm:text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span className="text-base sm:text-lg">👥</span> 
                      <span className="font-medium">
                        {activity.activityType === 'limited' 
                          ? `${approvedCount}/${activity.maxParticipants} participants` 
                          : `${activity.requiredParticipants} participant${activity.requiredParticipants !== 1 ? 's' : ''} needed`}
                      </span>
                    </div>
                    
                    {activity.activityType === 'limited' && activity.maxParticipants && (
                      <div className="text-xs text-green-600 font-medium ml-1 bg-green-50 px-2 py-1 rounded-full inline-block">
                        {activity.maxParticipants - approvedCount} spots available
                      </div>
                    )}
                    
                    {activity.deadline && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-base sm:text-lg">📅</span> 
                        <span className="text-xs sm:text-sm">Deadline: {activity.deadline}</span>
                      </div>
                    )}
                    
                    {activity.contact && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-base sm:text-lg">📬</span> 
                        <span className="text-xs sm:text-sm truncate">{activity.contact}</span>
                      </div>
                    )}
                    
                    {/* Creator Information */}
                    <div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mt-3 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors border border-blue-100"
                      onClick={() => handleViewUserProfile(activity.userId._id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full">Creator</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">{activity.userId?.name}</p>
                      {activity.userId?.phone ? (
                        <p className="text-xs text-blue-700 flex items-center gap-1 mt-1">
                          <span>📞</span> {formatPhoneNumber(activity.userId.phone)}
                        </p>
                      ) : (
                        <p className="text-xs text-blue-400 mt-1">No phone number</p>
                      )}
                      <p className="text-xs text-blue-600 mt-1 truncate">{activity.userId?.email}</p>
                    </div>

                    {/* Participants List */}
                    {activity.participants && activity.participants.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-slate-700">Participants ({activity.participants.filter(p => p.status === 'approved').length})</p>
                          {activity.participants.filter(p => p.status === 'approved').length > 3 && (
                            <button
                              onClick={() => setExpandedParticipants(isExpanded ? null : activity._id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              {isExpanded ? 'Show less' : 'View all'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {activity.participants
                            .filter(p => p.status === 'approved')
                            .slice(0, isExpanded ? undefined : 3)
                            .map((p, idx) => (
                              <div 
                                key={idx} 
                                className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleViewUserProfile(p.user._id)}
                              >
                                <p className="text-xs sm:text-sm font-medium text-slate-800">{p.user.name}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {user && activity.status === 'open' && (
                    <div className="mt-4">
                      {activity.activityType === 'whatsapp' && activity.whatsappLink && (
                        <button
                          onClick={() => joinWhatsAppGroup(activity.whatsappLink!)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-3 sm:py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                          </svg>
                          <span>Join WhatsApp Group</span>
                        </button>
                      )}

                      {activity.activityType === 'limited' && (
                        <>
                          {!userStatus && (
                            <button
                              onClick={() => requestToJoin(activity._id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 sm:py-2.5 rounded-lg text-sm transition-colors"
                              disabled={approvedCount >= (activity.maxParticipants || 0)}
                            >
                              {approvedCount >= (activity.maxParticipants || 0) 
                                ? 'Activity Full' 
                                : 'Request to Join'}
                            </button>
                          )}
                          
                          {userStatus?.type === 'participant' && (
                            <button
                              onClick={() => leaveActivity(activity._id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 sm:py-2.5 rounded-lg text-sm transition-colors"
                            >
                              Leave Activity
                            </button>
                          )}
                          
                          {userStatus?.type === 'requested' && (
                            <button
                              disabled
                              className="w-full bg-yellow-500 text-white font-medium px-4 py-3 sm:py-2.5 rounded-lg text-sm cursor-not-allowed"
                            >
                              Request Pending
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Edit/Delete buttons for creator/admin */}
                  {canModify(activity.userId._id) && (
                    <div className="flex gap-2 mt-4 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => startEdit(activity)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteActivity(activity._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          
          
          {activities.length === 0 && (
            <div className="col-span-full py-12 sm:py-16 text-center bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-slate-400 text-sm sm:text-base">No activities yet. Be the first to post!</p>
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
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
}