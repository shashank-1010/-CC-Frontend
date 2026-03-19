import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import UserProfileModal from '../components/UserProfileModal';
import api from '../api/api';

type Tab = 'items' | 'notes' | 'rides' | 'studygroups' | 'activities' | 'skills' | 'lostitems' | 'complaints';

interface User {
  _id: string;
  name: string;
  phone?: string;
  email: string;
  bio?: string;
  skills?: string[];
  achievements?: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  whatsapp?: string;
  status: string;
  type: 'sale' | 'rent';
  userId: User;
  createdAt: string;
}

interface Note {
  _id: string;
  title: string;
  subject: string;
  description: string;
  fileUrl?: string;
  status: string;
  userId: User;
  createdAt: string;
}

interface Ride {
  _id: string;
  from: string;
  to: string;
  rideTime: string;
  seats: number;
  price?: number;
  status: string;
  userId: User;
  passengers?: User[];
  createdAt: string;
}

interface StudyGroup {
  _id: string;
  subject: string;
  description: string;
  membersLimit: number;
  whatsappLink?: string;
  status: string;
  userId: User;
  members: User[];
  createdAt: string;
}

interface Activity {
  _id: string;
  title: string;
  description: string;
  requiredParticipants: number;
  location?: string;
  deadline?: string;
  participantsLimit?: number;
  contact?: string;
  whatsappLink?: string;
  activityType?: 'whatsapp' | 'limited';
  maxParticipants?: number;
  status: string;
  userId: User;
  participants?: Array<{
    user: User;
    joinedAt: string;
    status: string;
  }>;
  joinRequests?: Array<{
    user: User;
    requestedAt: string;
    message?: string;
  }>;
  createdAt: string;
}

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'expert';
  availability: 'available' | 'busy' | 'unavailable';
  whatsapp?: string;
  tags: string[];
  userId: User;
  views: number;
  createdAt: string;
}

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
  userId: User;
  createdAt: string;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: User;
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

// Remove Member Confirmation Modal
const RemoveMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Remove Member</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Are you sure you want to remove <span className="font-medium">{memberName}</span> from this group?
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:bg-slate-300"
            >
              {loading ? 'Removing...' : 'Remove'}
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

