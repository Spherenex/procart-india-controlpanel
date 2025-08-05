






// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   doc, 
//   updateDoc, 
//   getDoc,
//   where, 
//   Timestamp,
//   arrayUnion,
//   serverTimestamp 
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Ordersmanagement.css';

// const OrdersManagement = () => {
//   const [orders, setOrders] = useState({
//     quick: [],
//     normal: [],
//     late: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dateRange, setDateRange] = useState({ from: '', to: '' });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  
//   const searchInputRef = useRef(null);

//   const orderStatusOptions = [
//     'all',
//     'Pending',
//     'Processing',
//     'Shipped',
//     'Out for Delivery',
//     'Delivered',
//     'Cancelled'
//   ];

//   useEffect(() => {
//     const timerId = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 300);
//     return () => clearTimeout(timerId);
//   }, [searchTerm]);

//   const parseDateString = (dateString) => {
//     if (!dateString) return null;
//     if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return new Date(dateString);
//     const parts = dateString.split('-');
//     if (parts.length === 3) return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
//     return new Date(dateString);
//   };

//   const getDeliverySpeedDisplayName = (speed) => {
//     if (!speed) return 'Standard';
//     switch(speed.toLowerCase()) {
//       case 'quick': case 'express': return 'Quick';
//       case 'normal': return 'Standard';
//       case 'late': return 'Eco';
//       default: return 'Standard';
//     }
//   };

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         let ordersQuery = query(
//           collection(db, 'orders'),
//           orderBy('orderDate', 'desc')
//         );

//         // Apply status filter if not 'all'
//         if (statusFilter !== 'all') {
//           ordersQuery = query(
//             collection(db, 'orders'),
//             where('status', '==', statusFilter),
//             orderBy('orderDate', 'desc')
//           );
//         }

//         const orderSnapshot = await getDocs(ordersQuery);
//         const ordersData = orderSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           orderDate: doc.data().orderDate instanceof Timestamp 
//             ? doc.data().orderDate.toDate() 
//             : new Date(doc.data().orderDate)
//         }));

//         // Apply date range filter
//         let filteredOrders = ordersData;
//         if (dateRange.from && dateRange.to) {
//           const fromDate = parseDateString(dateRange.from);
//           const toDate = parseDateString(dateRange.to);
//           if (fromDate && toDate) {
//             toDate.setHours(23, 59, 59, 999);
//             filteredOrders = filteredOrders.filter(order => {
//               const orderDate = order.orderDate instanceof Date 
//                 ? order.orderDate 
//                 : new Date(order.orderDate);
//               return orderDate >= fromDate && orderDate <= toDate;
//             });
//           }
//         }

//         // Apply search filter
//         if (debouncedSearchTerm) {
//           const term = debouncedSearchTerm.toLowerCase();
//           filteredOrders = filteredOrders.filter(order => 
//             (order.orderId && order.orderId.toLowerCase().includes(term)) || 
//             (order.id && order.id.toLowerCase().includes(term)) || 
//             (order.userId && order.userId.toLowerCase().includes(term)) ||
//             (order.customerName && order.customerName.toLowerCase().includes(term)) ||
//             (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term))
//           );
//         }

//         // Group orders by delivery speed with status consideration
//         const groupedOrders = { quick: [], normal: [], late: [] };
//         filteredOrders.forEach(order => {
//           if (order.items && Array.isArray(order.items)) {
//             const speedsInOrder = new Set(order.items.map(item => item.deliverySpeed || 'normal'));
//             speedsInOrder.forEach(speed => {
//               if (['quick', 'normal', 'late'].includes(speed)) {
//                 const speedItems = order.items.filter(item => (item.deliverySpeed || 'normal') === speed);
//                 let speedStatus = order.status || 'Pending';
//                 if (order.statusHistory && Array.isArray(order.statusHistory)) {
//                   const speedStatusUpdates = order.statusHistory
//                     .filter(update => update.deliverySpeed === speed)
//                     .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//                   if (speedStatusUpdates.length > 0) speedStatus = speedStatusUpdates[0].status;
//                 }
//                 const subtotal = speedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
//                 groupedOrders[speed].push({
//                   id: order.id,
//                   orderId: order.id,
//                   orderDate: order.orderDate,
//                   customerName: order.customerName || 'Guest',
//                   customerId: order.userId || 'guest',
//                   customerEmail: order.customerEmail || 'Not provided',
//                   customerPhone: order.customerPhone || 'Not provided',
//                   deliveryAddress: order.deliveryAddress || 'Not specified',
//                   paymentMethod: order.paymentMethod || 'Not specified',
//                   paymentId: order.paymentId || 'N/A',
//                   deliverySpeed: speed,
//                   items: speedItems,
//                   status: speedStatus,
//                   statusHistory: order.statusHistory || [],
//                   subtotal: subtotal,
//                   totalAmount: order.totalAmount || 0,
//                   notes: order.notes || ''
//                 });
//               }
//             });
//           } else if (order.deliverySpeed) {
//             const speed = order.deliverySpeed;
//             if (['quick', 'normal', 'late'].includes(speed)) groupedOrders[speed].push(order);
//             else groupedOrders.normal.push(order);
//           } else {
//             groupedOrders.normal.push(order);
//           }
//         });

//         setOrders(groupedOrders);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to load orders. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [statusFilter, dateRange, debouncedSearchTerm]);

//   const viewOrderDetails = async (orderId, specificDeliverySpeed) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       const orderSnap = await getDoc(orderRef);
//       if (orderSnap.exists()) {
//         const orderData = orderSnap.data();
//         let filteredItems = [];
//         if (orderData.items && Array.isArray(orderData.items)) {
//           filteredItems = orderData.items.filter(item => (item.deliverySpeed || 'normal') === specificDeliverySpeed);
//         }
//         let speedStatus = orderData.status || 'Pending';
//         if (orderData.statusHistory && Array.isArray(orderData.statusHistory)) {
//           const speedStatusUpdates = orderData.statusHistory
//             .filter(update => update.deliverySpeed === specificDeliverySpeed)
//             .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//           if (speedStatusUpdates.length > 0) speedStatus = speedStatusUpdates[0].status;
//         }
//         const subtotal = filteredItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
//         setSelectedOrder({
//           id: orderSnap.id,
//           ...orderData,
//           items: filteredItems,
//           status: speedStatus,
//           viewingDeliverySpeed: specificDeliverySpeed,
//           orderDate: orderData.orderDate instanceof Timestamp ? orderData.orderDate.toDate() : new Date(orderData.orderDate),
//           subtotal: subtotal
//         });
//         setShowDetails(true);
//       } else {
//         alert("Order not found!");
//       }
//     } catch (error) {
//       console.error("Error fetching order details:", error);
//       alert("Failed to load order details. Please try again.");
//     }
//   };

//   const updateOrderStatus = async (orderId, newStatus, specificDeliverySpeed) => {
//     try {
//       setUpdateStatusLoading(true);
//       const orderRef = doc(db, 'orders', orderId);
//       const orderDoc = await getDoc(orderRef);
//       if (!orderDoc.exists()) throw new Error("Order not found");
//       const statusUpdate = {
//         status: newStatus,
//         timestamp: new Date().toISOString(),
//         deliverySpeed: specificDeliverySpeed || selectedOrder?.viewingDeliverySpeed || 'normal'
//       };
//       await updateDoc(orderRef, {
//         statusHistory: arrayUnion(statusUpdate),
//         lastUpdated: serverTimestamp()
//       });
//       setOrders(prevOrders => {
//         const updatedOrders = { ...prevOrders };
//         if (specificDeliverySpeed && updatedOrders[specificDeliverySpeed]) {
//           updatedOrders[specificDeliverySpeed] = prevOrders[specificDeliverySpeed].map(order => 
//             order.id === orderId ? { ...order, status: newStatus, statusHistory: [...(order.statusHistory || []), statusUpdate] } : order
//           );
//         }
//         return updatedOrders;
//       });
//       if (selectedOrder && selectedOrder.id === orderId && selectedOrder.viewingDeliverySpeed === specificDeliverySpeed) {
//         setSelectedOrder(prev => ({ 
//           ...prev, 
//           status: newStatus,
//           statusHistory: [...(prev.statusHistory || []), statusUpdate]
//         }));
//       }
//       alert(`Order status updated to ${newStatus} for ${getDeliverySpeedDisplayName(specificDeliverySpeed)} delivery`);
//     } catch (error) {
//       console.error("Error updating order status:", error);
//       alert(`Failed to update order status: ${error.message}`);
//     } finally {
//       setUpdateStatusLoading(false);
//     }
//   };

//   const cancelOrder = async (orderId, deliverySpeed) => {
//     if (!window.confirm(`Are you sure you want to cancel the ${getDeliverySpeedDisplayName(deliverySpeed)} delivery for this order?`)) return;
//     try {
//       setUpdateStatusLoading(true);
//       const orderRef = doc(db, 'orders', orderId);
//       const orderDoc = await getDoc(orderRef);
//       if (!orderDoc.exists()) throw new Error("Order not found");
//       const statusUpdate = {
//         status: 'Cancelled',
//         timestamp: new Date().toISOString(),
//         deliverySpeed: deliverySpeed,
//         reason: 'Cancelled by admin'
//       };
//       await updateDoc(orderRef, {
//         statusHistory: arrayUnion(statusUpdate),
//         lastUpdated: serverTimestamp()
//       });
//       setOrders(prevOrders => {
//         const updatedOrders = { ...prevOrders };
//         if (updatedOrders[deliverySpeed]) {
//           updatedOrders[deliverySpeed] = prevOrders[deliverySpeed].map(order => 
//             order.id === orderId ? { ...order, status: 'Cancelled', statusHistory: [...(order.statusHistory || []), statusUpdate] } : order
//           );
//         }
//         return updatedOrders;
//       });
//       if (selectedOrder && selectedOrder.id === orderId && selectedOrder.viewingDeliverySpeed === deliverySpeed) {
//         setSelectedOrder(prev => ({ 
//           ...prev, 
//           status: 'Cancelled',
//           statusHistory: [...(prev.statusHistory || []), statusUpdate]
//         }));
//       }
//       alert(`${getDeliverySpeedDisplayName(deliverySpeed)} delivery has been cancelled`);
//     } catch (error) {
//       console.error("Error cancelling order:", error);
//       alert(`Failed to cancel order: ${error.message}`);
//     } finally {
//       setUpdateStatusLoading(false);
//     }
//   };

//   const addOrderNotes = async (orderId, notes) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       const orderDoc = await getDoc(orderRef);
//       if (!orderDoc.exists()) throw new Error('Order not found');
//       await updateDoc(orderRef, {
//         notes: notes,
//         lastUpdated: serverTimestamp()
//       });
//       if (selectedOrder && selectedOrder.id === orderId) {
//         setSelectedOrder(prev => ({ ...prev, notes: notes }));
//       }
//       alert('Order notes updated successfully');
//     } catch (error) {
//       console.error("Error updating order notes:", error);
//       alert("Failed to update order notes. Please try again.");
//     }
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     const d = date instanceof Date ? date : new Date(date);
//     if (isNaN(d.getTime())) return 'Invalid Date';
//     return d.toLocaleString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatAmount = (amount) => {
//     if (typeof amount !== 'number') return '0.00';
//     return amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'Pending': return 'status-pending';
//       case 'Processing': return 'status-processing';
//       case 'Shipped': return 'status-shipped';
//       case 'Out for Delivery': return 'status-out-for-delivery';
//       case 'Delivered': return 'status-delivered';
//       case 'Cancelled': return 'status-cancelled';
//       default: return '';
//     }
//   };

//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick': return { icon: '⚡', class: 'delivery-quick' };
//       case 'express': return { icon: '🚀', class: 'delivery-express' };
//       case 'normal': return { icon: '🚚', class: 'delivery-normal' };
//       case 'late': return { icon: '🐌', class: 'delivery-late' };
//       default: return { icon: '📦', class: 'delivery-standard' };
//     }
//   };

//   const resetFilters = () => {
//     setStatusFilter('all');
//     setDateRange({ from: '', to: '' });
//     setSearchTerm('');
//     if (searchInputRef.current) searchInputRef.current.focus();
//   };

//   if (loading) {
//     return (
//       <div className="orders-loading">
//         <div className="spinner"></div>
//         <p>Loading orders...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="orders-error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   const totalOrders = orders.quick.length + orders.normal.length + orders.late.length;

//   return (
//     <div className="orders-management">
//       <h1>Orders Management</h1>
      
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Status:</label>
//           <select 
//             value={statusFilter} 
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             {orderStatusOptions.map(status => (
//               <option key={status} value={status}>
//                 {status === 'all' ? 'All Statuses' : status}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div className="filter-group">
//           <label>Date Range:</label>
//           <input 
//             type="date" 
//             value={dateRange.from} 
//             onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
//             placeholder="From"
//           />
//           <input 
//             type="date" 
//             value={dateRange.to} 
//             onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
//             placeholder="To"
//           />
//         </div>
        
//         <div className="filter-group">
//           <label>Search:</label>
//           <input 
//             type="text" 
//             value={searchTerm} 
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Order ID, Customer, Address..."
//             ref={searchInputRef}
//           />
//         </div>
        
//         <button className="reset-filters-btn" onClick={resetFilters}>
//           Reset Filters
//         </button>
//       </div>
      
//       <div className="orders-summary">
//         <div className="summary-card total">
//           <div className="summary-icon">📦</div>
//           <div className="summary-details">
//             <h3>Total Orders</h3>
//             <p className="summary-count">{totalOrders}</p>
//           </div>
//         </div>
//         <div className="summary-card quick">
//           <div className="summary-icon">⚡</div>
//           <div className="summary-details">
//             <h3>Quick Orders</h3>
//             <p className="summary-count">{orders.quick.length}</p>
//           </div>
//         </div>
//         <div className="summary-card normal">
//           <div className="summary-icon">🚚</div>
//           <div className="summary-details">
//             <h3>Standard Orders</h3>
//             <p className="summary-count">{orders.normal.length}</p>
//           </div>
//         </div>
//         <div className="summary-card late">
//           <div className="summary-icon">🐌</div>
//           <div className="summary-details">
//             <h3>Eco Orders</h3>
//             <p className="summary-count">{orders.late.length}</p>
//           </div>
//         </div>
//       </div>
      
//       {totalOrders === 0 && (
//         <div className="no-orders">
//           <p>No orders found matching the current filters.</p>
//           <button onClick={resetFilters}>Reset Filters</button>
//         </div>
//       )}
      
//       {orders.quick.length > 0 && (
//         <div className="order-section">
//           <div className="section-header quick-header">
//             <h2>
//               <span className="delivery-icon">⚡</span> 
//               Quick Orders ({orders.quick.length})
//             </h2>
//           </div>
//           <div className="orders-table-container">
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Date</th>
//                   <th>Customer</th>
//                   <th>Address</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.quick.map((order) => (
//                   <tr key={order.id}>
//                     <td>{order.id.substring(0, 8)}...</td>
//                     <td>{formatDate(order.orderDate)}</td>
//                     <td>{order.customerName}</td>
//                     <td>{order.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{formatAmount(order.subtotal)}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(order.status)}`}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewOrderDetails(order.id, 'quick')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateOrderStatus(order.id, e.target.value, 'quick');
//                               e.target.value = "";
//                             }
//                           }}
//                           disabled={updateStatusLoading}
//                         >
//                           <option value="">Update Status</option>
//                           {orderStatusOptions
//                             .filter(status => status !== 'all' && status !== order.status)
//                             .map(status => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))
//                           }
//                         </select>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
      
//       {orders.normal.length > 0 && (
//         <div className="order-section">
//           <div className="section-header normal-header">
//             <h2>
//               <span className="delivery-icon">🚚</span> 
//               Standard Orders ({orders.normal.length})
//             </h2>
//           </div>
//           <div className="orders-table-container">
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Date</th>
//                   <th>Customer</th>
//                   <th>Address</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.normal.map((order) => (
//                   <tr key={order.id}>
//                     <td>{order.id.substring(0, 8)}...</td>
//                     <td>{formatDate(order.orderDate)}</td>
//                     <td>{order.customerName}</td>
//                     <td>{order.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{formatAmount(order.subtotal)}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(order.status)}`}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewOrderDetails(order.id, 'normal')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateOrderStatus(order.id, e.target.value, 'normal');
//                               e.target.value = "";
//                             }
//                           }}
//                           disabled={updateStatusLoading}
//                         >
//                           <option value="">Update Status</option>
//                           {orderStatusOptions
//                             .filter(status => status !== 'all' && status !== order.status)
//                             .map(status => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))
//                           }
//                         </select>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
      
//       {orders.late.length > 0 && (
//         <div className="order-section">
//           <div className="section-header late-header">
//             <h2>
//               <span className="delivery-icon">🐌</span> 
//               Eco Orders ({orders.late.length})
//             </h2>
//           </div>
//           <div className="orders-table-container">
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Date</th>
//                   <th>Customer</th>
//                   <th>Address</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.late.map((order) => (
//                   <tr key={order.id}>
//                     <td>{order.id.substring(0, 8)}...</td>
//                     <td>{formatDate(order.orderDate)}</td>
//                     <td>{order.customerName}</td>
//                     <td>{order.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{formatAmount(order.subtotal)}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(order.status)}`}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewOrderDetails(order.id, 'late')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateOrderStatus(order.id, e.target.value, 'late');
//                               e.target.value = "";
//                             }
//                           }}
//                           disabled={updateStatusLoading}
//                         >
//                           <option value="">Update Status</option>
//                           {orderStatusOptions
//                             .filter(status => status !== 'all' && status !== order.status)
//                             .map(status => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))
//                           }
//                         </select>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
      
//       {showDetails && selectedOrder && (
//         <div className="order-details-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <div className="header-content">
//                 <h2>Order Details</h2>
//                 {selectedOrder.viewingDeliverySpeed && (
//                   <div className="delivery-badge-container">
//                     <span className={`delivery-badge ${getDeliverySpeedInfo(selectedOrder.viewingDeliverySpeed).class}`}>
//                       {getDeliverySpeedInfo(selectedOrder.viewingDeliverySpeed).icon} 
//                       {getDeliverySpeedDisplayName(selectedOrder.viewingDeliverySpeed)} Delivery
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <button 
//                 className="close-btn"
//                 onClick={() => {
//                   setShowDetails(false);
//                   setSelectedOrder(null);
//                 }}
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="modal-top-section">
//                 <div className="order-status-display">
//                   <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
//                     {selectedOrder.status}
//                   </span>
//                 </div>
//                 {selectedOrder.status !== 'Cancelled' && (
//                   <div className="order-actions">
//                     <button 
//                       className="cancel-order-btn"
//                       onClick={() => cancelOrder(selectedOrder.id, selectedOrder.viewingDeliverySpeed)}
//                       disabled={updateStatusLoading}
//                     >
//                       {updateStatusLoading ? 'Processing...' : 'Cancel Order'}
//                     </button>
//                   </div>
//                 )}
//               </div>
              
//               <div className="order-info-grid">
//                 <div className="info-section order-info">
//                   <h3>Order Information</h3>
//                   <div className="info-group">
//                     <span className="label">Order ID:</span>
//                     <span className="value">{selectedOrder.id}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Order Date:</span>
//                     <span className="value">{formatDate(selectedOrder.orderDate)}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Payment Method:</span>
//                     <span className="value">
//                       {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
//                        selectedOrder.paymentMethod === 'online' ? 'Online Payment' : 
//                        selectedOrder.paymentMethod || 'Not specified'}
//                     </span>
//                   </div>
//                   {selectedOrder.paymentId && selectedOrder.paymentId !== 'N/A' && (
//                     <div className="info-group">
//                       <span className="label">Payment ID:</span>
//                       <span className="value">{selectedOrder.paymentId}</span>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="info-section customer-info">
//                   <h3>Customer Information</h3>
//                   <div className="info-group">
//                     <span className="label">Name:</span>
//                     <span className="value">{selectedOrder.customerName}</span>
//                   </div>
//                   {selectedOrder.customerEmail && selectedOrder.customerEmail !== 'Not provided' && (
//                     <div className="info-group">
//                       <span className="label">Email:</span>
//                       <span className="value">{selectedOrder.customerEmail}</span>
//                     </div>
//                   )}
//                   {selectedOrder.customerPhone && selectedOrder.customerPhone !== 'Not provided' && (
//                     <div className="info-group">
//                       <span className="label">Phone:</span>
//                       <span className="value">{selectedOrder.customerPhone}</span>
//                     </div>
//                   )}
//                   <div className="info-group">
//                     <span className="label">Customer ID:</span>
//                     <span className="value">{selectedOrder.customerId}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Delivery Address:</span>
//                     <span className="value address">{selectedOrder.deliveryAddress}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="order-items">
//                 <h3>
//                   {selectedOrder.viewingDeliverySpeed ? 
//                     `${getDeliverySpeedDisplayName(selectedOrder.viewingDeliverySpeed)} Delivery Items` : 
//                     'Order Items'}
//                 </h3>
//                 <table className="items-table">
//                   <thead>
//                     <tr>
//                       <th>Item</th>
//                       <th>Price</th>
//                       <th>Quantity</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedOrder.items && selectedOrder.items.length > 0 ? (
//                       selectedOrder.items.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.name}</td>
//                           <td>₹{formatAmount(item.price)}</td>
//                           <td>{item.quantity || 1}</td>
//                           <td>₹{formatAmount((item.price || 0) * (item.quantity || 1))}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="4">No item details available</td>
//                       </tr>
//                     )}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td colSpan="3" className="total-label">Subtotal:</td>
//                       <td className="total-value">₹{formatAmount(selectedOrder.subtotal)}</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
              
//               <div className="order-status-section">
//                 <h3>Status Updates</h3>
//                 {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
//                   <div className="status-timeline">
//                     {selectedOrder.statusHistory
//                       .filter(update => !update.deliverySpeed || update.deliverySpeed === selectedOrder.viewingDeliverySpeed)
//                       .map((statusUpdate, index) => (
//                         <div className="timeline-item" key={index}>
//                           <div className="timeline-marker"></div>
//                           <div className="timeline-content">
//                             <div className="timeline-date">{formatDate(statusUpdate.timestamp)}</div>
//                             <div className="timeline-status">
//                               <span className={`status-badge ${getStatusClass(statusUpdate.status)}`}>
//                                 {statusUpdate.status}
//                               </span>
//                             </div>
//                             {statusUpdate.reason && (
//                               <div className="timeline-reason">{statusUpdate.reason}</div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 ) : (
//                   <p className="no-status-updates">No status updates recorded.</p>
//                 )}
//               </div>
              
//               <div className="order-notes-section">
//                 <h3>Order Notes</h3>
//                 <textarea
//                   className="order-notes"
//                   value={selectedOrder.notes || ''}
//                   onChange={(e) => setSelectedOrder(prev => ({ ...prev, notes: e.target.value }))}
//                   placeholder="Add order notes here..."
//                   rows="3"
//                 />
//                 <button 
//                   className="save-notes-btn"
//                   onClick={() => addOrderNotes(selectedOrder.id, selectedOrder.notes)}
//                   disabled={updateStatusLoading}
//                 >
//                   Save Notes
//                 </button>
//               </div>
              
//               <div className="status-update-section">
//                 <h3>Update Order Status</h3>
//                 <div className="status-update-form">
//                   <select
//                     className="status-select"
//                     value=""
//                     onChange={(e) => {
//                       if (e.target.value) {
//                         updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.viewingDeliverySpeed);
//                         e.target.value = "";
//                       }
//                     }}
//                     disabled={updateStatusLoading || selectedOrder.status === 'Cancelled'}
//                   >
//                     <option value="">Select New Status</option>
//                     {orderStatusOptions
//                       .filter(status => status !== 'all' && status !== selectedOrder.status)
//                       .map(status => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))
//                     }
//                   </select>
//                   {updateStatusLoading && <span className="loading-indicator">Updating...</span>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrdersManagement;




import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot,
  doc, 
  updateDoc, 
  getDoc,
  Timestamp,
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Ordersmanagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState({
    quick: [],
    normal: [],
    late: []
  });
  const [filteredOrders, setFilteredOrders] = useState({
    quick: [],
    normal: [],
    late: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  
  const searchInputRef = useRef(null);

  // Add "Pending Payment" to the status options
  const orderStatusOptions = [
    'all',
    'Pending',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Pending Payment'
  ];

  // Parse date strings consistently
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
      
      // Alternative parsing for DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const parts = dateString.split('-');
        return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
      }
      
      return null;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Get consistent display names for delivery speeds
  const getDeliverySpeedDisplayName = (speed) => {
    if (!speed) return 'Standard';
    
    switch(speed.toLowerCase()) {
      case 'quick': case 'express': return 'Quick';
      case 'normal': return 'Standard';
      case 'late': return 'Eco';
      default: return 'Standard';
    }
  };

  // Helper function to get the latest status for a specific delivery speed
  const getLatestStatusForDeliverySpeed = (order, deliverySpeed) => {
    let status = order.status || 'Pending';
    
    if (order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
      const speedUpdates = order.statusHistory
        .filter(update => update.deliverySpeed === deliverySpeed)
        .sort((a, b) => {
          const timeA = new Date(a.timestamp);
          const timeB = new Date(b.timestamp);
          return timeB - timeA;
        });
      
      if (speedUpdates.length > 0) {
        status = speedUpdates[0].status;
      }
    }
    
    return status;
  };

  // Setup real-time orders listener
  useEffect(() => {
    let unsubscribe = null;

    const setupOrdersListener = () => {
      try {
        console.log("Setting up real-time orders listener...");
        setLoading(true);
        setError(null);
        
        const ordersRef = collection(db, 'orders');
        
        unsubscribe = onSnapshot(
          ordersRef,
          (snapshot) => {
            console.log(`Received ${snapshot.size} orders in real-time update`);
            
            if (snapshot.empty) {
              setOrders({ quick: [], normal: [], late: [] });
              setFilteredOrders({ quick: [], normal: [], late: [] });
              setAllOrders([]);
              setLoading(false);
              return;
            }
            
            // Process all orders data
            const ordersData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                orderDate: data.orderDate instanceof Timestamp 
                  ? data.orderDate.toDate() 
                  : data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate()
                  : data.orderDate ? new Date(data.orderDate) 
                  : data.createdAt ? new Date(data.createdAt)
                  : new Date()
              };
            });
            
            // Store all orders for filtering
            setAllOrders(ordersData);
            
            // Process orders into delivery speeds
            const processedOrders = processOrders(ordersData);
            setOrders(processedOrders);
            setFilteredOrders(processedOrders); // Initially show all orders
            
            setLoading(false);
            console.log("Orders processed and state updated");
          },
          (err) => {
            console.error("Error in real-time orders listener:", err);
            setError(`Failed to load orders: ${err.message}`);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up orders listener:", err);
        setError(`Failed to setup orders listener: ${err.message}`);
        setLoading(false);
      }
    };

    setupOrdersListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up orders listener");
        unsubscribe();
      }
    };
  }, []); // Only run once on mount

  // Apply filters when filter criteria change
  useEffect(() => {
    if (orders.quick.length > 0 || orders.normal.length > 0 || orders.late.length > 0) {
      applyFilters();
    }
  }, [statusFilter, dateRange, searchTerm, orders]);

  // Enhanced function to normalize orders (handle both individual and cart orders)
  const normalizeOrder = (order) => {
    // If order already has items array (cart order), return as is
    if (order.items && Array.isArray(order.items)) {
      return order;
    }
    
    // If it's an individual order, convert to items array format
    if (order.productId || order.productName) {
      const normalizedOrder = {
        ...order,
        items: [{
          id: order.productId || 'unknown',
          name: order.productName || 'Unknown Product',
          productName: order.productName || 'Unknown Product',
          price: order.price || 0,
          quantity: order.quantity || 1,
          imageUrl: order.imageUrl || order.image || '',
          image: order.imageUrl || order.image || '',
          deliverySpeed: order.deliverySpeed || order.deliveryOption || order.originalDeliveryOption || 'normal',
          discountPercentage: order.discountPercentage || 0,
          finalPrice: order.price || 0,
          originalPrice: order.originalPrice || order.price || 0
        }]
      };
      
      return normalizedOrder;
    }
    
    // Fallback for orders without clear structure
    return {
      ...order,
      items: []
    };
  };

  // Process orders into delivery speed categories
  const processOrders = (ordersData) => {
    const groupedOrders = { 
      quick: [], 
      normal: [], 
      late: [] 
    };
    
    // Sort orders by date in descending order (newest first)
    const sortedOrdersData = ordersData.sort((a, b) => {
      const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate || 0);
      const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate || 0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    sortedOrdersData.forEach(order => {
      // First normalize the order to ensure consistent structure
      const normalizedOrder = normalizeOrder(order);
      
      if (normalizedOrder.items && Array.isArray(normalizedOrder.items) && normalizedOrder.items.length > 0) {
        const speedsInOrder = new Set(normalizedOrder.items.map(item => {
          // Handle various delivery speed field names
          return item.deliverySpeed || item.originalDeliverySpeed || 'normal';
        }));
        
        speedsInOrder.forEach(speed => {
          if (['quick', 'normal', 'late'].includes(speed)) {
            const speedItems = normalizedOrder.items.filter(item => {
              const itemSpeed = item.deliverySpeed || item.originalDeliverySpeed || 'normal';
              return itemSpeed === speed;
            });
            
            // Get the latest status for this speed from statusHistory or use the main status
            const speedStatus = getLatestStatusForDeliverySpeed(normalizedOrder, speed);
            
            const subtotal = speedItems.reduce((sum, item) => {
              const price = Number(item.price || item.finalPrice) || 0;
              const quantity = Number(item.quantity) || 1;
              return sum + (price * quantity);
            }, 0);
            
            groupedOrders[speed].push({
              id: normalizedOrder.id,
              orderId: normalizedOrder.orderId || normalizedOrder.id,
              orderDate: normalizedOrder.orderDate,
              customerName: normalizedOrder.customerName || 'Guest',
              customerId: normalizedOrder.userId || 'guest',
              customerEmail: normalizedOrder.customerEmail || 'Not provided',
              customerPhone: normalizedOrder.customerPhone || 'Not provided',
              deliveryAddress: normalizedOrder.deliveryAddress || 'Not specified',
              paymentMethod: normalizedOrder.paymentMethod || 'Not specified',
              paymentId: normalizedOrder.paymentId || 'N/A',
              deliverySpeed: speed,
              items: speedItems,
              status: speedStatus,
              statusHistory: normalizedOrder.statusHistory || [],
              subtotal: subtotal,
              totalAmount: normalizedOrder.totalAmount || subtotal,
              notes: normalizedOrder.notes || '',
              // Keep original order data for reference
              originalOrder: normalizedOrder
            });
          }
        });
      } else {
        // Handle orders without items (fallback to normal delivery)
        const speedStatus = getLatestStatusForDeliverySpeed(normalizedOrder, 'normal');
        
        groupedOrders.normal.push({
          id: normalizedOrder.id,
          orderId: normalizedOrder.orderId || normalizedOrder.id,
          orderDate: normalizedOrder.orderDate,
          customerName: normalizedOrder.customerName || 'Guest',
          customerId: normalizedOrder.userId || 'guest',
          customerEmail: normalizedOrder.customerEmail || 'Not provided',
          customerPhone: normalizedOrder.customerPhone || 'Not provided',
          deliveryAddress: normalizedOrder.deliveryAddress || 'Not specified',
          paymentMethod: normalizedOrder.paymentMethod || 'Not specified',
          paymentId: normalizedOrder.paymentId || 'N/A',
          deliverySpeed: 'normal',
          items: [],
          status: speedStatus,
          statusHistory: normalizedOrder.statusHistory || [],
          subtotal: normalizedOrder.totalAmount || normalizedOrder.price || 0,
          totalAmount: normalizedOrder.totalAmount || normalizedOrder.price || 0,
          notes: normalizedOrder.notes || '',
          originalOrder: normalizedOrder
        });
      }
    });
    
    // Sort each category by order date (newest first)
    groupedOrders.quick.sort((a, b) => {
      const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate || 0);
      const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate || 0);
      return dateB - dateA;
    });
    
    groupedOrders.normal.sort((a, b) => {
      const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate || 0);
      const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate || 0);
      return dateB - dateA;
    });
    
    groupedOrders.late.sort((a, b) => {
      const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate || 0);
      const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate || 0);
      return dateB - dateA;
    });
    
    return groupedOrders;
  };

  // Apply filters to orders
  const applyFilters = () => {
    console.log("Applying filters:", { statusFilter, dateRange, searchTerm });
    
    // Deep copy of all orders
    const allOrders = {
      quick: [...orders.quick],
      normal: [...orders.normal],
      late: [...orders.late]
    };
    
    // Apply filters to each category
    const filtered = {
      quick: filterOrderCategory(allOrders.quick),
      normal: filterOrderCategory(allOrders.normal),
      late: filterOrderCategory(allOrders.late)
    };
    
    console.log("Filtered orders:", {
      quick: filtered.quick.length,
      normal: filtered.normal.length,
      late: filtered.late.length
    });
    
    setFilteredOrders(filtered);
  };
  
  // Filter a specific order category
  const filterOrderCategory = (orders) => {
    return orders.filter(order => {
      // Status filter - case insensitive
      if (statusFilter !== 'all') {
        const statusLower = statusFilter.toLowerCase();
        const orderStatusLower = (order.status || '').toLowerCase();
        
        if (orderStatusLower !== statusLower) {
          return false;
        }
      }
      
      // Date range filter
      if (dateRange.from && dateRange.to) {
        const fromDate = parseDateString(dateRange.from);
        const toDate = parseDateString(dateRange.to);
        
        if (fromDate && toDate) {
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          
          const orderDate = order.orderDate instanceof Date 
            ? order.orderDate 
            : new Date(order.orderDate || Date.now());
          
          if (orderDate < fromDate || orderDate > toDate) {
            return false;
          }
        }
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        
        return (
          (order.orderId && order.orderId.toLowerCase().includes(term)) || 
          (order.id && order.id.toLowerCase().includes(term)) || 
          (order.customerId && order.customerId.toLowerCase().includes(term)) ||
          (order.customerName && order.customerName.toLowerCase().includes(term)) ||
          (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term))
        );
      }
      
      return true;
    });
  };

  // Enhanced view order details function
  const viewOrderDetails = async (orderId, specificDeliverySpeed) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        
        // Normalize the order data first
        const normalizedOrder = normalizeOrder(orderData);
        
        // Filter items for the specific delivery speed
        let filteredItems = [];
        if (normalizedOrder.items && Array.isArray(normalizedOrder.items)) {
          filteredItems = normalizedOrder.items.filter(item => {
            const itemSpeed = item.deliverySpeed || item.originalDeliverySpeed || 'normal';
            return itemSpeed === specificDeliverySpeed;
          });
        }
        
        // Get the specific status for this delivery speed
        const speedStatus = getLatestStatusForDeliverySpeed(normalizedOrder, specificDeliverySpeed);
        
        // Calculate subtotal for these items
        const subtotal = filteredItems.reduce((sum, item) => {
          const price = Number(item.price || item.finalPrice) || 0;
          const quantity = Number(item.quantity) || 1;
          return sum + (price * quantity);
        }, 0);
        
        setSelectedOrder({
          id: orderSnap.id,
          ...normalizedOrder,
          items: filteredItems,
          status: speedStatus,
          viewingDeliverySpeed: specificDeliverySpeed,
          orderDate: normalizedOrder.orderDate,
          subtotal: subtotal
        });
        
        setShowDetails(true);
      } else {
        alert("Order not found!");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to load order details. Please try again.");
    }
  };

  // Update order status with real-time support
  const updateOrderStatus = async (orderId, newStatus, specificDeliverySpeed) => {
    try {
      setUpdateStatusLoading(true);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }
      
      const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        deliverySpeed: specificDeliverySpeed,
        updatedBy: 'admin'
      };
      
      // Update the order document - the real-time listener will handle UI updates
      await updateDoc(orderRef, {
        statusHistory: arrayUnion(statusUpdate),
        lastUpdated: serverTimestamp()
      });
      
      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder.id === orderId && selectedOrder.viewingDeliverySpeed === specificDeliverySpeed) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: newStatus,
          statusHistory: [...(prev.statusHistory || []), statusUpdate]
        }));
      }
      
      alert(`Order status updated to ${newStatus} for ${getDeliverySpeedDisplayName(specificDeliverySpeed)} delivery`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(`Failed to update order status: ${error.message}`);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId, deliverySpeed) => {
    if (!window.confirm(`Are you sure you want to cancel the ${getDeliverySpeedDisplayName(deliverySpeed)} delivery for this order?`)) {
      return;
    }
    
    try {
      setUpdateStatusLoading(true);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }
      
      const statusUpdate = {
        status: 'Cancelled',
        timestamp: new Date().toISOString(),
        deliverySpeed: deliverySpeed,
        reason: 'Cancelled by admin',
        updatedBy: 'admin'
      };
      
      // Update the order document - real-time listener handles UI updates
      await updateDoc(orderRef, {
        statusHistory: arrayUnion(statusUpdate),
        lastUpdated: serverTimestamp()
      });
      
      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder.id === orderId && selectedOrder.viewingDeliverySpeed === deliverySpeed) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: 'Cancelled',
          statusHistory: [...(prev.statusHistory || []), statusUpdate]
        }));
      }
      
      alert(`${getDeliverySpeedDisplayName(deliverySpeed)} delivery has been cancelled`);
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(`Failed to cancel order: ${error.message}`);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // Add order notes
  const addOrderNotes = async (orderId, notes) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      // Update the order document - real-time listener handles UI updates
      await updateDoc(orderRef, {
        notes: notes,
        lastUpdated: serverTimestamp()
      });
      
      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, notes: notes }));
      }
      
      alert('Order notes updated successfully');
    } catch (error) {
      console.error("Error updating order notes:", error);
      alert("Failed to update order notes. Please try again.");
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
    
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    // Make status case-insensitive
    const normalizedStatus = (status || '').toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'out for delivery': return 'status-out-for-delivery';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      case 'pending payment': return 'status-pending-payment';
      default: return '';
    }
  };

  // Get delivery speed info
  const getDeliverySpeedInfo = (speed) => {
    switch (speed) {
      case 'quick': return { icon: '⚡', class: 'delivery-quick' };
      case 'express': return { icon: '🚀', class: 'delivery-express' };
      case 'normal': return { icon: '🚚', class: 'delivery-normal' };
      case 'late': return { icon: '🐌', class: 'delivery-late' };
      default: return { icon: '📦', class: 'delivery-standard' };
    }
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const totalOrders = 
    filteredOrders.quick.length + 
    filteredOrders.normal.length + 
    filteredOrders.late.length;

  return (
    <div className="orders-management">
      <h1>Orders Management</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {orderStatusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <input 
            type="date" 
            value={dateRange.from} 
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            placeholder="From"
          />
          <input 
            type="date" 
            value={dateRange.to} 
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            placeholder="To"
          />
        </div>
        
        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Order ID, Customer, Address..."
            ref={searchInputRef}
          />
        </div>
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      <div className="orders-summary">
        <div className="summary-card total">
          <div className="summary-icon">📦</div>
          <div className="summary-details">
            <h3>Total Orders</h3>
            <p className="summary-count">{totalOrders}</p>
          </div>
        </div>
        <div className="summary-card quick">
          <div className="summary-icon">⚡</div>
          <div className="summary-details">
            <h3>Quick Orders</h3>
            <p className="summary-count">{filteredOrders.quick.length}</p>
          </div>
        </div>
        <div className="summary-card normal">
          <div className="summary-icon">🚚</div>
          <div className="summary-details">
            <h3>Standard Orders</h3>
            <p className="summary-count">{filteredOrders.normal.length}</p>
          </div>
        </div>
        <div className="summary-card late">
          <div className="summary-icon">🐌</div>
          <div className="summary-details">
            <h3>Eco Orders</h3>
            <p className="summary-count">{filteredOrders.late.length}</p>
          </div>
        </div>
      </div>
      
      {totalOrders === 0 && (
        <div className="no-orders">
          <p>No orders found matching the current filters.</p>
          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      )}
      
      {/* Quick Orders Section */}
      {filteredOrders.quick.length > 0 && (
        <div className="order-section">
          <div className="section-header quick-header">
            <h2>
              <span className="delivery-icon">⚡</span> 
              Quick Orders ({filteredOrders.quick.length})
            </h2>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.quick.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.substring(0, 8)}...</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.customerName}</td>
                    <td>{order.deliveryAddress && order.deliveryAddress.length > 15 ? 
                      `${order.deliveryAddress.substring(0, 15)}...` : 
                      order.deliveryAddress || 'Not specified'}</td>
                    <td>₹{formatAmount(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewOrderDetails(order.id, 'quick')}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order.id, e.target.value, 'quick');
                              e.target.value = "";
                            }
                          }}
                          disabled={updateStatusLoading}
                        >
                          <option value="">Update Status</option>
                          {orderStatusOptions
                            .filter(status => status !== 'all' && status.toLowerCase() !== (order.status || '').toLowerCase())
                            .map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Standard Orders Section */}
      {filteredOrders.normal.length > 0 && (
        <div className="order-section">
          <div className="section-header normal-header">
            <h2>
              <span className="delivery-icon">🚚</span> 
              Standard Orders ({filteredOrders.normal.length})
            </h2>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.normal.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.substring(0, 8)}...</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.customerName}</td>
                    <td>{order.deliveryAddress && order.deliveryAddress.length > 15 ? 
                      `${order.deliveryAddress.substring(0, 15)}...` : 
                      order.deliveryAddress || 'Not specified'}</td>
                    <td>₹{formatAmount(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewOrderDetails(order.id, 'normal')}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order.id, e.target.value, 'normal');
                              e.target.value = "";
                            }
                          }}
                          disabled={updateStatusLoading}
                        >
                          <option value="">Update Status</option>
                          {orderStatusOptions
                            .filter(status => status !== 'all' && status.toLowerCase() !== (order.status || '').toLowerCase())
                            .map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Eco Orders Section */}
      {filteredOrders.late.length > 0 && (
        <div className="order-section">
          <div className="section-header late-header">
            <h2>
              <span className="delivery-icon">🐌</span> 
              Eco Orders ({filteredOrders.late.length})
            </h2>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.late.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.substring(0, 8)}...</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.customerName}</td>
                    <td>{order.deliveryAddress && order.deliveryAddress.length > 15 ? 
                      `${order.deliveryAddress.substring(0, 15)}...` : 
                      order.deliveryAddress || 'Not specified'}</td>
                    <td>₹{formatAmount(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewOrderDetails(order.id, 'late')}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order.id, e.target.value, 'late');
                              e.target.value = "";
                            }
                          }}
                          disabled={updateStatusLoading}
                        >
                          <option value="">Update Status</option>
                          {orderStatusOptions
                            .filter(status => status !== 'all' && status.toLowerCase() !== (order.status || '').toLowerCase())
                            .map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <div className="header-content">
                <h2>Order Details</h2>
                {selectedOrder.viewingDeliverySpeed && (
                  <div className="delivery-badge-container">
                    <span className={`delivery-badge ${getDeliverySpeedInfo(selectedOrder.viewingDeliverySpeed).class}`}>
                      {getDeliverySpeedInfo(selectedOrder.viewingDeliverySpeed).icon} 
                      {getDeliverySpeedDisplayName(selectedOrder.viewingDeliverySpeed)} Delivery
                    </span>
                  </div>
                )}
              </div>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedOrder(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-top-section">
                <div className="order-status-display">
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                {selectedOrder.status !== 'Cancelled' && (
                  <div className="order-actions">
                    <button 
                      className="cancel-order-btn"
                      onClick={() => cancelOrder(selectedOrder.id, selectedOrder.viewingDeliverySpeed)}
                      disabled={updateStatusLoading}
                    >
                      {updateStatusLoading ? 'Processing...' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="order-info-grid">
                <div className="info-section order-info">
                  <h3>Order Information</h3>
                  <div className="info-group">
                    <span className="label">Order ID:</span>
                    <span className="value">{selectedOrder.orderId || selectedOrder.id}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Order Date:</span>
                    <span className="value">{formatDate(selectedOrder.orderDate)}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Payment Method:</span>
                    <span className="value">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       selectedOrder.paymentMethod === 'online' ? 'Online Payment' :
                       selectedOrder.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' :
                       selectedOrder.paymentMethod || 'Not specified'}
                    </span>
                  </div>
                  {selectedOrder.paymentId && selectedOrder.paymentId !== 'N/A' && (
                    <div className="info-group">
                      <span className="label">Payment ID:</span>
                      <span className="value">{selectedOrder.paymentId}</span>
                    </div>
                  )}
                </div>
                
                <div className="info-section customer-info">
                  <h3>Customer Information</h3>
                  <div className="info-group">
                    <span className="label">Name:</span>
                    <span className="value">{selectedOrder.customerName}</span>
                  </div>
                  {selectedOrder.customerEmail && selectedOrder.customerEmail !== 'Not provided' && (
                    <div className="info-group">
                      <span className="label">Email:</span>
                      <span className="value">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  {selectedOrder.customerPhone && selectedOrder.customerPhone !== 'Not provided' && (
                    <div className="info-group">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  <div className="info-group">
                    <span className="label">Customer ID:</span>
                    <span className="value">{selectedOrder.customerId}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Delivery Address:</span>
                    <span className="value address">{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-items">
                <h3>
                  {selectedOrder.viewingDeliverySpeed ? 
                    `${getDeliverySpeedDisplayName(selectedOrder.viewingDeliverySpeed)} Delivery Items` : 
                    'Order Items'}
                </h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name || item.productName}</td>
                          <td>₹{formatAmount(Number(item.price || item.finalPrice) || 0)}</td>
                          <td>{item.quantity || 1}</td>
                          <td>₹{formatAmount((Number(item.price || item.finalPrice) || 0) * (Number(item.quantity) || 1))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No item details available</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Subtotal:</td>
                      <td className="total-value">₹{formatAmount(selectedOrder.subtotal || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="order-status-section">
                <h3>Status Updates</h3>
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                  <div className="status-timeline">
                    {selectedOrder.statusHistory
                      .filter(update => !update.deliverySpeed || update.deliverySpeed === selectedOrder.viewingDeliverySpeed)
                      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                      .map((statusUpdate, index) => (
                        <div className="timeline-item" key={index}>
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="timeline-date">{formatDate(statusUpdate.timestamp)}</div>
                            <div className="timeline-status">
                              <span className={`status-badge ${getStatusClass(statusUpdate.status)}`}>
                                {statusUpdate.status}
                              </span>
                            </div>
                            {statusUpdate.reason && (
                              <div className="timeline-reason">{statusUpdate.reason}</div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="no-status-updates">No status updates recorded.</p>
                )}
              </div>
              
              <div className="order-notes-section">
                <h3>Order Notes</h3>
                <textarea
                  className="order-notes"
                  value={selectedOrder.notes || ''}
                  onChange={(e) => setSelectedOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add order notes here..."
                  rows="3"
                />
                <button 
                  className="save-notes-btn"
                  onClick={() => addOrderNotes(selectedOrder.id, selectedOrder.notes)}
                  disabled={updateStatusLoading}
                >
                  Save Notes
                </button>
              </div>
              
              <div className="status-update-section">
                <h3>Update Order Status</h3>
                <div className="status-update-form">
                  <select
                    className="status-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.viewingDeliverySpeed);
                        e.target.value = "";
                      }
                    }}
                    disabled={updateStatusLoading || selectedOrder.status === 'Cancelled'}
                  >
                    <option value="">Select New Status</option>
                    {orderStatusOptions
                      .filter(status => status !== 'all' && status.toLowerCase() !== (selectedOrder.status || '').toLowerCase())
                      .map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))
                    }
                  </select>
                  {updateStatusLoading && <span className="loading-indicator">Updating...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;