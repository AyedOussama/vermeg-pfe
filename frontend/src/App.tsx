import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { RouteTransition } from './components/common/PageTransition';
import ChatBot from './components/chatbot/ChatBot';

// Lazy load route components
const ProjectLeaderRoutes = lazy(() => import('./pages/project-leader/ProjectLeaderRoutes'));
const CeoRoutes = lazy(() => import('./pages/ceo/CEORoutes'));
const CandidateRoutes = lazy(() => import('./pages/candidate/CandidateRoutes'));
const RHRoutes = lazy(() => import('./pages/rh/RHRoutes'));

// Import critical public pages directly for better performance
import HomePage from './pages/public/HomePage';
import SignInPage from './pages/public/SignInPage';
import RegistrationPage from './pages/public/RegistrationPage';

// Lazy load less critical components
const SectionNavigator = lazy(() => import('./components/navigation/SectionNavigator'));



// AuthDebugPage removed - no longer needed
const ProfileDemo = lazy(() => import('./pages/candidate/ProfileDemo'));
const BadgeDemo = lazy(() => import('./pages/BadgeDemo'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/public/UnauthorizedPage'));
const ErrorHandlingDemo = lazy(() => import('./pages/public/ErrorHandlingDemo'));

const JobsPage = lazy(() => import('./pages/public/JobsPage'));
const JobApplicationPage = lazy(() => import('./pages/public/JobApplicationPage'));
const EnvironmentInfo = lazy(() => import('./pages/public/EnvironmentInfo'));
const NavbarDemo = lazy(() => import('./pages/public/NavbarDemo'));

const App: React.FC = () => {
  // Authentication is now handled within ProtectedRoute components

  // Debug: Log current path changes
  React.useEffect(() => {
    console.log('🌐 App component - Current path:', window.location.pathname);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
          <Routes>
        {/* Public routes - All use SectionNavigator for smooth scrolling */}
        <Route path="/" element={<SectionNavigator />} />
        <Route path="/home" element={<Navigate to="/#home" replace />} />
        <Route path="/process" element={<Navigate to="/#processe" replace />} />
        <Route path="/careers" element={<Navigate to="/#careerz" replace />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />

        {/* Authentication routes */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<RegistrationPage />} />


        {/* Public job pages */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/apply/:jobId" element={<JobApplicationPage />} />

        {/* Demo routes */}
        <Route path="/demo/navbar" element={<NavbarDemo />} />
        <Route path="/test/profile-demo" element={<ProfileDemo />} />
        <Route path="/error-demo" element={<ErrorHandlingDemo />} />

        <Route path="/env-info" element={<EnvironmentInfo />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes by role */}
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute
              requiredRole="CANDIDATE"
              redirectPath="/unauthorized"
            >
              <CandidateRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-leader/*"
          element={
            <ProtectedRoute
              requiredRole="PROJECT_LEADER"
              redirectPath="/unauthorized"
            >
              <ProjectLeaderRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rh/*"
          element={
            <ProtectedRoute
              requiredRole="RH"
              redirectPath="/unauthorized"
            >
              <RHRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ceo/*"
          element={
            <ProtectedRoute
              requiredRole="CEO"
              redirectPath="/unauthorized"
            >
              <CeoRoutes />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/badge-demo" element={<BadgeDemo />} />

        {/* Default route */}
        <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>

        {/* Chatbot for user assistance */}
        <ChatBot />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
