import React from 'react';
import { Button } from '../common/Button';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' }
  ],
  solutions: [
    { label: 'Wealth Management', href: '#' },
    { label: 'Asset Servicing', href: '#' },
    { label: 'Insurance', href: '#' },
    { label: 'Financial Markets', href: '#' }
  ],
  resources: [
    { label: 'Blog', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Partners', href: '#' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Settings', href: '#' }
  ]
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' }
];

const contactInfo = [
  { icon: Mail, text: 'careers@vermeg.com', href: 'mailto:careers@vermeg.com' },
  { icon: Phone, text: '+33 1 84 88 41 00', href: 'tel:+33184884100' },
  { icon: MapPin, text: 'Paris, France', href: '#' }
];

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-bold mb-4">
                <span className="text-red-600">/</span>vermeg
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Leading financial software solutions provider with over 30 years of expertise 
                across 40+ countries, transforming the future of financial technology.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group"
                  >
                    <contact.icon className="w-4 h-4 mr-3 group-hover:text-red-400 transition-colors" />
                    <span className="text-sm">{contact.text}</span>
                  </a>
                ))}
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Solutions Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Solutions</h3>
              <ul className="space-y-3">
                {footerLinks.solutions.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter Signup */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest news about career opportunities and company updates.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-600 focus:outline-none transition-colors"
                />
                <Button
                  variant="contained"
                  size="small"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Vermeg. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
