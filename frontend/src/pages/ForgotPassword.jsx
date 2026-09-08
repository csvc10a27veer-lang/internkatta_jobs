import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite book?",
  "What is your favorite food?",
];

function ForgotPassword() {
  // step 1: enter email
  // step 2: set security question (for users who have none)
  // step 3: answer security question
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [newSecurityQuestion, setNewSecurityQuestion] = useState('');
  const [newSecurityAnswer, setNewSecurityAnswer] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Find the user account by email
  const handleFindAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/users/forgot-password', { email: email.trim() });

      if (response.data.noSecurityQuestion) {
        // User has no security question set — go to setup step
        setStep(2);
      } else {
        // Normal flow — user already has a security question
        setSecurityQuestion(response.data.securityQuestion || '');
        setStep(3);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set security question for the first time
  const handleSetupSecurityQuestion = async (e) => {
    e.preventDefault();
    setError('');
    if (!newSecurityQuestion || !newSecurityAnswer.trim()) {
      setError('Please select a question and enter an answer.');
      return;
    }
    setLoading(true);

    try {
      const response = await api.post('/api/users/setup-security-question', {
        email: email.trim(),
        securityQuestion: newSecurityQuestion,
        securityAnswer: newSecurityAnswer.trim(),
      });
      // Now proceed to answering it (pre-fill it)
      setSecurityQuestion(response.data.securityQuestion || newSecurityQuestion);
      setStep(3);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify the security answer
  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/verify-security-answer', {
        email: email.trim(),
        securityAnswer: securityAnswer.trim(),
      });
      navigate('/reset-password', {
        state: { email: email.trim(), securityAnswer: securityAnswer.trim() },
      });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Incorrect answer. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Account Recovery</h2>

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form onSubmit={handleFindAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Enter your Email Address</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Find Account'}
            </button>
          </form>
        )}

        {/* ── Step 2: Setup Security Question (Google users who skipped it) ── */}
        {step === 2 && (
          <form onSubmit={handleSetupSecurityQuestion} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <strong>Security question required.</strong> Your account doesn't have a security question set up yet. Please create one to continue with password recovery.
            </div>
            <p className="text-sm text-gray-600">
              Setting up for: <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Choose a Security Question</label>
              <select
                className="w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={newSecurityQuestion}
                onChange={(e) => setNewSecurityQuestion(e.target.value)}
                required
              >
                <option value="">Select a question...</option>
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Answer</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your answer"
                required
                value={newSecurityAnswer}
                onChange={(e) => setNewSecurityAnswer(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        )}

        {/* ── Step 3: Answer Security Question ── */}
        {step === 3 && (
          <form onSubmit={handleVerifyAnswer} className="space-y-4">
            <p className="text-sm text-gray-600">
              Recovering account for: <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                {securityQuestion || 'Answer your security question'}
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your answer"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify Answer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
