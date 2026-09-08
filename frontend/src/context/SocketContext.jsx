import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserAuth } from './UserAuthContext';
import { useAdminAuth } from './AdminAuthContext';
import api, { API_BASE_URL } from '../utils/api';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { auth: userAuth } = useUserAuth();
    const { auth: adminAuth } = useAdminAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const hasUser = userAuth && userAuth.user && userAuth.user._id;
        const hasAdmin = adminAuth && adminAuth.admin && adminAuth.admin._id;

        if (hasUser || hasAdmin) {
            const apiUrl = API_BASE_URL || 'http://localhost:4000/api';
            const baseUrl = apiUrl.replace(/\/api(\/v1)?$/, '');

            const newSocket = io(baseUrl, {
                withCredentials: true,
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                if (hasUser) newSocket.emit('register', userAuth.user._id);
                if (hasAdmin) newSocket.emit('register', adminAuth.admin._id);
            });

            newSocket.on('newNotification', (notification) => {
                console.log('New notification received via socket:', notification);
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
                
                toast.success(notification.title + ": " + notification.message, {
                    duration: 5000,
                    position: 'top-right',
                });
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });

            return () => {
                newSocket.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [userAuth, adminAuth]);

    useEffect(() => {
        const fetchNotifications = async () => {
            let allNotifications = [];
            try {
                if (userAuth && userAuth.token && userAuth.user?._id) {
                    const res = await api.get('/api/notifications');
                    if (res.data) allNotifications = [...allNotifications, ...res.data];
                }
                if (adminAuth && adminAuth.token && adminAuth.admin?._id) {
                    const res = await api.get('/api/notifications/admin');
                    if (res.data) allNotifications = [...allNotifications, ...res.data];
                }
                
                // Sort by date descending
                allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setNotifications(allNotifications);
                setUnreadCount(allNotifications.filter(n => !n.isRead).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [userAuth, adminAuth]);

    const markAsRead = async (notificationId) => {
        try {
            const notif = notifications.find(n => n._id === notificationId);
            if (!notif) return;
            
            const isAdminNotif = adminAuth?.admin?._id === notif.recipient;
            const endpoint = isAdminNotif 
                ? `/api/notifications/admin/${notificationId}/read` 
                : `/api/notifications/${notificationId}/read`;
                
            await api.put(endpoint);
            setNotifications((prev) =>
                prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (userAuth?.user?._id) await api.put(`/api/notifications/read-all`);
            if (adminAuth?.admin?._id) await api.put(`/api/notifications/admin/read-all`);
            
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};
