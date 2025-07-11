// ============================================================================
// PAGE TRANSITION COMPONENT - Smooth transitions between pages
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  duration = 300
}) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, duration / 2);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation, duration]);

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-in-out',
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// FADE TRANSITION - Simple fade in/out
// ============================================================================

interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show,
  duration = 200,
  className = ''
}) => {
  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        show ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// SLIDE TRANSITION - Slide in from different directions
// ============================================================================

interface SlideTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  show,
  direction = 'right',
  duration = 300,
  className = ''
}) => {
  const getTransform = () => {
    if (show) return 'translate-x-0 translate-y-0';
    
    switch (direction) {
      case 'left': return '-translate-x-full';
      case 'right': return 'translate-x-full';
      case 'up': return '-translate-y-full';
      case 'down': return 'translate-y-full';
      default: return 'translate-x-full';
    }
  };

  return (
    <div
      className={cn(
        'transition-transform ease-in-out',
        getTransform(),
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// ROUTE TRANSITION WRAPPER - For React Router transitions
// ============================================================================

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  className = ''
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className
      )}
    >
      {children}
    </div>
  );
};
