// src/pages/AdminRegister.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        securityAnswer: '' // Your form includes this field
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.securityAnswer) {
            toast.error("Please fill out all fields.");
            setLoading(false);
            return;
        }

        try {
            // --- THIS IS THE FIX ---
            // Point the request to the new, dedicated admin registration endpoint.
            const { data } = await api.post('/api/admin/register', formData);
            
            toast.success(data.message || 'Admin account created successfully!');
            
            // Redirect to the admin login page after successful registration
            navigate('/admin/login');

        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Create New Admin Account</h1>
                    <p className="mt-2 text-gray-500">This account will have full administrative privileges.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    {/* The securityAnswer field is required by your backend logic */}
                    <input type="text" name="securityAnswer" placeholder="Security Answer (e.g., Mother's maiden name)" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />

                    <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-400">
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-500">
                    Already have an admin account?{' '}
                    <Link to="/admin/login" className="font-medium text-sky-600 hover:underline">
                        Log In Here
                    </Link>
                </p>
            </div>
        </div>
    );
};
export default AdminRegister;