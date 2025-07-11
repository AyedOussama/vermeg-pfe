import React from 'react';
import { cn } from '@/utils/cn';

interface MinimalLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  className?: string;
}

export const MinimalLayout: React.FC<MinimalLayoutProps> = ({
  children,
  showLogo = true,
  className
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Optional Logo Header */}
      {showLogo && (
        <header className="bg-white shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-2xl font-bold">
              <span className="text-red-600">/</span>vermeg
            </div>
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Vermeg. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};