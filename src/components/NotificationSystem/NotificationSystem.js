// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   collection, 
//   query, 
//   where, 
//   onSnapshot, 
//   orderBy, 
//   limit,
//   doc,
//   updateDoc,
//   Timestamp,
//   serverTimestamp
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './NotificationSystem.css';

// const NotificationSystem = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const dropdownRef = useRef(null);

//   // Separate counts for different notification types
//   const [orderCount, setOrderCount] = useState(0);
//   const [supportCount, setSupportCount] = useState(0);

//   useEffect(() => {
//     // Load saved notification state from localStorage
//     const savedNotifications = localStorage.getItem('notifications');
//     const savedUnreadCount = localStorage.getItem('unreadCount');
    
//     if (savedNotifications) {
//       try {
//         setNotifications(JSON.parse(savedNotifications));
//       } catch (error) {
//         console.error('Error parsing saved notifications:', error);
//       }
//     }
    
//     if (savedUnreadCount) {
//       try {
//         setUnreadCount(parseInt(savedUnreadCount, 10));
//       } catch (error) {
//         console.error('Error parsing unread count:', error);
//       }
//     }
    
//     // Listen for new orders
//     const orderQuery = query(
//       collection(db, 'orders'),
//       where('notificationSent', '==', false),
//       orderBy('createdAt', 'desc'),
//       limit(50)
//     );
    
//     const ordersUnsubscribe = onSnapshot(orderQuery, (snapshot) => {
//       if (snapshot.empty) {
//         setOrderCount(0);
//         return;
//       }
      
//       const newOrders = snapshot.docs.map(doc => ({
//         id: doc.id,
//         type: 'order',
//         title: 'New Order Received',
//         message: `Order #${doc.id.slice(0, 6)} from ${doc.data().customerName || 'Unknown'}`,
//         timestamp: doc.data().createdAt,
//         read: false,
//         data: {
//           orderId: doc.id,
//           customerName: doc.data().customerName,
//           amount: doc.data().totalAmount,
//           items: doc.data().items
//         }
//       }));
      
//       setOrderCount(newOrders.length);
      
//       if (newOrders.length > 0) {
//         addNotifications(newOrders);
//       }
      
//       setLoading(false);
//     }, (error) => {
//       console.error("Error fetching orders:", error);
//       setLoading(false);
//     });
    
//     // Listen for new support requests
//     const supportQuery = query(
//       collection(db, 'support'),
//       where('status', '==', 'pending'),
//       orderBy('createdAt', 'desc'),
//       limit(50)
//     );
    
//     const supportUnsubscribe = onSnapshot(supportQuery, (snapshot) => {
//       if (snapshot.empty) {
//         setSupportCount(0);
//         return;
//       }
      
//       const newSupportRequests = snapshot.docs.map(doc => ({
//         id: doc.id,
//         type: 'support',
//         title: 'New Support Request',
//         message: `Support request from ${doc.data().customerName || 'Unknown'}: ${doc.data().issueType}`,
//         timestamp: doc.data().createdAt,
//         read: false,
//         data: {
//           requestId: doc.id,
//           customerName: doc.data().customerName,
//           issueType: doc.data().issueType,
//           issueDescription: doc.data().issueDescription
//         }
//       }));
      
//       setSupportCount(newSupportRequests.length);
      
//       if (newSupportRequests.length > 0) {
//         addNotifications(newSupportRequests);
//       }
      
//       setLoading(false);
//     }, (error) => {
//       console.error("Error fetching support requests:", error);
//       setLoading(false);
//     });
    
//     // Close dropdown when clicking outside
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
    
//     // Cleanup
//     return () => {
//       ordersUnsubscribe();
//       supportUnsubscribe();
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);
  
//   // Save notifications to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem('notifications', JSON.stringify(notifications));
//     localStorage.setItem('unreadCount', unreadCount.toString());
//   }, [notifications, unreadCount]);
  
//   // Add new notifications to the list
//   const addNotifications = (newNotifications) => {
//     setNotifications(prev => {
//       // Filter out duplicates based on ID
//       const existingIds = new Set(prev.map(n => n.id));
//       const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
      
//       if (filteredNew.length === 0) return prev;
      
//       // Play notification sound if there are new notifications
//       playNotificationSound();
      
//       // Update unread count
//       setUnreadCount(prevCount => prevCount + filteredNew.length);
      
//       return [...filteredNew, ...prev].sort((a, b) => {
//         const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
//         const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
//         return timeB - timeA;
//       });
//     });
//   };
  
//   // Play notification sound
//   const playNotificationSound = () => {
//     try {
//       const audio = new Audio('/notification-sound.mp3');
//       audio.play();
//     } catch (error) {
//       console.error('Error playing notification sound:', error);
//     }
//   };
  
