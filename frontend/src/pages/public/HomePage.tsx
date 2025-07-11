/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// import React, { useState, useEffect } from 'react';
// import { Footer } from '@/components/landing';
// import { AboutSection } from '@/components/landing/AboutSection';
// import { ProcessSteps } from '@/components/landing';
// import { Hero } from '@/components/landing';
// import { 
//   ArrowRight, Globe, Users, Briefcase, Check, ChevronRight, Mail, Phone, 
//   MapPin, Star, Linkedin, Facebook, Twitter, X, User, Lock, Eye, EyeOff, 
//   Calendar, Clock, Building, Target, Award, Heart, ChevronDown, Menu,
//   Search, Filter, Sparkles, Sliders, DollarSign, Tag, ExternalLink,
//   CheckCircle2, BookOpen, Layers, Clock8
// } from 'lucide-react';

// const HomePage = () => {
//   // State variables
//   const [scrolled, setScrolled] = useState(false);
//   const [activeSection, setActiveSection] = useState('home');
//   const [showCandidateModal, setShowCandidateModal] = useState(false);
//   const [showInternalModal, setShowInternalModal] = useState(false);
//   const [isSignup, setIsSignup] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [activeProcess, setActiveProcess] = useState(1);
//   type Job = typeof currentJobs[number];
//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showApplicationModal, setShowApplicationModal] = useState(false);
//   const [selectedCountryCode, setSelectedCountryCode] = useState('+216');
//   const [countryCodes, setCountryCodes] = useState<{ code: string; country: string; flag: string }[]>([]);
//   const [showCountryDropdown, setShowCountryDropdown] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [filterOpen, setFilterOpen] = useState(false);
  


//   const currentJobs = [
//     {
//       id: 1,
//       title: 'Senior Full Stack Developer',
//       department: 'Engineering',
//       location: 'Tunis, Tunisia',
//       type: 'Full-time',
//       employmentType: 'FULL_TIME',
//       level: 'Senior',
//       salary: '€50K - €70K',
//       salaryRangeMin: 50000,
//       salaryRangeMax: 70000,
//       displaySalary: true,
//       minExperience: 5,
//       posted: 'Posted 2 days ago',
//       description: 'We are looking for an experienced Full Stack Developer to join our engineering team...',
//       responsibilities: 'Design and implement scalable web applications, collaborate with cross-functional teams, ensure code quality through testing',
//       qualifications: 'Strong proficiency in Angular, TypeScript, and modern JavaScript, experience with Java Spring Boot',
//       benefits: 'Competitive salary, flexible working arrangements, health insurance and wellness programs',
//       fullDescription: `
//         <h3>About the Role</h3>
//         <p>We are seeking an experienced Full Stack Developer to join our core engineering team and help build the next generation of financial software solutions. You will work on challenging projects that directly impact millions of users across the globe.</p>
        
//         <h3>Key Responsibilities</h3>
//         <ul>
//           <li>Design and implement scalable web applications using Angular and Spring Boot</li>
//           <li>Collaborate with cross-functional teams to define and ship new features</li>
//           <li>Ensure code quality through comprehensive testing and code reviews</li>
//           <li>Mentor junior developers and contribute to technical documentation</li>
//           <li>Participate in architecture decisions and technology selection</li>
//         </ul>
        
//         <h3>Requirements</h3>
//         <ul>
//           <li>5+ years of experience in full-stack development</li>
//           <li>Strong proficiency in Angular, TypeScript, and modern JavaScript</li>
//           <li>Experience with Java Spring Boot and microservices architecture</li>
//           <li>Solid understanding of RESTful APIs and database design</li>
//           <li>Experience with cloud platforms (AWS, Azure) is a plus</li>
//         </ul>
        
