// src/utils/skillMatcher.js

/**
 * Comprehensive Canonical Skill Aliases Dictionary
 * Maps all variations, abbreviations, and punctuation styles of skills
 * to unified canonical skill identifiers for exact token matching.
 */
export const CANONICAL_SKILL_MAP = {
  // --- Programming Languages ---
  'c': 'c',
  'c language': 'c',
  'c programming': 'c',
  'c lang': 'c',
  'ansi c': 'c',
  'embedded c': 'c',

  'c++': 'c++',
  'cpp': 'c++',
  'c plus plus': 'c++',
  'cplusplus': 'c++',
  'c/c++': 'c++',

  'c#': 'c#',
  'c sharp': 'c#',
  'csharp': 'c#',
  'c#.net': 'c#',

  'r': 'r',
  'r language': 'r',
  'r programming': 'r',
  'r lang': 'r',

  'javascript': 'javascript',
  'js': 'javascript',
  'ecmascript': 'javascript',
  'vanilla js': 'javascript',

  'typescript': 'typescript',
  'ts': 'typescript',

  'python': 'python',
  'python3': 'python',
  'python 3': 'python',
  'py': 'python',

  'java': 'java',
  'core java': 'java',
  'advanced java': 'java',
  'j2ee': 'java',

  'php': 'php',
  'php7': 'php',
  'php8': 'php',

  'ruby': 'ruby',
  'ruby on rails': 'ruby on rails',
  'rails': 'ruby on rails',

  'golang': 'go',
  'go': 'go',
  'go lang': 'go',
  'rust': 'rust',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'dart': 'dart',
  'scala': 'scala',
  'perl': 'perl',

  // --- Query Languages & Databases ---
  'sql': 'sql',
  'mysql': 'mysql',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'psql': 'postgresql',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'redis': 'redis',
  'firebase': 'firebase',
  'sqlite': 'sqlite',
  'sqlite3': 'sqlite',
  'prisma': 'prisma',
  'mongoose': 'mongoose',
  'dynamodb': 'dynamodb',
  'cassandra': 'cassandra',
  'oracle': 'oracle',
  'oracle db': 'oracle',
  'nosql': 'nosql',
  'ms sql': 'sql server',
  'sql server': 'sql server',

  // --- Frontend Frameworks & Libraries ---
  'react': 'react.js',
  'react.js': 'react.js',
  'reactjs': 'react.js',
  'react js': 'react.js',

  'next': 'next.js',
  'next.js': 'next.js',
  'nextjs': 'next.js',
  'next js': 'next.js',

  'vue': 'vue.js',
  'vue.js': 'vue.js',
  'vuejs': 'vue.js',
  'vue js': 'vue.js',
  'vue 3': 'vue.js',

  'angular': 'angular',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'angular js': 'angular',

  'svelte': 'svelte',
  'sveltejs': 'svelte',

  'tailwind': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'tailwindcss': 'tailwindcss',

  'bootstrap': 'bootstrap',
  'bootstrap 5': 'bootstrap',
  'bootstrap5': 'bootstrap',
  'bootstrap 4': 'bootstrap',

  'html': 'html5',
  'html5': 'html5',

  'css': 'css3',
  'css3': 'css3',

  'sass': 'sass',
  'scss': 'sass',
  'less': 'less',

  'redux': 'redux',
  'redux toolkit': 'redux',
  'zustand': 'zustand',
  'mobx': 'mobx',
  'recoil': 'recoil',

  'vite': 'vite',
  'webpack': 'webpack',

  // --- Backend & Runtimes ---
  'node': 'node.js',
  'node.js': 'node.js',
  'nodejs': 'node.js',
  'node js': 'node.js',

  'express': 'express.js',
  'express.js': 'express.js',
  'expressjs': 'express.js',
  'express js': 'express.js',

  'django': 'django',
  'flask': 'flask',
  'fastapi': 'fastapi',
  'fast api': 'fastapi',

  'spring boot': 'spring boot',
  'springboot': 'spring boot',
  'spring': 'spring boot',
  'spring mvc': 'spring boot',

  'nestjs': 'nestjs',
  'nest.js': 'nestjs',
  'nest js': 'nestjs',

  'laravel': 'laravel',
  'asp.net': 'asp.net',
  'dotnet': 'asp.net',
  '.net': 'asp.net',

  // --- APIs & Architecture ---
  'rest': 'rest apis',
  'rest api': 'rest apis',
  'rest apis': 'rest apis',
  'restful': 'rest apis',
  'restful api': 'rest apis',
  'restful apis': 'rest apis',
  'graphql': 'graphql',
  'grpc': 'grpc',
  'socket.io': 'socket.io',
  'socketio': 'socket.io',
  'websockets': 'socket.io',
  'websocket': 'socket.io',
  'microservices': 'microservices',
  'microservice': 'microservices',

  // --- Cloud & DevOps ---
  'aws': 'aws',
  'amazon web services': 'aws',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'linux': 'linux',
  'unix': 'linux',
  'git': 'git',
  'github': 'github',
  'gitlab': 'gitlab',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
  'ci cd': 'ci/cd',
  'azure': 'azure',
  'microsoft azure': 'azure',
  'gcp': 'gcp',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',
  'terraform': 'terraform',
  'nginx': 'nginx',
  'jenkins': 'jenkins',
  'ansible': 'ansible',
  'cloud computing': 'cloud computing',

  // --- AI / ML & Data Science ---
  'machine learning': 'machine learning',
  'ml': 'machine learning',
  'deep learning': 'deep learning',
  'dl': 'deep learning',
  'data science': 'data science',
  'pandas': 'pandas',
  'numpy': 'numpy',
  'scikit-learn': 'scikit-learn',
  'scikit learn': 'scikit-learn',
  'sklearn': 'scikit-learn',
  'pytorch': 'pytorch',
  'tensorflow': 'tensorflow',
  'tf': 'tensorflow',
  'nlp': 'nlp',
  'natural language processing': 'nlp',
  'computer vision': 'computer vision',
  'cv': 'computer vision',
  'data analysis': 'data analysis',
  'data analytics': 'data analysis',
  'powerbi': 'powerbi',
  'power bi': 'powerbi',
  'tableau': 'tableau',
  'llms': 'llms',
  'llm': 'llms',
  'large language models': 'llms',
  'langchain': 'langchain',
  'opencv': 'opencv',
  'seaborn': 'seaborn',
  'matplotlib': 'matplotlib',
  'genai': 'generative ai',
  'generative ai': 'generative ai',

  // --- Marketing, Product & Design ---
  'seo': 'seo',
  'search engine optimization': 'seo',
  'sem': 'sem',
  'google ads': 'google ads',
  'meta ads': 'meta ads',
  'facebook ads': 'meta ads',
  'google analytics': 'google analytics',
  'content marketing': 'content marketing',
  'social media marketing': 'social media marketing',
  'smm': 'social media marketing',
  'copywriting': 'copywriting',
  'email marketing': 'email marketing',
  'figma': 'figma',
  'ui/ux': 'ui/ux',
  'ui ux': 'ui/ux',
  'ui/ux design': 'ui/ux',
  'ui': 'ui/ux',
  'ux': 'ui/ux',
  'wireframing': 'wireframing',
  'prototyping': 'wireframing'
};

