import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/api';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
  timeElapsed?: string;
}

const cards = [
  {
    title: 'User Management',
    desc: 'View all users, ban, unban, or delete accounts.',
    to: '/admin/users',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Content Moderation',
    desc: 'Review and remove posts, notes, rides, polls and more.',
    to: '/admin/moderation',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'text-purple-600 bg-purple-50',
  },
  {
    title: 'Complaints Management',
    desc: 'Manage and resolve user complaints about hostel, campus, mess, etc.',
    to: '/admin/complaints',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-orange-600 bg-orange-50',
  },
  {
    title: 'Admin Logs',
    desc: 'Full history of all admin actions and activity.',
    to: '/admin/logs',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'text-emerald-600 bg-emerald-50',
  },
];

// Complaint Detail Modal Component
const ComplaintDetailModal = ({ 
  complaint, 
  isOpen, 
  onClose 
}: { 
  complaint: Complaint | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!isOpen || !complaint) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-slate-800">Complaint Details</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{complaint.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {complaint.category}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
              <p className="text-slate-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Location</p>
                <p className="text-slate-800">{complaint.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Reported By</p>
                <p className="text-slate-800">{complaint.userId.name}</p>
                <p className="text-xs text-slate-500">{complaint.userId.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Reported On</p>
                <p className="text-slate-800">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Last Updated</p>
                <p className="text-slate-800">{complaint.timeElapsed || 'Just now'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 1234,
    activePosts: 567,
    pendingComplaints: 23,
    reportsToday: 5
  });

  useEffect(() => {
    loadRecentComplaints();
    loadStats();
  }, []);

  const loadRecentComplaints = async () => {
    try {
      const { data } = await api.get('/complaints?limit=5');
      setRecentComplaints(data.complaints || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/complaints/stats/dashboard');
      setStats(prev => ({
        ...prev,
        pendingComplaints: data.stats?.pending || 0
      }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout title="Admin Panel" subtitle="Platform management and monitoring">
      <div className="space-y-6">
        {/* Complaint Detail Modal */}
        <ComplaintDetailModal
          complaint={selectedComplaint}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedComplaint(null);
          }}
        />

        {/* Management Cards */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {c.icon}
                </div>
                <h2 className="font-semibold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                  {c.title}
                </h2>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{c.desc}</p>
                
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-blue-600 font-medium">Click to manage →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Complaints Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">Recent Complaints</h3>
              <p className="text-sm text-slate-500">Latest complaints from users</p>
            </div>
            <Link 
              to="/admin/complaints" 
              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View All Complaints →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentComplaints.length > 0 ? (
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => handleViewComplaint(complaint)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">{complaint.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {complaint.location} • {complaint.timeElapsed || new Date(complaint.createdAt).toLocaleDateString()} • by {complaint.userId.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewComplaint(complaint);
                    }}
                    className="text-xs bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No complaints yet</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">System Status</h3>
              <p className="text-blue-100 text-sm">All systems are operational. No issues detected.</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-green-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Online
              </span>
              <span className="bg-blue-400 text-white px-3 py-1 rounded-full text-xs font-medium">
                v2.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}