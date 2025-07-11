// modals/JobDetailModal.tsx
import React, { memo, useCallback } from 'react';
import { 
  X, Building, MapPin, Briefcase, DollarSign, Clock8, Calendar, 
  BookOpen, Tag, CheckCircle2, Layers, Heart, Check, Sparkles 
} from 'lucide-react';
import { JobDetailModalProps } from '@/types';

const JobDetailModal: React.FC<JobDetailModalProps> = memo(({ 
  job, 
  onClose, 
  onApply, 
  isAuthenticated 
}) => {
  const handleApply = useCallback(() => {
    // Always call onApply - let the parent handle authentication logic
    onApply();
  }, [onApply]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        />
        
        <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-4xl w-full relative animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-700">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative h-full flex items-end px-8 pb-8">
              <div className="text-white">
                <div className="flex items-center mb-2">
                  {job.featured && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm mr-2">
                      Poste Vedette
                    </span>
                  )}
                  {job.remote && (
                    <span className="bg-blue-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm mr-2">
                      Télétravail
                    </span>
                  )}
                  {job.urgent && (
                    <span className="bg-orange-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">{job.title}</h2>
                <div className="flex items-center space-x-4 text-white/90">
                  <span className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {job.department}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.type || job.employmentType}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <DollarSign className="w-6 h-6 text-red-600 mb-2" />
                <span className="text-lg font-semibold text-gray-900">{job.salary}</span>
                <span className="text-gray-500 text-sm">Fourchette salariale</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <Clock8 className="w-6 h-6 text-red-600 mb-2" />
                <span className="text-lg font-semibold text-gray-900">
                  {job.minExperience ? `${job.minExperience}+ ans` : 'Toute expérience'}
                </span>
                <span className="text-gray-500 text-sm">Expérience requise</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <Calendar className="w-6 h-6 text-red-600 mb-2" />
                <span className="text-lg font-semibold text-gray-900">
                  {job.posted?.replace('Posted ', '') || 'Récemment'}
                </span>
                <span className="text-gray-500 text-sm">Date de publication</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                Aperçu du poste
              </h3>
              <p className="text-gray-700">{job.description}</p>
            </div>
            
            {job.skills && job.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-red-600" />
                  Compétences requises
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.skills.map((skill, index) => (
                    <div key={index} className={`flex items-start p-3 rounded-lg ${
                      skill.isRequired ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className={`mt-0.5 mr-3 ${
                        skill.isRequired ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {skill.isRequired ? <CheckCircle2 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-600">{skill.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Niveau: {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {job.fullDescription ? (
              <div 
                className="prose max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: job.fullDescription }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {job.responsibilities && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Responsabilités</h3>
                    <ul className="space-y-2 text-gray-700">
                      {job.responsibilities.split(',').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.qualifications && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h3>
                    <ul className="space-y-2 text-gray-700">
                      {job.qualifications.split(',').map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {job.benefits && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Avantages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.split(',').map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <Check className="w-4 h-4 text-red-600" />
                      </span>
                      <span className="text-gray-700">{benefit.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleApply}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all hover:scale-105 flex items-center justify-center font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Postuler maintenant
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

JobDetailModal.displayName = 'JobDetailModal';

export default JobDetailModal;