//         <h3>What We Offer</h3>
//         <ul>
//           <li>Competitive salary and benefits package</li>
//           <li>Flexible working arrangements</li>
//           <li>Continuous learning and development opportunities</li>
//           <li>International work environment</li>
//           <li>Health insurance and wellness programs</li>
//         </ul>
//       `,
//       skills: [
//         {
//           name: 'Angular',
//           isRequired: true,
//           level: 'ADVANCED',
//           description: 'Frontend development with Angular framework'
//         },
//         {
//           name: 'Java',
//           isRequired: true,
//           level: 'ADVANCED',
//           description: 'Backend development with Java'
//         },
//         {
//           name: 'Spring Boot',
//           isRequired: true,
//           level: 'INTERMEDIATE',
//           description: 'Building microservices with Spring Boot'
//         },
//         {
//           name: 'MongoDB',
//           isRequired: false,
//           level: 'INTERMEDIATE',
//           description: 'Working with NoSQL databases'
//         }
//       ],
//       tags: ['Angular', 'Java', 'Spring Boot', 'MongoDB'],
//       featured: true
//     },
//     {
//       id: 2,
//       title: 'Product Manager - Fintech',
//       department: 'Product',
//       location: 'Paris, France',
//       type: 'Full-time',
//       employmentType: 'FULL_TIME',
//       level: 'Mid-Senior',
//       salary: '€65K - €85K',
//       salaryRangeMin: 65000,
//       salaryRangeMax: 85000,
//       displaySalary: true,
//       minExperience: 3,
//       posted: 'Posted 5 days ago',
//       description: 'Lead product strategy and development for our innovative fintech solutions...',
//       responsibilities: 'Define product roadmap, collaborate with engineering teams, conduct market research, work with customers',
//       qualifications: 'Strong understanding of financial markets and regulations, excellent communication skills',
//       benefits: 'Competitive pay, flexible work arrangements, professional development opportunities',
//       skills: [
//         {
//           name: 'Agile',
//           isRequired: true,
//           level: 'ADVANCED',
//           description: 'Agile methodologies and product management'
//         },
//         {
//           name: 'Fintech',
//           isRequired: true,
//           level: 'INTERMEDIATE',
//           description: 'Understanding of fintech landscape'
//         }
//       ],
//       tags: ['Agile', 'Fintech', 'Strategy', 'Leadership'],
//       remote: true
//     },
//     {
//       id: 3,
//       title: 'Data Science Lead',
//       department: 'Analytics',
//       location: 'Luxembourg',
//       type: 'Full-time',
//       employmentType: 'FULL_TIME',
//       level: 'Lead',
//       salary: '€80K - €100K',
//       salaryRangeMin: 80000,
//       salaryRangeMax: 100000,
//       displaySalary: true,
//       minExperience: 7,
//       posted: 'Posted 1 week ago',
//       description: 'Lead our data science initiatives and build advanced analytics solutions...',
//       responsibilities: 'Lead a team of data scientists, develop ML models, design data pipelines, collaborate with product teams',
//       qualifications: 'Strong programming skills in Python and R, experience with big data technologies, deep understanding of ML algorithms',
//       benefits: 'Competitive salary, flexible work arrangements, professional growth opportunities, modern workspace',
//       skills: [
//         {
//           name: 'Python',
//           isRequired: true,
//           level: 'ADVANCED',
//           description: 'Data analysis and ML model development'
//         },
//         {
//           name: 'Machine Learning',
//           isRequired: true,
//           level: 'ADVANCED',
//           description: 'Building ML models for finance'
//         }
//       ],
//       tags: ['Python', 'Machine Learning', 'Big Data'],
//       urgent: true
//     },
//     {
//       id: 4,
//       title: 'Développeur Full-Stack Java/React',
//       department: 'IT',
//       location: 'Monastir, Tunisie',
//       employmentType: 'FULL_TIME',
//       type: 'Full-time',
//       level: 'Mid-level',
//       salary: '€20K - €55K',
//       salaryRangeMin: 20000,
//       salaryRangeMax: 55000,
//       displaySalary: true,
//       minExperience: 2,
//       posted: 'Posted 3 days ago',
//       description: 'Nous recherchons un développeur Full-Stack expérimenté pour rejoindre notre équipe de développement produit.',
//       responsibilities: 'Concevoir et développer des applications web responsive, collaborer avec l\'équipe produit, participer aux revues de code.',
//       qualifications: 'Expérience en développement avec Spring Boot et React, connaissance des bases de données SQL, expérience en développement agile.',
//       benefits: 'Horaires flexibles, formation continue, assurance santé, environnement de travail moderne.',
//       skills: [
//         {
//           name: 'React',
//           isRequired: true,
//           level: 'INTERMEDIATE',
//           description: 'Frontend development with React'
//         },
//         {
//           name: 'Docker',
//           isRequired: true,
//           level: 'INTERMEDIATE',
//           description: 'Requêtes et schémas de base de données'
//         }
//       ],
//       tags: ['React', 'Java', 'Spring Boot', 'SQL', 'Docker'],
//       featured: false
//     }
//   ];



//   const navItems = [
//     { id: 'home', label: 'Home' },
//     { id: 'process', label: 'Process' },
//     { id: 'careers', label: 'Careers' },
//     { id: 'about', label: 'About' }
//   ];



//   // Effects
//   useEffect(() => {
//     // Simulate fetching country codes
//     const data = [
//       { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
//       { code: '+33', country: 'France', flag: '🇫🇷' },
//       { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
//       { code: '+1', country: 'USA', flag: '🇺🇸' },
//       { code: '+44', country: 'UK', flag: '🇬🇧' }
//     ];
//     setCountryCodes(data);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setActiveProcess(prev => prev >= 5 ? 1 : prev + 1);
//     }, 3000);
//     return () => clearInterval(timer);
//   }, []);

//   // Component: Navigation
//   const Navigation = () => (
//     <nav className={`fixed w-full z-50 transition-all duration-500 ${
//       scrolled ? 'bg-white shadow-lg py-4' : 'bg-transparent py-6'
//     }`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-12">
//             <div className="flex items-center cursor-pointer" onClick={() => setActiveSection('home')}>
//               <span className="text-3xl font-bold tracking-tight">
//                 <span className={`${scrolled || activeSection !== 'home' ? 'text-red-600' : 'text-red-400'}`}>/</span>
//                 <span className={`${scrolled || activeSection !== 'home' ? 'text-gray-900' : 'text-white'}`}>vermeg</span>
//               </span>
//             </div>
            
//             <div className="hidden md:flex items-center space-x-8">
//               {navItems.map(item => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveSection(item.id)}
//                   className={`text-sm font-medium transition-all duration-300 ${
//                     activeSection === item.id 
//                       ? scrolled || activeSection !== 'home' 
//                         ? 'text-red-600 border-b-2 border-red-600' 
//                         : 'text-white border-b-2 border-white'
//                       : scrolled || activeSection !== 'home'
//                         ? 'text-gray-700 hover:text-red-600 border-b-2 border-transparent'
//                         : 'text-white hover:text-red-200 border-b-2 border-transparent'
//                   }`}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setShowCandidateModal(true)}
//               className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
//                 scrolled || activeSection !== 'home'
//                   ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
//                   : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
//               }`}
//             >
//               Candidate Portal
//             </button>
//             <button
//               onClick={() => setShowInternalModal(true)}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
//             >
//               Employee Login
//             </button>
//             <button
//               onClick={() => setMobileMenuOpen(true)}
//               className="md:hidden text-2xl bg-red-600 text-white p-2 rounded-full"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );

//   // Component: MobileMenu
//   const MobileMenu = () => (
//     <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
//       <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 flex flex-col">
//         <div className="p-4 border-b flex justify-between items-center">
//           <div className="text-2xl font-bold">
//             <span className="text-red-600">/</span>
//             <span>vermeg</span>
//           </div>
//           <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
//             <X className="w-6 h-6" />
//           </button>
//         </div>
        
