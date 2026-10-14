import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { normalizeSkill } from './skillMatcher.js';

// Set up PDF.js worker for browser execution
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  // workerSrc fallback
}

// Comprehensive Dictionary of 80+ Industry Skills Across Tech, Data, Cloud & Business Domains
const TECH_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Kotlin', 'Swift', 'SQL',
  // Frontend
  'React.js', 'React', 'Next.js', 'Vue.js', 'Angular', 'TailwindCSS', 'Bootstrap', 'HTML5', 'CSS3', 'HTML', 'CSS', 'Redux', 'Zustand', 'Sass', 'Vite', 'Webpack',
  // Backend & APIs
  'Node.js', 'Express.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'NestJS', 'REST APIs', 'RESTful API', 'GraphQL', 'Socket.io', 'Microservices',
  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQLite', 'Prisma', 'Mongoose', 'DynamoDB', 'Cassandra', 'Oracle',
  // Cloud & DevOps
  'AWS', 'Docker', 'Kubernetes', 'Linux', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Azure', 'GCP', 'Terraform', 'Nginx', 'Jenkins', 'Cloud Computing',
  // AI, ML & Data Science
  'Machine Learning', 'Deep Learning', 'Data Science', 'Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Data Analysis', 'PowerBI', 'Tableau', 'LLMs', 'LangChain', 'OpenCV', 'Seaborn', 'Matplotlib',
  // Marketing & Design
  'SEO', 'SEM', 'Google Ads', 'Meta Ads', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Copywriting', 'Email Marketing', 'Figma', 'UI/UX', 'Wireframing'
];

// Broad engineering, technology, science, and business specializations
const KNOWN_STREAMS = [
  // Computer & IT
  { regex: /\b(?:computer\s*science\s*(?:&|and)?\s*engineering|cse)\b/i, label: 'Computer Science & Engineering' },
  { regex: /\b(?:computer\s*engineering)\b/i, label: 'Computer Engineering' },
  { regex: /\b(?:computer\s*science|cs)\b/i, label: 'Computer Science' },
  { regex: /\b(?:information\s*technology|it)\b/i, label: 'Information Technology' },
  { regex: /\b(?:software\s*engineering)\b/i, label: 'Software Engineering' },
  { regex: /\b(?:cyber\s*security)\b/i, label: 'Cyber Security' },
  { regex: /\b(?:cloud\s*computing)\b/i, label: 'Cloud Computing' },
  // AI & Data
  { regex: /\b(?:ai\s*(?:&|and)?\s*data\s*science|aids)\b/i, label: 'AI & Data Science' },
  { regex: /\b(?:artificial\s*intelligence\s*(?:&|and)?\s*machine\s*learning|ai\s*(?:&|and)?\s*ml|aiml)\b/i, label: 'AI & Machine Learning' },
  { regex: /\b(?:data\s*science)\b/i, label: 'Data Science' },
  { regex: /\b(?:artificial\s*intelligence)\b/i, label: 'Artificial Intelligence' },
  // Mechanical & Allied
  { regex: /\b(?:mechanical\s*engineering|mechanical)\b/i, label: 'Mechanical Engineering' },
  { regex: /\b(?:automobile\s*engineering|automobile)\b/i, label: 'Automobile Engineering' },
  { regex: /\b(?:aerospace\s*engineering|aerospace)\b/i, label: 'Aerospace Engineering' },
  { regex: /\b(?:aeronautical\s*engineering|aeronautical)\b/i, label: 'Aeronautical Engineering' },
  { regex: /\b(?:mechatronics\s*engineering|mechatronics)\b/i, label: 'Mechatronics' },
  { regex: /\b(?:robotics\s*(?:&|and)?\s*automation|robotics)\b/i, label: 'Robotics & Automation' },
  // Electronics & Electrical
  { regex: /\b(?:electronics\s*(?:&|and)?\s*telecommunication(?:\s*engineering)?|entc|extc)\b/i, label: 'Electronics & Telecommunication' },
  { regex: /\b(?:electronics\s*(?:&|and)?\s*communication(?:\s*engineering)?|ece)\b/i, label: 'Electronics & Communication' },
  { regex: /\b(?:electrical\s*(?:&|and)?\s*electronics(?:\s*engineering)?|eee)\b/i, label: 'Electrical & Electronics Engineering' },
  { regex: /\b(?:electrical\s*engineering|electrical)\b/i, label: 'Electrical Engineering' },
  { regex: /\b(?:electronics\s*engineering|electronics)\b/i, label: 'Electronics Engineering' },
  { regex: /\b(?:instrumentation(?:\s*engineering)?)\b/i, label: 'Instrumentation Engineering' },
  // Civil & Chemical
  { regex: /\b(?:civil\s*engineering|civil)\b/i, label: 'Civil Engineering' },
  { regex: /\b(?:chemical\s*engineering|chemical)\b/i, label: 'Chemical Engineering' },
  { regex: /\b(?:biotechnology|biotech)\b/i, label: 'Biotechnology' },
  { regex: /\b(?:biomedical\s*engineering|biomedical)\b/i, label: 'Biomedical Engineering' },
  { regex: /\b(?:environmental\s*engineering)\b/i, label: 'Environmental Engineering' },
  // Commerce, Management & Sciences
  { regex: /\b(?:finance|financial\s*management)\b/i, label: 'Finance' },
  { regex: /\b(?:marketing)\b/i, label: 'Marketing' },
  { regex: /\b(?:human\s*resources|hr)\b/i, label: 'Human Resources' },
  { regex: /\b(?:accounting|accounts)\b/i, label: 'Accounting' },
  { regex: /\b(?:business\s*analytics)\b/i, label: 'Business Analytics' },
  { regex: /\b(?:physics)\b/i, label: 'Physics' },
  { regex: /\b(?:chemistry)\b/i, label: 'Chemistry' },
  { regex: /\b(?:mathematics|maths)\b/i, label: 'Mathematics' },
  { regex: /\b(?:statistics|stats)\b/i, label: 'Statistics' },
  { regex: /\b(?:economics)\b/i, label: 'Economics' }
];

