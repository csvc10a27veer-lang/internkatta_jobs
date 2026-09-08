import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 18, 2025</p>

        <div className="prose max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Overview</h2>
            <p>
              Thank you for enrolling in a program at <span>Intern</span><span className="text-[#FF8C42]">Katta</span>. We are committed to providing our students with an exceptional learning experience. As our offerings are digital products and services, where access is granted immediately upon purchase, our refund policy is as follows.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. No Refund Policy</h2>
            <p>
              All purchases for internship programs, courses, and other digital services on our website are final and non-refundable. Once you have enrolled and paid for a program, you will gain immediate access to the course materials and platform features. Due to the digital nature of our services and the immediate value provided, we do not offer any refunds or credits for any reason, including partial use or dissatisfaction.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">3. Cancellation</h2>
            <p>
              As payments are for immediate access to digital content, cancellation of a purchase is not possible once the transaction is complete. We encourage you to review the program details, course curriculum, and our FAQs carefully before making a purchase to ensure it meets your needs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Contact Us</h2>
            <p>
              If you have any questions about our Refund Policy, please feel free to contact us at <strong>support@<span>Intern</span><span className="text-[#FF8C42]">Katta</span>.com</strong>. We are here to help clarify any doubts you may have before you make a purchase.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
