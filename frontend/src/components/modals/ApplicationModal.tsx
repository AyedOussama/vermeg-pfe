// modals/ApplicationModal.tsx
import React, { memo, useState, useCallback } from 'react';
import { X, CheckCircle, Send } from 'lucide-react';
import { ApplicationModalProps } from '@/types';

const ApplicationModal: React.FC<ApplicationModalProps> = memo(({ 
  job, 
  onClose, 
  onSubmit 
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    // Simulation d'une soumission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    onSubmit();
    onClose();
    
    // Affichage d'une notification de succès
    alert('Candidature soumise avec succès!');
  }, [onSubmit, onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        />
        
        <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-md w-full relative p-8 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Candidature rapide</h3>
            <p className="text-gray-600">
              Votre CV est déjà enregistré. Vous pouvez postuler en un clic!
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-gray-600 space-y-2">
              <p className="mb-2">
                <span className="font-semibold text-gray-900">Poste:</span> {job.title}
              </p>
              <p className="mb-2">
                <span className="font-semibold text-gray-900">Département:</span> {job.department}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Localisation:</span> {job.location}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message additionnel (Optionnel)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={handleMessageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              placeholder="Ajoutez toute information supplémentaire que vous souhaitez partager..."
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/500 caractères
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all hover:scale-105 transform flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Soumettre la candidature
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            En soumettant cette candidature, vous confirmez que toutes les informations fournies sont exactes et complètes.
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationModal.displayName = 'ApplicationModal';

export default ApplicationModal;