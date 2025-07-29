import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import NotificationService from '../components/NotificationSystem/NotificationService';
import { useAuth } from './AuthContext'; // Adjust import path as needed

// Create notification context
const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Set up notification listeners when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Listen for unread notifications
    const notificationsQuery = query(
      collection(db, 'adminNotifications'),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      if (snapshot.empty) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt 
          ? (doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate() 
            : new Date(doc.data().createdAt)) 
          : new Date()
      }));
      
      // Sort notifications by createdAt in descending order
      notificationsData.sort((a, b) => b.createdAt - a.createdAt);
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.length);
      setLoading(false);
    });
    
    // Set up listeners for new notifications
    const { unsubscribeAll } = NotificationService.setupAllNotificationListeners();
    
    return () => {
      unsubscribeNotifications();
      unsubscribeAll();
    };
  }, [currentUser]);

  // Value to be provided to consumers
  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead: NotificationService.markAsRead,
    markAllAsRead: NotificationService.markAllAsRead,
    createNotification: NotificationService.createNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;