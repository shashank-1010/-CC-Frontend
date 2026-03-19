import React from 'react';
const { useState, useEffect } = React;
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/api';

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

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, []);

  const loadComplaints = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data.complaints);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/complaints/stats/dashboard');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const updateStatus = async (id: string, status: string, remarks?: string, priority?: string) => {
    try {
      const payload: any = { status };
      if (remarks !== undefined) payload.adminRemarks = remarks;
      if (priority !== undefined) payload.priority = priority;
      
      await api.put(`/complaints/${id}/status`, payload);
      showToast('Complaint status updated successfully!', 'success');
      loadComplaints();
      loadStats();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      showToast('Complaint deleted successfully', 'success');
      loadComplaints();
      loadStats();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      showToast('Failed to delete complaint', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'hostel': return '🏠';
      case 'campus': return '🌳';
      case 'mess': return '🍽️';
      case 'security': return '🛡️';
      case 'maintenance': return '🔧';
      default: return '📌';
    }
  };

  return (
    <DashboardLayout title="Complaints Management" subtitle="Manage and resolve user complaints">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-blue-600">In Progress</p>
            <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-slate-800">{stats.rejected}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-purple-600">Last 7 Days</p>
            <p className="text-2xl font-bold text-slate-800">{stats.last7Days}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="hostel">Hostel</option>
              <option value="campus">Campus</option>
              <option value="mess">Mess</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setCategoryFilter('all');
                setPriorityFilter('all');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-400">No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getCategoryIcon(complaint.category)}</span>
                      <h3 className="font-semibold text-slate-800">{complaint.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{complaint.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>👤 {complaint.userId.name}</span>
                      <span>📍 {complaint.location}</span>
                      <span>📅 {new Date(complaint.createdAt).toLocaleString()}</span>
                      <span>⏱️ {complaint.timeElapsed}</span>
                    </div>

                    {complaint.adminRemarks && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Admin: {complaint.adminRemarks}
                      </div>
                    )}
                  </div>
                  
                  {complaint.imageUrl && (
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      className="w-16 h-16 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Title and Status */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{selectedComplaint.title}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {getCategoryIcon(selectedComplaint.category)} {selectedComplaint.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Location</p>
                    <p className="text-slate-800">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Submitted By</p>
                    <p className="text-slate-800">{selectedComplaint.userId.name}</p>
                    <p className="text-xs text-slate-500">{selectedComplaint.userId.email}</p>
                    {selectedComplaint.userId.phone && (
                      <p className="text-xs text-slate-500">📞 {selectedComplaint.userId.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Submitted On</p>
                    <p className="text-slate-800">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Last Updated</p>
                    <p className="text-slate-800">{selectedComplaint.timeElapsed}</p>
                  </div>
                </div>

                {/* Image */}
                {selectedComplaint.imageUrl && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">Attachment</p>
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Complaint"
                      className="max-h-64 rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Admin Actions</h3>
                  
                  <div className="space-y-3">
                    {/* Status Update */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Update Status</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedComplaint.status}
                        onChange={(e) => setSelectedComplaint({ ...selectedComplaint, status: e.target.value as any })}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Priority Update */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Update Priority</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedComplaint.priority}
                        onChange={(e) => setSelectedComplaint({ ...selectedComplaint, priority: e.target.value as any })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Admin Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Admin Remarks</label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Add remarks or response to the user..."
                        value={selectedComplaint.adminRemarks || ''}
                        onChange={(e) => setSelectedComplaint({ ...selectedComplaint, adminRemarks: e.target.value })}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => updateStatus(
                          selectedComplaint._id,
                          selectedComplaint.status,
                          selectedComplaint.adminRemarks,
                          selectedComplaint.priority
                        )}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => deleteComplaint(selectedComplaint._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Delete Complaint
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Admin Remarks Display */}
                {selectedComplaint.adminRemarks && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 mb-1">Current Admin Response</p>
                    <p className="text-sm text-blue-700">{selectedComplaint.adminRemarks}</p>
                    {selectedComplaint.resolvedAt && (
                      <p className="text-xs text-blue-500 mt-2">
                        Resolved on: {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
