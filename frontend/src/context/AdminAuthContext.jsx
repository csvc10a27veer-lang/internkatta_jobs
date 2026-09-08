// frontend/src/context/AdminAuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only load from localStorage if there's valid data
        const data = localStorage.getItem('adminAuth');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                // Validate that the data has required fields and is an admin
                if (parsedData.token && parsedData.admin && parsedData.admin._id && parsedData.admin.role === 'admin') {
                    setAuth(parsedData);
                } else {
                    // Clear invalid data
                    localStorage.removeItem('adminAuth');
                }
            } catch {
                // Clear corrupted data
                localStorage.removeItem('adminAuth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (loginApiResponse) => {
        const dataToSet = {
            admin: {
                _id: loginApiResponse._id,
                fullName: loginApiResponse.fullName,
                email: loginApiResponse.email,
                role: loginApiResponse.role,
            },
            token: loginApiResponse.token,
        };
        setAuth(dataToSet);
        localStorage.setItem('adminAuth', JSON.stringify(dataToSet));
    };

    const logout = () => {
        setAuth(null);
        localStorage.removeItem('adminAuth');
    };
    
    const updateAdmin = (updatedAdminData) => {
        setAuth(prevAuth => {
            if (!prevAuth) return null;

            const newAuth = {
                ...prevAuth,
                admin: {
                    ...prevAuth.admin,
                    ...updatedAdminData,
                }
            };

            localStorage.setItem('adminAuth', JSON.stringify(newAuth));
            return newAuth;
        });
    };
    
    return (
        <AdminAuthContext.Provider value={{ auth, login, logout, updateAdmin, isLoading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
