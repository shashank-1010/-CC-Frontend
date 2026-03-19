interface ProfileHeaderProps {
  name?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  onEdit?: () => void;
}

const ProfileHeader = ({ name, phone, role, createdAt, onEdit }: ProfileHeaderProps) => {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{name || 'User'}</h1>
            <div className="flex items-center gap-3 mt-1">
              {phone && (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <span>📞</span> {phone}
                </p>
              )}
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                {role || 'user'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Member since {formatDate(createdAt)}
            </p>
          </div>
        </div>
        
        {/* Edit Profile Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;