// Degree Patterns & Base Definitions
const DEGREE_PATTERNS = [
  {
    regex: /\b(?:B\.?\s*Tech(?:nology)?|Bachelor of Technology)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'B.Tech'
  },
  {
    regex: /\b(?:B\.?\s*E\.?|Bachelor of Engineering)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'B.E.'
  },
  {
    regex: /\b(?:BCA|Bachelor of Computer Applications?)\b/i,
    base: 'BCA'
  },
  {
    regex: /\b(?:MCA|Master of Computer Applications?)\b/i,
    base: 'MCA'
  },
  {
    regex: /\b(?:M\.?\s*Tech(?:nology)?|Master of Technology)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'M.Tech'
  },
  {
    regex: /\b(?:M\.?\s*E\.?|Master of Engineering)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'M.E.'
  },
  {
    regex: /\b(?:B\.?\s*Sc|Bachelor of Science)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'B.Sc'
  },
  {
    regex: /\b(?:M\.?\s*Sc|Master of Science)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'M.Sc'
  },
  {
    regex: /\b(?:MBA|Master of Business Administration)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'MBA'
  },
  {
    regex: /\b(?:BBA|Bachelor of Business Administration)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'BBA'
  },
  {
    regex: /\b(?:B\.?\s*Com|Bachelor of Commerce)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'B.Com'
  },
  {
    regex: /\b(?:M\.?\s*Com|Master of Commerce)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'M.Com'
  },
  {
    regex: /\b(?:B\.?\s*A\.?|Bachelor of Arts)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'B.A.'
  },
  {
    regex: /\b(?:Diploma)\b(?:\s*(?:in|of|-|\/|,|\()\s*([A-Za-z\s&/.-]+?)(?:\)|,|\n|$|;))?/i,
    base: 'Diploma'
  }
];

/**
 * Dynamically formats degree string with detected stream or returns clean degree without default assumptions
 */
