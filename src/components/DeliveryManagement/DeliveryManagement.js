// import React, { useState, useEffect } from 'react';
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
// import './DeliveryManagement.css';

// const DeliveryManagement = () => {
//   // State variables
//   const [deliveries, setDeliveries] = useState({
//     quick: [],
//     normal: [],
//     late: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedDelivery, setSelectedDelivery] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dateRange, setDateRange] = useState({ from: '', to: '' });
//   const [searchTerm, setSearchTerm] = useState('');

//   // Define delivery status options
//   const deliveryStatusOptions = [
//     'all',
//     'Pending',
//     'Processing',
//     'Out for Delivery',
//     'Delivered',
//     'Cancelled'
//   ];

//   // Fetch deliveries from Firestore
//   useEffect(() => {
//     const fetchDeliveries = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Base query - orders collection, ordered by orderDate (descending)
//         let ordersQuery = query(
//           collection(db, 'orders'),
//           orderBy('orderDate', 'desc')
//         );

//         // Apply status filter if not 'all'
//         if (statusFilter !== 'all') {
//           ordersQuery = query(
//             collection(db, 'orders'),
//             where('deliveryStatus', '==', statusFilter),
//             orderBy('orderDate', 'desc')
//           );
//         }

//         // Execute the query
//         const querySnapshot = await getDocs(ordersQuery);
        
//         // Process the results
//         let ordersData = [];
//         querySnapshot.forEach((doc) => {
//           const orderData = doc.data();
          
//           // Add the document ID to the order data
//           ordersData.push({
//             id: doc.id,
//             ...orderData,
//             // Convert Firestore timestamp to JS Date if needed
//             orderDate: orderData.orderDate instanceof Timestamp 
//               ? orderData.orderDate.toDate() 
//               : new Date(orderData.orderDate)
//           });
//         });

//         // Apply date range filter if provided
//         if (dateRange.from && dateRange.to) {
//           const fromDate = new Date(dateRange.from);
//           const toDate = new Date(dateRange.to);
//           toDate.setHours(23, 59, 59, 999); // Set to end of day
          
//           ordersData = ordersData.filter(order => {
//             const orderDate = order.orderDate instanceof Date 
//               ? order.orderDate 
//               : new Date(order.orderDate);
            
//             return orderDate >= fromDate && orderDate <= toDate;
//           });
//         }

//         // Apply search filter if provided
//         if (searchTerm) {
//           const term = searchTerm.toLowerCase();
//           ordersData = ordersData.filter(order => 
//             (order.orderId && order.orderId.toLowerCase().includes(term)) || 
//             (order.id && order.id.toLowerCase().includes(term)) || 
//             (order.userId && order.userId.toLowerCase().includes(term)) ||
//             (order.customerName && order.customerName.toLowerCase().includes(term)) ||
//             (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term))
//           );
//         }

//         // Group deliveries by delivery speed
//         const groupedDeliveries = {
//           quick: [],
//           normal: [],
//           late: []
//         };

//         // Process each order to extract delivery information
//         ordersData.forEach(order => {
//           // Initialize deliveryStatus if not present
//           if (!order.deliveryStatus) {
//             order.deliveryStatus = 'Pending';
//           }

//           // Group items by delivery speed
//           if (order.items && Array.isArray(order.items)) {
//             // Track which delivery speeds are in this order
//             const speedsInOrder = new Set();
            
//             // Organize items by delivery speed
//             order.items.forEach(item => {
//               const speed = item.deliverySpeed || 'normal';
//               speedsInOrder.add(speed);
//             });
            
//             // Create a delivery entry for each speed in the order
//             speedsInOrder.forEach(speed => {
//               if (groupedDeliveries[speed]) {
//                 // Get items with this delivery speed
//                 const speedItems = order.items.filter(item => (item.deliverySpeed || 'normal') === speed);
                
//                 // Create a delivery entry for this speed
//                 const deliveryEntry = {
//                   id: order.id,
//                   orderId: order.orderId || order.id,
//                   orderDate: order.orderDate,
//                   customerName: order.customerName || 'Guest',
//                   customerId: order.userId || 'guest',
//                   deliveryAddress: order.deliveryAddress || 'Not specified',
//                   paymentMethod: order.paymentMethod || 'Not specified',
//                   deliverySpeed: speed,
//                   items: speedItems,
//                   status: order.deliveryStatus || 'Pending',
//                   statusHistory: order.statusHistory || [],
//                   // Calculate subtotal for these items
//                   subtotal: speedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
//                 };
                
