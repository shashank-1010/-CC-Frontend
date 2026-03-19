import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostCard from '../components/PostCard';
import api from '../api/api';

interface User {
  _id: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface StudyGroup {
  _id: string;
  subject: string;
  description: string;
  membersLimit: number;
  status: string;
  userId: User;
  members: User[];
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

export default function StudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', membersLimit: '', status: 'open' });
  const [editGroup, setEditGroup] = useState<StudyGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const load = async () => {
    try {
      let url = '/studygroups';
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterSubject) params.append('subject', filterSubject);
      if (params.toString()) url += '?' + params.toString();
      
      const { data } = await api.get(url);
      console.log('Loaded groups:', data);
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
      showToast('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [filterStatus, filterSubject]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, membersLimit: parseInt(form.membersLimit) };
    try {
      if (editGroup) {
        await api.put(`/studygroups/${editGroup._id}`, payload);
        showToast('Group updated successfully!', 'success');
      } else {
        await api.post('/studygroups', payload);
        showToast('Group created successfully!', 'success');
      }
      
      setForm({ subject: '', description: '', membersLimit: '', status: 'open' });
      setShowForm(false);
      setEditGroup(null);
      load();
      
      // Scroll to top after form submission
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Submit failed:', error);
      showToast(error.response?.data?.message || 'Failed to save group', 'error');
    }
  };

  const startEdit = (g: StudyGroup) => {
    setEditGroup(g);
    setForm({ 
      subject: g.subject, 
      description: g.description, 
      membersLimit: String(g.membersLimit), 
      status: g.status 
    });
    setShowForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Delete this study group?')) return;
    try {
      await api.delete(`/studygroups/${id}`);
      showToast('Group deleted successfully', 'success');
      load();
    } catch (error: any) {
      console.error('Delete failed:', error);
      showToast(error.response?.data?.message || 'Failed to delete group', 'error');
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) {
      showToast('Please login to join group', 'info');
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/studygroups/${groupId}/join`);
      showToast(response.data.message || 'Successfully joined the group!', 'success');
      load();
      setShowGroupModal(false);
    } catch (error: any) {
      console.error('Join failed:', error);
      showToast(error.response?.data?.message || 'Failed to join group', 'error');
    } finally {
      setJoining(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const response = await api.post(`/studygroups/${groupId}/leave`);
      showToast(response.data.message || 'You have left the group', 'success');
      load();
      setSelectedGroup(null);
      setShowGroupModal(false);
    } catch (error: any) {
      console.error('Leave failed:', error);
      showToast(error.response?.data?.message || 'Failed to leave group', 'error');
    }
  };

  const isUserMember = (group: StudyGroup) => {
    return group.members?.some(m => m._id === user?._id);
  };

  const isUserCreator = (group: StudyGroup) => {
    return group.userId?._id === user?._id;
  };

  const handleCardClick = (group: StudyGroup) => {
    console.log('Selected group:', group);
    setSelectedGroup(group);
    setShowGroupModal(true);
  };

  const openWhatsApp = (phone: string, name: string, groupSubject: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`Hi ${name}, I'm from your study group "${groupSubject}"`);
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  const makePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.length === 10) {
      return `+91 ${cleanNumber}`;
    }
    return phone;
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
          Filter Groups
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
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Search by subject..."
              className="w-full text-sm py-2.5 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setIsFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const GroupModal = () => {
    if (!selectedGroup) return null;

    const isMember = isUserMember(selectedGroup);
    const isCreator = isUserCreator(selectedGroup);
    const memberCount = selectedGroup.members?.length || 0;
    const availableSpots = selectedGroup.membersLimit - memberCount;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" 
        onClick={() => setShowGroupModal(false)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-semibold text-slate-800">{selectedGroup.subject}</h3>
                <p className="text-sm text-slate-500 mt-1">Created by {selectedGroup.userId?.name}</p>
              </div>
              <button 
                onClick={() => setShowGroupModal(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700">{selectedGroup.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {memberCount}/{selectedGroup.membersLimit}
                </span>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedGroup.status === 'open' ? 'bg-green-100 text-green-700' :
                  selectedGroup.status === 'closed' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedGroup.status}
                </span>

                {availableSpots > 0 && selectedGroup.status === 'open' && (
                  <span className="text-green-600 text-sm font-medium">{availableSpots} spots left</span>
                )}
                {availableSpots === 0 && selectedGroup.status === 'open' && (
                  <span className="text-red-600 text-sm font-medium">Group Full</span>
                )}
              </div>
            </div>

            {user && !isCreator && (
              <div className="mb-4">
                {isMember ? (
                  <button
                    onClick={() => leaveGroup(selectedGroup._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => joinGroup(selectedGroup._id)}
                    disabled={joining || selectedGroup.status !== 'open' || availableSpots === 0}
                    className={`w-full font-medium px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      joining || selectedGroup.status !== 'open' || availableSpots === 0
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {joining ? 'Joining...' : 
                     selectedGroup.status !== 'open' ? 'Group Closed' :
                     availableSpots === 0 ? 'Group Full' : 
                     'Join Group'}
                  </button>
                )}
              </div>
            )}

            

            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Members ({memberCount})
              </h4>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {/* Creator */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">{selectedGroup.userId?.name}</p>
                      {selectedGroup.userId?.phone ? (
                        <p className="text-xs text-blue-600 mt-1">📞 {formatPhoneNumber(selectedGroup.userId.phone)}</p>
                      ) : (
                        <p className="text-xs text-blue-400 mt-1">No phone number</p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Creator</span>
                  </div>
                  {selectedGroup.userId?.phone && isMember && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => openWhatsApp(selectedGroup.userId.phone!, selectedGroup.userId.name, selectedGroup.subject)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => makePhoneCall(selectedGroup.userId.phone!)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </button>
                    </div>
                  )}
                </div>

                {/* Other Members */}
                {selectedGroup.members
                  ?.filter(m => m._id !== selectedGroup.userId?._id)
                  .map((member) => (
                    <div key={member._id} className="bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-slate-800">{member.name}</p>
                        {member.phone ? (
                          <p className="text-xs text-slate-600 mt-1">📞 {formatPhoneNumber(member.phone)}</p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">No phone number</p>
                        )}
                      </div>
                      {member.phone && isMember && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => openWhatsApp(member.phone!, member.name, selectedGroup.subject)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                            </svg>
                            WhatsApp
                          </button>
                          <button
                            onClick={() => makePhoneCall(member.phone!)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {memberCount === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">No members yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  

  return (

    <DashboardLayout
      title="Study Groups"
      subtitle="Create or join a study group with fellow students"
      action={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Desktop Filters */}
          <div className="hidden sm:flex gap-3 items-center">
            <select
              className="w-32 text-sm py-1.5 border border-slate-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
            <input
              type="text"
              placeholder="Search subject..."
              className="w-40 text-sm py-1.5 border border-slate-300 rounded-lg px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => { 
              setShowForm(!showForm); 
              setEditGroup(null); 
              setForm({ subject: '', description: '', membersLimit: '', status: 'open' });
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
            {showForm ? 'Cancel' : 'Create Group'}
          </button>
        </div>
      }
    >

      {/* About Study Groups - Simple & Professional */}
<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-800 mb-1">About Study Groups</h3>
      <p className="text-sm text-gray-600">
        Learn better together. Join or create study groups for your courses, 
        prepare for exams, and help each other understand difficult topics.
      </p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>✓ Collaborative learning</span>
        <span>✓ Clear doubts faster</span>
        <span>✓ Stay motivated</span>
      </div>
    </div>
  </div>
</div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile Filter */}
      <MobileFilter />

      {/* Form - Always at the top when visible */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {editGroup ? 'Edit Group' : 'Create Study Group'}
          </h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Subject/Course *</label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.subject} 
                onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                required 
                placeholder="e.g. Mathematics 101"
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
                placeholder="Describe your study group..."
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Members Limit *</label>
              <input 
                type="number" 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.membersLimit} 
                onChange={(e) => setForm({ ...form, membersLimit: e.target.value })} 
                required 
                min={2} 
                max={50}
                inputMode="numeric"
                placeholder="5"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 2 members required</p>
            </div>
            
            <div>
      *-        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Status *</label>
              <select 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="open">Open for joining</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 sm:py-2 rounded-lg text-sm transition-colors"
              >
                {editGroup ? 'Update Group' : 'Create Group'}
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setShowForm(false); 
                  setEditGroup(null); 
                }} 
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-3 sm:py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      

      {showGroupModal && <GroupModal />}

      

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 sm:h-52 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {groups.map((g) => {
            const memberCount = g.members?.length || 0;
            const isMember = user && g.members?.some(m => m._id === user._id);
            const availableSpots = g.membersLimit - memberCount;
            const isFull = memberCount >= g.membersLimit;
            
            return (
              <div key={g._id} onClick={() => handleCardClick(g)} className="cursor-pointer">
                <PostCard
                  title={g.subject}
                  description={g.description}
                  status={g.status}
                  meta={
                    <div className="space-y-1">
                      <p className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">👥 {memberCount}/{g.membersLimit}</span>
                        {availableSpots > 0 && g.status === 'open' && !isFull && (
                          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">{availableSpots} left</span>
                        )}
                        {isFull && g.status === 'open' && (
                          <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full">Full</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 truncate">By {g.userId?.name}</p>
                      {isMember && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
                          Member
                        </span>
                      )}
                    </div>
                  }
                  onEdit={user && (String(g.userId?._id) === user._id || user.role === 'admin') ? () => startEdit(g) : undefined}
                  onDelete={user && (String(g.userId?._id) === user._id || user.role === 'admin') ? () => deleteGroup(g._id) : undefined}
                />
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="col-span-full py-12 sm:py-16 text-center bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-slate-400 text-sm sm:text-base">No study groups yet. Create one to get started!</p>
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
      `}</style>
    </DashboardLayout>
  );
}