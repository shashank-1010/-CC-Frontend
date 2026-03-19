import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import api from '../api/api';

interface Stats {
  marketplace: number;
  notes: number;
  rides: number;
  studygroups: number;
  activities: number;
  polls: number;
  lostitems: number;
}

const quickLinks = [
  { to: '/marketplace', label: 'Browse Marketplace', desc: 'Find items for sale', icon: '🛍️' },
  { to: '/notes', label: 'Browse Notes', desc: 'Download shared notes', icon: '📚' },
  { to: '/rides', label: 'Find a Ride', desc: 'Check available rides', icon: '🚗' },
  { to: '/studygroups', label: 'Join a Study Group', desc: 'Study with peers', icon: '👥' },
  { to: '/activities', label: 'See Activities', desc: 'Events & hackathons', icon: '🎯' },
  { to: '/polls', label: 'Vote on Polls', desc: 'Share your opinion', icon: '📊' },
  { to: '/lost-found', label: 'Lost & Found', desc: 'Report lost or found items', icon: '🔍' },
];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [m, n, r, s, a, p, l] = await Promise.all([
          api.get('/marketplace'),
          api.get('/notes'),
          api.get('/rides'),
          api.get('/studygroups'),
          api.get('/activities'),
          api.get('/polls'),
          api.get('/lost-items'),
        ]);
        
        setStats({
          marketplace: m.data.length,
          notes: n.data.length,
          rides: r.data.length,
          studygroups: s.data.length,
          activities: a.data.length,
          polls: p.data.length,
          lostitems: l.data.length,
        });

        const allItems = [
          ...m.data.slice(0, 2).map((item: any) => ({ ...item, category: 'marketplace' })),
          ...l.data.slice(0, 2).map((item: any) => ({ ...item, category: 'lostfound' })),
          ...a.data.slice(0, 1).map((item: any) => ({ ...item, category: 'activities' })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
         .slice(0, 5);
        
        setRecentItems(allItems);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const statCards = [
    { 
      label: 'Marketplace Listings', 
      value: stats?.marketplace ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> 
    },
    { 
      label: 'Notes Shared', 
      value: stats?.notes ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> 
    },
    { 
      label: 'Ride Posts', 
      value: stats?.rides ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> 
    },
    { 
      label: 'Study Groups', 
      value: stats?.studygroups ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    },
    { 
      label: 'Active Activities', 
      value: stats?.activities ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      label: 'Polls Created', 
      value: stats?.polls ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> 
    },
    { 
      label: 'Lost & Found', 
      value: stats?.lostitems ?? 0, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> 
    },
  ];

  return (
    <DashboardLayout
      title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0] || 'User'}`}
      subtitle="Here's what's happening on your campus today."
    >
      {/* Stats Grid - Mobile first: 2 cols, Desktop: 8 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((s) => (
          <StatCard 
            key={s.label} 
            label={s.label} 
            value={s.value} 
            icon={s.icon} 
            loading={loading} 
          />
        ))}
      </div>

      {/* Quick Access - Mobile first: 2 cols, Desktop: 7 cols */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-1">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">{l.icon}</span>
              <p className="font-medium text-gray-700 text-xs sm:text-sm group-hover:text-red-600 transition-colors">
                {l.label}
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 hidden sm:block">
                {l.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Profile - Stack on mobile, grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed - Exactly as before, only design changed */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    item.category === 'marketplace' ? 'bg-red-100 text-red-600' :
                    item.category === 'lostfound' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {item.category === 'marketplace' ? '🛍️' : 
                     item.category === 'lostfound' ? (item.category === 'lost' ? '🔴' : '🟢') : '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      <span className="font-medium">{item.title || item.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category === 'marketplace' ? `₹${item.price}` : 
                       item.category === 'lostfound' ? `${item.location}` : 
                       `${item.requiredParticipants} participants needed`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Profile Card - Red & White theme */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Your Profile
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
              <p className="text-gray-500 text-sm truncate">{user?.email}</p>
              {user?.phone && (
                <p className="text-xs text-gray-400 mt-1 truncate">{user.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Member since:</span>
              <span className="text-gray-800 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="text-gray-800 font-medium capitalize">{user?.role || 'user'}</span>
            </div>
          </div>

          <Link 
            to="/profile" 
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            View Full Profile →
          </Link>

          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 mb-2">Your Contributions</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-gray-800">{stats?.marketplace || 0}</p>
                <p className="text-xs text-gray-500">Items</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-gray-800">{stats?.lostitems || 0}</p>
                <p className="text-xs text-gray-500">Lost/Found</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Banner - Red theme */}
      <div className="mt-6 bg-red-600 rounded-xl p-4 sm:p-5 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-1">Lost something? Found something?</h3>
            <p className="text-red-100 text-xs sm:text-sm">Report lost items or help others find their belongings.</p>
          </div>
          <Link
            to="/lost-found"
            className="bg-white text-red-600 hover:bg-gray-50 px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Go to Lost & Found →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}