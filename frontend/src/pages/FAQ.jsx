import React, { useState } from 'react';
import SEO from '../components/SEO';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is this InternKatta internship platform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "InternKatta is a hands-on learning platform designed to provide students and professionals with real-world experience through structured online internships. Each program includes lectures, practical tasks, and quizzes to ensure comprehensive learning."
        }
      },
      {
        "@type": "Question",
        "name": "How do I enroll in an internship?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To enroll, navigate to the 'Internships' section, browse the available programs, and click the 'Enroll Now' button on the internship you are interested in. You will then be guided through the registration and payment process."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a deadline for completing the tasks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While our internships are self-paced to offer flexibility, we recommend following the suggested timeline to get the most out of the program. Some programs may have a final completion deadline, which will be clearly stated on the internship details page."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if my task submission is rejected?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If your task is rejected, you will receive feedback from your mentor. You should review the feedback, make the necessary corrections to your work, and re-submit the task. There is no penalty for re-submission."
        }
      },
      {
        "@type": "Question",
        "name": "Do I get a certificate upon completion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, upon successful completion of all lectures, tasks, and quizzes in an internship program, you will receive a verifiable digital certificate that you can add to your resume and LinkedIn profile."
        }
      }
    ]
  };

  const faqData = [
    {
      question: "What is this InternKatta internship platform?",
      answer: (
        <>
          <span>Intern</span><span className="text-[#FF8C42]">Katta</span> is a hands-on learning platform designed to provide students and professionals with real-world experience through structured online internships. Each program includes lectures, practical tasks, and quizzes to ensure comprehensive learning.
        </>
      )
    },
    {
      question: "How do I enroll in an internship?",
      answer: "To enroll, navigate to the 'Internships' section, browse the available programs, and click the 'Enroll Now' button on the internship you are interested in. You will then be guided through the registration and payment process."
    },
    {
      question: "Is there a deadline for completing the tasks?",
      answer: "While our internships are self-paced to offer flexibility, we recommend following the suggested timeline to get the most out of the program. Some programs may have a final completion deadline, which will be clearly stated on the internship details page."
    },
    {
      question: "What happens if my task submission is rejected?",
      answer: "If your task is rejected, you will receive feedback from your mentor. You should review the feedback, make the necessary corrections to your work, and re-submit the task. There is no penalty for re-submission."
    },
    {
      question: "Do I get a certificate upon completion?",
      answer: "Yes, upon successful completion of all lectures, tasks, and quizzes in an internship program, you will receive a verifiable digital certificate that you can add to your resume and LinkedIn profile."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title="FAQ - Frequently Asked Questions | InternKatta"
        description="Find answers to the most common questions about InternKatta platform, internships, courses, enrollment process, certificates, and more."
        keywords="FAQ, frequently asked questions, internkatta help, internship questions, course questions, enrollment help"
        url="https://internkatta.com/faq"
        structuredData={faqStructuredData}
      />
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-center text-gray-500 mb-10">
            Find answers to the most common questions about our platform and programs.
          </p>

          <div className="space-y-2">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-gray-200 py-4">
                <button 
                  className="w-full flex justify-between items-center text-left focus:outline-none"
                  onClick={() => toggleItem(index)}
                >
                  <span className="text-lg font-semibold text-gray-800">{item.question}</span>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="pt-3 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;