// src/api/client.js
import axios from 'axios';
import { calculateSkillMatchMetrics, isSkillMatch } from '../utils/skillMatcher';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api';

const API = axios.create({
  baseURL: FASTAPI_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
});

// Comprehensive Mock Data for Job Board (Used when FastAPI server is offline or initializing)
export const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Junior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India (Hybrid)',
    domain: 'Software Development',
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
    domain: 'Data Science',
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
    domain: 'Software Development',
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
    domain: 'Digital Marketing',
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
    domain: 'Software Development',
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
    domain: 'Data Science',
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
    domain: 'Software Development',
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
    domain: 'Digital Marketing',
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
export const fetchJobs = async (domain = '') => {
  try {
    const response = await API.get('/jobs', { params: domain && domain !== 'All Domains' ? { domain } : {} });
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    // Fallback to filtered mock
    if (domain && domain !== 'All Domains') {
      return MOCK_JOBS.filter((j) => j.domain.toLowerCase() === domain.toLowerCase());
    }
    return MOCK_JOBS;
  } catch (err) {
    console.warn('[AI Job API] FastAPI backend not available, running in mock mode:', err.message);
    if (domain && domain !== 'All Domains') {
      return MOCK_JOBS.filter((j) => j.domain.toLowerCase() === domain.toLowerCase());
    }
    return MOCK_JOBS;
  }
};

export const checkEligibility = async (userId, jobId, userProfile = null) => {
  try {
    const response = await API.post('/eligibility/check', {
      user_id: userId,
      job_id: jobId,
      profile: userProfile
    });
    if (response.data && typeof response.data.is_eligible === 'boolean') {
      return response.data;
    }
    const targetJob = MOCK_JOBS.find((j) => j.id === jobId) || MOCK_JOBS[0];
    return evaluateMockEligibility(targetJob, userProfile);
  } catch (err) {
    console.warn('[AI Job API] Live check failed, evaluating with intelligent mock engine:', err.message);
    const targetJob = MOCK_JOBS.find((j) => j.id === jobId) || MOCK_JOBS[0];
    return evaluateMockEligibility(targetJob, userProfile);
  }
};

export const applyToJob = async (userId, jobId, userProfile = null) => {
  try {
    const response = await API.post('/applications/apply', {
      user_id: userId,
      job_id: jobId,
      profile: userProfile
    });
    return response.data || { success: true, application_id: `APP-${Date.now()}` };
  } catch (err) {
    console.warn('[AI Job API] Live apply failed, completing via mock handler:', err.message);
    return {
      success: true,
      application_id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default API;