//                 groupedDeliveries[speed].push(deliveryEntry);
//               }
//             });
//           }
//         });

//         console.log("Grouped deliveries:", groupedDeliveries);
//         setDeliveries(groupedDeliveries);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching deliveries:", err);
//         setError("Failed to load deliveries. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchDeliveries();
//   }, [statusFilter, dateRange, searchTerm]);

//   // Update delivery status
//   const updateDeliveryStatus = async (orderId, newStatus, deliverySpeed) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       const orderDoc = await getDoc(orderRef);
      
//       if (!orderDoc.exists()) {
//         throw new Error('Order not found');
//       }
      
//       // Create a status update entry
//       const statusUpdate = {
//         status: newStatus,
//         timestamp: new Date().toISOString(),
//         deliverySpeed: deliverySpeed
//       };
      
//       // Update the order document
//       await updateDoc(orderRef, {
//         deliveryStatus: newStatus,
//         statusHistory: arrayUnion(statusUpdate),
//         lastUpdated: serverTimestamp()
//       });
      
//       // Update the local state
//       setDeliveries(prevDeliveries => {
//         const updatedDeliveries = { ...prevDeliveries };
        
//         // Update the delivery in the correct category
//         updatedDeliveries[deliverySpeed] = prevDeliveries[deliverySpeed].map(delivery => 
//           delivery.id === orderId 
//             ? { ...delivery, status: newStatus, statusHistory: [...(delivery.statusHistory || []), statusUpdate] } 
//             : delivery
//         );
        
//         return updatedDeliveries;
//       });

//       // If this is the selected delivery, update it too
//       if (selectedDelivery && selectedDelivery.id === orderId) {
//         setSelectedDelivery(prev => ({ 
//           ...prev, 
//           status: newStatus,
//           statusHistory: [...(prev.statusHistory || []), statusUpdate]
//         }));
//       }
      
//       alert(`Delivery status updated to ${newStatus}`);
//     } catch (error) {
//       console.error("Error updating delivery status:", error);
//       alert("Failed to update delivery status. Please try again.");
//     }
//   };

//   // View delivery details
//   const viewDeliveryDetails = async (orderId, deliverySpeed) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
//       const orderSnap = await getDoc(orderRef);
      
//       if (orderSnap.exists()) {
//         const orderData = orderSnap.data();
        
//         // Find the items with the matching delivery speed
//         const speedItems = Array.isArray(orderData.items) 
//           ? orderData.items.filter(item => (item.deliverySpeed || 'normal') === deliverySpeed)
//           : [];
        
//         const deliveryDetails = {
//           id: orderSnap.id,
//           orderId: orderData.orderId || orderSnap.id,
//           orderDate: orderData.orderDate instanceof Timestamp 
//             ? orderData.orderDate.toDate() 
//             : new Date(orderData.orderDate),
//           customerName: orderData.customerName || 'Guest',
//           customerEmail: orderData.customerEmail || 'Not provided',
//           customerPhone: orderData.customerPhone || 'Not provided',
//           customerId: orderData.userId || 'guest',
//           deliveryAddress: orderData.deliveryAddress || 'Not specified',
//           paymentMethod: orderData.paymentMethod || 'Not specified',
//           paymentId: orderData.paymentId || 'N/A',
//           deliverySpeed: deliverySpeed,
//           items: speedItems,
//           status: orderData.deliveryStatus || 'Pending',
//           statusHistory: orderData.statusHistory || [],
//           subtotal: speedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
//           notes: orderData.notes || ''
//         };
        
//         setSelectedDelivery(deliveryDetails);
//         setShowDetails(true);
//       } else {
//         alert("Order not found!");
//       }
//     } catch (error) {
//       console.error("Error fetching delivery details:", error);
//       alert("Failed to load delivery details. Please try again.");
//     }
//   };

//   // Format date for display
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

//   // Get appropriate status class for styling
//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'Pending':
//         return 'status-pending';
//       case 'Processing':
//         return 'status-processing';
//       case 'Out for Delivery':
//         return 'status-out-for-delivery';
//       case 'Delivered':
//         return 'status-delivered';
//       case 'Cancelled':
//         return 'status-cancelled';
//       default:
//         return '';
//     }
//   };

