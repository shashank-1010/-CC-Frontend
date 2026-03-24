import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';

interface PollOption { 
  _id: string; 
  text: string; 
  votes: number;
  voters?: string[];
}

interface Poll { 
  _id: string; 
  question: string; 
  options: PollOption[]; 
  createdAt: string;
  votedUsers?: string[];
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

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [votedPolls, setVotedPolls] = useState<Map<string, string>>(new Map()); // Map<pollId, optionId>
  
  let user = null;
  try {
    const userStr = localStorage.getItem('cc_user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.log('Error parsing user in Polls');
    localStorage.removeItem('cc_user');
  }
  const isAdmin = user?.role === 'admin';

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const load = async () => {
    try {
      const pollsRes = await api.get('/polls');
      setPolls(pollsRes.data);
      
      // Load voted polls from localStorage (pollId -> optionId)
      const voted = localStorage.getItem('votedPollsMap');
      if (voted) {
        setVotedPolls(new Map(JSON.parse(voted)));
      }
    } catch (error) {
      console.error('Failed to load polls:', error);
      showToast('Failed to load polls', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  // Create Poll
  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOpts = options.filter((o) => o.trim());
    if (validOpts.length < 2) {
      showToast('Add at least 2 options', 'error');
      return;
    }
    
    try {
      await api.post('/polls', { 
        question, 
        options: validOpts,
        createdBy: user?._id || 'anonymous'
      });
      setQuestion('');
      setOptions(['', '']);
      setShowForm(false);
      showToast('Poll created successfully!', 'success');
      load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to create poll:', error);
      showToast('Failed to create poll', 'error');
    }
  };

  // Vote function - allows changing vote
  const vote = async (pollId: string, optionId: string) => {
    const currentVotedOption = votedPolls.get(pollId);
    
    if (currentVotedOption === optionId) {
      showToast('You already voted for this option', 'info');
      return;
    }
    
    try {
      await api.post(`/polls/${pollId}/vote`, { 
        optionId,
        userId: user?._id || 'anonymous' 
      });
      
      const newVotedPolls = new Map(votedPolls);
      newVotedPolls.set(pollId, optionId);
      setVotedPolls(newVotedPolls);
      localStorage.setItem('votedPollsMap', JSON.stringify(Array.from(newVotedPolls.entries())));
      
      if (currentVotedOption) {
        showToast('Vote changed successfully!', 'success');
      } else {
        showToast('Vote recorded!', 'success');
      }
      
      load();
    } catch (error: any) {
      console.error('Vote failed:', error);
      showToast(error.response?.data?.message || 'Failed to vote', 'error');
    }
  };

  const deletePoll = async (id: string) => {
    if (!confirm('Delete this poll?')) return;
    try {
      await api.delete(`/polls/${id}`);
      showToast('Poll deleted successfully', 'success');
      load();
    } catch (error) {
      console.error('Failed to delete poll:', error);
      showToast('Failed to delete poll', 'error');
    }
  };

  const clearAllPolls = async () => {
    if (!confirm('Are you sure you want to delete ALL polls? This action cannot be undone.')) return;
    try {
      await api.delete('/polls/all');
      showToast('All polls cleared', 'success');
      load();
    } catch (error) {
      console.error('Failed to clear polls:', error);
      showToast('Failed to clear polls', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Anonymous Polls"
      subtitle="Vote anonymously • Change your vote anytime"
      action={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={clearAllPolls}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Polls
            </button>
          )}
          <button 
            onClick={() => { 
              setShowForm(!showForm); 
              if (!showForm) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} 
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Create Poll'}
          </button>
        </div>
      }
    >
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Create Poll Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Anonymous Poll
          </h2>
          <form onSubmit={createPoll} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Poll Question</label>
              <input 
                className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                required 
                placeholder="Ask anything..." 
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Options (Minimum 2)</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input 
                    className="flex-1 px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={opt} 
                    onChange={(e) => { 
                      const o = [...options]; 
                      o[i] = e.target.value; 
                      setOptions(o); 
                    }} 
                    placeholder={`Option ${i + 1}`}
                    autoComplete="off"
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => setOptions(options.filter((_, j) => j !== i))} 
                      className="text-slate-400 hover:text-red-500 px-2 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setOptions([...options, ''])} 
                className="text-blue-600 text-xs sm:text-sm hover:underline mt-2"
              >
                + Add option
              </button>
            </div>

            <div className="flex gap-1 pt-2">
              <button 
                type="submit" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-2 py-1.5 rounded text-xs transition-colors"
              >
                Create
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1.5 rounded text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Polls List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span>📊</span> Active Polls
          </h2>
          <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {polls.length} polls
          </span>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 sm:h-52 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const total = poll.options.reduce((s, o) => s + o.votes, 0);
              const hasVoted = votedPolls.has(poll._id);
              const votedOptionId = votedPolls.get(poll._id);
              
              return (
                <div key={poll._id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800 flex-1">{poll.question}</h3>
                    {isAdmin && (
                      <button 
                        onClick={() => deletePoll(poll._id)} 
                        className="text-xs text-rose-500 hover:text-rose-700 transition-colors bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-full"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4">
                    <span className="bg-slate-100 px-2 py-1 rounded-full">{total} votes</span>
                    <span>•</span>
                    <span>anonymous voting</span>
                    {hasVoted && (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Voted
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((opt) => {
                      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                      const isSelected = votedOptionId === opt._id;
                      
                      return (
                        <button 
                          key={opt._id} 
                          onClick={() => vote(poll._id, opt._id)} 
                          className="w-full text-left group transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm ${isSelected ? 'font-semibold text-blue-600' : 'text-slate-700'}`}>
                                {opt.text}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                  Your vote
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{pct}% ({opt.votes})</span>
                          </div>
                          <div className="h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-green-500' 
                                  : hasVoted 
                                    ? 'bg-slate-300' 
                                    : 'bg-blue-500 group-hover:bg-blue-600'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {hasVoted && (
                    <p className="text-[10px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-100">
                      💡 Click on a different option to change your vote
                    </p>
                  )}
                </div>
              );
            })}
            {polls.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-slate-400 text-sm sm:text-base">No polls yet. Create the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

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