/**
 * Normalizes any skill input string into a standard lowercase canonical token.
 * Trims whitespace, strips excess formatting, and consults CANONICAL_SKILL_MAP.
 * 
 * @param {string} skill
 * @returns {string} Normalized canonical skill token
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';

  let cleaned = skill.trim().toLowerCase();
  if (!cleaned) return '';

  // Direct map check
  if (CANONICAL_SKILL_MAP[cleaned]) {
    return CANONICAL_SKILL_MAP[cleaned];
  }

  // Check without trailing .js or js
  const withoutJs = cleaned.replace(/\.js$/i, '').replace(/js$/i, '').trim();
  if (withoutJs && CANONICAL_SKILL_MAP[withoutJs]) {
    return CANONICAL_SKILL_MAP[withoutJs];
  }

  // Remove trailing and leading punctuation (preserve +, #, / for c++, c#, ci/cd, ui/ux)
  cleaned = cleaned.replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/gi, '').trim();
  if (CANONICAL_SKILL_MAP[cleaned]) {
    return CANONICAL_SKILL_MAP[cleaned];
  }

  // Standardize multiple spaces/hyphens
  cleaned = cleaned.replace(/[\s\-_]+/g, ' ').trim();
  if (CANONICAL_SKILL_MAP[cleaned]) {
    return CANONICAL_SKILL_MAP[cleaned];
  }

  return cleaned;
};

/**
 * Checks whether two skill tokens represent the same exact skill using canonical equality.
 * Never performs loose substring inclusion.
 * 
 * @param {string} skillA
 * @param {string} skillB
 * @returns {boolean}
 */