// Remove Participant Modal
const RemoveParticipantModal = ({
  isOpen,
  onClose,
  onConfirm,
  participantName,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  participantName: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Remove Participant</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Are you sure you want to remove <span className="font-medium">{participantName}</span> from this activity?
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:bg-slate-300"
            >
              {loading ? 'Removing...' : 'Remove'}
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

// ==================== FIXED EDIT PROFILE MODAL ====================
const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: any) => void;
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    skills: '',
    achievements: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        achievements: user.achievements?.join(', ') || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(s => s),
        achievements: form.achievements.split(',').map(a => a.trim()).filter(a => a)
      };

      const { data } = await api.put('/profile', payload);
      
      // ✅ FIX: Properly update localStorage with the returned user data
      // The response might be { user: updatedUser } or directly updatedUser
      const updatedUser = data.user || data;
      localStorage.setItem('cc_user', JSON.stringify(updatedUser));
      
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        onSave(updatedUser);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setToast({ message: error.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[70]" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Edit Profile</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {toast && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {toast.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Skills</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="JavaScript, React, Node.js (comma separated)"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Achievements</label>
              <input
                type="text"
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                placeholder="Hackathon Winner, 5⭐ coder (comma separated)"
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const tabs: { key: Tab; label: string }[] = [
  { key: 'items', label: 'My Items' },
  { key: 'notes', label: 'My Notes' },
  { key: 'skills', label: 'My Skills' },
  { key: 'rides', label: 'My Rides' },
  { key: 'studygroups', label: 'My Study Groups' },
  { key: 'activities', label: 'My Activities' },
  { key: 'lostitems', label: 'Lost & Found' },
  { key: 'complaints', label: 'My Complaints' },
];

const endpoints: Record<Tab, string> = {
  items: '/profile/items',
  notes: '/profile/notes',
  rides: '/profile/rides',
  studygroups: '/profile/studygroups',
  activities: '/profile/activities',
  skills: '/profile/skills',
  lostitems: '/profile/lost-items',
  complaints: '/complaints/my-complaints',
};

const routes: Record<Tab, string> = {
  items: 'marketplace',
  notes: 'notes',
  rides: 'rides',
  studygroups: 'studygroups',
  activities: 'activities',
  skills: 'skills',
  lostitems: 'lost-items',
  complaints: 'complaints',
};

const statusOptions: Record<Tab, string[]> = {
  items: ['available', 'reserved', 'sold', 'removed'],
  notes: ['public', 'archived'],
  rides: ['active', 'full', 'cancelled', 'completed'],
  studygroups: ['open', 'closed', 'completed'],
  activities: ['open', 'full', 'closed', 'cancelled'],
  skills: ['available', 'busy', 'unavailable'],
  lostitems: ['open', 'resolved', 'closed'],
  complaints: ['pending', 'in-progress', 'resolved', 'rejected'],
};

function getTitle(item: any, tab: Tab): string {
  if (tab === 'items') return item.title;
  if (tab === 'notes') return `${item.title} — ${item.subject}`;
  if (tab === 'rides') return `${item.from} → ${item.to}`;
  if (tab === 'studygroups') return item.subject;
  if (tab === 'activities') return item.title;
  if (tab === 'skills') return item.title;
  if (tab === 'lostitems') {
    const emoji = item.category === 'lost' ? '🔴' : '🟢';
    return `${emoji} ${item.title}`;
  }
  if (tab === 'complaints') {
    const priorityEmoji = 
      item.priority === 'urgent' ? '🔴' :
      item.priority === 'high' ? '🟠' :
      item.priority === 'medium' ? '🟡' : '🟢';
    return `${priorityEmoji} ${item.title}`;
  }
  return '';
}

// ==================== FIXED getMeta FUNCTION ====================
function getMeta(item: any, tab: Tab): string {
  if (tab === 'items') return `₹${item.price}`;
  if (tab === 'notes') return item.subject;
  if (tab === 'rides') {
    const date = new Date(item.rideTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${item.seats} seats`;
  }
  if (tab === 'studygroups') {
    // ✅ FIX: Ensure members is an array and count correctly
    const members = Array.isArray(item.members) ? item.members : [];
    const memberCount = members.length;
    return `👥 ${memberCount}/${item.membersLimit || 0}`;
  }
  if (tab === 'activities') {
    if (item.activityType === 'limited' && item.maxParticipants) {
      const approvedCount = item.participants?.filter((p: any) => p.status === 'approved').length || 0;
      return `👥 ${approvedCount}/${item.maxParticipants}`;
    }
    if (item.requiredParticipants) {
      return `👥 ${item.requiredParticipants} needed`;
    }
    return item.deadline ? `📅 ${new Date(item.deadline).toLocaleDateString()}` : '';
  }
  if (tab === 'skills') {
    return `${item.category} • ${item.proficiencyLevel}`;
  }
  if (tab === 'lostitems') {
    return `${item.itemType} • ${item.location}`;
  }
  if (tab === 'complaints') {
    return `${item.category} • ${item.location}`;
  }
  return '';
}

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    return `+91 ${cleanNumber}`;
  }
  return phone;
};

// Complaint Status Badge Component
const ComplaintStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor()}`}>
      {status}
    </span>
  );
};

// Complaint Priority Badge Component
const ComplaintPriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = () => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor()}`}>
      {priority}
    </span>
  );
};

// Skill Proficiency Badge Component
const SkillProficiencyBadge = ({ level }: { level: string }) => {
  const getColor = () => {
    switch(level) {
      case 'expert': return 'bg-purple-100 text-purple-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'beginner': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${getColor()}`}>
      {level}
    </span>
  );
};

