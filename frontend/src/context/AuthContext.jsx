// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This useEffect correctly loads the session from localStorage on app start.
        const data = localStorage.getItem('auth');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.token && parsedData.user && parsedData.user._id) {
                    setAuth(parsedData);
                } else {
                    localStorage.removeItem('auth');
                }
            } catch {
                localStorage.removeItem('auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (loginApiResponse) => {
        // This function is enhanced to handle all user data upon login
        const dataToSet = {
            user: {
                _id: loginApiResponse._id,
                fullName: loginApiResponse.fullName,
                email: loginApiResponse.email,
                role: loginApiResponse.role,
                enrolledCourses: loginApiResponse.enrolledCourses || [],
                enrolledInternships: loginApiResponse.enrolledInternships || [],
            },
            token: loginApiResponse.token,
        };
        setAuth(dataToSet);
        localStorage.setItem('auth', JSON.stringify(dataToSet));
    };

    const logout = () => {
        setAuth(null);
        localStorage.removeItem('auth');
    };
    
    // --- THIS IS THE NEW FUNCTION ---
    // Safely updates the user's data within the auth state
    const updateUser = (updatedUserData) => {
        setAuth(prevAuth => {
            if (!prevAuth) return null;

            const newAuth = {
                ...prevAuth,
                user: {
                    ...prevAuth.user,
                    ...updatedUserData,
                }
            };

            localStorage.setItem('auth', JSON.stringify(newAuth));
            return newAuth;
        });
    };
    
    return (
        // We add the new 'updateUser' function to the context's value
        <AuthContext.Provider value={{ auth, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);