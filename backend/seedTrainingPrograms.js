require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const TrainingProgram = require('./models/trainingProgramModel');
const connectDB = require('./config/dbconnection');

const dummyPrograms = [
  {
    title: 'Industrial Training',
    badge: 'Engineering Track',
    shortDescription: 'A comprehensive program designed for engineering students to gain hands-on industrial experience with real-world projects and mentorship.',
    duration: '4 / 6 Weeks',
    mode: 'Live Online Sessions',
    idealFor: '2nd, 3rd & Final Year Engineering Students',
    category: 'Industrial Training',
    difficulty: 'Intermediate',
    language: 'English',
    keyFeatures: [
      'Live project development from scratch',
      'Direct mentorship by industry veterans',
      'Fulfills academic/college requirements',
      'Dedicated sessions for soft skills & interview prep',
      'Build a professional-grade portfolio'
    ],
    technologies: ['Python & Django', 'Java Full Stack', 'MERN Stack', 'Data Science', 'Cloud Computing'],
    longDescription: 'Our intensive Industrial Training program is designed to bridge the gap between academic learning and real-world application. Students will work in teams, follow agile methodologies, and build a complete project that can be showcased to potential employers.',
    stats: [
      { value: '95%', label: 'Completion Rate' },
      { value: '80%', label: 'Placement Assistance' },
      { value: '5+', label: 'Real Projects' }
    ],
    status: 'active'
  },
  {
    title: 'MSBTE Sponsored Training',
    badge: 'MSBTE Curriculum Aligned',
    shortDescription: 'Programs structured around the MSBTE curriculum to help diploma students fulfill academic requirements with practical skills and industry exposure.',
    duration: '4 Weeks',
    mode: 'Hybrid (Online + Offline)',
    idealFor: 'Polytechnic & Diploma Students (MSBTE)',
    category: 'MSBTE Training',
    difficulty: 'Beginner',
    language: 'English',
    keyFeatures: [
      'Curriculum approved by MSBTE',
      'Practical labs and assignments',
      'Guaranteed certification upon completion',
      'Focus on in-demand technical skills',
      'Industry-expert led sessions'
    ],
    technologies: ['Embedded Systems', 'PLC/SCADA', 'Web Technologies', 'Networking'],
    longDescription: 'This program is officially recognized and designed in collaboration with MSBTE standards. It provides diploma students the perfect platform to gain practical skills that complement their theoretical knowledge, making them highly employable.',
    stats: [
      { value: '100%', label: 'Certified' },
      { value: 'MSBTE', label: 'Approved' },
      { value: '4.8/5', label: 'Rating' }
    ],
    status: 'active'
  },
  {
    title: 'Specialized Workshops',
    badge: '1–3 Day Intensive',
    shortDescription: 'Intensive 1–3 day workshops focused on a single, cutting-edge technology or tool. Fast-track your skills with expert-led sessions.',
    duration: '1 to 3 Days',
    mode: 'Live Online or In-Person',
    idealFor: 'Students & Professionals wanting to upskill quickly',
    category: 'Workshops',
    difficulty: 'All Levels',
    language: 'English',
    keyFeatures: [
      'Deep dive into one specific topic',
      'Hands-on, practical sessions',
      'Perfect for weekend learning',
      'Certificate of Participation',
      'Network with peers and instructors'
    ],
    technologies: ['Git & GitHub', 'Docker', 'Figma for Developers', 'Advanced JavaScript'],
    longDescription: 'Our workshops are short, intensive, and designed for maximum impact. Whether you want to master a new tool over a weekend or get a crash course in a new technology, these workshops are the most efficient way to learn.',
    stats: [
      { value: '10+', label: 'Workshops' },
      { value: '98%', label: 'Satisfaction' },
      { value: '500+', label: 'Participants' }
    ],
    status: 'active'
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    await TrainingProgram.deleteMany();
    console.log('Existing training programs removed');
    await TrainingProgram.insertMany(dummyPrograms);
    console.log('Dummy training programs inserted');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