//   // Toggle notification dropdown
//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };
  
//   // Mark all notifications as read
//   const markAllAsRead = () => {
//     if (notifications.length === 0) return;
    
//     setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
//     setUnreadCount(0);
//   };
  
//   // Mark a single notification as read
//   const markAsRead = (id) => {
//     setNotifications(prev => prev.map(notification => {
//       if (notification.id === id && !notification.read) {
//         setUnreadCount(prevCount => Math.max(0, prevCount - 1));
//         return { ...notification, read: true };
//       }
//       return notification;
//     }));
//   };
  
//   // Delete a notification
//   const deleteNotification = (id) => {
//     setNotifications(prev => {
//       const notification = prev.find(n => n.id === id);
      
//       if (notification && !notification.read) {
//         setUnreadCount(prevCount => Math.max(0, prevCount - 1));
//       }
      
//       return prev.filter(notification => notification.id !== id);
//     });
//   };
  
//   // Format timestamp
//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return 'Unknown time';
    
//     let date;
    
//     if (timestamp instanceof Timestamp) {
//       date = timestamp.toDate();
//     } else if (timestamp.seconds) {
//       date = new Date(timestamp.seconds * 1000);
//     } else {
//       date = new Date(timestamp);
//     }
    
//     const now = new Date();
//     const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
//     if (diffMinutes < 1) return 'Just now';
//     if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
//     const diffHours = Math.floor(diffMinutes / 60);
//     if (diffHours < 24) return `${diffHours} hours ago`;
    
//     const diffDays = Math.floor(diffHours / 24);
//     if (diffDays < 7) return `${diffDays} days ago`;
    
//     return date.toLocaleDateString();
//   };
  
//   // Get notification icon based on type
//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'order':
//         return '🛒';
//       case 'support':
//         return '🔔';
//       default:
//         return '📄';
//     }
//   };
  
//   // Get notification link based on type
//   const getNotificationLink = (notification) => {
//     switch (notification.type) {
//       case 'order':
//         return `/orders`;
//       case 'support':
//         return `/customer-support`;
//       default:
//         return '#';
//     }
//   };
  
//   // Total count of all unread notifications
//   const totalUnreadCount = orderCount + supportCount;

//   return (
//     <div className="notification-system" ref={dropdownRef}>
//       <div className="notification-icon" onClick={toggleDropdown}>
//         <i className="fas fa-bell"></i>
//         {totalUnreadCount > 0 && (
//           <span className="notification-badge">{totalUnreadCount}</span>
//         )}
//       </div>
      
//       {showDropdown && (
//         <div className="notification-dropdown">
//           <div className="notification-header">
//             <h3>Notifications</h3>
//             {unreadCount > 0 && (
//               <button className="mark-all-read" onClick={markAllAsRead}>
//                 Mark all as read
//               </button>
//             )}
//           </div>
          
//           <div className="notification-counters">
//             {orderCount > 0 && (
//               <div className="counter order-counter">
//                 <span className="counter-icon">🛒</span>
//                 <span className="counter-value">{orderCount}</span>
//                 <span className="counter-label">New Orders</span>
//               </div>
//             )}
            
//             {supportCount > 0 && (
//               <div className="counter support-counter">
//                 <span className="counter-icon">🔔</span>
//                 <span className="counter-value">{supportCount}</span>
//                 <span className="counter-label">Support Requests</span>
//               </div>
//             )}
//           </div>
          
//           <div className="notification-list">
//             {loading ? (
//               <div className="notification-loading">
//                 <div className="loading-spinner"></div>
//                 <p>Loading notifications...</p>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="no-notifications">
//                 <p>No notifications</p>
//               </div>
//             ) : (
//               notifications.slice(0, 10).map((notification) => (
//                 <Link 
//                   to={getNotificationLink(notification)}
//                   key={notification.id}
//                   className={`notification-item ${!notification.read ? 'unread' : ''}`}
//                   onClick={() => markAsRead(notification.id)}
//                 >
//                   <div className="notification-icon-container">
//                     <span className="notification-type-icon">
//                       {getNotificationIcon(notification.type)}
//                     </span>
//                   </div>
//                   <div className="notification-content">
//                     <div className="notification-title">
//                       {notification.title}
//                       {!notification.read && <span className="unread-dot"></span>}
//                     </div>
//                     <div className="notification-message">{notification.message}</div>
//                     <div className="notification-time">{formatTimestamp(notification.timestamp)}</div>
//                   </div>
//                   <button 
//                     className="delete-notification" 
//                     onClick={(e) => {
//                       e.preventDefault();
//                       e.stopPropagation();
//                       deleteNotification(notification.id);
//                     }}
//                   >
//                     ×
//                   </button>
//                 </Link>
//               ))
//             )}
//           </div>
          
