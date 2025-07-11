import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HomePage from '@/pages/public/HomePage';

const SectionNavigator: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      const sectionId = location.hash.substring(1);

      // Wait for the page to render, then scroll to the section
      const timer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return <HomePage />;
};

export default SectionNavigator;