//   // Get delivery speed icon and class
//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick':
//         return { icon: '⚡', class: 'delivery-quick' };
//       case 'express':
//         return { icon: '🚀', class: 'delivery-express' };
//       case 'normal':
//         return { icon: '🚚', class: 'delivery-normal' };
//       case 'late':
//         return { icon: '🐌', class: 'delivery-late' };
//       default:
//         return { icon: '📦', class: 'delivery-standard' };
//     }
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setStatusFilter('all');
//     setDateRange({ from: '', to: '' });
//     setSearchTerm('');
//   };

//   // Add delivery notes
//   const addDeliveryNotes = async (orderId, notes) => {
//     try {
//       const orderRef = doc(db, 'orders', orderId);
      
//       await updateDoc(orderRef, {
//         notes: notes,
//         lastUpdated: serverTimestamp()
//       });
      
//       // Update the selected delivery in state
//       if (selectedDelivery && selectedDelivery.id === orderId) {
//         setSelectedDelivery(prev => ({ ...prev, notes: notes }));
//       }
      
//       alert('Delivery notes updated successfully');
//     } catch (error) {
//       console.error("Error updating delivery notes:", error);
//       alert("Failed to update delivery notes. Please try again.");
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="deliveries-loading">
//         <div className="spinner"></div>
//         <p>Loading deliveries...</p>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="deliveries-error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   // Calculate total deliveries
//   const totalDeliveries = 
//     deliveries.quick.length + 
//     deliveries.normal.length + 
//     deliveries.late.length;

//   return (
//     <div className="delivery-management">
//       <h1>Delivery Management</h1>
      
