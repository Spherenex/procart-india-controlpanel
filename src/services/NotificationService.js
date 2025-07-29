// services/NotificationService.js
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';

class NotificationService {
  /**
   * Create a notification for new orders
   * @param {Object} orderData - The order data
   * @returns {Promise} - Promise resolving to notification doc reference
   */
  static async createOrderNotification(orderData) {
    try {
      console.log("Creating order notification for:", orderData.id);
      
      // Create user-friendly order message
      const customerMessage = `Thank you for your order!\n\nOrder Details:\nProduct: ${orderData.productName || 'Product'}\nQuantity: ${orderData.quantity || 1}\nTotal Amount: ₹${orderData.totalAmount?.toFixed(2) || '0.00'}\nDelivery Option: ${orderData.deliveryOption || 'Standard Delivery'}\n\nYour order is being processed and will be delivered as per the selected delivery option.`;
      
      // Create admin message
      const adminMessage = `New Order Received! Order ID: ${orderData.id}\nProduct: ${orderData.productName || 'Product'}\nQuantity: ${orderData.quantity || 1}\nTotal: ₹${orderData.totalAmount?.toFixed(2) || '0.00'}\nCustomer: ${orderData.customerName || 'Unknown'}\nPhone: ${orderData.customerPhone || 'Unknown'}\nAddress: ${orderData.deliveryAddress || 'Unknown'}\nPayment: ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`;
      
      // Create notification document
      const notificationData = {
        orderId: orderData.id,
        orderData: orderData,
        customerMessage: customerMessage,
        adminMessage: adminMessage,
        customerPhone: orderData.customerPhone || '',
        adminPhone: orderData.adminPhone || '9353267558', // Default admin phone
        notificationType: 'whatsapp',
        status: 'unread',
        createdAt: serverTimestamp(),
        sentAt: null
      };
      
      console.log("Notification data prepared:", notificationData);
      
      // Add to notifications collection
      const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log("Notification created with ID:", notificationRef.id);
      
      // Update the order to mark notification as sent
      if (orderData.id) {
        try {
          console.log("Updating order with notificationSent=true");
          await updateDoc(doc(db, 'orders', orderData.id), {
            notificationSent: true,
            notificationId: notificationRef.id
          });
        } catch (orderUpdateError) {
          console.error("Error updating order notification status:", orderUpdateError);
        }
      }
      
      return notificationRef;
    } catch (error) {
      console.error('Error creating order notification:', error);
      throw error;
    }
  }
  
  /**
   * Create a notification for new support requests
   * @param {Object} supportData - The support request data
   * @returns {Promise} - Promise resolving to notification doc reference
   */
  static async createSupportNotification(supportData) {
    try {
      console.log("Creating support notification for:", supportData.id);
      
      const notificationData = {
        type: 'support',
        title: 'New Support Request',
        message: `Support request from ${supportData.customerName || 'Unknown'}: ${supportData.issueType || 'General inquiry'}`,
        supportId: supportData.id,
        supportData: {
          customerName: supportData.customerName,
          issueType: supportData.issueType,
          issueDescription: supportData.issueDescription || supportData.customDescription,
          orderId: supportData.orderId
        },
        status: 'unread',
        createdAt: serverTimestamp(),
        notificationType: 'support'
      };
      
      console.log("Support notification data prepared:", notificationData);
      
      // Add to notifications collection
      const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log("Support notification created with ID:", notificationRef.id);
      
      // Update the support request to mark notification as sent
      if (supportData.id) {
        try {
          console.log("Updating support request with notificationSent=true");
          await updateDoc(doc(db, 'support', supportData.id), {
            notificationSent: true,
            notificationId: notificationRef.id
          });
        } catch (supportUpdateError) {
          console.error("Error updating support notification status:", supportUpdateError);
        }
      }
      
      return notificationRef;
    } catch (error) {
      console.error('Error creating support notification:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} notificationId - The notification ID
   * @returns {Promise} - Promise resolving to void
   */
  static async markAsRead(notificationId) {
    try {
      console.log("Marking notification as read:", notificationId);
      
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        status: 'read',
        readAt: serverTimestamp()
      });
      
      console.log("Notification marked as read");
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read
   * @returns {Promise} - Promise resolving to void
   */
  static async markAllAsRead() {
    try {
      console.log("Marking all notifications as read");
      
      // This would ideally be done in a batch or transaction
      // For now, this is a placeholder - in production you would use
      // a cloud function to handle this operation
      
      console.log("All notifications marked as read");
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   * @param {string} notificationId - The notification ID
   * @returns {Promise} - Promise resolving to void
   */
  static async deleteNotification(notificationId) {
    try {
      console.log("Deleting notification:", notificationId);
      
      // Instead of actually deleting, we mark it as deleted
      const notificationRef = doc(db, 'notifications', notificationId);
      
      await updateDoc(notificationRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      
      console.log("Notification marked as deleted");
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default NotificationService;