import { useEffect, useState } from 'react';
import api from '../api/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  achievements?: string[];
  createdAt: string;
  role: string;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal = ({ userId, isOpen, onClose }: UserProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/activities/users/${userId}/profile`);
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {profile && !loading && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-slate-800 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-slate-600">Name:</span>{' '}
                    <span className="text-slate-800">{profile.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-slate-600">Email:</span>{' '}
                    <span className="text-slate-800">{profile.email}</span>
                  </p>
                  {profile.phone && (
                    <p className="text-sm">
                      <span className="font-medium text-slate-600">Phone:</span>{' '}
                      <span className="text-slate-800">{profile.phone}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium text-slate-600">Member since:</span>{' '}
                    <span className="text-slate-800">{formatDate(profile.createdAt)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-slate-600">Role:</span>{' '}
                    <span className="text-slate-800 capitalize">{profile.role}</span>
                  </p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-3">Bio</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-3">Achievements</h3>
                  <ul className="space-y-2">
                    {profile.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">🏆</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;