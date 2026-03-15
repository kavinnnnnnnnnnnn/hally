import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            read: false,
            ...notification,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setLatestNotification(newNotification);
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const clearLatest = useCallback(() => {
        setLatestNotification(null);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                latestNotification,
                addNotification,
                markAsRead,
                clearAll,
                clearLatest,
                unreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
