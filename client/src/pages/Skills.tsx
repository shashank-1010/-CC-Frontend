import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import { formatDistanceToNow } from 'date-fns';

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'expert';
  availability: 'available' | 'busy' | 'unavailable';
  userId: {
    _id: string;
    name: string;
    email: string;
    whatsapp?: string;
  };
  whatsapp?: string;
  tags: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProficiency, setSelectedProficiency] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    proficiencyLevel: 'intermediate',
    availability: 'available',
    whatsapp: '',
    tags: ''
  });
  
  const [whatsappError, setWhatsappError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('cc_user') || 'null');

  // Load skills on mount and when filters change
  useEffect(() => {
    loadSkills();
  }, [selectedCategory, selectedProficiency, selectedAvailability]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load skills with filters
  const loadSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedProficiency !== 'all') params.append('proficiency', selectedProficiency);
      if (selectedAvailability !== 'all') params.append('availability', selectedAvailability);
      if (searchQuery) params.append('search', searchQuery);
      
      const { data } = await api.get(`/skills?${params.toString()}`);
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const { data } = await api.get('/skills/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Handle search
  const handleSearch = () => {
    loadSkills();
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Validate WhatsApp number
  const validateWhatsApp = (num: string) => {
    return /^\d{10}$/.test(num);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle WhatsApp input (only numbers, max 10 digits)
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      setForm(prev => ({ ...prev, whatsapp: numbers }));
      if (numbers.length !== 10 && numbers.length !== 0) {
        setWhatsappError('Must be 10 digits');
      } else {
        setWhatsappError('');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: '',
      proficiencyLevel: 'intermediate',
      availability: 'available',
      whatsapp: '',
      tags: ''
    });
    setWhatsappError('');
    setEditSkill(null);
  };

  // Handle form submit (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.title || !form.description || !form.category) {
      alert('Please fill all required fields');
      return;
    }

    if (form.whatsapp && !validateWhatsApp(form.whatsapp)) {
      setWhatsappError('WhatsApp number must be 10 digits');
      return;
    }

    setSubmitting(true);

    try {
      if (editSkill) {
        // Update existing skill
        await api.put(`/skills/${editSkill._id}`, form);
        alert('✅ Skill updated successfully!');
      } else {
        // Create new skill
        await api.post('/skills', form);
        alert('✅ Skill posted successfully!');
      }
      
      // Reset form and reload
      resetForm();
      setShowForm(false);
      loadSkills();
    } catch (error: any) {
      console.error('Submit failed:', error);
      alert(error.response?.data?.error || 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a skill
  const startEdit = (skill: Skill) => {
    setEditSkill(skill);
    setForm({
      title: skill.title,
      description: skill.description,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
      availability: skill.availability,
      whatsapp: skill.whatsapp || '',
      tags: skill.tags?.join(', ') || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a skill
  const deleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await api.delete(`/skills/${id}`);
      alert('✅ Skill deleted successfully');
      loadSkills();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete skill');
    }
  };

  // Open WhatsApp chat
  const openWhatsApp = (whatsapp: string, skillTitle: string, userName: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(
      `Hi ${userName}, I'm interested in your skill: ${skillTitle}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  // Open phone call
  const openCall = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`tel:+91${cleanNumber}`, '_blank');
  };

  // View skill details in modal
  const viewDetails = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowDetailsModal(true);
  };

  // Get proficiency level color
  const getProficiencyColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get availability color
  const getAvailabilityColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Skill Card Component
  const SkillCard = ({ skill }: { skill: Skill }) => {
    const isOwner = user && (skill.userId._id === user._id || user.role === 'admin');

    return (
      <div 
        className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer border border-slate-200 overflow-hidden"
        onClick={() => viewDetails(skill)}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-800 mb-1">{skill.title}</h3>
              <p className="text-sm text-blue-600 font-medium">{skill.category}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className={`w-2.5 h-2.5 rounded-full ${getAvailabilityColor(skill.availability)}`}></span>
              <span className="text-xs text-slate-500 capitalize">{skill.availability}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-3">
           <h3 className="font-semibold text-slate-700 mb-2">Skill Exchange For : </h3>
          <p className="text-sm text-slate-600 line-clamp-3">{skill.description}</p>
        </div>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 3).map((tag, i) => (
              <span 
                key={i}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {skill.tags.length > 3 && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                +{skill.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Proficiency Level */}
        <div className="px-5 pb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`}>
            {skill.proficiencyLevel}
          </span>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{skill.userId.name}</p>
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true })} 
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {/* WhatsApp Button */}
              {(skill.whatsapp || skill.userId?.whatsapp) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openWhatsApp(skill.whatsapp || skill.userId.whatsapp!, skill.title, skill.userId.name);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                  title="Chat on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                  </svg>
                </button>
              )}

              {/* Call Button */}
              {(skill.whatsapp || skill.userId?.whatsapp) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCall(skill.whatsapp || skill.userId.whatsapp!);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                  title="Call now"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              )}

              {/* Edit Button (Owner only) */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(skill);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-full transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}

              {/* Delete Button (Owner only) */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSkill(skill._id);
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Details Modal Component
  const DetailsModal = () => {
    if (!selectedSkill) return null;

    const isOwner = user && (selectedSkill.userId._id === user._id || user.role === 'admin');

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        onClick={() => setShowDetailsModal(false)}
      >
        <div
          className="bg-white rounded-t-xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedSkill.title}</h2>
                <p className="text-blue-600 font-medium mt-1">{selectedSkill.category}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-sm px-3 py-1 rounded-full ${getProficiencyColor(selectedSkill.proficiencyLevel)}`}>
                {selectedSkill.proficiencyLevel}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-1.5 ${
                selectedSkill.availability === 'available' ? 'bg-green-100 text-green-700' :
                selectedSkill.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${getAvailabilityColor(selectedSkill.availability)}`}></span>
                {selectedSkill.availability}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{selectedSkill.description}</p>
            </div>

            {/* Tags */}
            {selectedSkill.tags && selectedSkill.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.tags.map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="border-t border-slate-200 pt-4 mb-4">
              <h3 className="font-semibold text-slate-700 mb-3">Seller Information</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-800">{selectedSkill.userId.name}</p>
                <p className="text-sm text-slate-600 mt-1">{selectedSkill.userId.email}</p>
                {(selectedSkill.whatsapp || selectedSkill.userId.whatsapp) && (
                  <p className="text-sm text-slate-600 mt-1">
                    WhatsApp: +91 {selectedSkill.whatsapp || selectedSkill.userId.whatsapp}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="text-sm text-slate-500 mb-6">
              Posted {formatDistanceToNow(new Date(selectedSkill.createdAt), { addSuffix: true })} • {selectedSkill.views} views
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {(selectedSkill.whatsapp || selectedSkill.userId?.whatsapp) && (
                <>
                  <button
                    onClick={() => openWhatsApp(
                      selectedSkill.whatsapp || selectedSkill.userId.whatsapp!,
                      selectedSkill.title,
                      selectedSkill.userId.name
                    )}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.001 2.00195C6.477 2.00195 2.00195 6.477 2.00195 12.001C2.00195 14.1 2.70195 16.073 3.96695 17.645L2.25195 21.999L6.69895 20.305C8.23495 21.325 10.069 21.999 12.001 21.999C17.525 21.999 22 17.525 22 12.001C22 6.477 17.525 2.00195 12.001 2.00195Z" />
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => openCall(selectedSkill.whatsapp || selectedSkill.userId.whatsapp!)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>

            {/* Edit/Delete for Owner */}
            {isOwner && (
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    startEdit(selectedSkill);
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Edit Skill
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    deleteSkill(selectedSkill._id);
                  }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-3 rounded-lg font-medium transition-colors"
                >
                  Delete Skill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Skill Exchange"
      subtitle="Share your skills and learn from others"
      action={
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Share Skill
        </button>
      }
    >
      {/* Post Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200">
          <h2 className="font-semibold text-lg mb-4">
            {editSkill ? 'Edit Skill' : 'Share Your Skill'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Skill Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., React.js Development, Video Editing, etc."
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Which Skills do you want to exchange it for: <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your skill, experience level, what you can teach, etc."
                required
              />
            </div>

            {/* Proficiency & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proficiency Level
                </label>
                <select
                  name="proficiencyLevel"
                  value={form.proficiencyLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={form.availability}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp Number <span className="text-slate-400 font-normal">(10 digits, optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">+91</span>
                <input
                  type="text"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleWhatsAppChange}
                  className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {whatsappError && (
                <p className="text-sm text-red-500 mt-1">{whatsappError}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags <span className="text-slate-400 font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="react, javascript, frontend"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors disabled:bg-slate-400"
              >
                {submitting ? 'Saving...' : (editSkill ? 'Update Skill' : 'Post Skill')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

{/* About Skill Exchange - Simple & Professional */}
<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-800 mb-1">About Skill Exchange</h3>
      <p className="text-sm text-gray-600">
        Connect with fellow students to learn new skills or teach what you know. 
        Exchange knowledge without money - just skills for skills.
      </p>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
        <span>✓ Learn for free</span>
        <span>✓ Teach what you know</span>
        <span>✓ Build your network</span>
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search skills by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filter Dropdowns - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedProficiency}
            onChange={(e) => setSelectedProficiency(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 flex items-center justify-between"
          >
            <span>Filter Skills</span>
            <svg
              className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isFilterOpen && (
            <div className="mt-2 bg-white border border-slate-200 rounded-lg p-3 space-y-3">
              <select
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setIsFilterOpen(false);
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={selectedProficiency}
                onChange={(e) => {
                  setSelectedProficiency(e.target.value);
                  setIsFilterOpen(false);
                }}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>

              <select
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={selectedAvailability}
                onChange={(e) => {
                  setSelectedAvailability(e.target.value);
                  setIsFilterOpen(false);
                }}
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
          
          {skills.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-400 text-lg">No skills found</p>
              <p className="text-slate-400 text-sm mt-2">Be the first to share your skill!</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && <DetailsModal />}
    </DashboardLayout>
  );
}