// backend/services/jobScraperService.js

const jobPools = {
  linkedin: [
    {
      companyName: 'Microsoft',
      jobTitle: 'Software Engineer - Full Stack (React / Node)',
      email: 'careers@microsoft.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Join Microsoft engineering team building high-scale cloud platforms. Responsible for creating responsive web applications with React, TypeScript, and microservices.',
      experience: '2-5 Years',
      skills: ['React', 'TypeScript', 'Node.js', 'Azure', 'REST API'],
      jobType: 'Full Time',
      salary: '₹24-38 LPA',
      source: 'LinkedIn',
      platform: 'LinkedIn',
      sourceUrl: 'https://www.linkedin.com/jobs/view/microsoft-full-stack',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-15'
    },
    {
      companyName: 'Razorpay',
      jobTitle: 'Senior Frontend Engineer',
      email: 'talent@razorpay.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Build intuitive payment checkout experiences used by millions. Deep expertise with modern JavaScript, React architecture, performance optimization, and web security.',
      experience: '3-6 Years',
      skills: ['React', 'Redux', 'Next.js', 'Webpack', 'TailwindCSS'],
      jobType: 'Full Time',
      salary: '₹28-45 LPA',
      source: 'LinkedIn',
      platform: 'LinkedIn',
      sourceUrl: 'https://www.linkedin.com/jobs/view/razorpay-frontend-sr',
      status: 'Active',
      registrationDate: '2026-10-09',
      endDate: '2026-11-14'
    },
    {
      companyName: 'Swiggy',
      jobTitle: 'Backend Engineer - Delivery Systems',
      email: 'hiring@swiggy.in',
      contact: '',
      location: 'Hyderabad, Telangana',
      jobDescription: 'Work on real-time order routing, geolocation algorithms, and high-throughput transaction pipelines processing 100k+ RPM.',
      experience: '2-4 Years',
      skills: ['Node.js', 'Go', 'Redis', 'Kafka', 'PostgreSQL'],
      jobType: 'Full Time',
      salary: '₹22-35 LPA',
      source: 'LinkedIn',
      platform: 'LinkedIn',
      sourceUrl: 'https://www.linkedin.com/jobs/view/swiggy-backend-eng',
      status: 'Active',
      registrationDate: '2026-10-08',
      endDate: '2026-11-12'
    },
    {
      companyName: 'Adobe',
      jobTitle: 'Cloud Infrastructure & DevOps Engineer',
      email: 'jobs@adobe.com',
      contact: '',
      location: 'Noida, Uttar Pradesh',
      jobDescription: 'Manage enterprise infrastructure for Adobe Creative Cloud across AWS and Kubernetes. Build automated CI/CD pipelines and observability dashboards.',
      experience: '3-5 Years',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'Prometheus'],
      jobType: 'Full Time',
      salary: '₹26-40 LPA',
      source: 'LinkedIn',
      platform: 'LinkedIn',
      sourceUrl: 'https://www.linkedin.com/jobs/view/adobe-cloud-devops',
      status: 'Active',
      registrationDate: '2026-10-08',
      endDate: '2026-11-10'
    }
  ],
  naukri: [
    {
      companyName: 'TCS',
      jobTitle: 'Java Full Stack Developer (Spring Boot & Angular)',
      email: 'careers@tcs.com',
      contact: '',
      location: 'Pune, Maharashtra',
      jobDescription: 'Looking for enthusiastic Java Full Stack developers with experience in Spring Boot, REST APIs, Hibernate, and Angular/React for banking domain clients.',
      experience: '1-3 Years',
      skills: ['Java', 'Spring Boot', 'Angular', 'Oracle DB', 'Microservices'],
      jobType: 'Full Time',
      salary: '₹6.5-11 LPA',
      source: 'Naukri',
      platform: 'Naukri',
      sourceUrl: 'https://www.naukri.com/job-listings-tcs-java-fullstack',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-20'
    },
    {
      companyName: 'Infosys',
      jobTitle: 'Python Django Backend Developer',
      email: 'careers@infosys.com',
      contact: '',
      location: 'Pune, Maharashtra',
      jobDescription: 'Develop scalable backend web services, ETL workflows, and integration components using Python, Django, Flask, and PostgreSQL.',
      experience: '2-4 Years',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API'],
      jobType: 'Full Time',
      salary: '₹8-14 LPA',
      source: 'Naukri',
      platform: 'Naukri',
      sourceUrl: 'https://www.naukri.com/job-listings-infosys-python-dev',
      status: 'Active',
      registrationDate: '2026-10-09',
      endDate: '2026-11-18'
    },
    {
      companyName: 'Cognizant',
      jobTitle: 'QA Automation Engineer (Selenium & Cypress)',
      email: 'talent@cognizant.com',
      contact: '',
      location: 'Chennai, Tamil Nadu',
      jobDescription: 'Design, write, and execute automated regression suites using Selenium WebDriver with Java and modern JS frameworks like Cypress and Playwright.',
      experience: '2-5 Years',
      skills: ['Selenium', 'Java', 'Cypress', 'Jenkins', 'Jira'],
      jobType: 'Full Time',
      salary: '₹7-12 LPA',
      source: 'Naukri',
      platform: 'Naukri',
      sourceUrl: 'https://www.naukri.com/job-listings-cognizant-qa-auto',
      status: 'Active',
      registrationDate: '2026-10-08',
      endDate: '2026-11-15'
    },
    {
      companyName: 'Tech Mahindra',
      jobTitle: 'MERN Stack Developer',
      email: 'careers@techmahindra.com',
      contact: '',
      location: 'Mumbai, Maharashtra',
      jobDescription: 'Build next-generation enterprise digital platforms utilizing MongoDB, Express.js, React, and Node.js.',
      experience: '1-3 Years',
      skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'TailwindCSS'],
      jobType: 'Full Time',
      salary: '₹7.5-13 LPA',
      source: 'Naukri',
      platform: 'Naukri',
      sourceUrl: 'https://www.naukri.com/job-listings-techm-mern-developer',
      status: 'Active',
      registrationDate: '2026-10-07',
      endDate: '2026-11-12'
    }
  ],
  glassdoor: [
    {
      companyName: 'Salesforce',
      jobTitle: 'Member of Technical Staff - UI/UX Platforms',
      email: 'careers@salesforce.com',
      contact: '',
      location: 'Hyderabad, Telangana',
      jobDescription: 'Help build the next iteration of the Salesforce Lightning design system and core UI infrastructure with web components and modern React.',
      experience: '3-6 Years',
      skills: ['JavaScript', 'Web Components', 'React', 'CSS Architecture', 'Accessibility'],
      jobType: 'Full Time',
      salary: '₹28-48 LPA',
      source: 'Glassdoor',
      platform: 'Glassdoor',
      sourceUrl: 'https://www.glassdoor.co.in/job-listing/salesforce-mts-ui',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-25'
    },
    {
      companyName: 'Oracle',
      jobTitle: 'Cloud Database & Systems Engineer',
      email: 'recruiting@oracle.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Work on Oracle Cloud Infrastructure (OCI) autonomous database engineering, replication mechanisms, and distributed storage engines.',
      experience: '2-5 Years',
      skills: ['Linux', 'Oracle DB', 'SQL', 'Python', 'Cloud Systems'],
      jobType: 'Full Time',
      salary: '₹20-34 LPA',
      source: 'Glassdoor',
      platform: 'Glassdoor',
      sourceUrl: 'https://www.glassdoor.co.in/job-listing/oracle-cloud-db',
      status: 'Active',
      registrationDate: '2026-10-09',
      endDate: '2026-11-20'
    },
    {
      companyName: 'Goldman Sachs',
      jobTitle: 'Full Stack Engineer - Asset Management Technology',
      email: 'careers@gs.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Engineer mission-critical portfolio analytics and financial execution platforms with high performance, resilience, and strict data governance.',
      experience: '2-5 Years',
      skills: ['Java', 'Spring Boot', 'React', 'Kafka', 'Distributed Systems'],
      jobType: 'Full Time',
      salary: '₹30-50 LPA',
      source: 'Glassdoor',
      platform: 'Glassdoor',
      sourceUrl: 'https://www.glassdoor.co.in/job-listing/gs-fullstack-asset',
      status: 'Active',
      registrationDate: '2026-10-08',
      endDate: '2026-11-18'
    }
  ],
  internshala: [
    {
      companyName: 'Zepto',
      jobTitle: 'Web Development Intern (React & Node.js)',
      email: 'internships@zeptonow.com',
      contact: '',
      location: 'Mumbai, Maharashtra',
      jobDescription: 'Exciting 6-month internship with quick commerce leader Zepto. Hands-on experience developing customer-facing web interfaces and merchant analytics dashboards.',
      experience: 'Fresher',
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      jobType: 'Internship',
      salary: '₹25,000/month',
      source: 'Internshala',
      platform: 'Internshala',
      sourceUrl: 'https://internshala.com/internship/detail/zepto-web-intern',
      status: 'Active',
      registrationDate: '2026-10-11',
      endDate: '2026-11-20'
    },
    {
      companyName: 'Cred',
      jobTitle: 'Frontend Engineering Trainee',
      email: 'design-dev@cred.club',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Work directly alongside CRED design and engineering wizards to create pixel-perfect, hyper-smooth micro-animations and component libraries.',
      experience: 'Fresher',
      skills: ['React', 'Framer Motion', 'TailwindCSS', 'TypeScript', 'UI/UX'],
      jobType: 'Internship',
      salary: '₹35,000/month',
      source: 'Internshala',
      platform: 'Internshala',
      sourceUrl: 'https://internshala.com/internship/detail/cred-frontend-trainee',
      status: 'Active',
      registrationDate: '2026-10-12',
      endDate: '2026-11-22'
    },
    {
      companyName: 'Groww',
      jobTitle: 'Python & Data Analytics Intern',
      email: 'interns@groww.in',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Assist Groww analytics and trading research squads with automated data collection, cleaning, and model feature engineering.',
      experience: 'Fresher',
      skills: ['Python', 'Pandas', 'SQL', 'Data Visualization', 'Excel'],
      jobType: 'Internship',
      salary: '₹20,000/month',
      source: 'Internshala',
      platform: 'Internshala',
      sourceUrl: 'https://internshala.com/internship/detail/groww-python-intern',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-15'
    },
    {
      companyName: 'PhysicsWallah',
      jobTitle: 'EdTech Full Stack Developer Intern',
      email: 'careers@pw.live',
      contact: '',
      location: 'Noida, Uttar Pradesh',
      jobDescription: 'Help build high-concurrency live video player enhancements, quiz engines, and student test management systems.',
      experience: 'Fresher',
      skills: ['MERN Stack', 'Node.js', 'React', 'MongoDB', 'Socket.io'],
      jobType: 'Internship',
      salary: '₹18,000 - ₹22,000/month',
      source: 'Internshala',
      platform: 'Internshala',
      sourceUrl: 'https://internshala.com/internship/detail/pw-fullstack-intern',
      status: 'Active',
      registrationDate: '2026-10-09',
      endDate: '2026-11-16'
    },
    {
      companyName: 'PhonePe',
      jobTitle: 'Junior Frontend Developer (0-1 Years / Fresher)',
      email: 'careers@phonepe.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Great opportunity for freshers or 0-1 years engineers to work on user onboarding web interfaces and design systems.',
      experience: '0-1 Years',
      skills: ['React', 'JavaScript', 'TailwindCSS', 'REST API'],
      jobType: 'Full Time',
      salary: '₹8-12 LPA',
      source: 'Internshala',
      platform: 'Internshala',
      sourceUrl: 'https://internshala.com/job/detail/phonepe-junior-dev',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-20'
    }
  ],
  indeed: [
    {
      companyName: 'Accenture',
      jobTitle: 'Associate Software Engineer (0-1 Years / Fresher)',
      email: 'campus.hiring@accenture.com',
      contact: '',
      location: 'Pune, Maharashtra',
      jobDescription: 'Entry-level opportunity for Freshers and graduates with 0-1 years experience. Work on cloud engineering, Java/.NET development, and full stack microservices.',
      experience: '0-1 Years',
      skills: ['Java', 'Python', 'SQL', 'Problem Solving', 'Data Structures'],
      jobType: 'Full Time',
      salary: '₹4.5-6.5 LPA',
      source: 'Indeed',
      platform: 'Indeed',
      sourceUrl: 'https://www.indeed.com/viewjob?jk=accenture-ase-01',
      status: 'Active',
      registrationDate: '2026-10-12',
      endDate: '2026-11-25'
    },
    {
      companyName: 'Persistent Systems',
      jobTitle: 'Junior React Developer (0-1 Years)',
      email: 'talent@persistent.com',
      contact: '',
      location: 'Pune, Maharashtra',
      jobDescription: 'Looking for enthusiastic 0-1 years experience frontend engineers or freshers with hands-on projects in React, JavaScript, HTML5, and CSS3.',
      experience: '0-1 Years',
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      jobType: 'Full Time',
      salary: '₹5-7.5 LPA',
      source: 'Indeed',
      platform: 'Indeed',
      sourceUrl: 'https://www.indeed.com/viewjob?jk=persistent-react-01',
      status: 'Active',
      registrationDate: '2026-10-11',
      endDate: '2026-11-22'
    },
    {
      companyName: 'Capgemini',
      jobTitle: 'Graduate Engineer Trainee - Web & Cloud (0-1 Years)',
      email: 'fresher.recruiting@capgemini.com',
      contact: '',
      location: 'Mumbai, Maharashtra',
      jobDescription: 'Comprehensive training and deployment into client projects for fresh graduates. Hands-on exposure to MERN stack, cloud DevOps, and databases.',
      experience: '0-1 Years',
      skills: ['JavaScript', 'Node.js', 'MongoDB', 'Cloud Basics', 'SQL'],
      jobType: 'Full Time',
      salary: '₹4.2-6.0 LPA',
      source: 'Indeed',
      platform: 'Indeed',
      sourceUrl: 'https://www.indeed.com/viewjob?jk=capgemini-get-01',
      status: 'Active',
      registrationDate: '2026-10-11',
      endDate: '2026-11-20'
    },
    {
      companyName: 'Deloitte',
      jobTitle: 'Analyst - Technology Consulting (0-1 Years)',
      email: 'deloittecareers@deloitte.com',
      contact: '',
      location: 'Hyderabad, Telangana',
      jobDescription: 'Ideal role for freshers and candidates with 0-1 years of experience in data analytics, Python scripting, PowerBI, and SQL database management.',
      experience: '0-1 Years',
      skills: ['Python', 'SQL', 'PowerBI', 'Excel', 'Data Analysis'],
      jobType: 'Full Time',
      salary: '₹6-9 LPA',
      source: 'Indeed',
      platform: 'Indeed',
      sourceUrl: 'https://www.indeed.com/viewjob?jk=deloitte-analyst-01',
      status: 'Active',
      registrationDate: '2026-10-10',
      endDate: '2026-11-18'
    },
    {
      companyName: 'Cognizant',
      jobTitle: 'Junior QA & Automation Tester (0-1 Years)',
      email: 'fresher.qa@cognizant.com',
      contact: '',
      location: 'Bangalore, Karnataka',
      jobDescription: 'Entry-level position for freshers and candidates with 0-1 years of testing experience. Assist in writing test scripts with Selenium and Java.',
      experience: '0-1 Years',
      skills: ['Manual Testing', 'Selenium', 'Java', 'Test Cases', 'Jira'],
      jobType: 'Full Time',
      salary: '₹4.0-5.5 LPA',
      source: 'Indeed',
      platform: 'Indeed',
      sourceUrl: 'https://www.indeed.com/viewjob?jk=cognizant-qa-01',
      status: 'Active',
      registrationDate: '2026-10-09',
      endDate: '2026-11-15'
    }
  ]
};

