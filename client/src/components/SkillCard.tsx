import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface SkillCardProps {
  skill: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick: () => void;
}

export default function SkillCard({ skill, onEdit, onDelete, onClick }: SkillCardProps) {
  const openWhatsApp = () => {
    const number = skill.whatsapp || skill.userId?.whatsapp;
    if (!number) return;
    
    const cleanNumber = number.replace(/\D/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(
      `Hi ${skill.userId.name}, I'm interested in your skill: ${skill.title}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  const openCall = () => {
    const number = skill.whatsapp || skill.userId?.whatsapp;
    if (!number) return;
    window.open(`tel:+91${number}`, '_blank');
  };

  const getProficiencyColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header with availability indicator */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">{skill.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{skill.category}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${getAvailabilityColor(skill.availability)}`}></span>
            <span className="text-xs text-slate-500">{skill.availability}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-3">
        <p className="text-sm text-slate-600 line-clamp-3">{skill.description}</p>
      </div>

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map((tag: string, i: number) => (
            <span 
              key={i}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
            >
              {tag}
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
      <div className="px-5 py-3 bg-slate-50 rounded-b-xl border-t border-slate-100">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{skill.userId.name}</p>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true })} • {skill.views} views
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {/* WhatsApp Button */}
            {(skill.whatsapp || skill.userId?.whatsapp) && (
              <button
                onClick={openWhatsApp}
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
                onClick={openCall}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                title="Call now"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}

            {/* Edit/Delete for owner */}
            {onEdit && (
              <button
                onClick={onEdit}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors"
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
}