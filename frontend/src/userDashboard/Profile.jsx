import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Lock, Edit, Phone, Mail, User, Camera, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Save, X } from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
const Profile = () => {
    const navigate = useNavigate();
    const { auth, login, updateUser } = useUserAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [profileData, setProfileData] = useState({ fullName: '', email: '', phone: '', profilePicture: '' });
    const [originalProfileData, setOriginalProfileData] = useState({ fullName: '', email: '', phone: '', profilePicture: '' });
    const fileInputRef = React.useRef(null);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showPasswordSuccessMessage, setShowPasswordSuccessMessage] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (auth.token) {
                try {
                    const { data } = await api.get('/api/users/profile');
                    const userData = { fullName: data.fullName, email: data.email, phone: data.phone || '', profilePicture: data.profilePicture || '' };
                    setProfileData(userData);
                    setOriginalProfileData(userData);
                } catch (error) {
                    toast.error('Failed to load profile data.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [auth.token]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handleCancelEdit = () => {
        setProfileData(originalProfileData);
        setIsEditing(false);
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        try {
            toast.loading('Uploading profile picture...', { id: 'profile-upload' });
            const { data } = await api.put('/api/users/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Update context and local state
            updateUser({
                profilePicture: data.profilePicture
            });
            
            setProfileData(prev => ({ ...prev, profilePicture: data.profilePicture }));
            setOriginalProfileData(prev => ({ ...prev, profilePicture: data.profilePicture }));
            
            toast.success('Profile picture updated!', { id: 'profile-upload' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload image.', { id: 'profile-upload' });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingProfile(true);
        
        try {
            const { data } = await api.put('/api/users/profile', 
                { fullName: profileData.fullName, phone: profileData.phone }
            );
            
            // Update the user data in the context
            updateUser({
                fullName: data.fullName,
                phone: data.phone,
                email: data.email
            });
            
            setOriginalProfileData({ fullName: data.fullName, phone: data.phone, email: data.email });
            setIsEditing(false);
            
            // Show green success message
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000); // Hide after 3 seconds
            
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        setIsSubmittingPassword(true);
        try {
            const { data } = await api.put('/api/users/change-password', 
                { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }
            );
            
            // Show green success message for password
            setShowPasswordSuccessMessage(true);
            setTimeout(() => {
                setShowPasswordSuccessMessage(false);
            }, 3000); // Hide after 3 seconds
            
            toast.success(data.message);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsPasswordEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-600 mt-2">Manage your personal information and account security</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Profile Avatar Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <div className="relative inline-block">
                                {profileData.profilePicture ? (
                                    <img 
                                        src={getImageUrl(profileData.profilePicture)} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4" 
                                        onError={() => setProfileData(prev => ({ ...prev, profilePicture: '' }))}
                                    />
                                ) : (
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <UserCircle className="h-20 w-20 text-white" />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleProfilePictureChange} 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{profileData.fullName}</h2>
                            <p className="text-gray-600 mb-4">{profileData.email}</p>
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Verified Account</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Section */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Personal Information Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </h2>
                                    {!isEditing && (
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-black font-semibold rounded-lg hover:bg-opacity-30 transition-all w-fit"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* Success Message */}
                                {showSuccessMessage && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold">Profile updated successfully!</span>
                                    </div>
                                )}

                                {isEditing ? (
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    name="fullName" 
                                                    value={profileData.fullName} 
                                                    onChange={handleProfileChange} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    value={profileData.phone} 
                                                    onChange={handleProfileChange} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={profileData.email} 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
                                                disabled 
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={handleCancelEdit} 
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingProfile} 
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                            >
                                                <Save className="h-4 w-4" />
                                                {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                            {profileData.profilePicture ? (
                                                <img 
                                                    src={getImageUrl(profileData.profilePicture)} 
                                                    alt="Profile" 
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 mr-4"
                                                    onError={() => setProfileData(prev => ({ ...prev, profilePicture: '' }))}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="font-semibold text-gray-900">{profileData.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                                <Mail className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email Address</p>
                                                <p className="font-semibold text-gray-900">{profileData.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                                <Phone className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Phone Number</p>
                                                <p className="font-semibold text-gray-900">{profileData.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Security
                                    </h2>
                                    {!isPasswordEditing && (
                                        <button 
                                        onClick={() => setIsPasswordEditing(true)} 
                                        className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-black font-semibold rounded-lg hover:bg-opacity-30 transition-all w-fit"
                                    >
                                        <Lock className="h-4 w-4" />
                                        Change Password
                                    </button>
                                    
                                    )}
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* Password Success Message */}
                                {showPasswordSuccessMessage && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold">Password updated successfully!</span>
                                    </div>
                                )}

                                {isPasswordEditing ? (
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPasswords.current ? "text" : "password"} 
                                                    name="currentPassword" 
                                                    value={passwordData.currentPassword} 
                                                    onChange={handlePasswordChange} 
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    required 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPasswords.new ? "text" : "password"} 
                                                    name="newPassword" 
                                                    value={passwordData.newPassword} 
                                                    onChange={handlePasswordChange} 
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    required 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPasswords.confirm ? "text" : "password"} 
                                                    name="confirmPassword" 
                                                    value={passwordData.confirmPassword} 
                                                    onChange={handlePasswordChange} 
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    required 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsPasswordEditing(false)} 
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingPassword} 
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                                            >
                                                <Save className="h-4 w-4" />
                                                {isSubmittingPassword ? 'Saving...' : 'Save Password'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Security</h3>
                                        <p className="text-gray-600 mb-4">Keep your account secure with a strong password</p>
                                        <div className="mb-4">
                                            <span className="text-black font-bold text-lg">Change Password</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Last updated: Recently</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;