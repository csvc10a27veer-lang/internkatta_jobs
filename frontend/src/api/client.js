// src/api/client.js
import axios from 'axios';
import api from '../utils/api';
import { calculateSkillMatchMetrics, isSkillMatch } from '../utils/skillMatcher';

const API = api;

// Comprehensive Mock Data for Job Board (Used when FastAPI server is offline or initializing)
export const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Junior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India (Hybrid)',
    domain: 'Software & Web Development',
    type: 'Full-time',
    salary: '₹6,00,000 - ₹9,00,000 / yr',
    experience: '0-2 Years',
    posted: '2 days ago',
    description: 'We are looking for a motivated Full Stack Developer to build scalable cloud web applications using React, Node.js, and MongoDB. You will collaborate closely with senior engineers, participate in code reviews, and ship features directly to thousands of users.',
    requirements: [
      'Strong proficiency in React.js, JavaScript (ES6+), and CSS3',
      'Knowledge of Node.js, Express, and RESTful API architecture',
      'Experience with MongoDB or PostgreSQL databases',
      'Completed verified internship or portfolio projects in web development'
    ],
    skills: ['React.js', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST APIs', 'Git'],
    required_internships: ['Full Stack Web Development Internship', 'React Frontend Development Internship'],
    featured: true
  },
  {
    id: 'job-2',
    title: 'Data Science & ML Associate',
    company: 'NeuralMetrics AI',
    location: 'Pune, India (Remote)',
    domain: 'Data Science & Analytics',
    type: 'Full-time',
    salary: '₹7,50,000 - ₹11,00,000 / yr',
    experience: '0-1 Years',
    posted: '1 day ago',
    description: 'Join our cutting-edge AI team to build predictive models, sentiment analysis pipelines, and machine learning dashboards. You will work on massive datasets and deploy models into production environments.',
    requirements: [
      'Strong hands-on Python programming (NumPy, Pandas, Scikit-Learn)',
      'Familiarity with Data Visualization tools (Matplotlib, Seaborn, PowerBI)',
      'Understanding of supervised/unsupervised machine learning algorithms',
      'Hands-on internship experience in Data Science & Analytics'
    ],
    skills: ['Python', 'Pandas', 'Machine Learning', 'Data Analysis', 'SQL', 'Scikit-Learn'],
    required_internships: ['Data Science & Machine Learning Internship', 'Python for Data Analysis'],
    featured: true
  },
  {
    id: 'job-3',
    title: 'Frontend React Developer',
    company: 'InnovateX Digital',
    location: 'Mumbai, India (On-site)',
    domain: 'Software & Web Development',
    type: 'Full-time',
    salary: '₹5,50,000 - ₹8,00,000 / yr',
    experience: 'Fresher / 0-1 Years',
    posted: 'Just now',
    description: 'Looking for a creative Frontend Developer proficient in modern React, TailwindCSS, and state management. You will convert Figma wireframes into pixel-perfect, responsive web apps with buttery-smooth animations.',
    requirements: [
      'Mastery of React hooks, context, and modern component lifecycle',
      'Expertise in responsive design, CSS/Tailwind, and cross-browser support',
      'Understanding of API integration and asynchronous JavaScript'
    ],
    skills: ['React.js', 'TailwindCSS', 'JavaScript', 'HTML5/CSS3', 'Vite', 'Redux/Zustand'],
    required_internships: ['React Frontend Development Internship', 'UI/UX & Web Design Program'],
    featured: false
  },
  {
    id: 'job-4',
    title: 'Digital Marketing & Growth Specialist',
    company: 'BrandElevate Media',
    location: 'Hyderabad, India (Hybrid)',
    domain: 'Marketing & Business',
    type: 'Full-time',
    salary: '₹4,50,000 - ₹6,50,000 / yr',
    experience: '0-2 Years',
    posted: '3 days ago',
    description: 'Drive high-impact user acquisition campaigns, SEO optimization, performance marketing, and social media growth strategies for high-growth tech startups.',
    requirements: [
      'Proven understanding of SEO, SEM, Google Ads, and Meta Business Suite',
      'Content strategy, email marketing, and web analytics tools',
      'Analytical mindset with experience tracking conversion funnels'
    ],
    skills: ['SEO', 'Google Ads', 'Content Marketing', 'Social Media Marketing', 'Google Analytics', 'Copywriting'],
    required_internships: ['Digital Marketing & SEO Internship'],
    featured: false
  },
  {
    id: 'job-5',
    title: 'Cloud & DevOps Engineer Intern/Fresher',
    company: 'CloudSphere Technologies',
    location: 'Bangalore, India (Remote)',
    domain: 'Cloud & DevOps',
    type: 'Full-time',
    salary: '₹6,50,000 - ₹9,50,000 / yr',
    experience: '0-1 Years',
    posted: '4 days ago',
    description: 'Help automate CI/CD pipelines, containerize microservices using Docker & Kubernetes, and manage AWS cloud infrastructure for enterprise clients.',
    requirements: [
      'Understanding of Linux command line and shell scripting',
      'Familiarity with AWS services (EC2, S3, RDS, IAM)',
      'Basic knowledge of Docker containers and CI/CD GitHub Actions'
    ],
    skills: ['AWS', 'Docker', 'Linux', 'CI/CD', 'Git', 'Kubernetes', 'Terraform'],
    required_internships: ['Cloud Computing & AWS DevOps Internship'],
    featured: false
  },
  {
    id: 'job-6',
    title: 'AI & Deep Learning Research Engineer',
    company: 'CognitiveCore Labs',
    location: 'Pune, India (Hybrid)',
    domain: 'AI & Machine Learning',
    type: 'Full-time',
    salary: '₹8,50,000 - ₹14,00,000 / yr',
    experience: '0-2 Years',
    posted: '1 day ago',
    description: 'Develop LLM integrations, fine-tune transformer models, and implement generative AI pipelines for enterprise clients.',
    requirements: [
      'Proficiency in PyTorch or TensorFlow, Hugging Face, and LangChain',
      'Deep understanding of NLP, transformers, and vector databases',
      'Relevant project portfolio or verified AI internship certification'
    ],
    skills: ['Python', 'PyTorch', 'LLMs', 'LangChain', 'NLP', 'Vector DBs'],
    required_internships: ['Artificial Intelligence & Deep Learning Internship', 'Generative AI Specialization'],
    featured: true
  }
];

