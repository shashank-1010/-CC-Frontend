import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostCard from '../components/PostCard';
import api from '../api/api';

interface Ride {
  _id: string;
  from: string;
  to: string;
  rideTime: string;
  seats: number;
  status: string;
  userId: { _id: string; name: string; phone?: string };
  createdAt: string;
}

export default function RideShare() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ from: '', to: '', rideTime: '', seats: '', status: 'active' });
  const [editRide, setEditRide] = useState<Ride | null>(null);
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');

  const load = async () => {
    try {
      const { data } = await api.get('/rides');
      setRides(data);
    } catch (error) {
      console.error('Failed to load rides:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, seats: parseInt(form.seats) };
    
    try {
      if (editRide) {
        await api.put(`/rides/${editRide._id}`, payload);
      } else {
        await api.post('/rides', payload);
      }
      
      setForm({ from: '', to: '', rideTime: '', seats: '', status: 'active' });
      setShowForm(false);
      setEditRide(null);
      load();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const startEdit = (ride: Ride) => {
    // Format the datetime for input field
    const formattedTime = ride.rideTime ? ride.rideTime.slice(0, 16) : '';
    
    setEditRide(ride);
    setForm({ 
      from: ride.from, 
      to: ride.to, 
      rideTime: formattedTime, 
      seats: String(ride.seats), 
      status: ride.status 
    });
    setShowForm(true);
  };

  const deleteRide = async (id: string) => {
    if (!confirm('Delete this ride?')) return;
    try {
      await api.delete(`/rides/${id}`);
      load();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Function to handle WhatsApp click
  const handleWhatsApp = (phone: string, name: string, from: string, to: string) => {
    if (!phone) {
      alert('Phone number not available for this user');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hi ${name}, I'm interested in your ride from ${from} to ${to}. Is it still available?`);
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  // Function to handle call click
  const handleCall = (phone: string) => {
    if (!phone) {
      alert('Phone number not available for this user');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  // Format date for display
  const formatRideTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout
      title="Ride Share"
      subtitle="Find or offer rides with students"
      action={
        <button 
          onClick={() => { 
            setShowForm(!showForm); 
            setEditRide(null); 
            setForm({ from: '', to: '', rideTime: '', seats: '', status: 'active' }); 
          }} 
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Post Ride
        </button>
      }
    >

      {/* About Ride Share - Simple & Professional */}
<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-800 mb-1">About Ride Share</h3>
      <p className="text-sm text-gray-600">
        Travel together, save money, and reduce carbon footprint. 
        Find or offer rides to college, events, or weekend getaways.
      </p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>✓ Save on travel costs</span>
        <span>✓ Meet new people</span>
        <span>✓ Eco-friendly</span>
      </div>
    </div>
  </div>
</div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">{editRide ? 'Edit Ride' : 'Post Ride'}</h2>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From</label>
              <input 
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.from} 
                onChange={(e) => setForm({ ...form, from: e.target.value })} 
                required 
                placeholder="e.g. Main Gate, College" 
                autoComplete="off"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
              <input 
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.to} 
                onChange={(e) => setForm({ ...form, to: e.target.value })} 
                required 
                placeholder="e.g. City Centre" 
                autoComplete="off"
              />
            </div>
            
            {/* Date & Time Picker - FIXED */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.rideTime}
                onChange={(e) => setForm({ ...form, rideTime: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)} // Can't select past dates
              />
              <p className="text-xs text-slate-400 mt-1">
                Select date and time from the calendar
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Seats</label>
              <input 
                type="number" 
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.seats} 
                onChange={(e) => setForm({ ...form, seats: e.target.value })} 
                required 
                min={1} 
                max={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select 
                className="input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['active', 'full', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {editRide ? 'Update Ride' : 'Post Ride'}
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setShowForm(false); 
                  setEditRide(null); 
                }} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((ride) => (
            <div key={ride._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-slate-800">
                    {ride.from} → {ride.to}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ride.status === 'active' ? 'bg-green-100 text-green-700' :
                    ride.status === 'full' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {ride.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className="text-blue-500">🕒</span>
                    {formatRideTime(ride.rideTime)}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className="text-blue-500">🪑</span>
                    {ride.seats} {ride.seats === 1 ? 'seat' : 'seats'} available
                  </p>
                  <p className="text-xs text-slate-500">
                    Posted by {ride.userId?.name}
                  </p>
                </div>

                {/* Contact Buttons */}
                {ride.userId?.phone ? (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleWhatsApp(ride.userId.phone!, ride.userId.name, ride.from, ride.to)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <span>📱</span> WhatsApp
                    </button>
                    <button
                      onClick={() => handleCall(ride.userId.phone!)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <span>📞</span> Call
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    ⚠️ No contact number available
                  </p>
                )}

                {/* Edit/Delete buttons for owner/admin */}
                {user && (String(ride.userId?._id) === user._id || user.role === 'admin') && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEdit(ride)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRide(ride._id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {rides.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-400 text-sm">No rides posted yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                + Post the first ride
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}