//       {/* Filters Section */}
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Status:</label>
//           <select 
//             value={statusFilter} 
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             {deliveryStatusOptions.map(status => (
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
//             onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
//             placeholder="From"
//           />
//           <input 
//             type="date" 
//             value={dateRange.to} 
//             onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
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
//           />
//         </div>
        
//         <button className="reset-filters-btn" onClick={resetFilters}>
//           Reset Filters
//         </button>
//       </div>
      
//       {/* Deliveries Summary */}
//       <div className="deliveries-summary">
//         <div className="summary-card total">
//           <div className="summary-icon">📦</div>
//           <div className="summary-details">
//             <h3>Total Deliveries</h3>
//             <p className="summary-count">{totalDeliveries}</p>
//           </div>
//         </div>
//         <div className="summary-card quick">
//           <div className="summary-icon">⚡</div>
//           <div className="summary-details">
//             <h3>Quick Deliveries</h3>
//             <p className="summary-count">{deliveries.quick.length}</p>
//           </div>
//         </div>
//         <div className="summary-card normal">
//           <div className="summary-icon">🚚</div>
//           <div className="summary-details">
//             <h3>Normal Deliveries</h3>
//             <p className="summary-count">{deliveries.normal.length}</p>
//           </div>
//         </div>
//         <div className="summary-card late">
//           <div className="summary-icon">🐌</div>
//           <div className="summary-details">
//             <h3>Late Deliveries</h3>
//             <p className="summary-count">{deliveries.late.length}</p>
//           </div>
//         </div>
//       </div>
      
//       {/* No deliveries message */}
//       {totalDeliveries === 0 && (
//         <div className="no-deliveries">
//           <p>No deliveries found matching the current filters.</p>
//           <button onClick={resetFilters}>Reset Filters</button>
//         </div>
//       )}
      
//       {/* Quick Deliveries Section */}
//       {deliveries.quick.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header quick-header">
//             <h2>
//               <span className="delivery-icon">⚡</span> 
//               Quick Deliveries ({deliveries.quick.length})
//             </h2>
//           </div>
          
//           <div className="deliveries-table-container">
//             <table className="deliveries-table">
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
//                 {deliveries.quick.map((delivery) => (
//                   <tr key={`${delivery.id}-quick`}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id, 'quick')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateDeliveryStatus(delivery.id, e.target.value, 'quick');
//                               e.target.value = "";
//                             }
//                           }}
//                         >
//                           <option value="">Update Status</option>
//                           {deliveryStatusOptions
//                             .filter(status => status !== 'all' && status !== delivery.status)
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
      
//       {/* Normal Deliveries Section */}
//       {deliveries.normal.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header normal-header">
//             <h2>
//               <span className="delivery-icon">🚚</span> 
//               Normal Deliveries ({deliveries.normal.length})
//             </h2>
//           </div>
          
//           <div className="deliveries-table-container">
//             <table className="deliveries-table">
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
//                 {deliveries.normal.map((delivery) => (
//                   <tr key={`${delivery.id}-normal`}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id, 'normal')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateDeliveryStatus(delivery.id, e.target.value, 'normal');
//                               e.target.value = "";
//                             }
//                           }}
//                         >
//                           <option value="">Update Status</option>
//                           {deliveryStatusOptions
//                             .filter(status => status !== 'all' && status !== delivery.status)
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
      
//       {/* Late Deliveries Section */}
//       {deliveries.late.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header late-header">
//             <h2>
//               <span className="delivery-icon">🐌</span> 
//               Late Deliveries ({deliveries.late.length})
//             </h2>
//           </div>
          
//           <div className="deliveries-table-container">
//             <table className="deliveries-table">
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
//                 {deliveries.late.map((delivery) => (
//                   <tr key={`${delivery.id}-late`}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id, 'late')}
//                         >
//                           View
//                         </button>
//                         <select
//                           className="status-select"
//                           value=""
//                           onChange={(e) => {
//                             if (e.target.value) {
//                               updateDeliveryStatus(delivery.id, e.target.value, 'late');
//                               e.target.value = "";
//                             }
//                           }}
//                         >
//                           <option value="">Update Status</option>
//                           {deliveryStatusOptions
//                             .filter(status => status !== 'all' && status !== delivery.status)
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
      
//       {/* Delivery Details Modal */}
//       {showDetails && selectedDelivery && (
//         <div className="delivery-details-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h2>Delivery Details</h2>
//               <button 
//                 className="close-btn"
//                 onClick={() => {
//                   setShowDetails(false);
//                   setSelectedDelivery(null);
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="delivery-info-header">
//                 <div className="delivery-type">
//                   <span className={`delivery-icon ${getDeliverySpeedInfo(selectedDelivery.deliverySpeed).class}`}>
//                     {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).icon}
//                   </span>
//                   <span className="delivery-label">
//                     {selectedDelivery.deliverySpeed.charAt(0).toUpperCase() + selectedDelivery.deliverySpeed.slice(1)} Delivery
//                   </span>
//                 </div>
//                 <span className={`status-badge ${getStatusClass(selectedDelivery.status)}`}>
//                   {selectedDelivery.status}
//                 </span>
//               </div>
              
//               <div className="delivery-info-grid">
//                 <div className="info-section order-info">
//                   <h3>Order Information</h3>
//                   <div className="info-group">
//                     <span className="label">Order ID:</span>
//                     <span className="value">{selectedDelivery.orderId}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Order Date:</span>
//                     <span className="value">{formatDate(selectedDelivery.orderDate)}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Payment Method:</span>
//                     <span className="value">{selectedDelivery.paymentMethod}</span>
//                   </div>
//                   {selectedDelivery.paymentId && selectedDelivery.paymentId !== 'N/A' && (
//                     <div className="info-group">
//                       <span className="label">Payment ID:</span>
//                       <span className="value">{selectedDelivery.paymentId}</span>
//                     </div>
//                   )}
//                   <div className="info-group">
//                     <span className="label">Subtotal:</span>
//                     <span className="value">₹{selectedDelivery.subtotal.toLocaleString('en-IN')}</span>
//                   </div>
//                 </div>
                
//                 <div className="info-section customer-info">
//                   <h3>Customer Information</h3>
//                   <div className="info-group">
//                     <span className="label">Name:</span>
//                     <span className="value">{selectedDelivery.customerName}</span>
//                   </div>
//                   {selectedDelivery.customerEmail && selectedDelivery.customerEmail !== 'Not provided' && (
//                     <div className="info-group">
//                       <span className="label">Email:</span>
//                       <span className="value">{selectedDelivery.customerEmail}</span>
//                     </div>
//                   )}
//                   {selectedDelivery.customerPhone && selectedDelivery.customerPhone !== 'Not provided' && (
//                     <div className="info-group">
//                       <span className="label">Phone:</span>
//                       <span className="value">{selectedDelivery.customerPhone}</span>
//                     </div>
//                   )}
//                   <div className="info-group">
//                     <span className="label">Customer ID:</span>
//                     <span className="value">{selectedDelivery.customerId}</span>
//                   </div>
//                   <div className="info-group">
//                     <span className="label">Delivery Address:</span>
//                     <span className="value address">{selectedDelivery.deliveryAddress}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="delivery-items">
//                 <h3>Items for {selectedDelivery.deliverySpeed.charAt(0).toUpperCase() + selectedDelivery.deliverySpeed.slice(1)} Delivery</h3>
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
//                     {selectedDelivery.items.map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.name}</td>
//                         <td>₹{item.price.toLocaleString('en-IN')}</td>
//                         <td>{item.quantity || 1}</td>
//                         <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td colSpan="3" className="total-label">Subtotal:</td>
//                       <td className="total-value">₹{selectedDelivery.subtotal.toLocaleString('en-IN')}</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
              
//               <div className="delivery-status-section">
//                 <h3>Status Updates</h3>
//                 {selectedDelivery.statusHistory && selectedDelivery.statusHistory.length > 0 ? (
//                   <div className="status-timeline">
//                     {selectedDelivery.statusHistory.map((statusUpdate, index) => (
//                       <div className="timeline-item" key={index}>
//                         <div className="timeline-marker"></div>
//                         <div className="timeline-content">
//                           <div className="timeline-date">{formatDate(statusUpdate.timestamp)}</div>
//                           <div className="timeline-status">
//                             <span className={`status-badge ${getStatusClass(statusUpdate.status)}`}>
//                               {statusUpdate.status}
//                             </span>
//                           </div>
//                           {statusUpdate.deliverySpeed && (
//                             <div className="timeline-delivery">
//                               <span className={`delivery-badge ${getDeliverySpeedInfo(statusUpdate.deliverySpeed).class}`}>
//                                 {getDeliverySpeedInfo(statusUpdate.deliverySpeed).icon} {statusUpdate.deliverySpeed}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="no-status-updates">No status updates recorded.</p>
//                 )}
//               </div>
              
//               <div className="delivery-notes-section">
//                 <h3>Delivery Notes</h3>
//                 <textarea
//                   className="delivery-notes"
//                   value={selectedDelivery.notes || ''}
//                   onChange={(e) => setSelectedDelivery(prev => ({ ...prev, notes: e.target.value }))}
//                   placeholder="Add delivery notes here..."
//                   rows="3"
//                 ></textarea>
//                 <button 
//                   className="save-notes-btn"
//                   onClick={() => addDeliveryNotes(selectedDelivery.id, selectedDelivery.notes)}
//                 >
//                   Save Notes
//                 </button>
//               </div>
              
//               <div className="status-update-section">
//                 <h3>Update Status</h3>
//                 <div className="status-update-form">
//                   <select
//                     className="status-select"
//                     value=""
//                     onChange={(e) => {
//                       if (e.target.value) {
//                         updateDeliveryStatus(
//                           selectedDelivery.id, 
//                           e.target.value, 
//                           selectedDelivery.deliverySpeed
//                         );
//                         e.target.value = "";
//                       }
//                     }}
//                   >
//                     <option value="">Select New Status</option>
//                     {deliveryStatusOptions
//                       .filter(status => status !== 'all' && status !== selectedDelivery.status)
//                       .map(status => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))
//                     }
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DeliveryManagement;




import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  where, 
  Timestamp,
  arrayUnion,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './DeliveryManagement.css';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState({
    quick: [],
    normal: [],
    late: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const deliveryStatusOptions = [
    'all',
    'Pending',
    'Processing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);

        let ordersQuery = query(
          collection(db, 'orders'),
          orderBy('orderDate', 'desc')
        );

        if (statusFilter !== 'all') {
          ordersQuery = query(
            collection(db, 'orders'),
            where('deliveryStatus', '==', statusFilter),
            orderBy('orderDate', 'desc')
          );
        }

        const orderSnapshot = await getDocs(ordersQuery);
        let ordersData = [];
        orderSnapshot.forEach((doc) => {
          const orderData = doc.data();
          ordersData.push({
            id: doc.id,
            ...orderData,
            orderDate: orderData.orderDate instanceof Timestamp 
              ? orderData.orderDate.toDate() 
              : new Date(orderData.orderDate)
          });
        });

        if (dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          ordersData = ordersData.filter(order => {
            const orderDate = order.orderDate instanceof Date 
              ? order.orderDate 
              : new Date(order.orderDate);
            return orderDate >= fromDate && orderDate <= toDate;
          });
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          ordersData = ordersData.filter(order => 
            (order.orderId && order.orderId.toLowerCase().includes(term)) || 
            (order.id && order.id.toLowerCase().includes(term)) || 
            (order.userId && order.userId.toLowerCase().includes(term)) ||
            (order.customerName && order.customerName.toLowerCase().includes(term)) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term))
          );
        }

        const deliveriesQuery = query(collection(db, 'deliveries'));
        const deliverySnapshot = await getDocs(deliveriesQuery);
        
        const groupedDeliveries = {
          quick: [],
          normal: [],
          late: []
        };

        for (const order of ordersData) {
          if (order.items && Array.isArray(order.items)) {
            const speedsInOrder = new Set();
            order.items.forEach(item => {
              const speed = item.deliverySpeed || 'normal';
              speedsInOrder.add(speed);
            });

            for (const speed of speedsInOrder) {
              if (['quick', 'normal', 'late'].includes(speed)) {
                const speedItems = order.items.filter(item => (item.deliverySpeed || 'normal') === speed);
                
                const deliveryId = `${order.id}_${speed}`;
                const deliveryRef = doc(db, 'deliveries', deliveryId);
                const deliverySnap = await getDoc(deliveryRef);

                let deliveryData;
                if (!deliverySnap.exists()) {
                  deliveryData = {
                    id: deliveryId,
                    orderId: order.id,
                    orderDate: order.orderDate,
                    customerName: order.customerName || 'Guest',
                    customerId: order.userId || 'guest',
                    customerEmail: order.customerEmail || 'Not provided',
                    customerPhone: order.customerPhone || 'Not provided',
                    deliveryAddress: order.deliveryAddress || 'Not specified',
                    paymentMethod: order.paymentMethod || 'Not specified',
                    paymentId: order.paymentId || 'N/A',
                    deliverySpeed: speed,
                    items: speedItems,
                    status: order.deliveryStatus || 'Pending',
                    statusHistory: order.statusHistory?.filter(history => history.deliverySpeed === speed) || [],
                    subtotal: speedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
                    notes: order.notes || '',
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp()
                  };
                  
                  await setDoc(deliveryRef, deliveryData);
                } else {
                  deliveryData = deliverySnap.data();
                  deliveryData.orderDate = deliveryData.orderDate instanceof Timestamp 
                    ? deliveryData.orderDate.toDate() 
                    : new Date(deliveryData.orderDate);
                }

                groupedDeliveries[speed].push(deliveryData);
              }
            }
          }
        }

        console.log("Grouped deliveries:", groupedDeliveries);
        setDeliveries(groupedDeliveries);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError("Failed to load deliveries. Please try again.");
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [statusFilter, dateRange, searchTerm]);

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const deliveryDoc = await getDoc(deliveryRef);
      
      if (!deliveryDoc.exists()) {
        throw new Error('Delivery not found');
      }
      
      const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        deliverySpeed: deliveryDoc.data().deliverySpeed
      };
      
      await updateDoc(deliveryRef, {
        status: newStatus,
        statusHistory: arrayUnion(statusUpdate),
        lastUpdated: serverTimestamp()
      });
      
      setDeliveries(prevDeliveries => {
        const updatedDeliveries = { ...prevDeliveries };
        const speed = deliveryDoc.data().deliverySpeed;
        
        updatedDeliveries[speed] = prevDeliveries[speed].map(delivery => 
          delivery.id === deliveryId 
            ? { ...delivery, status: newStatus, statusHistory: [...(delivery.statusHistory || []), statusUpdate] } 
            : delivery
        );
        
        return updatedDeliveries;
      });

      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(prev => ({ 
          ...prev, 
          status: newStatus,
          statusHistory: [...(prev.statusHistory || []), statusUpdate]
        }));
      }
      
      alert(`Delivery status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert("Failed to update delivery status. Please try again.");
    }
  };

  const viewDeliveryDetails = async (deliveryId) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const deliverySnap = await getDoc(deliveryRef);
      
      if (deliverySnap.exists()) {
        const deliveryData = deliverySnap.data();
        
        const deliveryDetails = {
          id: deliverySnap.id,
          orderId: deliveryData.orderId,
          orderDate: deliveryData.orderDate instanceof Timestamp 
            ? deliveryData.orderDate.toDate() 
            : new Date(deliveryData.orderDate),
          customerName: deliveryData.customerName,
          customerEmail: deliveryData.customerEmail,
          customerPhone: deliveryData.customerPhone,
          customerId: deliveryData.customerId,
          deliveryAddress: deliveryData.deliveryAddress,
          paymentMethod: deliveryData.paymentMethod,
          paymentId: deliveryData.paymentId,
          deliverySpeed: deliveryData.deliverySpeed,
          items: deliveryData.items,
          status: deliveryData.status,
          statusHistory: deliveryData.statusHistory,
          subtotal: deliveryData.subtotal,
          notes: deliveryData.notes
        };
        
        setSelectedDelivery(deliveryDetails);
        setShowDetails(true);
      } else {
        alert("Delivery not found!");
      }
    } catch (error) {
      console.error("Error fetching delivery details:", error);
      alert("Failed to load delivery details. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Out for Delivery': return 'status-out-for-delivery';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getDeliverySpeedInfo = (speed) => {
    switch (speed) {
      case 'quick': return { icon: '⚡', class: 'delivery-quick' };
      case 'express': return { icon: '🚀', class: 'delivery-express' };
      case 'normal': return { icon: '🚚', class: 'delivery-normal' };
      case 'late': return { icon: '🐌', class: 'delivery-late' };
      default: return { icon: '📦', class: 'delivery-standard' };
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
  };

  const addDeliveryNotes = async (deliveryId, notes) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      
      await updateDoc(deliveryRef, {
        notes: notes,
        lastUpdated: serverTimestamp()
      });
      
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(prev => ({ ...prev, notes: notes }));
      }
      
      alert('Delivery notes updated successfully');
    } catch (error) {
      console.error("Error updating delivery notes:", error);
      alert("Failed to update delivery notes. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="deliveries-loading">
        <div className="spinner"></div>
        <p>Loading deliveries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deliveries-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const totalDeliveries = 
    deliveries.quick.length + 
    deliveries.normal.length + 
    deliveries.late.length;

  return (
    <div className="delivery-management">
      <h1>Delivery Management</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {deliveryStatusOptions.map(status => (
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
          />
        </div>
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      <div className="deliveries-summary">
        <div className="summary-card total">
          <div className="summary-icon">📦</div>
          <div className="summary-details">
            <h3>Total Deliveries</h3>
            <p className="summary-count">{totalDeliveries}</p>
          </div>
        </div>
        <div className="summary-card quick">
          <div className="summary-icon">⚡</div>
          <div className="summary-details">
            <h3>Quick Deliveries</h3>
            <p className="summary-count">{deliveries.quick.length}</p>
          </div>
        </div>
        <div className="summary-card normal">
          <div className="summary-icon">🚚</div>
          <div className="summary-details">
            <h3>Normal Deliveries</h3>
            <p className="summary-count">{deliveries.normal.length}</p>
          </div>
        </div>
        <div className="summary-card late">
          <div className="summary-icon">🐌</div>
          <div className="summary-details">
            <h3>Late Deliveries</h3>
            <p className="summary-count">{deliveries.late.length}</p>
          </div>
        </div>
      </div>
      
      {totalDeliveries === 0 && (
        <div className="no-deliveries">
          <p>No deliveries found matching the current filters.</p>
          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      )}
      
      {deliveries.quick.length > 0 && (
        <div className="delivery-section">
          <div className="section-header quick-header">
            <h2>
              <span className="delivery-icon">⚡</span> 
              Quick Deliveries ({deliveries.quick.length})
            </h2>
          </div>
          
          <div className="deliveries-table-container">
            <table className="deliveries-table">
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
                {deliveries.quick.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
                    <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewDeliveryDetails(delivery.id)}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateDeliveryStatus(delivery.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Update Status</option>
                          {deliveryStatusOptions
                            .filter(status => status !== 'all' && status !== delivery.status)
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
      
      {deliveries.normal.length > 0 && (
        <div className="delivery-section">
          <div className="section-header normal-header">
            <h2>
              <span className="delivery-icon">🚚</span> 
              Normal Deliveries ({deliveries.normal.length})
            </h2>
          </div>
          
          <div className="deliveries-table-container">
            <table className="deliveries-table">
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
                {deliveries.normal.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
                    <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewDeliveryDetails(delivery.id)}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateDeliveryStatus(delivery.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Update Status</option>
                          {deliveryStatusOptions
                            .filter(status => status !== 'all' && status !== delivery.status)
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
      
      {deliveries.late.length > 0 && (
        <div className="delivery-section">
          <div className="section-header late-header">
            <h2>
              <span className="delivery-icon">🐌</span> 
              Late Deliveries ({deliveries.late.length})
            </h2>
          </div>
          
          <div className="deliveries-table-container">
            <table className="deliveries-table">
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
                {deliveries.late.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
                    <td>₹{delivery.subtotal.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn"
                          onClick={() => viewDeliveryDetails(delivery.id)}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateDeliveryStatus(delivery.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Update Status</option>
                          {deliveryStatusOptions
                            .filter(status => status !== 'all' && status !== delivery.status)
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
      
      {showDetails && selectedDelivery && (
        <div className="delivery-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delivery Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedDelivery(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delivery-info-header">
                <div className="delivery-type">
                  <span className={`delivery-icon ${getDeliverySpeedInfo(selectedDelivery.deliverySpeed).class}`}>
                    {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).icon}
                  </span>
                  <span className="delivery-label">
                    {selectedDelivery.deliverySpeed.charAt(0).toUpperCase() + selectedDelivery.deliverySpeed.slice(1)} Delivery
                  </span>
                </div>
                <span className={`status-badge ${getStatusClass(selectedDelivery.status)}`}>
                  {selectedDelivery.status}
                </span>
              </div>
              
              <div className="delivery-info-grid">
                <div className="info-section order-info">
                  <h3>Order Information</h3>
                  <div className="info-group">
                    <span className="label">Order ID:</span>
                    <span className="value">{selectedDelivery.orderId}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Order Date:</span>
                    <span className="value">{formatDate(selectedDelivery.orderDate)}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Payment Method:</span>
                    <span className="value">{selectedDelivery.paymentMethod}</span>
                  </div>
                  {selectedDelivery.paymentId && selectedDelivery.paymentId !== 'N/A' && (
                    <div className="info-group">
                      <span className="label">Payment ID:</span>
                      <span className="value">{selectedDelivery.paymentId}</span>
                    </div>
                  )}
                  <div className="info-group">
                    <span className="label">Subtotal:</span>
                    <span className="value">₹{selectedDelivery.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="info-section customer-info">
                  <h3>Customer Information</h3>
                  <div className="info-group">
                    <span className="label">Name:</span>
                    <span className="value">{selectedDelivery.customerName}</span>
                  </div>
                  {selectedDelivery.customerEmail && selectedDelivery.customerEmail !== 'Not provided' && (
                    <div className="info-group">
                      <span className="label">Email:</span>
                      <span className="value">{selectedDelivery.customerEmail}</span>
                    </div>
                  )}
                  {selectedDelivery.customerPhone && selectedDelivery.customerPhone !== 'Not provided' && (
                    <div className="info-group">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedDelivery.customerPhone}</span>
                    </div>
                  )}
                  <div className="info-group">
                    <span className="label">Customer ID:</span>
                    <span className="value">{selectedDelivery.customerId}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Delivery Address:</span>
                    <span className="value address">{selectedDelivery.deliveryAddress}</span>
                  </div>
                </div>
              </div>
              
              <div className="delivery-items">
                <h3>Items for {selectedDelivery.deliverySpeed.charAt(0).toUpperCase() + selectedDelivery.deliverySpeed.slice(1)} Delivery</h3>
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
                    {selectedDelivery.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>₹{item.price.toLocaleString('en-IN')}</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Subtotal:</td>
                      <td className="total-value">₹{selectedDelivery.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="delivery-status-section">
                <h3>Status Updates</h3>
                {selectedDelivery.statusHistory && selectedDelivery.statusHistory.length > 0 ? (
                  <div className="status-timeline">
                    {selectedDelivery.statusHistory.map((statusUpdate, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-marker"></div>
                        <div className ="timeline-content">
                          <div className="timeline-date">{formatDate(statusUpdate.timestamp)}</div>
                          <div className="timeline-status">
                            <span className={`status-badge ${getStatusClass(statusUpdate.status)}`}>
                              {statusUpdate.status}
                            </span>
                          </div>
                          {statusUpdate.deliverySpeed && (
                            <div className="timeline-delivery">
                              <span className={`delivery-badge ${getDeliverySpeedInfo(statusUpdate.deliverySpeed).class}`}>
                                {getDeliverySpeedInfo(statusUpdate.deliverySpeed).icon} {statusUpdate.deliverySpeed}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-status-updates">No status updates recorded.</p>
                )}
              </div>
              
              <div className="delivery-notes-section">
                <h3>Delivery Notes</h3>
                <textarea
                  className="delivery-notes"
                  value={selectedDelivery.notes || ''}
                  onChange={(e) => setSelectedDelivery(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add delivery notes here..."
                  rows="3"
                />
                <button 
                  className="save-notes-btn"
                  onClick={() => addDeliveryNotes(selectedDelivery.id, selectedDelivery.notes)}
                >
                  Save Notes
                </button>
              </div>
              
              <div className="status-update-section">
                <h3>Update Status</h3>
                <div className="status-update-form">
                  <select
                    className="status-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateDeliveryStatus(selectedDelivery.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Select New Status</option>
                    {deliveryStatusOptions
                      .filter(status => status !== 'all' && status !== selectedDelivery.status)
                      .map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;