import React from 'react';
// TODO: Recréer l'API userApi pour les profils utilisateur
// import { useGetCurrentUserProfileQuery } from '../../store/api/userApi';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // TODO: Réactiver quand l'API userApi sera recréée
  const profile = null;
  const isLoading = false;
  const error = null;
  const refetch = () => {};

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <p className="text-center text-gray-600">Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement du profil</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vérifier si c'est un profil candidat ou utilisateur basique
  const isCandidate = profile && 'preferredCategories' in profile;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Mon Profil</h2>
      
      {profile && (
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <p className="text-gray-900">{profile.firstName || 'Non renseigné'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <p className="text-gray-900">{profile.lastName || 'Non renseigné'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{profile.email || 'Non renseigné'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <p className="text-gray-900">{profile.phone || 'Non renseigné'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôles
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.roles?.map((role: string) => (
                <span
                  key={role}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Informations spécifiques aux candidats */}
          {isCandidate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <p className="text-gray-900">{(profile as any).location || 'Non renseigné'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <p className="text-gray-900">
                  {(profile as any).linkedinUrl ? (
                    <a
                      href={(profile as any).linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {(profile as any).linkedinUrl}
                    </a>
                  ) : (
                    'Non renseigné'
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio
                </label>
                <p className="text-gray-900">
                  {(profile as any).portfolioUrl ? (
                    <a
                      href={(profile as any).portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {(profile as any).portfolioUrl}
                    </a>
                  ) : (
                    'Non renseigné'
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégories préférées
                </label>
                <div className="flex flex-wrap gap-2">
                  {(profile as any).preferredCategories?.map((category: string) => (
                    <span
                      key={category}
                      className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {category}
                    </span>
                  )) || <p className="text-gray-900">Aucune catégorie renseignée</p>}
                </div>
              </div>

              {(profile as any).profileSummary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Résumé du profil (généré par IA)
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {(profile as any).profileSummary}
                  </p>
                </div>
              )}

              {(profile as any).skills && (profile as any).skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compétences (extraites du CV)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(profile as any).skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Profil créé le : {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-sm text-gray-500">
              Dernière mise à jour : {new Date(profile.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