// InternKatta Recommended Internships Catalog
export const INTERNKATTA_INTERNSHIPS_CATALOG = [
  {
    id: 'ik-fsd',
    title: 'Full Stack Web Development Internship',
    domain: 'Software & Web Development',
    url: '/internship',
    duration: '2 Months',
    rating: '4.9 ★',
    learners: '2,400+ Enrolled',
    skills: ['React.js', 'Node.js', 'MongoDB', 'Express', 'REST APIs', 'Git'],
    description: 'Build end-to-end full stack web applications with industrial mentorship, real client tasks, live deployment, and ISO certified offer letters.'
  },
  {
    id: 'ik-ds',
    title: 'Data Science & Machine Learning Internship',
    domain: 'Data Science & Analytics',
    url: '/internship',
    duration: '2 Months',
    rating: '4.8 ★',
    learners: '1,900+ Enrolled',
    skills: ['Python', 'Pandas', 'Machine Learning', 'Data Analysis', 'SQL', 'Scikit-Learn'],
    description: 'Master data analysis, exploratory modeling, ML algorithms, and AI model deployment with end-to-end industry datasets.'
  },
  {
    id: 'ik-fe',
    title: 'React Frontend Development Internship',
    domain: 'Software & Web Development',
    url: '/internship',
    duration: '1 Month',
    rating: '4.9 ★',
    learners: '1,650+ Enrolled',
    skills: ['React.js', 'TailwindCSS', 'JavaScript', 'HTML5/CSS3', 'Vite'],
    description: 'Create ultra-fast, modern reactive applications with Tailwind CSS, API caching, state management, and real UI projects.'
  },
  {
    id: 'ik-dm',
    title: 'Digital Marketing & SEO Internship',
    domain: 'Marketing & Business',
    url: '/internship',
    duration: '1 Month',
    rating: '4.7 ★',
    learners: '1,200+ Enrolled',
    skills: ['SEO', 'Google Ads', 'Content Marketing', 'Social Media Marketing', 'Google Analytics'],
    description: 'Run live performance marketing campaigns, optimize search engine rankings, and master social media growth automation.'
  },
  {
    id: 'ik-cloud',
    title: 'Cloud Computing & AWS DevOps Internship',
    domain: 'Cloud & DevOps',
    url: '/internship',
    duration: '2 Months',
    rating: '4.9 ★',
    learners: '1,100+ Enrolled',
    skills: ['AWS', 'Docker', 'Linux', 'CI/CD', 'Git', 'Kubernetes'],
    description: 'Hands-on training in AWS infrastructure, container orchestration with Docker, and automated CI/CD deployment pipelines.'
  },
  {
    id: 'ik-ai',
    title: 'Artificial Intelligence & Deep Learning Internship',
    domain: 'AI & Machine Learning',
    url: '/internship',
    duration: '2 Months',
    rating: '4.9 ★',
    learners: '1,850+ Enrolled',
    skills: ['Python', 'PyTorch', 'LLMs', 'LangChain', 'NLP', 'Vector DBs'],
    description: 'Implement neural architectures, LLM prompt engineering, fine-tuning, and modern AI automation pipelines.'
  }
];