//         <nav className="flex-1 overflow-y-auto p-4">
//           <ul className="space-y-2">
//             {navItems.map(item => (
//               <li key={item.id}>
//                 <button
//                   onClick={() => {
//                     setActiveSection(item.id);
//                     setMobileMenuOpen(false);
//                   }}
//                   className={`block w-full text-left px-4 py-3 rounded-lg ${
//                     activeSection === item.id 
//                       ? 'bg-red-50 text-red-600 font-medium' 
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   {item.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
        
//         <div className="p-4 border-t space-y-3">
//           <button
//             onClick={() => {
//               setShowCandidateModal(true);
//               setMobileMenuOpen(false);
//             }}
//             className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200"
//           >
//             Candidate Portal
//           </button>
//           <button
//             onClick={() => {
//               setShowInternalModal(true);
//               setMobileMenuOpen(false);
//             }}
//             className="w-full px-4 py-3 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700"
//           >
//             Employee Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );

 

//   // Component: CareersSection
//   const CareersSection = () => {
//     const [formData, setFormData] = useState({
//       search: '',
//       location: '',
//       department: '',
//       position: ''
//     });
//     const [errors, setErrors] = useState<{ [key: string]: string }>({});
//     const [filteredJobs, setFilteredJobs] = useState(currentJobs);
//     const [experienceMin, setExperienceMin] = useState(0);
//     const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
//     const [featuredOnly, setFeaturedOnly] = useState(false);
//     const [remoteOnly, setRemoteOnly] = useState(false);
    
//     const locations = [...new Set(currentJobs.map(job => job.location))];
//     const departments = [...new Set(currentJobs.map(job => job.department))];
//     const positionLevels = [...new Set(currentJobs.map(job => job.level).filter(Boolean))];
//     const employmentTypes = [...new Set(currentJobs.map(job => job.employmentType || job.type).filter(Boolean))];

//     const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
//       const { name, value } = e.target;
//       setFormData(prev => ({ ...prev, [name]: value }));
      
//       // Clear related error
//       if (errors[name]) {
//         setErrors(prev => {
//           const newErrors = {...prev};
//           delete newErrors[name];
//           return newErrors;
//         });
//       }
//     };

//     const toggleEmploymentType = (type: string) => {
//       setSelectedEmploymentTypes(prev => 
//         prev.includes(type) 
//           ? prev.filter(t => t !== type) 
//           : [...prev, type]
//       );
//     };

//           const filterJobs = () => {
//       // Validate form if search is provided
//       if (formData.search) {
//         const newErrors: { [key: string]: string } = {};
        
//         if (formData.search.length < 2) {
//           newErrors.search = "Search term must be at least 2 characters";
//         }
        
//         if (Object.keys(newErrors).length > 0) {
//           setErrors(newErrors);
//           return;
//         }
//       }
      
//       // Filter jobs based on criteria
//       const filtered = currentJobs.filter(job => {
//         const searchMatch = !formData.search || 
//           job.title.toLowerCase().includes(formData.search.toLowerCase()) ||
//           job.description?.toLowerCase().includes(formData.search.toLowerCase());
          
//         const locationMatch = !formData.location || 
//           job.location.toLowerCase().includes(formData.location.toLowerCase());
          
//         const departmentMatch = !formData.department || 
//           job.department.toLowerCase() === formData.department.toLowerCase();
          
//         const positionMatch = !formData.position || 
//           job.level?.toLowerCase() === formData.position.toLowerCase();
          
//         const experienceMatch = !job.minExperience || job.minExperience >= experienceMin;
        
//         const employmentTypeMatch = selectedEmploymentTypes.length === 0 || 
//           selectedEmploymentTypes.includes(job.employmentType || job.type || '');
          
//         const featuredMatch = !featuredOnly || job.featured;
        
//         const remoteMatch = !remoteOnly || job.remote;
        
//         return searchMatch && locationMatch && departmentMatch && positionMatch && 
//                experienceMatch && employmentTypeMatch && featuredMatch && remoteMatch;
//       });
      
//       setFilteredJobs(filtered);
//     };

//     useEffect(() => {
//       if (Object.keys(errors).length === 0) {
//         filterJobs();
//       }
//     }, [
//       formData, 
//       errors, 
//       experienceMin, 
//       selectedEmploymentTypes, 
//       featuredOnly, 
//       remoteOnly
//     ]);

//     function setSalaryRange(arg0: number[]) {
//       throw new Error('Function not implemented.');
//     }

//     return (
//       <section className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Current Opportunities
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Find your perfect role and start making an impact in financial technology
//             </p>
//           </div>
          
//           {/* Modern Search and Filter Section */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-bold text-gray-900">
//                   Find Your Dream Job
//                 </h3>
//                 <button 
//                   onClick={() => setFilterOpen(!filterOpen)}
//                   className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
//                 >
//                   <Sliders className="w-5 h-5 mr-2" />
//                   <span className="font-medium">Advanced Filters</span>
//                 </button>
//               </div>
              
//               <div className="mt-4">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <div className="flex-1">
//                     <div className="relative">
//                       <input
//                         type="text"
//                         name="search"
//                         value={formData.search}
//                         onChange={handleInputChange}
//                         className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all
//                           ${errors.search ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="Job title, skills, or keywords..."
//                       />
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Search className="h-5 w-5 text-gray-400" />
//                       </div>
//                     </div>
//                     {errors.search && (
//                       <p className="text-red-500 text-xs mt-1">{errors.search}</p>
//                     )}
//                   </div>
                  
//                   <div className="md:w-1/4">
//                     <select
//                       name="location"
//                       value={formData.location}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                     >
//                       <option value="">All Locations</option>
//                       {locations.map((location, index) => (
//                         <option key={index} value={location}>{location}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <button
//                     onClick={filterJobs}
//                     className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
//                   >
//                     <Search className="w-5 h-5 mr-2" />
//                     Search Jobs
//                   </button>
//                 </div>
//               </div>
//             </div>
            
//             {/* Advanced Filters Panel */}
//             <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ${
//               filterOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
//             }`}>
//               <div className="p-6 border-t border-gray-200">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3">Department</h4>
//                     <select
//                       name="department"
//                       value={formData.department}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                     >
//                       <option value="">All Departments</option>
//                       {departments.map((dept, index) => (
//                         <option key={index} value={dept}>{dept}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3">Position Level</h4>
//                     <select
//                       name="position"
//                       value={formData.position}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                     >
//                       <option value="">All Levels</option>
//                       {positionLevels.map((level, index) => (
//                         <option key={index} value={level}>{level}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3">Minimum Experience</h4>
//                     <div className="flex items-center">
//                       <input
//                         type="range"
//                         min="0"
//                         max="10"
//                         step="1"
//                         value={experienceMin}
//                         onChange={(e) => setExperienceMin(parseInt(e.target.value))}
//                         className="w-full"
//                       />
//                       <span className="ml-3 min-w-[60px] text-gray-700">{experienceMin}+ years</span>
//                     </div>
//                   </div>
                  

                  
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3">Employment Type</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {employmentTypes.map((type, index) => (
//                         <button
//                           key={index}
//                           onClick={() => toggleEmploymentType(type)}
//                           className={`px-3 py-2 rounded-lg text-sm ${
//                             selectedEmploymentTypes.includes(type)
//                               ? 'bg-red-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           } transition-colors`}
//                         >
//                           {type}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-3">Job Options</h4>
//                     <div className="space-y-2">
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={featuredOnly}
//                           onChange={() => setFeaturedOnly(!featuredOnly)}
//                           className="rounded border-gray-300 text-red-600 focus:ring-red-500"
//                         />
//                         <span className="ml-2 text-gray-700">Featured Jobs Only</span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={remoteOnly}
//                           onChange={() => setRemoteOnly(!remoteOnly)}
//                           className="rounded border-gray-300 text-red-600 focus:ring-red-500"
//                         />
//                         <span className="ml-2 text-gray-700">Remote Jobs Only</span>
//                       </label>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="mt-6 flex justify-end">
//                   <button
//                     onClick={() => {
//                       // Reset all filters
//                       setFormData({search: '', location: '', department: '', position: ''});
//                       setSalaryRange([0, 100000]);
//                       setExperienceMin(0);
//                       setSelectedEmploymentTypes([]);
//                       setFeaturedOnly(false);
//                       setRemoteOnly(false);
//                     }}
//                     className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
//                   >
//                     Reset Filters
//                   </button>
//                   <button
//                     onClick={filterJobs}
//                     className="ml-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     Apply Filters
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Results Count */}
//           <div className="flex items-center justify-between mb-6">
//             <p className="text-gray-700">
//               <span className="font-semibold">{filteredJobs.length}</span> opportunities found
//             </p>
//           </div>
          