function formatDegree(base, rawSpec, contextSnippet = '') {
  if (base === 'BCA') return 'Bachelor of Computer Applications (BCA)';
  if (base === 'MCA') return 'Master of Computer Applications (MCA)';

  const textToScan = `${rawSpec || ''} ${contextSnippet || ''}`.trim();

  if (textToScan) {
    // 1. Check against known stream dictionary
    for (const stream of KNOWN_STREAMS) {
      if (stream.regex.test(textToScan)) {
        return `${base} in ${stream.label}`;
      }
    }

    // 2. Check if a clean raw stream phrase was extracted right next to the degree
    if (rawSpec) {
      const clean = rawSpec
        .replace(/[\n\r,;()]/g, ' ')
        .split(/\b(?:from|college|university|institute|cgpa|percentage|gpa|\d{4})\b/i)[0]
        .trim();
      if (clean.length >= 3 && clean.length <= 35 && /^[A-Za-z\s&'-]+$/.test(clean)) {
        const formattedClean = clean
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        return `${base} in ${formattedClean}`;
      }
    }
  }

  // If NO specific stream is detected, output only the clean degree title
  return base;
}

/**
 * Extracts candidate details directly from clean parsed resume body text
 * (Does NOT rely on file name)
 */
export const extractResumeData = (rawText) => {
  const result = {
    name: '',
    email: '',
    education: '',
    domain: 'Software Development',
    skills: []
  };

  if (!rawText || typeof rawText !== 'string') return result;

  const normalizedText = rawText.replace(/\r/g, '');
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // 1. EXTRACT EMAIL ADDRESS
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = normalizedText.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[1].trim().toLowerCase();
  }

  // 2. EXTRACT FULL NAME (From body text lines, filtering out contact/header lines)
  const nonNameKeywords = /resume|curriculum|vitae|profile|summary|objective|contact|phone|email|address|education|skills|experience|projects|github|linkedin|portfolio|page|\.com|\.in|\.org|developer|engineer|intern|student|fresher|http|www|\d{5,}/i;

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];

    // Check line conditions: 2 to 4 words, length between 3 and 35 chars, no symbols or non-name words
    if (
      line.length >= 3 &&
      line.length <= 35 &&
      !nonNameKeywords.test(line) &&
      !line.includes('@') &&
      !line.includes(':') &&
      !line.includes('|') &&
      !line.includes('/') &&
      /^[A-Za-z\s.'-]+$/.test(line)
    ) {
      const words = line.split(/\s+/).filter(Boolean);
      // Valid names are typically 2 to 4 words
      if (words.length >= 2 && words.length <= 4) {
        // Check capitalization or clean format
        result.name = words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }
  }

  // 3. EXTRACT DEGREE / QUALIFICATION
  for (const item of DEGREE_PATTERNS) {
    const match = normalizedText.match(item.regex);
    if (match) {
      const matchIndex = match.index || 0;
      // Extract context snippet of 120 chars around match
      const start = Math.max(0, matchIndex - 30);
      const end = Math.min(normalizedText.length, matchIndex + match[0].length + 100);
      const contextSnippet = normalizedText.substring(start, end);

      result.education = formatDegree(item.base, match[1] || '', contextSnippet);
      break;
    }
  }

  // 4. EXTRACT SKILLS (Match against 80+ Tech & Business Skills dictionary)
  const SPECIAL_SKILL_REGEX = {
    'C': /(?:\b(?:c\s*programming|c\s*language|ansi\s*c|embedded\s*c|c\s*\/+\s*c\+\+|c\s*&\s*c\+\+)\b|(?:(?:languages?|technologies|technical\s*skills|skills?|tools)[\s\S]{0,120}?(?:^|[,;:\s|/])c(?:[,;:\s|/]|$))|(?:\b(?:c\+\+|java|python|javascript|sql|c#)\s*[,/|]\s*c\b|\bc\s*[,/|]\s*(?:c\+\+|java|python|javascript|sql|c#)\b))/i,
    'R': /(?:\b(?:r\s*programming|r\s*language|r\s*package|r\s*studio|rstudio)\b|(?:(?:languages?|technologies|data\s*science|skills?)[\s\S]{0,120}?(?:^|[,;:\s|/])r(?:[,;:\s|/]|$))|(?:\b(?:python|sql|sas|matlab|spss)\s*[,/|]\s*r\b|\br\s*[,/|]\s*(?:python|sql|sas|matlab|spss)\b))/i,
    'C++': /(?:^|[^a-zA-Z0-9#+])(?:c\+\+|cpp|c\s*plus\s*plus)(?:$|[^a-zA-Z0-9#+])/i,
    'C#': /(?:^|[^a-zA-Z0-9#+])(?:c#|csharp|c\s*sharp|\.net)(?:$|[^a-zA-Z0-9#+])/i,
    'Go': /(?:^|[^a-zA-Z0-9#+])(?:golang|go\s*language|go\s*programming|go\s+lang)(?:$|[^a-zA-Z0-9#+])/i
  };

  const foundSkills = [];
  const seenCanonical = new Set();
  const lowerText = ` ${normalizedText.toLowerCase()} `;

  for (const skill of TECH_SKILLS) {
    let isMatched = false;

    if (SPECIAL_SKILL_REGEX[skill]) {
      isMatched = SPECIAL_SKILL_REGEX[skill].test(lowerText);
    } else {
      const lowerSkill = skill.toLowerCase();
      const escaped = lowerSkill.replace(/([.+*?^=!:${}()|[\]/\\])/g, '\\$1');
      const wordBoundaryRegex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, 'i');
      isMatched = wordBoundaryRegex.test(lowerText);
    }

    if (isMatched) {
      const canonical = normalizeSkill(skill);
      if (canonical && !seenCanonical.has(canonical)) {
        seenCanonical.add(canonical);
        foundSkills.push(skill);
      }
    }
  }

  result.skills = foundSkills;

  // 5. INFER TARGET DOMAIN
  const skillsStr = result.skills.join(' ').toLowerCase();
  if (
    skillsStr.includes('machine learning') ||
    skillsStr.includes('data science') ||
    skillsStr.includes('pandas') ||
    skillsStr.includes('scikit-learn') ||
    skillsStr.includes('powerbi')
  ) {
    result.domain = 'Data Science';
  } else if (
    skillsStr.includes('deep learning') ||
    skillsStr.includes('pytorch') ||
    skillsStr.includes('tensorflow') ||
    skillsStr.includes('nlp') ||
    skillsStr.includes('llms')
  ) {
    result.domain = 'AI & Machine Learning';
  } else if (
    skillsStr.includes('seo') ||
    skillsStr.includes('google ads') ||
    skillsStr.includes('content marketing') ||
    skillsStr.includes('social media marketing')
  ) {
    result.domain = 'Digital Marketing';
  } else if (
    skillsStr.includes('docker') ||
    skillsStr.includes('kubernetes') ||
    skillsStr.includes('aws') ||
    skillsStr.includes('ci/cd') ||
    skillsStr.includes('devops')
  ) {
    result.domain = 'Cloud & DevOps';
  } else {
    result.domain = 'Software Development';
  }

  return result;
};

/**
 * Extracts raw text from DOCX files using mammoth
 */
const extractTextFromDOCX = async (arrayBuffer) => {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (docxErr) {
    console.warn('[Mammoth DOCX Parser] Error extracting raw text from DOCX:', docxErr);
    return '';
  }
};

/**
 * Extracts raw text from PDF files using PDF.js
 */
const extractTextFromPDF = async (arrayBuffer) => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Group items by vertical position / line
      let lastY = null;
      let pageText = '';

      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }

      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (pdfErr) {
    console.warn('[PDF.js Parser] Standard PDF.js extraction error, using fallback:', pdfErr);
    // Fallback: Binary ASCII extraction for raw PDF streams
    const uint8 = new Uint8Array(arrayBuffer);
    let rawText = '';
    for (let i = 0; i < uint8.length; i++) {
      const code = uint8[i];
      if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
        rawText += String.fromCharCode(code);
      } else if (rawText.length > 0 && !rawText.endsWith(' ')) {
        rawText += ' ';
      }
    }
    return rawText;
  }
};

/**
 * Parses any uploaded resume file (.pdf, .docx, .doc, .txt)
 * @param {File} file
 * @returns {Promise<object>} Extracted candidate details
 */
export const parseResumeFile = async (file) => {
  if (!file) return {};

  const fileName = file.name.toLowerCase();
  let extractedText = '';

  if (fileName.endsWith('.txt')) {
    extractedText = await file.text();
  } else if (fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractTextFromPDF(arrayBuffer);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractTextFromDOCX(arrayBuffer);
    if (!extractedText || !extractedText.trim()) {
      try {
        extractedText = await file.text();
      } catch (e) {}
    }
  } else {
    // Default fallback: Try mammoth first, then plain text
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromDOCX(arrayBuffer);
    } catch (e) {
      extractedText = await file.text();
    }
  }

  const parsed = extractResumeData(extractedText);
  return parsed;
};
