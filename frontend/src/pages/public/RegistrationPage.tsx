import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';
import { CandidateRegistrationForm } from '@/components/auth/CandidateRegistrationForm';
import { useAuth } from '@/hooks/useAuth';
import { getRoleBasedDashboardRouteFromRoles } from '@/utils/authRedirect';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle automatic redirection if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user?.roles && !isRedirecting) {
      console.log('User authenticated after registration, redirecting...');
      setIsRedirecting(true);
      const dashboardRoute = getRoleBasedDashboardRouteFromRoles(user.roles);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 500);
    }
  }, [isAuthenticated, user, navigate, isRedirecting]);

  const handleRegistrationSuccess = (registeredUser?: any) => {
    console.log('🎉 Registration successful! Processing redirect...', registeredUser);
    setIsRedirecting(true);

    // Get user roles from the registered user or current auth state
    const userRoles = registeredUser?.roles || user?.roles || ['CANDIDATE'];

    console.log('User roles detected:', userRoles);

    if (userRoles.length > 0) {
      const dashboardRoute = getRoleBasedDashboardRouteFromRoles(userRoles);
      console.log(`🚀 Redirecting to dashboard: ${dashboardRoute}`);

      // Navigate to the appropriate dashboard
      setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 1000); // Give time for success message to be seen
    } else {
      // Fallback: redirect to candidate dashboard (most likely scenario)
      console.log('⚠️ No role information, defaulting to candidate dashboard');
      setTimeout(() => {
        navigate('/candidate/dashboard', { replace: true });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Redirecting Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center">
            <div className="mb-4">
              <Loader2 className="w-12 h-12 text-green-600 mx-auto animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Vermeg!
            </h3>
            <p className="text-gray-600">
              Taking you to your dashboard...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Vermeg as a Candidate
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Start your journey with us
          </p>


        </div>

        {/* Candidate Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Candidate Registration
            </h2>
            <p className="text-gray-600">
              Join our talent pool and discover exciting opportunities
            </p>
          </div>

          <CandidateRegistrationForm
            onSuccess={handleRegistrationSuccess}
            onLoading={() => {}} // No-op function since we removed loading state
          />

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/signin" className="text-red-600 hover:text-red-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationPage;
