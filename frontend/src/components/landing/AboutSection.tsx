import React from 'react';
import { ArrowRight, Target, Users, Heart, Award, Star, Globe, Briefcase, Building } from 'lucide-react';
// import { cn } from '@/utils/cn';

interface AboutSectionProps {
  className?: string;
  onLearnMore?: () => void;
}

const companyValues = [
  {
    icon: Target,
    title: 'Innovation First',
    description: 'We constantly push boundaries to deliver cutting-edge solutions'
  },
  {
    icon: Users,
    title: 'Team Excellence',
    description: 'We believe in the power of collaboration and diverse perspectives'
  },
  {
    icon: Heart,
    title: 'Customer Focus',
    description: 'Our clients success is at the heart of everything we do'
  },
  {
    icon: Award,
    title: 'Quality Driven',
    description: 'We maintain the highest standards in our products and services'
  }
];

const stats = [
  { 
    icon: Star, 
    value: '30+', 
    label: 'Years of Expertise',
    description: 'Three decades of financial software innovation'
  },
  { 
    icon: Globe, 
    value: '40+', 
    label: 'Countries',
    description: 'Global presence across multiple continents'
  },
  { 
    icon: Briefcase, 
    value: '160+', 
    label: 'Clients',
    description: 'Trusted by leading financial institutions'
  },
  { 
    icon: Building, 
    value: '25+', 
    label: 'Central Banks',
    description: 'Powering central banking operations worldwide'
  }
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  className,
  onLearnMore
}) => {
  return (
    <section className={`py-20 bg-white ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Leading the way in financial software solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A global leader in financial technology solutions since 1993, transforming
            the way financial institutions operate and serve their customers.
          </p>
        </div>
        
        {/* Mission & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="aspect-video bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg overflow-hidden relative group">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <span className="text-red-300 animate-pulse">/</span>vermeg
                </span>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="text-red-600 mb-3 text-sm font-semibold tracking-wider">
              / Our Mission
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Empowering Financial Innovation
            </h3>
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                At Vermeg, our mission is to empower financial institutions with innovative 
                technology solutions that drive efficiency, ensure compliance, and foster 
                growth in an ever-evolving market landscape.
              </p>
              <p>
                We combine deep industry expertise with cutting-edge technology to deliver 
                comprehensive solutions that address the complex challenges faced by banks, 
                asset managers, and insurance companies worldwide.
              </p>
            </div>
            
            <button
              onClick={onLearnMore}
              className="mt-6 inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Learn More About Our Story
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Company Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div 
                key={index}
                className="group bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:bg-white"
              >
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <value.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {value.title}
                </h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Global Impact Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-black mb-4">
              Our Global Impact
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Partnering with leading financial institutions across the globe to drive
              digital transformation and deliver measurable results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {stat.value}
                </div>
                <div className="text-gray-800 font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-600 text-sm">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};