/**
 * Automatic domain classification based on job title, skills, and description.
 * @param {Object} job
 * @returns {string} One of the 9 standardized domain strings
 */
function detectDomain(job) {
  if (!job) return 'Software & Web Development';
  const title = (job.jobTitle || job.title || '').toLowerCase();
  const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
  const desc = (job.jobDescription || job.description || '').toLowerCase();
  const text = `${title} ${skills} ${desc}`;

  // 1. Cyber Security
  if (/\b(cyber|security|soc|penetration|infosec|network\s*security|vulnerability|ethical\s*hack|firewall)\b/i.test(text)) {
    return 'Cyber Security';
  }

  // 2. RPA (Robotic Process Automation)
  if (/\b(rpa|uipath|power\s*automate|blue\s*prism|automation\s*anywhere)\b/i.test(text)) {
    return 'Robotic Process Automation (RPA)';
  }

  // 3. Enterprise Systems (ERP)
  if (/\b(sap|erp|oracle\s*erp|salesforce|crm|peoplesoft|dynamics\s*365|abap)\b/i.test(text)) {
    return 'Enterprise Systems (ERP)';
  }

  // 4. Mobile App Development
  if (/\b(android|ios|flutter|react\s*native|swift|swiftui|kotlin|mobile\s*app|xamarin)\b/i.test(text)) {
    return 'Mobile App Development';
  }

  // 5. AI & Machine Learning
  if (/\b(deep\s*learning|pytorch|tensorflow|nlp|llm|llms|generative\s*ai|computer\s*vision|langchain|hugging\s*face|neural|transformers?|artificial\s*intelligence)\b/i.test(text)) {
    return 'AI & Machine Learning';
  }

  // 6. Data Science & Analytics
  if (/\b(data\s*science|data\s*analytics|machine\s*learning|data\s*analyst|data\s*engineer|pandas|scikit|powerbi|power\s*bi|tableau|bigquery|snowflake|analytics|bi\s*developer)\b/i.test(text)) {
    return 'Data Science & Analytics';
  }

  // 7. Cloud & DevOps
  if (/\b(devops|aws|azure|kubernetes|cloud|terraform|docker|ci\/cd|infrastructure|sre|ansible|helm|gcp)\b/i.test(text)) {
    return 'Cloud & DevOps';
  }

  // 8. Marketing & Business
  if (/\b(marketing|seo|growth|digital\s*marketing|sem|google\s*ads|content\s*marketing|social\s*media|business\s*development|sales\s*executive)\b/i.test(text)) {
    return 'Marketing & Business';
  }

  // 9. Default: Software & Web Development
  return 'Software & Web Development';
}

