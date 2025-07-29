import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class NotificationService {
  /**
   * Create a new notification in the database
   * 
   * @param {Object} notification - The notification object
   * @param {string} notification.type - Type of notification ('order', 'support', etc.)
   * @param {string} notification.message - The notification message
   * @param {string} [notification.orderId] - Optional order ID related to notification
   * @param {string} [notification.customerId] - Optional customer ID related to notification
   * @param {Object} [notification.metadata] - Optional additional data
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createNotification(notification) {
    try {
      const notificationData = {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'adminNotifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   * 
   * @param {string} notificationId - The ID of the notification to mark as read
   * @returns {Promise<void>}
   */
  static async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'adminNotifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read
   * 
   * @returns {Promise<void>}
   */
  static async markAllAsRead() {
    try {
      const unreadQuery = query(
        collection(db, 'adminNotifications'),
        where('read', '==', false)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      
      if (unreadSnapshot.empty) return;
      
      const batch = writeBatch(db);
      
      unreadSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Set up real-time listener for new orders to create notifications
   * 
   * @returns {function} - Unsubscribe function to clean up the listener
   */
  static setupOrderNotificationsListener() {
    try {
      // Use timestamp of 5 minutes ago to prevent old orders from triggering notifications
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>', Timestamp.fromDate(fiveMinutesAgo)),
        orderBy('createdAt', 'desc')
      );
      
      return onSnapshot(ordersQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const order = change.doc.data();
            
            // Create notification for new order
            await NotificationService.createNotification({
              type: 'order',
              message: `New order placed by ${order.customerName || 'a customer'} for ₹${
                typeof order.totalAmount === 'number' 
                  ? order.totalAmount.toLocaleString('en-IN') 
                  : 'N/A'
              }`,
              orderId: change.doc.id,
              customerId: order.userId,
              metadata: {
                orderType: order.orderType,
                items: order.items?.length || 0,
                status: order.status || 'Pending'
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('Error setting up order notifications listener:', error);
      return () => {};
    }
  }
  
  /**
   * Set up real-time listener for support requests to create notifications
   * 
   * @returns {function} - Unsubscribe function to clean up the listener
   */
  static setupSupportNotificationsListener() {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const supportQuery = query(
        collection(db, 'support'),
        where('createdAt', '>', Timestamp.fromDate(fiveMinutesAgo)),
        orderBy('createdAt', 'desc')
      );
      
      return onSnapshot(supportQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const support = change.doc.data();
            
            // Create notification for new support request
            await NotificationService.createNotification({
              type: 'support',
              message: `New support request from ${support.customerName || 'a customer'} about ${
                support.issueType === 'other' ? 'an issue' : support.issueDescription
              }`,
              orderId: support.orderId,
              customerId: support.userId,
              metadata: {
                issueType: support.issueType,
                status: support.status || 'pending'
              }
            });
          }
          
          // Also track updates for pending support requests with new customer messages
          if (change.type === 'modified') {
            const support = change.doc.data();
            const responses = support.responses || [];
            
            // Check if the most recent response is from the customer
            if (responses.length > 0) {
              const latestResponse = responses[responses.length - 1];
              
              // If the latest response is from the customer and not too old
              if (!latestResponse.isAdmin && latestResponse.timestamp) {
                const responseTime = latestResponse.timestamp instanceof Timestamp 
                  ? latestResponse.timestamp.toDate() 
                  : new Date(latestResponse.timestamp);
                
                // Only create notification if response is within the last 5 minutes
                if ((new Date().getTime() - responseTime.getTime()) < 5 * 60 * 1000) {
                  await NotificationService.createNotification({
                    type: 'support',
                    message: `${support.customerName || 'A customer'} added information to their support request`,
                    orderId: support.orderId,
                    customerId: support.userId,
                    metadata: {
                      issueType: support.issueType,
                      status: support.status || 'pending'
                    }
                  });
                }
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error setting up support notifications listener:', error);
      return () => {};
    }
  }
  
  /**
   * Set up all notification listeners
   * 
   * @returns {Object} - Object containing unsubscribe functions
   */
  static setupAllNotificationListeners() {
    const unsubscribeOrders = this.setupOrderNotificationsListener();
    const unsubscribeSupport = this.setupSupportNotificationsListener();
    
    return {
      unsubscribeOrders,
      unsubscribeSupport,
      unsubscribeAll: () => {
        unsubscribeOrders();
        unsubscribeSupport();
      }
    };
  }
}

export default NotificationService;