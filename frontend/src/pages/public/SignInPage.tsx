import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, LogIn, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/hooks/useAuth';


const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError, user, getRedirectPath } = useAuth();

  const isRegistered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  });

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔍 SignInPage useEffect triggered:', {
      isAuthenticated,
      user,
      isLoading,
      hasRedirected,
      currentPath: window.location.pathname
    });

    // Ne pas rediriger si on est encore en train de charger ou si on a déjà redirigé
    if (isLoading || hasRedirected) {
      console.log('⏳ Still loading or already redirected, waiting...');
      return;
    }

    if (isAuthenticated && user && user.roles && user.roles.length > 0) {
      console.log('✅ User authenticated with roles, redirecting...');
      console.log('👤 User roles:', user.roles);

      // Marquer qu'on va rediriger pour éviter les boucles
      setHasRedirected(true);

      // Check if there's a pending redirect (e.g., to job application)
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin) {
        console.log('🔄 Found pending redirect:', redirectAfterLogin);
        localStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('pendingJobApplication'); // Clean up
        navigate(redirectAfterLogin, { replace: true });
        return;
      }

      // Default role-based redirect - Redirection immédiate
      const dashboardRoute = getRedirectPath(user.roles[0]);
      console.log('🎯 Redirecting immediately to:', dashboardRoute);

      // Redirection immédiate sans délai
      navigate(dashboardRoute, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, hasRedirected, navigate, getRedirectPath]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    clearErrors();
  }, [clearError, clearErrors]);

  // Si l'utilisateur est déjà authentifié, ne pas afficher le formulaire
  if (isAuthenticated && user) {
    console.log('🔄 User is authenticated, should redirect...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleResetDemoUsers = () => {
    try {
      // Reset functionality removed - using static mock data
      alert('✅ Demo users are always available! Use any demo account to login.');
    } catch (error) {
      console.error('Error resetting demo users:', error);
      alert('❌ Failed to reset demo users. Please try refreshing the page.');
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    if (isSubmitting || isLoading) return;

    try {
      setIsSubmitting(true);
      clearError();
      clearErrors();

      console.log('🚀 Submitting login form...');
      console.log('📝 Form data being sent to login:', data);

      await login({ email: data.email, password: data.password });
      console.log('✅ Login successful! Redirection will be handled by useEffect');

      console.log('⚠️ State not updated after max attempts, forcing page reload...');
      window.location.reload();
    } catch (error: any) {
      console.error('Login submission failed:', error);

      // Handle RTK Query errors
      let errorMessage = 'Erreur de connexion';

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error?.status === 500) {
        errorMessage = 'Erreur serveur, veuillez réessayer';
      }

      // Set appropriate field error or general error
      if (errorMessage.includes('mot de passe') || errorMessage.includes('password')) {
        setError('password', { message: errorMessage });
      } else if (errorMessage.includes('email') || errorMessage.includes('utilisateur')) {
        setError('email', { message: errorMessage });
      } else {
        setError('root', { message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Vermeg account
          </p>
        </div>

        {/* Registration Success Alert */}
        {isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert
              type="success"
              title="Registration Successful!"
              message="Your account has been created. Please sign in with your credentials."
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </motion.div>
        )}

        {/* Error Alert */}
        {(error || errors.root) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert
              type="error"
              title="Sign In Failed"
              message={error || errors.root?.message || 'An error occurred during sign in'}
              onClose={() => {
                clearError();
                clearErrors('root');
              }}
            />
          </motion.div>
        )}

        {/* Sign In Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <LogIn className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              Sign In
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="your.email@example.com"
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              loading={isSubmitting || isLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-red-600 hover:text-red-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">
              🎯 Comptes de démonstration disponibles
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between bg-red-50 p-2 rounded">
                <span className="font-medium">CEO:</span>
                <span className="font-mono">ceo@vermeg.com</span>
              </div>
              <div className="flex justify-between bg-blue-50 p-2 rounded">
                <span className="font-medium">RH:</span>
                <span className="font-mono">rh@vermeg.com</span>
              </div>
              <div className="flex justify-between bg-green-50 p-2 rounded">
                <span className="font-medium">Chef de projet:</span>
                <span className="font-mono">leader@vermeg.com</span>
              </div>
              <div className="flex justify-between bg-purple-50 p-2 rounded">
                <span className="font-medium">Candidat:</span>
                <span className="font-mono">candidate@vermeg.com</span>
              </div>
              <div className="text-center mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="font-medium text-yellow-800">🔑 Mot de passe pour tous: </span>
                <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-900 font-mono">demo123</code>
              </div>

              {/* Development Reset Button */}
              {import.meta.env.DEV && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Button
                    onClick={handleResetDemoUsers}
                    variant="outlined"
                    size="small"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset Demo Users
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Use this if login fails due to cached data
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