//           {notifications.length > 10 && (
//             <div className="view-all-container">
//               <Link to="/notifications" className="view-all-notifications">
//                 View All Notifications
//               </Link>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationSystem;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // For direct notifications fetching
  useEffect(() => {
    console.log("NotificationSystem: Initializing...");
    setLoading(true);
    setError(null);

    // Instead of using complex queries with listeners, let's directly fetch notifications
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications from Firestore...");
        // Simplified query - just get the notifications collection
        const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
        
        if (notificationsSnapshot.empty) {
          console.log("No notifications found in Firestore");
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        console.log(`Found ${notificationsSnapshot.size} notifications`);
        
        // Process the notifications
        const notificationsData = notificationsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Notification data:", data);
          
          // Return a standardized notification object
          return {
            id: doc.id,
            type: data.notificationType || 'order',
            title: data.adminMessage ? 'New Order Received' : 'Notification',
            message: data.adminMessage || data.customerMessage || 'New notification',
            timestamp: data.createdAt || new Date(),
            read: data.status === 'read',
            status: data.status || 'unread',
            data: data
          };
        });

        // Filter out deleted notifications and sort by timestamp
        const filteredNotifications = notificationsData
          .filter(n => n.status !== 'deleted')
          .sort((a, b) => {
            const timeA = a.timestamp instanceof Timestamp ? 
              a.timestamp.toDate() : new Date(a.timestamp);
            const timeB = b.timestamp instanceof Timestamp ? 
              b.timestamp.toDate() : new Date(b.timestamp);
            return timeB - timeA;
          });

        console.log(`Processed ${filteredNotifications.length} notifications`);
        
        setNotifications(filteredNotifications);
        
        // Count unread notifications
        const unreadNotifications = filteredNotifications.filter(n => !n.read);
        setUnreadCount(unreadNotifications.length);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(`Failed to load notifications: ${error.message}`);
        setLoading(false);
      }
    };

    // Fetch immediately, then set up a refresh interval
    fetchNotifications();
    
    // Refresh notifications every 15 seconds
    const intervalId = setInterval(fetchNotifications, 15000);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle notification dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    if (notifications.length === 0) return;
    
    setNotifications(prev => prev.map(notification => ({ 
      ...notification, 
      read: true,
      status: 'read' 
    })));
    setUnreadCount(0);
    
    // Here you would also update the read status in Firestore
    // This is simplified and would need to be expanded for production
  };
  
  // Format timestamp
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
      
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return 'Date error';
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
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
    // Extract type from either the type field or notificationType field
    const type = notification.type || notification.data?.notificationType;
    
    switch (type) {
      case 'order':
      case 'whatsapp':
        return `/orders`;
      case 'support':
        return `/customer-support`;
      default:
        return '/notifications';
    }
  };

  // Get notification message
  const getNotificationMessage = (notification) => {
    // Check various fields that might contain the message
    return notification.message || 
           notification.data?.adminMessage || 
           notification.data?.customerMessage || 
           'New notification';
  };
  
  // Calculate type-specific counts
  const orderCount = notifications.filter(n => 
    (n.type === 'order' || n.data?.notificationType === 'whatsapp') && !n.read
  ).length;
  
  const supportCount = notifications.filter(n => 
    n.type === 'support' && !n.read
  ).length;

  if (error) {
    return (
      <div className="notification-system">
        <div className="notification-icon" onClick={toggleDropdown}>
          <i className="fas fa-bell"></i>
          <span className="notification-error-badge">!</span>
        </div>
        
        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-error">
              <p>Error loading notifications</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notification-system" ref={dropdownRef}>
      <div className="notification-icon" onClick={toggleDropdown}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          
          {(orderCount > 0 || supportCount > 0) && (
            <div className="notification-counters">
              {orderCount > 0 && (
                <div className="counter order-counter">
                  <span className="counter-icon">🛒</span>
                  <span className="counter-value">{orderCount}</span>
                  <span className="counter-label">New Orders</span>
                </div>
              )}
              
              {supportCount > 0 && (
                <div className="counter support-counter">
                  <span className="counter-icon">🔔</span>
                  <span className="counter-value">{supportCount}</span>
                  <span className="counter-label">Support Requests</span>
                </div>
              )}
            </div>
          )}
          
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <Link 
                  to={getNotificationLink(notification)}
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon-container">
                    <span className="notification-type-icon">
                      {getNotificationIcon(notification.type || notification.data?.notificationType)}
                    </span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-message">
                      {getNotificationMessage(notification)}
                    </div>
                    <div className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {notifications.length > 10 && (
            <div className="view-all-container">
              <Link to="/notifications" className="view-all-notifications">
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;