// frontend/src/context/UserAuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only load from localStorage if there's valid data
        const data = localStorage.getItem('userAuth');
        
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                
                // Validate that the data has required fields and is a user
                if (parsedData.token && parsedData.user && parsedData.user._id && parsedData.user.role === 'user') {
                    setAuth(parsedData);
                } else {
                    // Clear invalid data
                    localStorage.removeItem('userAuth');
                }
            } catch (error) {
                // Clear corrupted data
                localStorage.removeItem('userAuth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (loginApiResponse) => {
        const dataToSet = {
            user: {
                _id: loginApiResponse._id,
                fullName: loginApiResponse.fullName,
                email: loginApiResponse.email,
                role: loginApiResponse.role,
                profilePicture: loginApiResponse.profilePicture,
                enrolledCourses: loginApiResponse.enrolledCourses || [],
                enrolledInternships: loginApiResponse.enrolledInternships || [],
            },
            token: loginApiResponse.token,
        };
        
        setAuth(dataToSet);
        localStorage.setItem('userAuth', JSON.stringify(dataToSet));
    };

    const logout = () => {
        setAuth(null);
        localStorage.removeItem('userAuth');
    };
    
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

            localStorage.setItem('userAuth', JSON.stringify(newAuth));
            return newAuth;
        });
    };
    
    return (
        <UserAuthContext.Provider value={{ auth, login, logout, updateUser, isLoading }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => useContext(UserAuthContext);
