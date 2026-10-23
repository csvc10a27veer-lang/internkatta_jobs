// src/utils/internshipRecommendations.js
import { isSkillMatch } from './skillMatcher';

/**
 * Standardized Internship Catalog grouped by Domain and specialized Keywords
 */
export const INTERNSHIP_RECOMMENDATION_CATALOG = {
  'Software & Web Development': [
    {
      title: 'Full Stack Using Java Development',
      keywords: ['Java', 'Spring Boot', 'Hibernate', 'J2EE', 'Spring', 'Java Full Stack'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'All Levels'
    },
    {
      title: 'Full stack in Python Development',
      keywords: ['Python', 'Django', 'Flask', 'FastAPI', 'Python Full Stack', 'Backend'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'All Levels'
    },
    {
      title: 'MERN Stack Development',
      keywords: ['React', 'React.js', 'Node.js', 'Express', 'MongoDB', 'MERN', 'JavaScript'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'Intermediate'
    },
    {
      title: 'Full Stack Web Development',
      keywords: ['HTML', 'CSS', 'JavaScript', 'Web Development', 'Frontend', 'Tailwind', 'Responsive Design'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'Beginner to Intermediate'
    },
    {
      title: 'MySQL Internship – Basic to Advanced',
      keywords: ['SQL', 'MySQL', 'Database', 'Relational DB', 'Queries', 'RDBMS', 'PostgreSQL'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.7 ★',
      level: 'All Levels'
    }
  ],

  'Data Science & Analytics': [
    {
      title: 'Data Science Internship',
      keywords: ['Data Science', 'Machine Learning', 'Scikit-learn', 'Model', 'Python', 'Pandas', 'NumPy'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'Intermediate'
    },
    {
      title: 'Data Analytics Internship',
      keywords: ['Data Analysis', 'Excel', 'Analytics', 'Statistics', 'EDA', 'Business Analysis', 'Reporting'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'All Levels'
    },
    {
      title: 'Power BI Internship',
      keywords: ['Power BI', 'PowerBI', 'DAX', 'Business Intelligence', 'Dashboards', 'KPIs', 'Data Modeling'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.9 ★',
      level: 'All Levels'
    },
    {
      title: 'Tableau Internship',
      keywords: ['Tableau', 'Data Visualization', 'Dashboards', 'Visual Analytics', 'Storytelling'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.7 ★',
      level: 'All Levels'
    },
    {
      title: 'Snowflake Internship',
      keywords: ['Snowflake', 'Data Warehousing', 'Cloud Data', 'ETL', 'SQL', 'Big Data'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'Intermediate'
    }
  ],

  'AI & Machine Learning': [
    {
      title: 'Artificial Intelligence & Machine Learning',
      keywords: ['AI', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Algorithms', 'Deep Learning'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'Advanced'
    },
    {
      title: 'Chatbots Internship',
      keywords: ['Chatbots', 'NLP', 'LLM', 'Conversational AI', 'Prompt Engineering', 'LangChain', 'OpenAI'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.8 ★',
      level: 'Intermediate'
    },
    {
      title: 'Artificial Intelligence & Deep Learning',
      keywords: ['Deep Learning', 'Neural Networks', 'CNN', 'RNN', 'Computer Vision', 'PyTorch', 'Transformers'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'Advanced'
    }
  ],

  'Cloud & DevOps': [
    {
      title: 'AWS Cloud Computing',
      keywords: ['AWS', 'EC2', 'S3', 'Cloud Computing', 'IAM', 'Cloud Architecture', 'VPC'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'All Levels'
    },
    {
      title: 'Cloud Computing & AWS DevOps',
      keywords: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Git'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'Intermediate'
    }
  ],

  'Mobile App Development': [
    {
      title: 'Android Development Internship',
      keywords: ['Android', 'Kotlin', 'Java', 'Mobile App', 'Flutter', 'React Native', 'Mobile UI'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'All Levels'
    }
  ],

  'Robotic Process Automation (RPA)': [
    {
      title: 'RPA – UiPath Internship',
      keywords: ['UiPath', 'Automation', 'RPA', 'Bot Development', 'Workflow Design'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.8 ★',
      level: 'All Levels'
    },
    {
      title: 'RPA – Power Automate / Power Automation',
      keywords: ['Power Automate', 'Workflow Automation', 'RPA', 'Microsoft Power Platform', 'Automation'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.7 ★',
      level: 'All Levels'
    }
  ],

  'Enterprise Systems (ERP)': [
    {
      title: 'SAP MM Internship',
      keywords: ['SAP', 'SAP MM', 'ERP', 'Materials Management', 'Procurement', 'Inventory'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'All Levels'
    },
    {
      title: 'SAP MM (Beginner to Intermediate)',
      keywords: ['SAP', 'SAP MM', 'ERP', 'Materials Management', 'Supply Chain', 'Logistics'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.8 ★',
      level: 'Beginner'
    }
  ],

  'Cyber Security': [
    {
      title: 'Cyber Security Internship',
      keywords: ['Cyber Security', 'Penetration Testing', 'Network Security', 'SOC', 'Ethical Hacking', 'InfoSec'],
      url: '/internship',
      duration: '2 Months',
      rating: '4.9 ★',
      level: 'All Levels'
    }
  ],

  'Marketing & Business': [
    {
      title: 'Digital Marketing & SEO Internship',
      keywords: ['SEO', 'Digital Marketing', 'SEM', 'Social Media', 'Growth', 'Google Ads', 'Content Marketing'],
      url: '/internship',
      duration: '1 Month',
      rating: '4.7 ★',
      level: 'All Levels'
    }
  ]
};

/**
 * Normalizes input domain strings to one of the 9 canonical categories.
 */
export const normalizeDomain = (domainStr) => {
  if (!domainStr) return 'Software & Web Development';
  const d = domainStr.toLowerCase().trim();

  if (d.includes('software') || d.includes('web') || d.includes('full stack') || d.includes('frontend') || d.includes('backend')) {
    return 'Software & Web Development';
  }
  if (d.includes('data science') || d.includes('analytics') || d.includes('powerbi') || d.includes('bi')) {
    return 'Data Science & Analytics';
  }
  if (d.includes('ai') || d.includes('machine learning') || d.includes('artificial')) {
    return 'AI & Machine Learning';
  }
  if (d.includes('cloud') || d.includes('devops') || d.includes('aws')) {
    return 'Cloud & DevOps';
  }
  if (d.includes('mobile') || d.includes('android') || d.includes('ios') || d.includes('flutter')) {
    return 'Mobile App Development';
  }
  if (d.includes('robotic') || d.includes('rpa') || d.includes('uipath') || d.includes('automate')) {
    return 'Robotic Process Automation (RPA)';
  }
  if (d.includes('erp') || d.includes('sap') || d.includes('enterprise')) {
    return 'Enterprise Systems (ERP)';
  }
  if (d.includes('cyber') || d.includes('security') || d.includes('infosec')) {
    return 'Cyber Security';
  }
  if (d.includes('marketing') || d.includes('business') || d.includes('seo')) {
    return 'Marketing & Business';
  }

  return 'Software & Web Development';
};

/**
 * Recommends the top matching internships based on Job requirements and Candidate Skill Gap.
 * 
 * @param {Object} job - The job posting object (contains domain, title, skills, description)
 * @param {Object} candidateProfile - The user intake profile (contains skills, completedInternships)
 * @param {number} maxRecommendations - Number of top ranked internships to return (default: 2)
 * @returns {Array<Object>} List of ranked internship recommendation objects
 */
export function getRecommendedInternships(job, candidateProfile = null, maxRecommendations = 2) {
  if (!job) return [];

  const domain = normalizeDomain(job.domain);
  const domainCatalog = INTERNSHIP_RECOMMENDATION_CATALOG[domain] || INTERNSHIP_RECOMMENDATION_CATALOG['Software & Web Development'];

  // Candidate skill analysis
  const candidateSkills = (candidateProfile?.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());
  const jobTitleLower = (job.title || job.jobTitle || '').toLowerCase();
  const jobDescLower = (job.description || job.jobDescription || '').toLowerCase();

  // Skills required by job that the candidate doesn't have yet
  const missingSkills = candidateSkills.length > 0
    ? jobSkills.filter((js) => !candidateSkills.some((cs) => isSkillMatch(cs, js)))
    : jobSkills;

  // Completed internships by candidate to avoid recommending programs they already finished
  const completedInternships = (candidateProfile?.completedInternships || []).map((c) =>
    (typeof c === 'string' ? c : c.title || '').toLowerCase()
  );

  // Score each internship in this domain
  const scored = domainCatalog.map((internship) => {
    let score = 0;
    const missingCovered = [];
    const matchedJobSkills = [];

    // Check if candidate already completed this
    const alreadyCompleted = completedInternships.some(
      (c) => c && (internship.title.toLowerCase().includes(c) || c.includes(internship.title.toLowerCase()))
    );

    internship.keywords.forEach((keyword) => {
      const kLower = keyword.toLowerCase();

      // 1. Bridges a missing skill gap (+5 points)
      const matchingMissing = missingSkills.find((ms) => isSkillMatch(ms, kLower));
      if (matchingMissing) {
        score += 5;
        if (!missingCovered.includes(matchingMissing)) {
          missingCovered.push(matchingMissing);
        }
      }

      // 2. Matches required job skill (+3 points)
      const matchingJobSkill = jobSkills.find((js) => isSkillMatch(js, kLower));
      if (matchingJobSkill) {
        score += 3;
        if (!matchedJobSkills.includes(matchingJobSkill)) {
          matchedJobSkills.push(matchingJobSkill);
        }
      }

      // 3. Keyword appears in job title (+4 points)
      if (jobTitleLower.includes(kLower)) {
        score += 4;
      }

      // 4. Keyword appears in job description (+1 point)
      if (jobDescLower.includes(kLower)) {
        score += 1;
      }
    });

    // Bonus if internship title is explicitly mentioned in job.required_internships
    if ((job.required_internships || []).some((req) => req.toLowerCase().includes(internship.title.toLowerCase()))) {
      score += 10;
    }

    return {
      ...internship,
      domain,
      score,
      alreadyCompleted,
      missingCovered,
      matchedJobSkills
    };
  });

  // Sort descending by score, prioritizing programs not yet completed
  scored.sort((a, b) => {
    if (a.alreadyCompleted && !b.alreadyCompleted) return 1;
    if (!a.alreadyCompleted && b.alreadyCompleted) return -1;
    return b.score - a.score;
  });

  return scored.slice(0, maxRecommendations);
}

export default {
  INTERNSHIP_RECOMMENDATION_CATALOG,
  normalizeDomain,
  getRecommendedInternships
};
