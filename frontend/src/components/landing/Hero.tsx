import React from 'react';
import { Button } from '../common/Button';
import { ArrowRight } from 'lucide-react';
// import { cn } from '@/utils/cn';

interface HeroProps {
  onExploreJobs?: () => void;
  onLearnProcess?: () => void;
  className?: string;
}



const highlights = [
  {
    icon: '🚀',
    title: 'Innovation First',
    description: 'Work on cutting-edge financial technology solutions'
  },
  {
    icon: '🌍',
    title: 'Global Impact',
    description: 'Transform financial services across continents'
  },
  {
    icon: '📈',
    title: 'Career Growth',
    description: 'Continuous learning and development opportunities'
  }
];

export const Hero: React.FC<HeroProps> = ({
  onExploreJobs,

  onLearnProcess,
  className
}) => {
  return (
    <section className={`relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden ${className || ''}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Main Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Join Vermeg and Shape the Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              Financial Technology
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Be part of Vermeg's mission to transform financial services worldwide.
            Join our team of innovators across 40+ countries and make a global impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="contained"
              size="large"
              onClick={onExploreJobs}
              className="group bg-red-500 hover:bg-red-600 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 font-semibold text-lg px-8 py-4 border-2 border-red-400 hover:border-red-500"
            >
              Explore Career Opportunities
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onLearnProcess}
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/20"
            >
              Our Recruitment Process
            </Button>
          </div>
        </div>
        
        {/* Why Choose Vermeg Section */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Why Choose a Career at Vermeg?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center group-hover:bg-red-600/40 transition-all duration-300">
                    <span className="text-2xl">{highlight.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 group-hover:text-red-400 transition-colors">
                      {highlight.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};