// Skill Availability Badge
const SkillAvailabilityBadge = ({ availability }: { availability: string }) => {
  const getColor = () => {
    switch(availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${getColor()}`}>
      {availability}
    </span>
  );
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('items');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Edit states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Modal states
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersTitle, setMembersTitle] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string; groupId: string } | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  
  // Participant removal states
  const [showRemoveParticipantModal, setShowRemoveParticipantModal] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string; activityId: string } | null>(null);
  const [removingParticipant, setRemovingParticipant] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Complaint modal states
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('cc_user') || 'null');
    setUser(userData);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get(endpoints[tab]);
      
      if (tab === 'complaints') {
        setData(d.complaints || []);
      } else {
        setData(d);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      showToast(error.response?.data?.message || 'Failed to load data', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [tab]);

  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  // Complaint Details Modal
  const ComplaintDetailsModal = () => {
    if (!selectedComplaint) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setShowComplaintModal(false)}>
        <div className="bg-white rounded-t-xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Complaint Details</h2>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">{selectedComplaint.title}</h3>
                <div className="flex gap-2 mb-3">
                  <ComplaintStatusBadge status={selectedComplaint.status} />
                  <ComplaintPriorityBadge priority={selectedComplaint.priority} />
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Description</p>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Category</p>
                  <p className="text-xs sm:text-sm text-slate-800 capitalize">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Location</p>
                  <p className="text-xs sm:text-sm text-slate-800">{selectedComplaint.location}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Submitted</p>
                  <p className="text-xs sm:text-sm text-slate-800">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Updated</p>
                  <p className="text-xs sm:text-sm text-slate-800">{selectedComplaint.timeElapsed || 'Just now'}</p>
                </div>
              </div>

              {selectedComplaint.imageUrl && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-2">Attachment</p>
                  <img 
                    src={selectedComplaint.imageUrl} 
                    alt="Complaint" 
                    className="max-h-40 sm:max-h-48 rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {selectedComplaint.adminRemarks && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">Admin Response</p>
                  <p className="text-xs sm:text-sm text-blue-700">{selectedComplaint.adminRemarks}</p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-[10px] sm:text-xs text-blue-500 mt-2">
                      Resolved: {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Start editing an item
  const startEdit = (item: any) => {
    setEditingItem(item);
    
    if (tab === 'items') {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        price: item.price || '',
        type: item.type || 'sale',
        status: item.status || 'available',
        imageUrl: item.imageUrl || '',
        whatsapp: item.whatsapp || ''
      });
      setPreviewUrl(item.imageUrl || null);
    }
    else if (tab === 'notes') {
      setEditForm({
        title: item.title || '',
        subject: item.subject || '',
        description: item.description || '',
        fileUrl: item.fileUrl || '',
        status: item.status || 'public'
      });
    }
    else if (tab === 'rides') {
      setEditForm({
        from: item.from || '',
        to: item.to || '',
        rideTime: item.rideTime ? item.rideTime.slice(0, 16) : '',
        seats: item.seats || '',
        price: item.price || '',
        status: item.status || 'active'
      });
    }
    else if (tab === 'studygroups') {
      setEditForm({
        subject: item.subject || '',
        description: item.description || '',
        membersLimit: item.membersLimit || '',
        whatsappLink: item.whatsappLink || '',
        status: item.status || 'open'
      });
    }
    else if (tab === 'activities') {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        requiredParticipants: item.requiredParticipants || '',
        location: item.location || '',
        deadline: item.deadline ? item.deadline.slice(0, 16) : '',
        participantsLimit: item.participantsLimit || '',
        contact: item.contact || '',
        whatsappLink: item.whatsappLink || '',
        activityType: item.activityType || 'whatsapp',
        maxParticipants: item.maxParticipants || '',
        status: item.status || 'open'
      });
    }
    else if (tab === 'skills') {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        proficiencyLevel: item.proficiencyLevel || 'intermediate',
        availability: item.availability || 'available',
        whatsapp: item.whatsapp || '',
        tags: item.tags?.join(', ') || ''
      });
    }
    else if (tab === 'lostitems') {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'lost',
        itemType: item.itemType || '',
        location: item.location || '',
        date: item.date ? item.date.slice(0, 16) : '',
        contactName: item.contactName || '',
        contactPhone: item.contactPhone || '',
        contactEmail: item.contactEmail || '',
        imageUrl: item.imageUrl || '',
        status: item.status || 'open'
      });
      setPreviewUrl(item.imageUrl || null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
    setPreviewUrl(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value ? parseInt(value) : '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditForm((prev: any) => ({ ...prev, imageUrl: data.imageUrl }));
      showToast('Image uploaded!', 'success');
    } catch (error: any) {
      console.error('Upload failed:', error);
      showToast(error.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      let payload = { ...editForm };
      
      if (tab === 'items') {
        payload.price = parseFloat(payload.price) || 0;
      } else if (tab === 'rides') {
        payload.seats = parseInt(payload.seats) || 1;
        if (payload.price) payload.price = parseFloat(payload.price);
        if (payload.rideTime) payload.rideTime = new Date(payload.rideTime).toISOString();
      } else if (tab === 'studygroups') {
        payload.membersLimit = parseInt(payload.membersLimit) || 2;
      } else if (tab === 'activities') {
        if (payload.requiredParticipants) {
          payload.requiredParticipants = parseInt(payload.requiredParticipants);
        }
        if (payload.participantsLimit) {
          payload.participantsLimit = parseInt(payload.participantsLimit);
        }
        if (payload.maxParticipants) {
          payload.maxParticipants = parseInt(payload.maxParticipants);
        }
        if (payload.deadline) {
          payload.deadline = new Date(payload.deadline).toISOString();
        }
      } else if (tab === 'skills') {
        if (payload.tags) {
          payload.tags = payload.tags.split(',').map((t: string) => t.trim());
        }
      } else if (tab === 'lostitems') {
        if (payload.date) {
          payload.date = new Date(payload.date).toISOString();
        }
      }

      await api.put(`/${routes[tab]}/${editingItem._id}`, payload);
      
      showToast('Updated successfully!', 'success');
      cancelEdit();
      await load();
      
    } catch (error: any) {
      console.error('Update failed:', error);
      showToast(error.response?.data?.message || error.response?.data?.error || 'Failed to update', 'error');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/${routes[tab]}/${id}`);
      showToast('Deleted successfully', 'success');
      await load();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      showToast(error.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const viewAllMembers = (members: User[], title: string) => {
    setSelectedMembers(members);
    setMembersTitle(title);
    setShowMembersModal(true);
  };

  const removeMember = async () => {
    if (!memberToRemove) return;
    
    setRemovingMember(true);
    try {
      await api.delete(`/studygroups/${memberToRemove.groupId}/members/${memberToRemove.id}`);
      showToast(`Removed ${memberToRemove.name} from group`, 'success');
      await load();
      setShowRemoveModal(false);
      setMemberToRemove(null);
    } catch (error: any) {
      console.error('Remove failed:', error);
      showToast(error.response?.data?.message || 'Failed to remove member', 'error');
    } finally {
      setRemovingMember(false);
    }
  };

  const removeParticipant = async () => {
    if (!participantToRemove) return;
    
    setRemovingParticipant(true);
    try {
      await api.delete(`/activities/${participantToRemove.activityId}/participants/${participantToRemove.id}`);
      showToast(`Removed ${participantToRemove.name} from activity`, 'success');
      await load();
      setShowRemoveParticipantModal(false);
      setParticipantToRemove(null);
    } catch (error: any) {
      console.error('Remove failed:', error);
      showToast(error.response?.data?.message || 'Failed to remove participant', 'error');
    } finally {
      setRemovingParticipant(false);
    }
  };

  const acceptRequest = async (activityId: string, userId: string) => {
    try {
      await api.post(`/activities/${activityId}/accept/${userId}`);
      showToast('Request accepted successfully!', 'success');
      await load();
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      showToast(error.response?.data?.message || 'Failed to accept request', 'error');
    }
  };

  const declineRequest = async (activityId: string, userId: string) => {
    try {
      await api.post(`/activities/${activityId}/decline/${userId}`);
      showToast('Request declined', 'success');
      await load();
    } catch (error: any) {
      console.error('Failed to decline request:', error);
      showToast(error.response?.data?.message || 'Failed to decline request', 'error');
    }
  };

  const markResolved = async (itemId: string) => {
    try {
      await api.put(`/lost-items/${itemId}/resolve`);
      showToast('Item marked as resolved!', 'success');
      await load();
    } catch (error: any) {
      console.error('Failed to mark resolved:', error);
      showToast(error.response?.data?.message || 'Failed to mark resolved', 'error');
    }
  };

  const isUserCreator = (group: StudyGroup) => {
    return user && group.userId?._id === user._id;
  };

  const isActivityCreator = (activity: Activity) => {
    return user && activity.userId?._id === user._id;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const canRemoveMember = (group: StudyGroup) => {
    return user && (isAdmin() || isUserCreator(group));
  };

  const canRemoveParticipant = (activity: Activity) => {
    return user && (isAdmin() || isActivityCreator(activity));
  };

  const handleViewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  // Members Modal
  const MembersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setShowMembersModal(false)}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">{membersTitle}</h3>
            <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedMembers.map((member) => {
              const group = data.find((g: StudyGroup) => 
                g.members?.some((m: User) => m._id === member._id)
              ) as StudyGroup | undefined;
              
              const canRemove = group && canRemoveMember(group) && member._id !== user?._id && member._id !== group.userId?._id;

              return (
                <div 
                  key={member._id} 
                  className="bg-slate-50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleViewUserProfile(member._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{member.name}</p>
                      {member.phone ? (
                        <p className="text-xs text-slate-600 mt-1">📞 {formatPhoneNumber(member.phone)}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">No phone</p>
                      )}
                    </div>
                    {canRemove && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemberToRemove({
                            id: member._id,
                            name: member.name,
                            groupId: group!._id
                          });
                          setShowRemoveModal(true);
                          setShowMembersModal(false);
                        }}
                        className="text-red-600 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== FIXED getExtraInfo FUNCTION ====================
  const getExtraInfo = (item: any, tab: Tab, onViewAll?: (members: User[], title: string) => void): React.ReactNode => {
    if (tab === 'studygroups') {
      // ✅ FIX: Ensure members is an array
      const members = Array.isArray(item.members) ? item.members : [];
      const creator = item.userId;
      const canRemove = canRemoveMember(item);
      
      return (
        <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          {/* Creator Info - Click to view profile */}
          <div 
            className="bg-blue-50 rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUserProfile(creator._id);
            }}
          >
            <p className="text-[10px] sm:text-xs font-semibold text-blue-800 mb-1">👑 Creator</p>
            <p className="text-xs sm:text-sm font-medium text-blue-900">{creator.name}</p>
            {creator.phone && <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5">📞 {formatPhoneNumber(creator.phone)}</p>}
          </div>

          {/* WhatsApp Link */}
          {item.whatsappLink && (
            <div className="bg-green-50 rounded-lg p-2 sm:p-3">
              <a
                href={item.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 text-xs sm:text-sm flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                </svg>
                WhatsApp Group
              </a>
            </div>
          )}

          {/* Members List */}
          {members.length > 0 ? (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                👥 Members ({members.length}/{item.membersLimit || 0})
              </p>
              <div className="space-y-1.5">
                {members.slice(0, 2).map((member: User) => (
                  <div 
                    key={member._id} 
                    className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewUserProfile(member._id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800">{member.name}</p>
                        {member.phone && (
                          <p className="text-[10px] text-slate-600 mt-0.5">📞 {formatPhoneNumber(member.phone)}</p>
                        )}
                      </div>
                      {/* ✅ Remove button - Only for creator/admin and not for creator themselves */}
                      {canRemove && member._id !== user?._id && member._id !== creator?._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMemberToRemove({
                              id: member._id,
                              name: member.name,
                              groupId: item._id
                            });
                            setShowRemoveModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg ml-2"
                          title="Remove member"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {members.length > 2 && (
                  <button
                    onClick={() => onViewAll?.(members, 'All Members')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-1.5 bg-blue-50 rounded-lg"
                  >
                    +{members.length - 2} more
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No members yet</p>
          )}
        </div>
      );
    }

    if (tab === 'rides') {
      return (
        <div className="mt-2 sm:mt-3 space-y-2">
          {item.passengers && item.passengers.length > 0 && (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                👥 Passengers ({item.passengers.length}/{item.seats})
              </p>
              <div className="space-y-1.5">
                {item.passengers.slice(0, 2).map((passenger: User) => (
                  <div 
                    key={passenger._id} 
                    className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewUserProfile(passenger._id);
                    }}
                  >
                    <p className="text-xs font-medium text-slate-800">{passenger.name}</p>
                  </div>
                ))}
                {item.passengers.length > 2 && (
                  <button
                    onClick={() => onViewAll?.(item.passengers, 'All Passengers')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-1.5 bg-blue-50 rounded-lg"
                  >
                    +{item.passengers.length - 2} more
                  </button>
                )}
              </div>
            </div>
          )}

          {item.price && (
            <p className="text-xs text-slate-600">💰 ₹{item.price} per seat</p>
          )}
        </div>
      );
    }

    if (tab === 'activities') {
      const participants = item.participants?.filter((p: any) => p.status === 'approved') || [];
      const pendingRequests = item.joinRequests || [];
      const isCreator = user && item.userId._id === user._id;
      const canManage = isCreator || isAdmin();
      const approvedCount = participants.length;
      const totalSpots = item.maxParticipants || 0;
      const spotsLeft = totalSpots - approvedCount;
      
      return (
        <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          <div 
            className="bg-blue-50 rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUserProfile(item.userId._id);
            }}
          >
            <p className="text-[10px] sm:text-xs font-semibold text-blue-800 mb-1">👤 Creator</p>
            <p className="text-xs sm:text-sm font-medium text-blue-900">{item.userId?.name}</p>
          </div>

          {item.requiredParticipants && (
            <p className="text-xs sm:text-sm text-slate-600">
              {item.activityType === 'limited' && item.maxParticipants
                ? `${approvedCount}/${item.maxParticipants} joined (${spotsLeft} left)`
                : `${item.requiredParticipants} needed`}
            </p>
          )}

          {canManage && pendingRequests.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs font-semibold text-yellow-800 mb-2">
                ⏳ Join Requests ({pendingRequests.length})
              </p>
              <div className="space-y-2">
                {pendingRequests.slice(0, 2).map((request: any) => (
                  <div key={request.user._id} className="bg-white rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer hover:opacity-80"
                        onClick={() => handleViewUserProfile(request.user._id)}
                      >
                        <p className="text-xs font-medium text-slate-800">{request.user.name}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptRequest(item._id, request.user._id);
                          }}
                          disabled={spotsLeft <= 0}
                          className={`px-2 py-1 rounded text-[10px] font-medium ${
                            spotsLeft > 0
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title="Accept request"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            declineRequest(item._id, request.user._id);
                          }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-medium hover:bg-red-200"
                          title="Decline request"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length > 2 && (
                  <p className="text-[10px] text-yellow-700">+{pendingRequests.length - 2} more requests</p>
                )}
              </div>
            </div>
          )}

          {participants.length > 0 && (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                👥 Participants ({participants.length})
              </p>
              <div className="space-y-1.5">
                {participants.slice(0, 2).map((p: any) => (
                  <div 
                    key={p.user._id}
                    className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleViewUserProfile(p.user._id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-800">{p.user.name}</p>
                      {canManage && p.user._id !== user?._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setParticipantToRemove({
                              id: p.user._id,
                              name: p.user.name,
                              activityId: item._id
                            });
                            setShowRemoveParticipantModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Remove participant"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {participants.length > 2 && (
                  <button
                    onClick={() => onViewAll?.(participants.map((p: any) => p.user), 'All Participants')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-1.5 bg-blue-50 rounded-lg"
                  >
                    +{participants.length - 2} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'skills') {
      return (
        <div className="mt-2 sm:mt-3 space-y-2">
          <div className="flex gap-1 flex-wrap">
            <SkillProficiencyBadge level={item.proficiencyLevel} />
            <SkillAvailabilityBadge availability={item.availability} />
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div 
            className="bg-blue-50 rounded-lg p-2 cursor-pointer hover:bg-blue-100"
            onClick={() => handleViewUserProfile(item.userId._id)}
          >
            <p className="text-xs font-medium text-blue-900">👤 {item.userId.name}</p>
          </div>

          {(item.whatsapp || item.userId?.whatsapp) && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/${item.whatsapp || item.userId.whatsapp}`, '_blank');
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 rounded-lg"
              >
                WhatsApp
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:+91${item.whatsapp || item.userId.whatsapp}`, '_blank');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 rounded-lg"
              >
                Call
              </button>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'lostitems') {
      return (
        <div className="mt-2 sm:mt-3 space-y-2">
          <div className={`rounded-lg p-2 text-center text-xs font-medium ${
            item.category === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {item.category === 'lost' ? 'Lost' : 'Found'}
          </div>

          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs font-medium text-blue-900">{item.contactName}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">📞 {formatPhoneNumber(item.contactPhone)}</p>
          </div>

          <div className={`rounded-lg p-2 text-center text-xs font-medium ${
            item.status === 'open' ? 'bg-green-100 text-green-700' :
            item.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {item.status}
          </div>

          {item.status === 'open' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markResolved(item._id);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Mark Resolved
            </button>
          )}
        </div>
      );
    }

    if (tab === 'complaints') {
      return (
        <div className="mt-2 sm:mt-3 space-y-2">
          <div className="flex gap-1">
            <ComplaintStatusBadge status={item.status} />
            <ComplaintPriorityBadge priority={item.priority} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              viewComplaintDetails(item);
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            View Details
          </button>
        </div>
      );
    }

    return null;
  };

  const renderEditForm = () => {
    if (!editingItem) return null;
    if (tab === 'complaints') return null;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg">
          Edit {tab === 'items' ? 'Item' : 
               tab === 'notes' ? 'Note' : 
               tab === 'rides' ? 'Ride' : 
               tab === 'studygroups' ? 'Study Group' : 
               tab === 'activities' ? 'Activity' : 
               tab === 'skills' ? 'Skill' : 'Lost/Found Item'}
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tab === 'items' && (
              <>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="title"
                    value={editForm.title || ''}
                    onChange={handleInputChange}
                    placeholder="Title"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    name="price"
                    value={editForm.price || ''}
                    onChange={handleNumberChange}
                    placeholder="Price (₹)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="type"
                    value={editForm.type || 'sale'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
                <div>
                  <select 
                    name="status"
                    value={editForm.status || 'available'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {statusOptions.items.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input 
                    type="text"
                    name="whatsapp"
                    value={editForm.whatsapp || ''}
                    onChange={handleInputChange}
                    placeholder="WhatsApp"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {tab === 'rides' && (
              <>
                <div>
                  <input 
                    type="text"
                    name="from"
                    value={editForm.from || ''}
                    onChange={handleInputChange}
                    placeholder="From"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="to"
                    value={editForm.to || ''}
                    onChange={handleInputChange}
                    placeholder="To"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="datetime-local"
                    name="rideTime"
                    value={editForm.rideTime || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    name="seats"
                    value={editForm.seats || ''}
                    onChange={handleNumberChange}
                    placeholder="Available Seats"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    name="price"
                    value={editForm.price || ''}
                    onChange={handleNumberChange}
                    placeholder="Price per seat (₹)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="status"
                    value={editForm.status || 'active'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {statusOptions.rides.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === 'studygroups' && (
              <>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="subject"
                    value={editForm.subject || ''}
                    onChange={handleInputChange}
                    placeholder="Subject"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    name="membersLimit"
                    value={editForm.membersLimit || ''}
                    onChange={handleNumberChange}
                    placeholder="Members Limit"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="whatsappLink"
                    value={editForm.whatsappLink || ''}
                    onChange={handleInputChange}
                    placeholder="WhatsApp Group Link"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="status"
                    value={editForm.status || 'open'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {statusOptions.studygroups.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === 'activities' && (
              <>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="title"
                    value={editForm.title || ''}
                    onChange={handleInputChange}
                    placeholder="Activity Title"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="location"
                    value={editForm.location || ''}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="datetime-local"
                    name="deadline"
                    value={editForm.deadline || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="number"
                    name="requiredParticipants"
                    value={editForm.requiredParticipants || ''}
                    onChange={handleNumberChange}
                    placeholder="Required Participants"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="activityType"
                    value={editForm.activityType || 'whatsapp'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="whatsapp">WhatsApp Group</option>
                    <option value="limited">Limited Participants</option>
                  </select>
                </div>
                {editForm.activityType === 'limited' && (
                  <div>
                    <input 
                      type="number"
                      name="maxParticipants"
                      value={editForm.maxParticipants || ''}
                      onChange={handleNumberChange}
                      placeholder="Max Participants"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <input 
                    type="text"
                    name="whatsappLink"
                    value={editForm.whatsappLink || ''}
                    onChange={handleInputChange}
                    placeholder="WhatsApp Group Link"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="contact"
                    value={editForm.contact || ''}
                    onChange={handleInputChange}
                    placeholder="Contact Info"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="status"
                    value={editForm.status || 'open'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    {statusOptions.activities.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === 'skills' && (
              <>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="title"
                    value={editForm.title || ''}
                    onChange={handleInputChange}
                    placeholder="Skill Title"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="category"
                    value={editForm.category || ''}
                    onChange={handleInputChange}
                    placeholder="Category"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="proficiencyLevel"
                    value={editForm.proficiencyLevel || 'intermediate'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <select 
                    name="availability"
                    value={editForm.availability || 'available'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="text"
                    name="whatsapp"
                    value={editForm.whatsapp || ''}
                    onChange={handleInputChange}
                    placeholder="WhatsApp"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="tags"
                    value={editForm.tags || ''}
                    onChange={handleInputChange}
                    placeholder="Tags (comma separated)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {tab === 'lostitems' && (
              <>
                <div className="md:col-span-2">
                  <input 
                    type="text"
                    name="title"
                    value={editForm.title || ''}
                    onChange={handleInputChange}
                    placeholder="Title"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <select 
                    name="category"
                    value={editForm.category || 'lost'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="text"
                    name="itemType"
                    value={editForm.itemType || ''}
                    onChange={handleInputChange}
                    placeholder="Item Type"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="location"
                    value={editForm.location || ''}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="datetime-local"
                    name="date"
                    value={editForm.date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="contactName"
                    value={editForm.contactName || ''}
                    onChange={handleInputChange}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    name="contactPhone"
                    value={editForm.contactPhone || ''}
                    onChange={handleInputChange}
                    placeholder="Contact Phone"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="email"
                    name="contactEmail"
                    value={editForm.contactEmail || ''}
                    onChange={handleInputChange}
                    placeholder="Contact Email (optional)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <select 
                    name="status"
                    value={editForm.status || 'open'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={saveEdit}
              disabled={uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg text-xs transition-colors"
            >
              {uploading ? 'Uploading...' : 'Save'}
            </button>
            <button 
              onClick={cancelEdit}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account and posts">
      <div className="max-w-4xl space-y-4 sm:space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

        <RemoveMemberModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setMemberToRemove(null);
          }}
          onConfirm={removeMember}
          memberName={memberToRemove?.name || ''}
          loading={removingMember}
        />

        <RemoveParticipantModal
          isOpen={showRemoveParticipantModal}
          onClose={() => {
            setShowRemoveParticipantModal(false);
            setParticipantToRemove(null);
          }}
          onConfirm={removeParticipant}
          participantName={participantToRemove?.name || ''}
          loading={removingParticipant}
        />

        {showComplaintModal && <ComplaintDetailsModal />}

        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          user={user}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            showToast('Profile updated successfully!', 'success');
          }}
        />

        <ProfileHeader
          name={user?.name}
          phone={user?.phone}
          role={user?.role}
          createdAt={user?.createdAt}
          onEdit={() => setShowEditProfile(true)}
        />

       <div className="relative">
  {/* Desktop View - Full Width */}
  <div className="hidden md:block border-b border-slate-200">
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => {
            setTab(t.key);
            cancelEdit();
          }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            tab === t.key 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  </div>

  {/* Mobile View - Scrollable */}
  <div className="md:hidden">
    <div className="overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl min-w-max">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              cancelEdit();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.key 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>

        {showMembersModal && <MembersModal />}
        {renderEditForm()}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 sm:h-40 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map((item) => (
              <PostCard
                key={item._id}
                title={getTitle(item, tab)}
                status={item.status}
                meta={<p className="text-xs sm:text-sm">{getMeta(item, tab)}</p>}
                extra={getExtraInfo(item, tab, viewAllMembers)}
                onEdit={tab !== 'complaints' ? () => startEdit(item) : undefined}
                onDelete={tab !== 'complaints' ? () => deleteItem(item._id) : undefined}
              />
            ))}
            {data.length === 0 && (
              <p className="col-span-full text-center text-slate-400 py-8 sm:py-12 text-xs sm:text-sm">
                Nothing here yet.
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </DashboardLayout>
  );
}