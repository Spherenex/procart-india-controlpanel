import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log("NotificationsPage: Fetching notifications...");
        setLoading(true);
        setError(null);

        // Simple fetch without complex queries to avoid index requirements
        const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
        
        if (notificationsSnapshot.empty) {
          console.log("No notifications found");
          setNotifications([]);
          setLoading(false);
          return;
        }

        console.log(`Found ${notificationsSnapshot.size} notifications`);
        
        // Process notifications into a standard format
        let notificationsData = notificationsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.notificationType || 'order',
            title: data.adminMessage ? 'New Order Received' : 'Notification',
            message: data.adminMessage || data.customerMessage || 'New notification',
            timestamp: data.createdAt || data.timestamp || new Date(),
            read: data.status === 'read',
            status: data.status || 'unread',
            data: data
          };
        });

        // Sort by timestamp (newest first)
        notificationsData = notificationsData.sort((a, b) => {
          const timeA = a.timestamp instanceof Timestamp ? 
            a.timestamp.toDate() : 
            a.timestamp instanceof Date ? 
              a.timestamp : 
              new Date(a.timestamp || 0);
              
          const timeB = b.timestamp instanceof Timestamp ? 
            b.timestamp.toDate() : 
            b.timestamp instanceof Date ? 
              b.timestamp : 
              new Date(b.timestamp || 0);
              
          return timeB - timeA;
        });

        // Apply filter
        if (filter === 'unread') {
          notificationsData = notificationsData.filter(n => !n.read && n.status !== 'deleted');
        } else if (filter === 'order') {
          notificationsData = notificationsData.filter(n => 
            (n.type === 'order' || n.type === 'whatsapp' || n.notificationType === 'whatsapp') && 
            n.status !== 'deleted'
          );
        } else if (filter === 'support') {
          notificationsData = notificationsData.filter(n => 
            n.type === 'support' && 
            n.status !== 'deleted'
          );
        } else {
          // 'all' filter - just exclude deleted
          notificationsData = notificationsData.filter(n => n.status !== 'deleted');
        }

        console.log(`After filtering (${filter}): ${notificationsData.length} notifications`);
        
        setNotifications(notificationsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(`Failed to load notifications: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [filter]);
  
  const markAsRead = async (notificationId) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        status: 'read',
        readAt: serverTimestamp()
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, status: 'read' } 
            : notification
        )
      );

      console.log("Notification marked as read successfully");
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert(`Error marking notification as read: ${error.message}`);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update each notification one by one
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, 'notifications', notification.id);
        await updateDoc(notificationRef, {
          status: 'read',
          readAt: serverTimestamp()
        });
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          !notification.read
            ? { ...notification, read: true, status: 'read' } 
            : notification
        )
      );

      console.log(`${unreadNotifications.length} notifications marked as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert(`Error marking all notifications as read: ${error.message}`);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      console.log(`Deleting notification ${notificationId}`);
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      console.log("Notification deleted successfully");
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert(`Error deleting notification: ${error.message}`);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const type = notification.type || notification.data?.notificationType;
    switch (type) {
      case 'order':
        return '🛒';
      case 'whatsapp':
        return '📱';
      case 'support':
        return '🔔';
      default:
        return '📄';
    }
  };
  
  // Get notification link based on type
  const getNotificationLink = (notification) => {
    const type = notification.type || notification.data?.notificationType;
    switch (type) {
      case 'order':
      case 'whatsapp':
        return `/orders`;
      case 'support':
        return `/customer-support`;
      default:
        return '#';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    let date;
    
    try {
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        console.warn("Unknown timestamp format:", timestamp);
        return 'Invalid date';
      }
      
      if (isNaN(date.getTime())) {
        console.warn("Invalid date from timestamp:", timestamp);
        return 'Invalid date';
      }
      
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return 'Date error';
    }
  };
  
  const getNotificationMessage = (notification) => {
    // Check various fields that might contain the message
    return notification.message || 
           notification.data?.adminMessage || 
           notification.data?.customerMessage || 
           'New notification';
  };
  
  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="notifications-page">
        <div className="notifications-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const orderCount = notifications.filter(n => 
    (n.type === 'order' || n.type === 'whatsapp' || n.data?.notificationType === 'whatsapp') && !n.read
  ).length;
  const supportCount = notifications.filter(n => n.type === 'support' && !n.read).length;
  
  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        
        <div className="notifications-actions">
          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="order">Orders</option>
              <option value="support">Support</option>
            </select>
          </div>
          
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              Mark All as Read
            </button>
          )}
        </div>
      </div>
      
      <div className="notifications-summary">
        <div className="notification-count">
          <span className="count-value">{notifications.length}</span>
          <span className="count-label">Total Notifications</span>
        </div>
        
        <div className="notification-count unread">
          <span className="count-value">{unreadCount}</span>
          <span className="count-label">Unread</span>
        </div>
        
        <div className="notification-count orders">
          <span className="count-value">{orderCount}</span>
          <span className="count-label">Orders</span>
        </div>
        
        <div className="notification-count support">
          <span className="count-value">{supportCount}</span>
          <span className="count-label">Support</span>
        </div>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-data-icon">📭</div>
            <h3>No notifications found</h3>
            <p>There are no notifications matching your current filter.</p>
            {filter !== 'all' && (
              <button className="reset-filter-btn" onClick={() => setFilter('all')}>
                Show All Notifications
              </button>
            )}
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-icon-container">
                <div className="notification-icon">
                  {getNotificationIcon(notification)}
                </div>
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h3 className="notification-title">{notification.title}</h3>
                  {!notification.read && (
                    <span className="unread-badge">New</span>
                  )}
                </div>
                
                <p className="notification-message">
                  {getNotificationMessage(notification)}
                </p>
                
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  
                  <span className="notification-type">
                    {notification.type === 'support' ? 'Support' : 'Order'}
                  </span>
                </div>
                
                <div className="notification-actions">
                  <Link 
                    to={getNotificationLink(notification)} 
                    className="view-details-btn"
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    View Details
                  </Link>
                  
                  {!notification.read && (
                    <button 
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  
                  <button 
                    className="delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;