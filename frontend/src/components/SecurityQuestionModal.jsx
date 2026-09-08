import React, { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';

const SecurityQuestionModal = () => {
    const { auth, updateUser } = useUserAuth();
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const needsSecuritySetup = auth?.user?.needsSecuritySetup;

    if (!needsSecuritySetup) {
        return null; // Don't render if setup is not needed
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!securityQuestion.trim() || !securityAnswer.trim()) {
            setError('Please provide both a question and an answer.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/api/users/set-security-question', {
                securityQuestion,
                securityAnswer
            });
            // Update auth context to remove needsSecuritySetup
            updateUser({ needsSecuritySetup: false });
        } catch (err) {
            console.error('Failed to set security question:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Action Required</h2>
                <p style={styles.text}>
                    To keep your account secure and enable password recovery, please set up a security question before continuing.
                </p>
                {error && <p style={styles.error}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Security Question</label>
                        <select 
                            style={styles.input} 
                            value={securityQuestion} 
                            onChange={(e) => setSecurityQuestion(e.target.value)}
                        >
                            <option value="">Select a question...</option>
                            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                            <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                            <option value="What city were you born in?">What city were you born in?</option>
                            <option value="What is your favorite book?">What is your favorite book?</option>
                            <option value="What is your favorite food?">What is your favorite food?</option>
                        </select>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Answer</label>
                        <input 
                            type="text" 
                            style={styles.input}
                            placeholder="Enter your answer"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: 'var(--bg-card, #ffffff)',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        color: 'var(--text-primary, #333)',
    },
    title: {
        marginTop: 0,
        marginBottom: '1rem',
        fontSize: '1.5rem',
        color: '#e74c3c',
    },
    text: {
        marginBottom: '1.5rem',
        lineHeight: 1.5,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    input: {
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    button: {
        padding: '0.75rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    error: {
        color: '#e74c3c',
        backgroundColor: '#fadbd8',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    }
};

export default SecurityQuestionModal;
