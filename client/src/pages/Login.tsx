import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Background image URL - replace with your image
  const bgImageUrl = "https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/28635642-26aa-4666-9797-ebdf98416886.png";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('cc_token', data.token);
      localStorage.setItem('cc_user', JSON.stringify(data.user));
      
      // ✅ DIRECT REDIRECT - No modal, no delay
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center relative"
      style={{ 
        fontFamily: "'Poppins', sans-serif",
        backgroundImage: `url(${bgImageUrl})`
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Login Container - Centered Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
          
          {/* Header - Campus Connect Branding */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">CC</span>
              </div>
              <div className="text-white">
                <h1 className="text-lg font-bold">Campus Connect</h1>
                <p className="text-white/80 text-sm">Community Platform</p>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STUDENT LOGIN</h2>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6">
            <p className="text-white/90 text-sm">
              Welcome to Campus Connect - Your gateway to college community. 
              Buy, sell, share notes, find rides, and connect with peers.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter User Id"
                  className="w-full bg-black/50 border-2 border-white/30 text-white placeholder-white/60 h-12 text-base rounded-xl px-4 focus:border-white focus:ring-0 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
                  className="w-full bg-black/50 border-2 border-white/30 text-white placeholder-white/60 h-12 text-base rounded-xl px-4 pr-12 focus:border-white focus:ring-0 focus:outline-none transition-all"
                  required
                  minLength={6}
                />
                
                {/* Password Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-all focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span>SIGNING IN...</span>
                  <svg className="h-4 w-4 ml-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </>
              ) : (
                <>
                  <span>NEXT</span>
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/30"></div>
            <span className="px-3 text-white text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-white/30"></div>
          </div>

          {/* Registration Link */}
          <div className="text-center">
            <Link
              to="/signup"
              className="inline-block w-full bg-white text-black hover:bg-gray-200 font-bold text-sm py-2 rounded-xl transition-all"
            >
              CLICK HERE FOR REGISTRATION
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}