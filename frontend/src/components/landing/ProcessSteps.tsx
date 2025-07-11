import React, { useEffect, useState } from 'react';
import { Check, Users } from 'lucide-react';
// import { cn } from '@/utils/cn';

interface ProcessStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  duration: string;
}

interface ProcessStepsProps {
  steps?: ProcessStep[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

const defaultSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Job Creation',
    subtitle: 'Project Leader Creates Job',
    description: 'Project Leader creates job posting and builds technical quiz (8-10 questions) for the role',
    icon: '📋',
    duration: 'Day 1'
  },
  {
    id: 2,
    title: 'HR Enhancement',
    subtitle: 'RH Adds HR Quiz',
    description: 'RH Manager reviews job and creates behavioral/interpersonal skills quiz',
    icon: '👥',
    duration: 'Day 2-3'
  },
  {
    id: 3,
    title: 'CEO Approval',
    subtitle: 'Final Approval',
    description: 'CEO reviews complete job package (job + technical quiz + HR quiz) and approves',
    icon: '✅',
    duration: 'Day 4-5'
  },
  {
    id: 4,
    title: 'Candidate Application',
    subtitle: 'Apply & Take Quizzes',
    description: 'Candidates apply and complete both technical quiz (first) and HR quiz (second)',
    icon: '🎯',
    duration: '1-2 hours'
  },
  {
    id: 5,
    title: 'Final Decision',
    subtitle: 'Project Leader Decides',
    description: 'Project Leader reviews application data and quiz results to make final hiring decision',
    icon: '🤝',
    duration: '2-3 days'
  }
];

export const ProcessSteps: React.FC<ProcessStepsProps> = ({
  steps = defaultSteps,
  className,
  autoPlay = true,
  interval = 3000
}) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setActiveStep(prev => prev >= steps.length ? 1 : prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, steps.length]);

  return (
    <section className={`py-20 bg-white ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Our Intelligent Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our structured and intelligent recruitment process ensures the best match between candidates and roles
          </p>
        </div>
        
        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`relative text-center cursor-pointer transition-all duration-500 ${
                  activeStep === step.id ? 'transform scale-105' : ''
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                {/* Step Circle */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl transition-all duration-500 relative z-10 ${
                  activeStep >= step.id
                    ? 'bg-red-600 shadow-lg'
                    : 'bg-gray-200'
                }`}>
                  {activeStep > step.id ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <span className={activeStep >= step.id ? 'grayscale-0' : 'grayscale'}>
                      {step.icon}
                    </span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="space-y-2">
                  <h3 className={`font-bold text-lg transition-colors ${
                    activeStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm font-medium transition-colors ${
                    activeStep >= step.id ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                    {step.description}
                  </p>
                  <span className="inline-block text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2">
                    {step.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Final Step - Offer & Onboarding */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                Candidate Notification
              </h4>
              <p className="text-gray-600 text-sm">
                Candidates are automatically notified of the final decision through the Vermeg platform.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeStep === step.id
                    ? 'bg-red-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Go to step: ${step.title}`}
                aria-label={`Go to step: ${step.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};