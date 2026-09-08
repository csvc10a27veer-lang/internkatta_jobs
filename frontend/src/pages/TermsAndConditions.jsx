import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 18, 2025</p>

        <div className="prose max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
            <p>
              Welcome to <span>Intern</span><span className="text-[#FF8C42]">Katta</span>! These terms and conditions outline the rules and regulations for the use of <span>Intern</span><span className="text-[#FF8C42]">Katta</span>'s Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use <span>Intern</span><span className="text-[#FF8C42]">Katta</span> if you do not agree to take all of the terms and conditions stated on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. Intellectual Property Rights</h2>
            <p>
              Other than the content you own, under these Terms, <span>Intern</span><span className="text-[#FF8C42]">Katta</span> and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Pricing and Payments</h2>
            <p>
              All prices for services provided by InternKatta are listed in Indian Rupees (INR). We are transparent about our pricing, which is as follows:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Internship Programs:</strong> The fee for our internship programs starts from ₹199 and goes up to ₹20,000, depending on the complexity, duration, and subject matter. The exact amount will be displayed on the specific internship enrollment page.</li>
              <li><strong>Online Courses:</strong> Fees for specialized online courses start from ₹500 and can go up to ₹30,000. The final price will be clearly stated on the respective course pages in INR.</li>
            </ul>
            <p className="mt-3">
              Payment is required in full before you gain access to the internship or course materials. All payments are processed through a secure payment gateway. Prices are subject to change without prior notice, but any changes will not affect orders that have already been placed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">5. Limitation of Liability</h2>
            <p>
              In no event shall InternKatta, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. InternKatta, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
