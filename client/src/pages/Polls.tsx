import { useEffect, useState, useRef } from 'react';
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

interface ChatMessage {
  _id: string;
  message: string;
  createdAt: string;
  userId?: string;
  isAnonymous: boolean;
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

// Admin Chat Controls Modal
const AdminChatControls = ({ 
  isOpen, 
  onClose, 
  onClearAll,
  onDeleteMessage,
  messages
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onClearAll: () => void;
  onDeleteMessage: (messageId: string) => void;
  messages: ChatMessage[];
}) => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]" onClick={onClose}>
      <div className="bg-white rounded-t-xl sm:rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800">Admin Chat Controls</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete ALL messages? This cannot be undone.')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ALL Messages
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-slate-700 mb-2">Delete Individual Messages:</h4>
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No messages to delete</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <p className="text-xs sm:text-sm text-slate-700 flex-1 mr-4 line-clamp-2">{msg.message}</p>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this message?')) {
                        onDeleteMessage(msg._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    title="Delete message"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [activeTab, setActiveTab] = useState<'polls' | 'chat'>('polls');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');
  const isAdmin = user?.role === 'admin';

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const load = async () => {
    try {
      const [pollsRes, chatRes] = await Promise.all([
        api.get('/polls'),
        api.get('/chat/messages')
      ]);
      
      setPolls(pollsRes.data);
      setChatMessages(chatRes.data);
      
      // Load voted polls from localStorage
      const voted = localStorage.getItem('votedPolls');
      if (voted) {
        setVotedPolls(new Set(JSON.parse(voted)));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  // Poll Functions
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
      
      // Scroll to top after creating poll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to create poll:', error);
      showToast('Failed to create poll', 'error');
    }
  };

  const vote = async (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) {
      showToast('You have already voted in this poll', 'info');
      return;
    }

    try {
      await api.post(`/polls/${pollId}/vote`, { 
        optionId,
        userId: user?._id || 'anonymous' 
      });
      
      const newVoted = new Set(votedPolls);
      newVoted.add(pollId);
      setVotedPolls(newVoted);
      localStorage.setItem('votedPolls', JSON.stringify(Array.from(newVoted)));
      
      showToast('Vote recorded!', 'success');
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

  // Chat Functions
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const response = await api.post('/chat/messages', { 
        message: newMessage,
        userId: user?._id || 'anonymous',
        isAnonymous: true
      });
      
      setChatMessages(prev => [...prev, response.data]);
      setNewMessage('');
      showToast('Message sent!', 'success');
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message', 'error');
    }
  };

  const clearAllMessages = async () => {
    try {
      await api.delete('/chat/messages/all');
      setChatMessages([]);
      showToast('All messages cleared', 'success');
    } catch (error) {
      console.error('Failed to clear messages:', error);
      showToast('Failed to clear messages', 'error');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      setChatMessages(prev => prev.filter(msg => msg._id !== messageId));
      showToast('Message deleted', 'success');
    } catch (error) {
      console.error('Failed to delete message:', error);
      showToast('Failed to delete message', 'error');
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add delete button next to each message for admin (directly in chat)
  const MessageWithDelete = ({ msg }: { msg: ChatMessage }) => {
    const [showDelete, setShowDelete] = useState(false);
    
    return (
      <div 
        className="flex flex-col items-start group relative"
        onMouseEnter={() => isAdmin && setShowDelete(true)}
        onMouseLeave={() => isAdmin && setShowDelete(false)}
      >
        <div className="bg-white rounded-2xl rounded-tl-none px-3 sm:px-4 py-2 shadow-sm max-w-[85%] pr-8 sm:pr-10">
          <p className="text-xs sm:text-sm text-slate-800 break-words">{msg.message}</p>
          <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">{formatTime(msg.createdAt)}</p>
        </div>
        
        {/* Delete button for admin - appears on hover */}
        {isAdmin && showDelete && (
          <button
            onClick={() => {
              if (confirm('Delete this message?')) {
                deleteMessage(msg._id);
              }
            }}
            className="absolute -right-2 top-0 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-all transform hover:scale-110"
            title="Delete message"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Mobile Tab Navigation
  const MobileTabs = () => (
    <div className="sm:hidden flex border-b border-slate-200 mb-4">
      <button
        onClick={() => setActiveTab('polls')}
        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'polls' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        📊 Polls ({polls.length})
      </button>
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
          activeTab === 'chat' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        💬 Chat ({chatMessages.length})
      </button>
    </div>
  );

  return (
    <DashboardLayout
      title="Public Polls & Chat"
      subtitle="Anonymous public chat"
      action={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {isAdmin && (
            <>
              <button
                onClick={clearAllPolls}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Clear All Polls</span>
                <span className="sm:hidden">Clear Polls</span>
              </button>
              <button
                onClick={() => setShowAdminControls(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span className="hidden sm:inline">Manage Chat</span>
                <span className="sm:hidden">Manage</span>
              </button>
            </>
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

      {/* Admin Chat Controls Modal */}
      <AdminChatControls
        isOpen={showAdminControls}
        onClose={() => setShowAdminControls(false)}
        onClearAll={clearAllMessages}
        onDeleteMessage={deleteMessage}
        messages={chatMessages}
      />

      {/* Create Poll Form - Always at top when visible */}
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
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Options</label>
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

      {/* Mobile Tabs */}
      <MobileTabs />

      {/* Main Content - Two Columns on Desktop, Tabbed on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Polls Column - Takes 2/3 width on desktop, visible based on tab on mobile */}
        <div className={`lg:col-span-2 space-y-4 ${activeTab === 'polls' ? 'block' : 'hidden lg:block'}`}>
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
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 sm:pr-2 pb-4">
              {polls.map((poll) => {
                const total = poll.options.reduce((s, o) => s + o.votes, 0);
                const hasVoted = votedPolls.has(poll._id);
                
                return (
                  <div key={poll._id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
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
                      <span>anonymous</span>
                      {hasVoted && (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          You voted
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {poll.options.map((opt) => {
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        return (
                          <button 
                            key={opt._id} 
                            onClick={() => vote(poll._id, opt._id)} 
                            disabled={hasVoted}
                            className={`w-full text-left group ${hasVoted ? 'cursor-not-allowed opacity-75' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs sm:text-sm text-slate-700">{opt.text}</span>
                              <span className="text-xs text-slate-400">{pct}% ({opt.votes})</span>
                            </div>
                            <div className="h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  hasVoted ? 'bg-green-500' : 'bg-blue-500 group-hover:bg-blue-600'
                                }`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
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

        {/* Chat Column - Takes 1/3 width on desktop, visible based on tab on mobile */}
        <div className={`lg:col-span-1 ${activeTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-slate-200 rounded-xl h-[calc(100vh-250px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] flex flex-col sticky top-24">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Public Chat
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {chatMessages.length}
                  </span>
                </h2>
                
                {/* Quick delete button for admin */}
                {isAdmin && chatMessages.length > 0 && (
                  <button
                    onClick={() => setShowAdminControls(true)}
                    className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    Manage
                  </button>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Anonymous • Real-time</p>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50">
              {chatMessages.map((msg) => (
                <MessageWithDelete key={msg._id} msg={msg} />
              ))}
              <div ref={chatEndRef} />
              
              {chatMessages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-xs sm:text-sm text-slate-400">No messages yet.<br />Be the first to say something!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="p-2 sm:p-3 border-t border-slate-200 bg-white rounded-b-xl">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 sm:py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-full text-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
}












