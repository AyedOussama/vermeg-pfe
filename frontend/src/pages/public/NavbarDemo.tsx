// ============================================================================
// NAVBAR DEMO PAGE - Demonstrates role-based navigation
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

const DEMO_USERS = [
  {
    email: 'ceo@vermeg.com',
    role: 'CEO',
    name: 'Ahmed Ben Salem',
    description: 'Accès complet au système, analytics, gestion des utilisateurs'
  },
  {
    email: 'rh@vermeg.com',
    role: 'RH',
    name: 'Fatima Mansouri',
    description: 'Gestion des candidatures, entretiens, quiz RH, messages'
  },
  {
    email: 'leader@vermeg.com',
    role: 'PROJECT_LEADER',
    name: 'Mohamed Trabelsi',
    description: 'Création et gestion des offres d\'emploi'
  },
  {
    email: 'candidate@vermeg.com',
    role: 'CANDIDATE',
    name: 'Sara Bouaziz',
    description: 'Recherche d\'emploi, candidatures, messages'
  }
];

const NavbarDemo: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, 'demo123');
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Navbar - Changes based on user role */}
      <DynamicNavbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧭 Démonstration du Navbar Dynamique
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Le navbar s'adapte automatiquement selon le rôle de l'utilisateur connecté. 
              Testez les différents rôles pour voir les changements de navigation.
            </p>
          </div>

          {/* Current User Status */}
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">👤 Utilisateur Actuel</h2>
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.fullName}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <Badge 
                        variant="success" 
                        className="mt-1"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    disabled={isLoading}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg mb-4">
                    Aucun utilisateur connecté
                  </p>
                  <Badge variant="secondary">Non connecté</Badge>
                </div>
              )}
            </Card>
          </div>

          {/* Demo Users */}
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">🎭 Tester les Différents Rôles</h2>
              <p className="text-gray-600 mb-6">
                Cliquez sur un utilisateur pour vous connecter et voir comment le navbar change :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEMO_USERS.map((demoUser) => (
                  <div
                    key={demoUser.email}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      user?.email === demoUser.email
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                        {demoUser.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="font-semibold text-gray-900">{demoUser.name}</h3>
                      <Badge 
                        variant={
                          demoUser.role === 'CEO' ? 'success' :
                          demoUser.role === 'RH' ? 'info' :
                          demoUser.role === 'PROJECT_LEADER' ? 'warning' :
                          'secondary'
                        }
                        className="mt-1"
                      >
                        {demoUser.role}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      {demoUser.description}
                    </p>
                    
                    <Button
                      onClick={() => handleLogin(demoUser.email)}
                      disabled={isLoading || user?.email === demoUser.email}
                      variant={user?.email === demoUser.email ? 'outlined' : 'contained'}
                      size="small"
                      className="w-full"
                    >
                      {isLoading ? 'Connexion...' : 
                       user?.email === demoUser.email ? 'Connecté' : 'Se connecter'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Navigation Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">🎯 Fonctionnalités du Navbar</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Navigation adaptative selon le rôle</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Menu avatar avec options spécifiques</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Notifications par rôle</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Thème couleur basé sur le rôle</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Menu mobile responsive</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Déconnexion sécurisée</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">📋 Navigation par Rôle</h2>
              <div className="space-y-4">
                <div>
                  <Badge variant="success" className="mb-2">CEO</Badge>
                  <p className="text-sm text-gray-600">Jobs, Analytics, User Management</p>
                </div>
                <div>
                  <Badge variant="info" className="mb-2">RH</Badge>
                  <p className="text-sm text-gray-600">Applications, Quiz, Interviews, Messages</p>
                </div>
                <div>
                  <Badge variant="warning" className="mb-2">PROJECT_LEADER</Badge>
                  <p className="text-sm text-gray-600">Create Job, My Jobs</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">CANDIDATE</Badge>
                  <p className="text-sm text-gray-600">Applications, Job Search, Messages</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                💡 Instructions
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Connectez-vous avec différents utilisateurs pour voir les changements</li>
                <li>Observez comment le navbar s'adapte à chaque rôle</li>
                <li>Testez le menu avatar (clic sur l'avatar en haut à droite)</li>
                <li>Vérifiez les notifications et messages spécifiques au rôle</li>
                <li>Testez la version mobile en réduisant la fenêtre</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarDemo;
