import { Job } from '@/types/job';

export const currentJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Senior',
    salary: '€50K - €70K',
    salaryRangeMin: 50000,
    salaryRangeMax: 70000,
    displaySalary: true,
    minExperience: 5,
    posted: 'Posted 2 days ago',
    description: 'We are looking for an experienced Full Stack Developer to join our engineering team...',
    responsibilities: 'Design and implement scalable web applications, collaborate with cross-functional teams, ensure code quality through testing',
    qualifications: 'Strong proficiency in Angular, TypeScript, and modern JavaScript, experience with Java Spring Boot',
    benefits: 'Competitive salary, flexible working arrangements, health insurance and wellness programs',
    fullDescription: `
      <h3>About the Role</h3>
      <p>We are seeking an experienced Full Stack Developer to join our core engineering team and help build the next generation of financial software solutions. You will work on challenging projects that directly impact millions of users across the globe.</p>
      
      <h3>Key Responsibilities</h3>
      <ul>
        <li>Design and implement scalable web applications using Angular and Spring Boot</li>
        <li>Collaborate with cross-functional teams to define and ship new features</li>
        <li>Ensure code quality through comprehensive testing and code reviews</li>
        <li>Mentor junior developers and contribute to technical documentation</li>
        <li>Participate in architecture decisions and technology selection</li>
      </ul>
      
      <h3>Requirements</h3>
      <ul>
        <li>5+ years of experience in full-stack development</li>
        <li>Strong proficiency in Angular, TypeScript, and modern JavaScript</li>
        <li>Experience with Java Spring Boot and microservices architecture</li>
        <li>Solid understanding of RESTful APIs and database design</li>
        <li>Experience with cloud platforms (AWS, Azure) is a plus</li>
      </ul>
      
      <h3>What We Offer</h3>
      <ul>
        <li>Competitive salary and benefits package</li>
        <li>Flexible working arrangements</li>
        <li>Continuous learning and development opportunities</li>
        <li>International work environment</li>
        <li>Health insurance and wellness programs</li>
      </ul>
    `,
    skills: [
      {
        name: 'Angular',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Frontend development with Angular framework'
      },
      {
        name: 'Java',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Backend development with Java'
      },
      {
        name: 'Spring Boot',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Building microservices with Spring Boot'
      },
      {
        name: 'MongoDB',
        isRequired: false,
        level: 'INTERMEDIATE',
        description: 'Working with NoSQL databases'
      }
    ],
    tags: ['Angular', 'Java', 'Spring Boot', 'MongoDB'],
    featured: true
  },
  {
    id: 2,
    title: 'Product Manager - Fintech',
    department: 'Product',
    location: 'Paris, France',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Mid-Senior',
    salary: '€65K - €85K',
    salaryRangeMin: 65000,
    salaryRangeMax: 85000,
    displaySalary: true,
    minExperience: 3,
    posted: 'Posted 5 days ago',
    description: 'Lead product strategy and development for our innovative fintech solutions...',
    responsibilities: 'Define product roadmap, collaborate with engineering teams, conduct market research, work with customers',
    qualifications: 'Strong understanding of financial markets and regulations, excellent communication skills',
    benefits: 'Competitive pay, flexible work arrangements, professional development opportunities',
    skills: [
      {
        name: 'Agile',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Agile methodologies and product management'
      },
      {
        name: 'Fintech',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Understanding of fintech landscape'
      }
    ],
    tags: ['Agile', 'Fintech', 'Strategy', 'Leadership'],
    remote: true
  },
  {
    id: 3,
    title: 'Data Science Lead',
    department: 'Analytics',
    location: 'Luxembourg',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Lead',
    salary: '€80K - €100K',
    salaryRangeMin: 80000,
    salaryRangeMax: 100000,
    displaySalary: true,
    minExperience: 7,
    posted: 'Posted 1 week ago',
    description: 'Lead our data science initiatives and build advanced analytics solutions...',
    responsibilities: 'Lead a team of data scientists, develop ML models, design data pipelines, collaborate with product teams',
    qualifications: 'Strong programming skills in Python and R, experience with big data technologies, deep understanding of ML algorithms',
    benefits: 'Competitive salary, flexible work arrangements, professional growth opportunities, modern workspace',
    skills: [
      {
        name: 'Python',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Data analysis and ML model development'
      },
      {
        name: 'Machine Learning',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Building ML models for finance'
      }
    ],
    tags: ['Python', 'Machine Learning', 'Big Data'],
    urgent: true
  },
  {
    id: 4,
    title: 'Développeur Full-Stack Java/React',
    department: 'IT',
    location: 'Monastir, Tunisie',
    employmentType: 'FULL_TIME',
    type: 'Full-time',
    level: 'Mid-level',
    salary: '€20K - €55K',
    salaryRangeMin: 20000,
    salaryRangeMax: 55000,
    displaySalary: true,
    minExperience: 2,
    posted: 'Posted 3 days ago',
    description: 'Nous recherchons un développeur Full-Stack expérimenté pour rejoindre notre équipe de développement produit.',
    responsibilities: 'Concevoir et développer des applications web responsive, collaborer avec l\'équipe produit, participer aux revues de code.',
    qualifications: 'Expérience en développement avec Spring Boot et React, connaissance des bases de données SQL, expérience en développement agile.',
    benefits: 'Horaires flexibles, formation continue, assurance santé, environnement de travail moderne.',
    skills: [
      {
        name: 'React',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Frontend development with React'
      },
      {
        name: 'Docker',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Containerization and deployment'
      }
    ],
    tags: ['React', 'Java', 'Spring Boot', 'SQL', 'Docker'],
    featured: false
  }
];