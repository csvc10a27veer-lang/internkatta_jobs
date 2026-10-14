import { initialJobs } from '../jobs/mockJobs';

const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];

const studentNames = [
  "Aarav Patel", "Vihaan Sharma", "Aditya Singh", "Sai Kumar", "Arjun Reddy",
  "Rohan Gupta", "Krishna Iyer", "Ishaan Verma", "Shaurya Jain", "Dhruv Mehta",
  "Diya Desai", "Sanya Kapoor", "Ananya Joshi", "Myra Nair", "Navya Bhat",
  "Kavya Menon", "Riya Das", "Zara Ali", "Suhana Khan", "Pari Sen",
  "Ravi Teja", "Manoj Tiwari", "Karthik Raja", "Pooja Hegde", "Rashmika Mandanna",
  "Nikhil Dsouza", "John Doe", "Jane Smith", "Alice Johnson", "Bob Williams"
];

// Domains mapping for the mock jobs
const domainMapping = {
  "Python Developer": "Software Development",
  "React Developer": "Web Development",
  "MERN Stack Developer": "Web Development",
  "Data Analyst Intern": "Data Science",
  "Frontend Engineer": "Web Development",
  "Backend Developer": "Software Development",
  "Cloud Architect": "Cloud Computing",
  "UI/UX Designer": "UI/UX",
  "WordPress Developer": "Web Development",
  "QA Engineer": "Testing / QA"
};

const generateMockApplications = () => {
  const applications = [];
  let appIdCounter = 1;

  // Let's create about 150 applications
  for (let i = 0; i < 150; i++) {
    // Pick a random student
    const studentIndex = Math.floor(Math.random() * studentNames.length);
    const studentName = studentNames[studentIndex];
    const studentId = `STU${String(studentIndex + 1).padStart(3, '0')}`;

    // Pick a random job
    const jobIndex = Math.floor(Math.random() * initialJobs.length);
    const job = initialJobs[jobIndex];

    // Pick a random status (weighted towards Applied and Under Review)
    const statusWeights = [0.4, 0.3, 0.15, 0.1, 0.05];
    const rand = Math.random();
    let statusIndex = 0;
    let cumSum = statusWeights[0];
    while (rand > cumSum && statusIndex < statusWeights.length - 1) {
      statusIndex++;
      cumSum += statusWeights[statusIndex];
    }
    const status = statuses[statusIndex];

    // Pick a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    applications.push({
      id: `APP${String(appIdCounter++).padStart(3, '0')}`,
      studentId,
      studentName,
      jobId: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      domain: domainMapping[job.jobTitle] || "Other",
      applicationStatus: status,
      appliedDate: date.toISOString().split('T')[0]
    });
  }

  // Ensure no duplicate applications (same student applying to same job twice)
  const uniqueApplications = [];
  const seen = new Set();
  
  for (const app of applications) {
    const key = `${app.studentId}-${app.jobId}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueApplications.push(app);
    }
  }

  return uniqueApplications.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
};

export const mockJobApplications = generateMockApplications();