//           {filteredJobs.length === 0 ? (
//             <div className="text-center py-16 bg-white rounded-xl shadow-sm">
//               <div className="text-5xl mb-4">🔍</div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
//               <p className="text-gray-600">Try adjusting your search filters</p>
//               <button
//                 onClick={() => {
//                   // Reset all filters
//                   setFormData({search: '', location: '', department: '', position: ''});
//                   setSalaryRange([0, 100000]);
//                   setExperienceMin(0);
//                   setSelectedEmploymentTypes([]);
//                   setFeaturedOnly(false);
//                   setRemoteOnly(false);
//                 }}
//                 className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Reset Filters
//               </button>
//             </div>
//           ) : (
//             // New modern job cards layout
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {filteredJobs.map((job, index) => (
//                 <div 
//                   key={job.id}
//                   className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer transform hover:-translate-y-1 animate-fade-in relative"
//                   onClick={() => setSelectedJob(job)}
//                   style={{animationDelay: `${index * 100}ms`}}
//                 >
//                   {job.featured && (
//                     <div className="absolute top-0 right-0">
//                       <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
//                         Featured
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="p-6">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
//                           {job.title}
//                         </h3>
//                         <div className="flex items-center text-gray-600 mt-1">
//                           <Building className="w-4 h-4 flex-shrink-0 mr-1" />
//                           <span className="text-sm">{job.department}</span>
//                         </div>
//                       </div>
//                       <div className="flex flex-col items-end space-y-2 ml-4">
//                         {job.remote && (
//                           <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
//                             <Globe className="w-3 h-3 mr-1" />
//                             Remote
//                           </span>
//                         )}
//                         {job.urgent && (
//                           <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center animate-pulse">
//                             <Clock className="w-3 h-3 mr-1" />
//                             Urgent
//                           </span>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="border-t border-gray-100 py-3 mb-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="flex items-center text-gray-600">
//                           <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="text-sm">{job.location}</span>
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="text-sm">{job.type || job.employmentType}</span>
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <Clock8 className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="text-sm">
//                             {job.minExperience ? `${job.minExperience}+ years` : 'Any experience'}
//                           </span>
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
//                           <span className="text-sm">{job.salary}</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                    
//                     {job.skills && job.skills.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {job.skills.slice(0, 3).map((skill, index) => (
//                           <span key={index} className={`text-xs px-2 py-1 rounded-full flex items-center ${
//                             skill.isRequired 
//                               ? 'bg-red-50 text-red-700' 
//                               : 'bg-gray-100 text-gray-700'
//                           }`}>
//                             {skill.isRequired && <CheckCircle2 className="w-3 h-3 mr-1" />}
//                             {skill.name}
//                           </span>
//                         ))}
//                         {job.skills.length > 3 && (
//                           <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
//                             +{job.skills.length - 3} more
//                           </span>
//                         )}
//                       </div>
//                     )}
                    
//                     <div className="flex items-center justify-between mt-2">
//                       <span className="text-xs text-gray-500">{job.posted}</span>
//                       <button className="group-hover:bg-red-600 group-hover:text-white text-red-600 border border-red-600 px-4 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center">
//                         View Details
//                         <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           <div className="text-center mt-12">
//             <button 
//               onClick={() => setActiveSection('careers')}
//               className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
//             >
//               View All Positions
//               <ArrowRight className="ml-2 w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </section>
//     );
//   };


//   // Component: JobDetailModal
//   const JobDetailModal = () => {
//     if (!selectedJob) return null;
    
//     const handleApply = () => {
//       if (!isAuthenticated) {
//         setSelectedJob(null);
//         setShowCandidateModal(true);
//       } else {
//         setShowApplicationModal(true);
//       }
//     };
    
//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="min-h-screen px-4 text-center">
//           <div 
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
//             onClick={() => setSelectedJob(null)}
//           />
          
//           <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-4xl w-full relative animate-slide-up">
//             <button
//               onClick={() => setSelectedJob(null)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
//             >
//               <X className="h-6 w-6" />
//             </button>
            
//             <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-700">
//               <div className="absolute inset-0 bg-black/20" />
//               <div className="relative h-full flex items-end px-8 pb-8">
//                 <div className="text-white">
//                   <div className="flex items-center mb-2">
//                     {selectedJob.featured && (
//                       <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm mr-2">
//                         Featured
//                       </span>
//                     )}
//                     {selectedJob.remote && (
//                       <span className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm mr-2">
//                         Remote
//                       </span>
//                     )}
//                     {selectedJob.urgent && (
//                       <span className="bg-orange-600/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
//                         Urgent
//                       </span>
//                     )}
//                   </div>
//                   <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
//                   <div className="flex items-center space-x-4 text-white/90">
//                     <span className="flex items-center">
//                       <Building className="w-4 h-4 mr-1" />
//                       {selectedJob.department}
//                     </span>
//                     <span className="flex items-center">
//                       <MapPin className="w-4 h-4 mr-1" />
//                       {selectedJob.location}
//                     </span>
//                     <span className="flex items-center">
//                       <Briefcase className="w-4 h-4 mr-1" />
//                       {selectedJob.type || selectedJob.employmentType}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-8">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                 <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
//                   <DollarSign className="w-6 h-6 text-red-600 mb-2" />
//                   <span className="text-lg font-semibold text-gray-900">{selectedJob.salary}</span>
//                   <span className="text-gray-500 text-sm">Salary Range</span>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
//                   <Clock8 className="w-6 h-6 text-red-600 mb-2" />
//                   <span className="text-lg font-semibold text-gray-900">
//                     {selectedJob.minExperience ? `${selectedJob.minExperience}+ years` : 'Any experience'}
//                   </span>
//                   <span className="text-gray-500 text-sm">Experience Required</span>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
//                   <Calendar className="w-6 h-6 text-red-600 mb-2" />
//                   <span className="text-lg font-semibold text-gray-900">{selectedJob.posted?.replace('Posted ', '')}</span>
//                   <span className="text-gray-500 text-sm">Date Posted</span>
//                 </div>
//               </div>
              
//               {/* Overview Section */}
//               <div className="mb-8">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
//                   <BookOpen className="w-5 h-5 mr-2 text-red-600" />
//                   Job Overview
//                 </h3>
//                 <p className="text-gray-700">{selectedJob.description}</p>
//               </div>
              
//               {/* Required Skills Section */}
//               {selectedJob.skills && selectedJob.skills.length > 0 && (
//                 <div className="mb-8">
//                   <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
//                     <Tag className="w-5 h-5 mr-2 text-red-600" />
//                     Required Skills
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {selectedJob.skills.map((skill, index) => (
//                       <div key={index} className={`flex items-start p-3 rounded-lg ${
//                         skill.isRequired ? 'bg-red-50' : 'bg-gray-50'
//                       }`}>
//                         <div className={`mt-0.5 mr-3 ${
//                           skill.isRequired ? 'text-red-600' : 'text-gray-500'
//                         }`}>
//                           {skill.isRequired ? <CheckCircle2 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900">{skill.name}</div>
//                           <div className="text-sm text-gray-600">{skill.description}</div>
//                           <div className="text-xs text-gray-500 mt-1">
//                             Level: {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {/* Rich Description */}
//               {selectedJob.fullDescription ? (
//                 <div 
//                   className="prose max-w-none mb-8"
//                   dangerouslySetInnerHTML={{ __html: selectedJob.fullDescription }}
//                 />
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//                   {selectedJob.responsibilities && (
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h3>
//                       <ul className="space-y-2 text-gray-700">
//                         {selectedJob.responsibilities.split(',').map((item, index) => (
//                           <li key={index} className="flex items-start">
//                             <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
//                             <span>{item.trim()}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
                  
//                   {selectedJob.qualifications && (
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h3>
//                       <ul className="space-y-2 text-gray-700">
//                         {selectedJob.qualifications.split(',').map((item, index) => (
//                           <li key={index} className="flex items-start">
//                             <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
//                             <span>{item.trim()}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               )}
              
//               {/* Benefits Section */}
//               {selectedJob.benefits && (
//                 <div className="bg-gray-50 rounded-lg p-6 mb-8">
//                   <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
//                     <Heart className="w-5 h-5 mr-2 text-red-600" />
//                     Benefits
//                   </h3>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {selectedJob.benefits.split(',').map((benefit, index) => (
//                       <div key={index} className="flex items-center">
//                         <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
//                           <Check className="w-4 h-4 text-red-600" />
//                         </span>
//                         <span className="text-gray-700">{benefit.trim()}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               <div className="mt-8 flex gap-4">
//                 <button
//                   onClick={handleApply}
//                   className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all hover:scale-105 flex items-center justify-center"
//                 >
//                   <Sparkles className="w-5 h-5 mr-2" />
//                   Apply Now
//                 </button>
//                 <button
//                   onClick={() => setSelectedJob(null)}
//                   className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Component: ApplicationModal
//   const ApplicationModal = () => (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="min-h-screen px-4 text-center">
//         <div 
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
//           onClick={() => setShowApplicationModal(false)}
          
//         />
        
//         <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-md w-full relative p-8 animate-slide-up">
//           <button
//             onClick={() => setShowApplicationModal(false)}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="h-6 w-6" />
//           </button>
          
//           <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Application</h3>
          
//           <div className="space-y-4">
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <p className="text-green-800">Your CV is already on file. You can apply with just one click!</p>
//             </div>
            
//             <div className="text-gray-600">
//               <p className="mb-2"><strong>Position:</strong> {selectedJob?.title}</p>
//               <p className="mb-2"><strong>Department:</strong> {selectedJob?.department}</p>
//               <p><strong>Location:</strong> {selectedJob?.location}</p>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Additional Message (Optional)
//               </label>
//               <textarea
//                 rows={4}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                 placeholder="Add any additional information you'd like to share..."
//               />
//             </div>
            
//             <button
//               onClick={() => {
//                 setShowApplicationModal(false);
//                 setSelectedJob(null);
//                 // Show success message
//                 alert('Application submitted successfully!');
//               }}
//               className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors hover:scale-105 transform"
//             >
//               Submit Application
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Component: Modal
//   const Modal = ({
//     isOpen,
//     onClose,
//     children,
//   }: {
//     isOpen: boolean;
//     onClose: () => void;
//     children: React.ReactNode;
//   }) => {
//     if (!isOpen) return null;
    
//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="min-h-screen px-4 text-center">
//           <div 
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
//             onClick={onClose}
//           />
          
//           <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-md w-full relative animate-modal-enter">
//             <button
//               onClick={onClose}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="h-6 w-6" />
//             </button>
            
//             {children}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Component: CandidateModal
//   const CandidateModal = () => (
//     <div className="p-8">
//       <div className="text-center mb-8">
//         <div className="text-3xl font-bold mb-2">
//           <span className="text-red-600">/</span>vermeg
//         </div>
//         <h2 className="text-2xl font-bold text-gray-900">Candidate Portal</h2>
//         <p className="text-gray-600 mt-2">Sign in to access your applications</p>
//       </div>
      
//       <div className="flex space-x-4 mb-8">
//         <button
//           onClick={() => setIsSignup(false)}
//           className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${
//             !isSignup 
//               ? 'text-red-600 border-b-2 border-red-600' 
//               : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
//           }`}
//         >
//           Sign In
//         </button>
//         <button
//           onClick={() => setIsSignup(true)}
//           className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${
//             isSignup 
//               ? 'text-red-600 border-b-2 border-red-600' 
//               : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
//           }`}
//         >
//           Create Account
//         </button>
//       </div>
      
//       {!isSignup ? (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             <div className="relative">
//               <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="email"
//                 className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//                 placeholder="your.email@example.com"
//               />
//             </div>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//                 placeholder="••••••••"
//               />
//               <button
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
//               <span className="ml-2 text-sm text-gray-600">Remember me</span>
//             </label>
//             <a href="#" className="text-sm text-red-600 hover:text-red-700">Forgot password?</a>
//           </div>
          
//           <button 
//             onClick={() => {
//               setIsAuthenticated(true);
//               setShowCandidateModal(false);
//               if (selectedJob) {
//                 setShowApplicationModal(true);
//               }
//             }}
//             className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
//           >
//             Sign In
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
//               <input
//                 type="text"
//                 className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
//               <input
//                 type="text"
//                 className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//               />
//             </div>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             <input
//               type="email"
//               className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//               placeholder="your.email@example.com"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//             <div className="flex">
//               <div className="relative">
//                 <button
//                   type="button"
//                   className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100"
//                   onClick={() => setShowCountryDropdown(!showCountryDropdown)}
//                 >
//                   <span className="mr-1">{countryCodes.find(c => c.code === selectedCountryCode)?.flag}</span>
//                   <span>{selectedCountryCode}</span>
//                   <ChevronDown className="w-4 h-4 ml-1" />
//                 </button>
//                 {showCountryDropdown && (
//                   <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
//                     {countryCodes.map(country => (
//                       <button
//                         key={country.code}
//                         className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
//                         onClick={() => {
//                           setSelectedCountryCode(country.code);
//                           setShowCountryDropdown(false);
//                         }}
//                       >
//                         <span className="mr-2">{country.flag}</span>
//                         <span>{country.country}</span>
//                         <span className="ml-auto text-gray-500">{country.code}</span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <input
//                 type="tel"
//                 className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//                 placeholder="12 345 678"
//               />
//             </div>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
//               placeholder="Minimum 8 characters"
//             />
//           </div>
          
//           <div>
//             <label className="flex items-start">
//               <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1" />
//               <span className="ml-2 text-sm text-gray-600">
//                 I agree to the <a href="#" className="text-red-600 hover:text-red-700">Terms of Service</a> and{' '}
//                 <a href="#" className="text-red-600 hover:text-red-700">Privacy Policy</a>
//               </span>
//             </label>
//           </div>
          
//           <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
//             Create Account
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   // Component: InternalModal with enhanced validation and UI
//   const InternalModal = () => {
//     const [formData, setFormData] = useState({
//       username: '',
//       password: '',
//       role: ''
//     });
//     const [errors, setErrors] = useState<{ [key: string]: string }>({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [formSubmitted, setFormSubmitted] = useState(false);
    
//     const handleChange = (e: { target: { name: any; value: any; }; }) => {
//       const { name, value } = e.target;
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
      
//       // Clear error when user starts typing
//       if (errors[name]) {
//         setErrors(prev => {
//           const newErrors = {...prev};
//           delete newErrors[name];
//           return newErrors;
//         });
//       }
//     };
    
//     const validateForm = () => {
//       const newErrors: { [key: string]: string } = {};
      
//       if (!formData.username.trim()) {
//         newErrors.username = "Username is required";
//       }
      
//       if (!formData.password) {
//         newErrors.password = "Password is required";
//       } else if (formData.password.length < 8) {
//         newErrors.password = "Password must be at least 8 characters";
//       }
      
//       if (!formData.role) {
//         newErrors.role = "Please select your role";
//       }
      
//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };
    
//     const handleSubmit = (e: { preventDefault: () => void; }) => {
//       e.preventDefault();
//       setFormSubmitted(true);
      
//       if (validateForm()) {
//         // Would handle actual login here
//         console.log("Login successful", formData);
//       }
//     };
    
//     return (
//       <div className="p-8">
//         <div className="text-center mb-8">
//           <div className="text-4xl font-bold mb-4">
//             <span className="text-red-600">/</span>vermeg
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
//           <p className="text-gray-600 mt-2">Access internal systems with your Vermeg credentials</p>
//         </div>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//             <div className="relative">
//               <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
//                   errors.username ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="firstname.lastname"
//               />
//             </div>
//             {errors.username && (
//               <p className="mt-1 text-sm text-red-600 flex items-center">
//                 <span className="mr-1">⚠️</span>
//                 {errors.username}
//               </p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
//                   errors.password ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-600 flex items-center">
//                 <span className="mr-1">⚠️</span>
//                 {errors.password}
//               </p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
//             <div className="relative">
//               <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none ${
//                   errors.role ? 'border-red-500' : 'border-gray-300'
//                 }`}
//               >
//                 <option value="">Select your role</option>
//                 <option value="admin">Super Admin</option>
//                 <option value="hr">RH Admin</option>
//                 <option value="pl">Project Leader</option>
//                 <option value="ceo">CEO</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
//             </div>
//             {errors.role && (
//               <p className="mt-1 text-sm text-red-600 flex items-center">
//                 <span className="mr-1">⚠️</span>
//                 {errors.role}
//               </p>
//             )}
//           </div>
          
//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
//               <span className="ml-2 text-sm text-gray-600">Remember me</span>
//             </label>
//             <a href="#" className="text-sm text-red-600 hover:text-red-700">Forgot password?</a>
//           </div>
          
//           <button
//             type="submit"
//             className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
//           >
//             Sign In
//           </button>
          
//           {formSubmitted && Object.keys(errors).length > 0 && (
//             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-sm text-red-700">
//                 Please fix the errors above to continue.
//               </p>
//             </div>
//           )}
          
//           <div className="text-center text-sm text-gray-600">
//             Need assistance? Contact{' '}
//             <a href="mailto:it.support@vermeg.com" className="text-red-600 hover:text-red-700">
//               it.support@vermeg.com
//             </a>
//           </div>
//         </form>
//       </div>
//     );
//   };

  
//   // Effect to scroll to top when section changes
//   useEffect(() => {
//     // Scroll to the top of the page when the active section changes
//     window.scrollTo(0, 0);
//   }, [activeSection]);
  
//   // Render content based on active section
//   const renderContent = () => {
//     switch(activeSection) {
//       case 'home':
//         return <Hero />;
//       case 'process':
//         return <ProcessSteps />;
//       case 'careers':
//         return <CareersSection />;
//       case 'about':
//         return <AboutSection />;
//       default:
//         return <Hero />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <Navigation />
//       <MobileMenu />
      
//       {renderContent()}
      
//       <Footer />
      
//       <Modal isOpen={showCandidateModal} onClose={() => setShowCandidateModal(false)}>
//         <CandidateModal />
//       </Modal>
      
//       <Modal isOpen={showInternalModal} onClose={() => setShowInternalModal(false)}>
//         <InternalModal />
//       </Modal>
      
//       {selectedJob && <JobDetailModal />}
//       {showApplicationModal && <ApplicationModal />}
      
//       <style>{`
//         @keyframes modal-enter {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
        
//         @keyframes slide-up {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-modal-enter {
//           animation: modal-enter 0.3s ease-out;
//         }
        
//         .animate-slide-up {
//           animation: slide-up 0.4s ease-out;
//         }
        
//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out forwards;
//           opacity: 0;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default HomePage;


// HomePage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';
import { Footer } from '@/components/landing';
import { AboutSection } from '@/components/landing/AboutSection';
import { ProcessSteps } from '@/components/landing';
import { Hero } from '@/components/landing';
import { JobsList } from '@/components/landing';
import {
  ArrowRight, Globe, Users, Briefcase, Check, ChevronRight, Mail, Phone,
  MapPin, Star, Linkedin, Facebook, Twitter, Building, Target, Award, Heart,
  Search, Filter, Sparkles, Sliders, DollarSign, Tag, ExternalLink,
  CheckCircle2, BookOpen, Layers, Clock8, Clock
} from 'lucide-react';

// Import des modales et constantes
import {
  JobDetailModal
} from '@/components/modals';
import {Modal} from '@/components/common/Modal'
import { CURRENT_JOBS, NAV_ITEMS } from '@/data/constants';
import { Job, ModalStates, UIStates, FilterCriteria, FormData } from '@/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // États principaux groupés pour éviter les re-renders
  const [activeSection, setActiveSection] = useState('home');
  
  // États des modales centralisés
  const [modalStates, setModalStates] = useState<ModalStates>({
    showCandidateModal: false,
    showInternalModal: false,
    selectedJob: null
  });
  
  // États UI centralisés
  const [uiStates, setUiStates] = useState<UIStates>({
    isSignup: false,
    showPassword: false,
    isAuthenticated: false, // This will be overridden by the actual auth state
    selectedCountryCode: '+216',
    showCountryDropdown: false,
    mobileMenuOpen: false,
    filterOpen: false
  });

  // Timer conditionnel pour activeProcess - seulement actif sur la section process
  const [activeProcess, setActiveProcess] = useState(1);
  
  useEffect(() => {
    if (activeSection !== 'process') return;
    
    const timer = setInterval(() => {
      setActiveProcess(prev => prev >= 5 ? 1 : prev + 1);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [activeSection]);

  // Fonctions de gestion d'état mémorisées
  const handleModalToggle = useCallback((modalName: keyof ModalStates, value: boolean | Job | null = true) => {
    setModalStates(prev => ({
      ...prev,
      [modalName]: value
    }));
  }, []);

  const handleUIToggle = useCallback((stateName: keyof UIStates, value: boolean | string) => {
    setUiStates(prev => ({
      ...prev,
      [stateName]: value
    }));
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleJobSelect = useCallback((job: Job | null) => {
    setModalStates(prev => ({
      ...prev,
      selectedJob: job
    }));
  }, []);

  const handleJobApply = useCallback(() => {
    if (!isAuthenticated) {
      // Store the selected job in localStorage so we can redirect back after login
      if (modalStates.selectedJob) {
        localStorage.setItem('pendingJobApplication', JSON.stringify(modalStates.selectedJob));
        localStorage.setItem('redirectAfterLogin', `/apply/${modalStates.selectedJob.id}`);
      }
      // Close the job detail modal before navigating to login
      handleJobSelect(null);
      navigate('/auth/signin');
    } else {
      // Navigate directly to the full application form
      if (modalStates.selectedJob) {
        navigate(`/apply/${modalStates.selectedJob.id}`);
        // Close the job detail modal
        handleJobSelect(null);
      }
    }
  }, [isAuthenticated, modalStates.selectedJob, navigate, handleJobSelect]);







  // Composant CareersSection optimisé
  const CareersSection = useMemo(() => {
    return () => {
      const [formData, setFormData] = useState<FormData>({
        search: '',
        location: '',
        department: '',
        position: ''
      });
      const [errors, setErrors] = useState<{ [key: string]: string }>({});
      const [filteredJobs, setFilteredJobs] = useState(CURRENT_JOBS);
      const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
        experienceMin: 0,
        selectedEmploymentTypes: [],
        featuredOnly: false,
        remoteOnly: false
      });

      const locations = useMemo(() => [...new Set(CURRENT_JOBS.map(job => job.location))], []);
      const departments = useMemo(() => [...new Set(CURRENT_JOBS.map(job => job.department))], []);
      const positionLevels = useMemo(() => [...new Set(CURRENT_JOBS.map(job => job.level).filter(Boolean))], []);
      const employmentTypes = useMemo(() => [...new Set(CURRENT_JOBS.map(job => job.employmentType || job.type).filter(Boolean))], []);

      const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[name];
            return newErrors;
          });
        }
      }, [errors]);

      const filterJobs = useCallback(() => {
        if (formData.search && formData.search.length < 2) {
          setErrors({ search: "Le terme de recherche doit contenir au moins 2 caractères" });
          return;
        }
        
        setErrors({});
        
        const filtered = CURRENT_JOBS.filter(job => {
          const searchMatch = !formData.search || 
            job.title.toLowerCase().includes(formData.search.toLowerCase()) ||
            job.description?.toLowerCase().includes(formData.search.toLowerCase());
            
          const locationMatch = !formData.location || 
            job.location.toLowerCase().includes(formData.location.toLowerCase());
            
          const departmentMatch = !formData.department || 
            job.department.toLowerCase() === formData.department.toLowerCase();
            
          const positionMatch = !formData.position || 
            job.level?.toLowerCase() === formData.position.toLowerCase();
            
          const experienceMatch = !job.minExperience || job.minExperience >= filterCriteria.experienceMin;
          
          const employmentTypeMatch = filterCriteria.selectedEmploymentTypes.length === 0 || 
            filterCriteria.selectedEmploymentTypes.includes(job.employmentType || job.type || '');
            
          const featuredMatch = !filterCriteria.featuredOnly || job.featured;
          const remoteMatch = !filterCriteria.remoteOnly || job.remote;
          
          return searchMatch && locationMatch && departmentMatch && positionMatch && 
                 experienceMatch && employmentTypeMatch && featuredMatch && remoteMatch;
        });
        
        setFilteredJobs(filtered);
      }, [formData, filterCriteria]);

      // Effect optimisé avec debounce
      useEffect(() => {
        const timeoutId = setTimeout(() => {
          if (Object.keys(errors).length === 0) {
            filterJobs();
          }
        }, 300);
        
        return () => clearTimeout(timeoutId);
      }, [formData, filterCriteria, errors, filterJobs]);

      return (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Opportunités actuelles
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trouvez votre poste idéal et commencez à faire la différence dans les technologies financières
              </p>
            </div>
            
            {/* Section de recherche moderne */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Trouvez votre emploi de rêve
                  </h3>
                  <button 
                    onClick={() => handleUIToggle('filterOpen', !uiStates.filterOpen)}
                    className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <Sliders className="w-5 h-5 mr-2" />
                    <span className="font-medium">Filtres avancés</span>
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          name="search"
                          value={formData.search}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                            errors.search ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Titre du poste, compétences ou mots-clés..."
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {errors.search && (
                        <p className="text-red-500 text-xs mt-1">{errors.search}</p>
                      )}
                    </div>
                    
                    <div className="md:w-1/4">
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Toutes les localisations</option>
                        {locations.map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={filterJobs}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Rechercher
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compteur de résultats */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                <span className="font-semibold">{filteredJobs.length}</span> opportunités trouvées
              </p>
            </div>
            
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600">Essayez d'ajuster vos filtres de recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredJobs.map((job, index) => (
                  <div 
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer transform hover:-translate-y-1 animate-fade-in relative"
                    onClick={() => handleJobSelect(job)}
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    {job.featured && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                          Vedette
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <Building className="w-4 h-4 flex-shrink-0 mr-1" />
                            <span className="text-sm">{job.department}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          {job.remote && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              Télétravail
                            </span>
                          )}
                          {job.urgent && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 py-3 mb-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">{job.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">{job.type || job.employmentType}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock8 className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">
                              {job.minExperience ? `${job.minExperience}+ ans` : 'Toute expérience'}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">{job.salary}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                      
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span key={skillIndex} className={`text-xs px-2 py-1 rounded-full flex items-center ${
                              skill.isRequired 
                                ? 'bg-red-50 text-red-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {skill.isRequired && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {skill.name}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              +{job.skills.length - 3} de plus
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{job.posted}</span>
                        <button className="group-hover:bg-red-600 group-hover:text-white text-red-600 border border-red-600 px-4 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center">
                          Voir les détails
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <button 
                onClick={() => handleSectionChange('careers')}
                className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Voir tous les postes
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      );
    };
  }, [handleJobSelect, handleSectionChange, handleUIToggle, uiStates.filterOpen]);

  // Rendu conditionnel optimisé - Single page layout
  const renderContent = useMemo(() => {
    return (
      <>
        <section id="home">
          <Hero
            onExploreJobs={() => {
              const careersSection = document.getElementById('careers');
              careersSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            onLearnProcess={() => {
              const processSection = document.getElementById('process');
              processSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>
        <section id="careers" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <JobsList
              jobs={CURRENT_JOBS}
              onJobClick={handleJobSelect}
              onViewAll={() => {
                // Could navigate to a dedicated careers page
                console.log('View all jobs clicked');
              }}
              limit={4}
              showFeaturedOnly={false}
            />
          </div>
        </section>
        <div id="process">
          <ProcessSteps />
        </div>
        <section id="about">
          <AboutSection />
        </section>
      </>
    );
  }, [handleJobSelect]);



  return (
    <div className="min-h-screen bg-white">
      <DynamicNavbar />

      {renderContent}
      
      <Footer />
      
      {/* Modales conditionnelles */}
      
      {modalStates.selectedJob && (
        <JobDetailModal
          job={modalStates.selectedJob}
          onClose={() => handleJobSelect(null)}
          onApply={handleJobApply}
          isAuthenticated={isAuthenticated}
        />
      )}
      

      
      <style>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HomePage;