// Helper: Mock Eligibility Evaluation Logic
export const evaluateMockEligibility = (job, userProfile) => {
  if (!job) {
    return {
      is_eligible: false,
      match_score: 0,
      matched_skills: [],
      missing_skills: [],
      recommended_internships: []
    };
  }

  if (!userProfile) {
    return {
      is_eligible: false,
      match_score: 0,
      matched_skills: [],
      missing_skills: job.skills || [],
      recommended_internships: INTERNKATTA_INTERNSHIPS_CATALOG.filter(
        (ik) => ik.domain === job.domain || ik.skills.some((s) => (job.skills || []).some((js) => isSkillMatch(js, s)))
      )
    };
  }

  // Check if candidate explicitly marked verified internship completed
  const completedInternships = userProfile.completedInternships || [];
  const hasMatchingInternship = (job.required_internships || []).some(
    (req) => completedInternships.includes(req) || completedInternships.some((c) => c.toLowerCase().includes(job.domain.toLowerCase()))
  );

  // Exact Canonical Skill overlap calculation
  const {
    matchedSkills,
    missingSkills,
    matchedCount,
    matchPercentage
  } = calculateSkillMatchMetrics(userProfile.skills || [], job.skills || []);

  const userSkillsCount = (userProfile.skills || []).length;

  // Criteria: Either candidate has a verified completed internship OR has >= 70% matching skills with at least 3 skills
  const isEligible = Boolean(
    hasMatchingInternship ||
    (userProfile.isEligibleOverride === true) ||
    (matchPercentage >= 70 && userSkillsCount >= 3)
  );

  // Find relevant InternKatta recommendations
  let recos = INTERNKATTA_INTERNSHIPS_CATALOG.filter((ik) => {
    return ik.domain === job.domain || ik.skills.some((s) => (job.skills || []).some((js) => isSkillMatch(js, s)));
  });

  if (recos.length === 0) {
    recos = [INTERNKATTA_INTERNSHIPS_CATALOG[0]];
  }

  return {
    is_eligible: isEligible,
    match_score: matchPercentage,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    recommended_internships: recos
  };
};

// API Methods
export const fetchJobs = async (filters = {}) => {
  try {
    const params = {};
    if (typeof filters === 'string') {
      if (filters && filters !== 'All Domains') params.domain = filters;
    } else if (filters && typeof filters === 'object') {
      if (filters.domain && filters.domain !== 'All Domains') params.domain = filters.domain;
      if (filters.location && filters.location !== 'All Locations') params.location = filters.location;
      if (filters.search) params.search = filters.search;
    }

    const response = await api.get('/api/jobs', { params });
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return MOCK_JOBS;
  } catch (err) {
    console.warn('[Jobs API] Live backend fetch error, falling back to mock:', err.message);
    if (typeof filters === 'string' && filters && filters !== 'All Domains') {
      return MOCK_JOBS.filter((j) => j.domain?.toLowerCase() === filters.toLowerCase());
    }
    return MOCK_JOBS;
  }
};

export const fetchJobById = async (id) => {
  try {
    const response = await api.get(`/api/jobs/${id}`);
    if (response.data && (response.data._id || response.data.id)) {
      return response.data;
    }
    return MOCK_JOBS.find((j) => j.id === id || j._id === id) || null;
  } catch (err) {
    return MOCK_JOBS.find((j) => j.id === id || j._id === id) || null;
  }
};

export const checkEligibility = async (userId, jobId, userProfile = null) => {
  try {
    let targetJob = MOCK_JOBS.find((j) => j.id === jobId || j._id === jobId);
    if (!targetJob && jobId) {
      targetJob = await fetchJobById(jobId);
    }
    return evaluateMockEligibility(targetJob || MOCK_JOBS[0], userProfile);
  } catch (err) {
    console.warn('[AI Job API] Live check failed, evaluating with intelligent mock engine:', err.message);
    const targetJob = MOCK_JOBS.find((j) => j.id === jobId || j._id === jobId) || MOCK_JOBS[0];
    return evaluateMockEligibility(targetJob, userProfile);
  }
};

export const applyToJob = async (userId, jobId, userProfile = null) => {
  try {
    const response = await api.post('/api/applications/apply', {
      user_id: userId,
      job_id: jobId,
      profile: userProfile
    });
    return response.data || { success: true, application_id: `APP-${Date.now()}` };
  } catch (err) {
    return {
      success: true,
      application_id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default API;