export const isSkillMatch = (skillA, skillB) => {
  if (!skillA || !skillB) return false;
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);
  if (!normA || !normB) return false;
  return normA === normB;
};

/**
 * Returns the subset of jobSkills (in original casing) that match the candidate's skills.
 * 
 * @param {string[]} candidateSkills
 * @param {string[]} jobSkills
 * @returns {string[]} Matched job skills in their original display format
 */
export const getMatchedSkills = (candidateSkills = [], jobSkills = []) => {
  if (!Array.isArray(candidateSkills) || !Array.isArray(jobSkills)) return [];

  const normalizedCandidateSkills = new Set(
    candidateSkills
      .map((s) => normalizeSkill(s))
      .filter(Boolean)
  );

  return jobSkills.filter((jobSkill) => {
    if (!jobSkill) return false;
    const normJobSkill = normalizeSkill(jobSkill);
    return normJobSkill && normalizedCandidateSkills.has(normJobSkill);
  });
};

/**
 * Returns the subset of jobSkills (in original casing) not matched by the candidate's skills.
 * 
 * @param {string[]} candidateSkills
 * @param {string[]} jobSkills
 * @returns {string[]} Missing job skills
 */
export const getMissingSkills = (candidateSkills = [], jobSkills = []) => {
  if (!Array.isArray(jobSkills)) return [];
  if (!Array.isArray(candidateSkills) || candidateSkills.length === 0) return [...jobSkills];

  const normalizedCandidateSkills = new Set(
    candidateSkills
      .map((s) => normalizeSkill(s))
      .filter(Boolean)
  );

  return jobSkills.filter((jobSkill) => {
    if (!jobSkill) return false;
    const normJobSkill = normalizeSkill(jobSkill);
    return !normJobSkill || !normalizedCandidateSkills.has(normJobSkill);
  });
};

/**
 * Calculates complete match metrics between candidate skills and job requirements.
 * 
 * @param {string[]} candidateSkills
 * @param {string[]} jobSkills
 * @returns {{
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   matchedCount: number,
 *   totalSkillsCount: number,
 *   matchPercentage: number
 * }}
 */
export const calculateSkillMatchMetrics = (candidateSkills = [], jobSkills = []) => {
  const safeJobSkills = Array.isArray(jobSkills) ? jobSkills : [];
  const safeCandidateSkills = Array.isArray(candidateSkills) ? candidateSkills : [];

  const matchedSkills = getMatchedSkills(safeCandidateSkills, safeJobSkills);
  const missingSkills = getMissingSkills(safeCandidateSkills, safeJobSkills);
  const totalSkillsCount = safeJobSkills.length;
  const matchedCount = matchedSkills.length;
  const matchPercentage = totalSkillsCount > 0 
    ? Math.round((matchedCount / totalSkillsCount) * 100) 
    : 0;

  return {
    matchedSkills,
    missingSkills,
    matchedCount,
    totalSkillsCount,
    matchPercentage
  };
};
