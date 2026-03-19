import { Link } from 'react-router-dom';

const features = [
  { icon: '🛍️', title: 'Marketplace', desc: 'Buy and sell items with fellow students.', to: '/marketplace' },
  { icon: '📚', title: 'Notes Sharing', desc: 'Share and download subject notes and PDFs.', to: '/notes' },
  { icon: '🚗', title: 'Ride Share', desc: 'Find or offer rides within campus.', to: '/rides' },
  { icon: '👥', title: 'Study Groups', desc: 'Create or join study groups for any subject.', to: '/studygroups' },
  { icon: '🎯', title: 'Activities', desc: 'Post events, hackathons and club recruitments.', to: '/activities' },
  { icon: '📊', title: 'Polls', desc: 'Create and vote on anonymous campus polls.', to: '/polls' },
];

export default function Home() {
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Campus Connect</h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Your all-in-one campus community platform — marketplace, notes, rides, study groups, activities and polls.
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Link to="/signup" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Get Started
              </Link>
              <Link to="/login" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Login
              </Link>
            </div>
          )}
          {user && (
            <p className="text-blue-100 text-lg">Welcome back, <span className="font-semibold text-white">{user.name}</span>! 👋</p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Everything You Need on Campus</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.title} to={f.to} className="card p-6 hover:shadow-md transition-shadow group">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