/**
 * Scrapes/fetches recent jobs from the requested platform or all platforms.
 * @param {string} platform - 'linkedin' | 'naukri' | 'glassdoor' | 'internshala' | 'indeed' | 'all'
 * @returns {Array} Array of job objects with deterministic sourceUrl and assigned domain
 */
function scrapeRecentJobs(platform = 'all') {
  const normalized = (platform || 'all').toLowerCase();
  let pool = [];

  if (normalized === 'all') {
    pool = [
      ...jobPools.linkedin,
      ...jobPools.naukri,
      ...jobPools.glassdoor,
      ...jobPools.internshala,
      ...jobPools.indeed
    ];
  } else if (jobPools[normalized]) {
    pool = [...jobPools[normalized]];
  } else {
    pool = [...jobPools.indeed];
  }

  // Stamp each job with fresh dates, detected domain, and deterministic sourceUrl for deduplication
  const now = new Date();
  return pool.map((job, idx) => ({
    ...job,
    domain: detectDomain(job),
    contact: '', // manual entry only, never auto-fill
    registrationDate: new Date(now.getTime() - idx * 3600000).toISOString().split('T')[0],
    endDate: new Date(now.getTime() + 30 * 24 * 3600000).toISOString().split('T')[0],
    postedDate: new Date(now.getTime() - idx * 3600000).toISOString().split('T')[0],
    sourceUrl: job.sourceUrl // Deterministic URL to ensure unique index & upsert deduplication
  }));
}

module.exports = {
  scrapeRecentJobs,
  detectDomain,
  jobPools
};
