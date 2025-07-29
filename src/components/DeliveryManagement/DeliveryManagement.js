




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
//   serverTimestamp,
//   setDoc
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './DeliveryManagement.css';

// const DeliveryManagement = () => {
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
//   const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

//   // We're only allowing "Delivered" status for the delivery team
//   const deliveryStatusOptions = [
//     'all',
//     'Delivered'
//   ];

//   useEffect(() => {
//     const fetchDeliveries = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         let ordersQuery = query(
//           collection(db, 'orders'),
//           orderBy('orderDate', 'desc')
//         );

//         if (statusFilter !== 'all') {
//           ordersQuery = query(
//             collection(db, 'orders'),
//             where('deliveryStatus', '==', statusFilter),
//             orderBy('orderDate', 'desc')
//           );
//         }

//         const orderSnapshot = await getDocs(ordersQuery);
//         let ordersData = [];
//         orderSnapshot.forEach((doc) => {
//           const orderData = doc.data();
//           ordersData.push({
//             id: doc.id,
//             ...orderData,
//             orderDate: orderData.orderDate instanceof Timestamp 
//               ? orderData.orderDate.toDate() 
//               : new Date(orderData.orderDate)
//           });
//         });

//         if (dateRange.from && dateRange.to) {
//           const fromDate = new Date(dateRange.from);
//           const toDate = new Date(dateRange.to);
//           toDate.setHours(23, 59, 59, 999);
          
//           ordersData = ordersData.filter(order => {
//             const orderDate = order.orderDate instanceof Date 
//               ? order.orderDate 
//               : new Date(order.orderDate);
//             return orderDate >= fromDate && orderDate <= toDate;
//           });
//         }

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

//         const deliveriesQuery = query(collection(db, 'deliveries'));
//         const deliverySnapshot = await getDocs(deliveriesQuery);
        
//         const groupedDeliveries = {
//           quick: [],
//           normal: [],
//           late: []
//         };

//         for (const order of ordersData) {
//           if (order.items && Array.isArray(order.items)) {
//             const speedsInOrder = new Set();
//             order.items.forEach(item => {
//               const speed = item.deliverySpeed || 'normal';
//               speedsInOrder.add(speed);
//             });

//             for (const speed of speedsInOrder) {
//               if (['quick', 'normal', 'late'].includes(speed)) {
//                 const speedItems = order.items.filter(item => (item.deliverySpeed || 'normal') === speed);
                
//                 const deliveryId = `${order.id}_${speed}`;
//                 const deliveryRef = doc(db, 'deliveries', deliveryId);
//                 const deliverySnap = await getDoc(deliveryRef);

//                 let deliveryData;
//                 if (!deliverySnap.exists()) {
//                   // Get the specific status for this delivery speed from statusHistory
//                   let speedStatus = order.status || 'Pending';
//                   if (order.statusHistory && Array.isArray(order.statusHistory)) {
//                     const speedStatusUpdates = order.statusHistory
//                       .filter(update => update.deliverySpeed === speed)
//                       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    
//                     if (speedStatusUpdates.length > 0) {
//                       speedStatus = speedStatusUpdates[0].status;
//                     }
//                   }
                  
//                   deliveryData = {
//                     id: deliveryId,
//                     orderId: order.id,
//                     orderDate: order.orderDate,
//                     customerName: order.customerName || 'Guest',
//                     customerId: order.userId || 'guest',
//                     customerEmail: order.customerEmail || 'Not provided',
//                     customerPhone: order.customerPhone || 'Not provided',
//                     deliveryAddress: order.deliveryAddress || 'Not specified',
//                     paymentMethod: order.paymentMethod || 'Not specified',
//                     paymentId: order.paymentId || 'N/A',
//                     deliverySpeed: speed,
//                     items: speedItems,
//                     status: speedStatus,
//                     statusHistory: order.statusHistory?.filter(history => history.deliverySpeed === speed) || [],
//                     subtotal: speedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
//                     notes: order.notes || '',
//                     createdAt: serverTimestamp(),
//                     lastUpdated: serverTimestamp()
//                   };
                  
//                   await setDoc(deliveryRef, deliveryData);
//                 } else {
//                   deliveryData = deliverySnap.data();
//                   deliveryData.orderDate = deliveryData.orderDate instanceof Timestamp 
//                     ? deliveryData.orderDate.toDate() 
//                     : new Date(deliveryData.orderDate);
//                 }

//                 groupedDeliveries[speed].push(deliveryData);
//               }
//             }
//           }
//         }

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

//   const updateDeliveryStatus = async (deliveryId, newStatus) => {
//     try {
//       setUpdateStatusLoading(true);
//       const deliveryRef = doc(db, 'deliveries', deliveryId);
//       const deliveryDoc = await getDoc(deliveryRef);
      
//       if (!deliveryDoc.exists()) {
//         throw new Error('Delivery not found');
//       }
      
//       const deliveryData = deliveryDoc.data();
//       const statusUpdate = {
//         status: newStatus,
//         timestamp: new Date().toISOString(),
//         deliverySpeed: deliveryData.deliverySpeed
//       };
      
//       // Update the delivery document
//       await updateDoc(deliveryRef, {
//         status: newStatus,
//         statusHistory: arrayUnion(statusUpdate),
//         lastUpdated: serverTimestamp()
//       });
      
//       // Also update the corresponding order document to sync with OrdersManagement
//       const orderId = deliveryData.orderId;
//       if (orderId) {
//         console.log(`Updating order ${orderId} with status ${newStatus} for ${deliveryData.deliverySpeed} delivery`);
//         const orderRef = doc(db, 'orders', orderId);
//         const orderDoc = await getDoc(orderRef);
        
//         if (orderDoc.exists()) {
//           // Update the status history with the delivery speed to match OrdersManagement
//           await updateDoc(orderRef, {
//             // This will be used by the OrdersPage component to display the correct status
//             statusHistory: arrayUnion(statusUpdate),
//             lastUpdated: serverTimestamp()
//           });
          
//           console.log(`Order ${orderId} status updated to ${newStatus} for ${deliveryData.deliverySpeed} delivery`);
//         } else {
//           console.error(`Order ${orderId} not found, unable to update status`);
//         }
//       }
      
//       // Update the local state
//       setDeliveries(prevDeliveries => {
//         const updatedDeliveries = { ...prevDeliveries };
//         const speed = deliveryData.deliverySpeed;
        
//         updatedDeliveries[speed] = prevDeliveries[speed].map(delivery => 
//           delivery.id === deliveryId 
//             ? { ...delivery, status: newStatus, statusHistory: [...(delivery.statusHistory || []), statusUpdate] } 
//             : delivery
//         );
        
//         return updatedDeliveries;
//       });

//       if (selectedDelivery && selectedDelivery.id === deliveryId) {
//         setSelectedDelivery(prev => ({ 
//           ...prev, 
//           status: newStatus,
//           statusHistory: [...(prev.statusHistory || []), statusUpdate]
//         }));
//       }
      
//       alert(`Delivery status updated to ${newStatus}`);
//       setUpdateStatusLoading(false);
//     } catch (error) {
//       console.error("Error updating delivery status:", error);
//       alert("Failed to update delivery status. Please try again.");
//       setUpdateStatusLoading(false);
//     }
//   };

//   const viewDeliveryDetails = async (deliveryId) => {
//     try {
//       const deliveryRef = doc(db, 'deliveries', deliveryId);
//       const deliverySnap = await getDoc(deliveryRef);
      
//       if (deliverySnap.exists()) {
//         const deliveryData = deliverySnap.data();
        
//         const deliveryDetails = {
//           id: deliverySnap.id,
//           orderId: deliveryData.orderId,
//           orderDate: deliveryData.orderDate instanceof Timestamp 
//             ? deliveryData.orderDate.toDate() 
//             : new Date(deliveryData.orderDate),
//           customerName: deliveryData.customerName,
//           customerEmail: deliveryData.customerEmail,
//           customerPhone: deliveryData.customerPhone,
//           customerId: deliveryData.customerId,
//           deliveryAddress: deliveryData.deliveryAddress,
//           paymentMethod: deliveryData.paymentMethod,
//           paymentId: deliveryData.paymentId,
//           deliverySpeed: deliveryData.deliverySpeed,
//           items: deliveryData.items,
//           status: deliveryData.status,
//           statusHistory: deliveryData.statusHistory,
//           subtotal: deliveryData.subtotal,
//           notes: deliveryData.notes
//         };
        
//         setSelectedDelivery(deliveryDetails);
//         setShowDetails(true);
//       } else {
//         alert("Delivery not found!");
//       }
//     } catch (error) {
//       console.error("Error fetching delivery details:", error);
//       alert("Failed to load delivery details. Please try again.");
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

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'Pending': return 'status-pending';
//       case 'Processing': return 'status-processing';
//       case 'Out for Delivery': return 'status-out-for-delivery';
//       case 'Delivered': return 'status-delivered';
//       case 'Cancelled': return 'status-cancelled';
//       default: return '';
//     }
//   };

//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick': return { icon: '⚡', class: 'delivery-quick', name: 'Quick' };
//       case 'normal': return { icon: '🚚', class: 'delivery-normal', name: 'Standard' };
//       case 'late': return { icon: '🐌', class: 'delivery-late', name: 'Eco' };
//       default: return { icon: '📦', class: 'delivery-standard', name: 'Standard' };
//     }
//   };

//   const resetFilters = () => {
//     setStatusFilter('all');
//     setDateRange({ from: '', to: '' });
//     setSearchTerm('');
//   };

//   const addDeliveryNotes = async (deliveryId, notes) => {
//     try {
//       const deliveryRef = doc(db, 'deliveries', deliveryId);
//       const deliveryDoc = await getDoc(deliveryRef);
      
//       if (!deliveryDoc.exists()) {
//         throw new Error('Delivery not found');
//       }
      
//       // Update the delivery document
//       await updateDoc(deliveryRef, {
//         notes: notes,
//         lastUpdated: serverTimestamp()
//       });
      
//       // Also update the corresponding order document with the notes
//       const orderId = deliveryDoc.data().orderId;
//       if (orderId) {
//         const orderRef = doc(db, 'orders', orderId);
//         const orderDoc = await getDoc(orderRef);
        
//         if (orderDoc.exists()) {
//           await updateDoc(orderRef, {
//             notes: notes,
//             lastUpdated: serverTimestamp()
//           });
//         }
//       }
      
//       if (selectedDelivery && selectedDelivery.id === deliveryId) {
//         setSelectedDelivery(prev => ({ ...prev, notes: notes }));
//       }
      
//       alert('Delivery notes updated successfully');
//     } catch (error) {
//       console.error("Error updating delivery notes:", error);
//       alert("Failed to update delivery notes. Please try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="deliveries-loading">
//         <div className="spinner"></div>
//         <p>Loading deliveries...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="deliveries-error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   const totalDeliveries = 
//     deliveries.quick.length + 
//     deliveries.normal.length + 
//     deliveries.late.length;

//   return (
//     <div className="delivery-management">
//       <h1>Delivery Management</h1>
      
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
//           />
//         </div>
        
//         <button className="reset-filters-btn" onClick={resetFilters}>
//           Reset Filters
//         </button>
//       </div>
      
//       {/* Summary Cards - Updated names to match image */}
//       <div className="deliveries-summary">
//         <div className="summary-card total">
//           <div className="summary-icon">📦</div>
//           <div className="summary-details">
//             <h3>Total Orders</h3>
//             <p className="summary-count">{totalDeliveries}</p>
//           </div>
//         </div>
//         <div className="summary-card quick">
//           <div className="summary-icon">⚡</div>
//           <div className="summary-details">
//             <h3>Quick Orders</h3>
//             <p className="summary-count">{deliveries.quick.length}</p>
//           </div>
//         </div>
//         <div className="summary-card normal">
//           <div className="summary-icon">🚚</div>
//           <div className="summary-details">
//             <h3>Standard Orders</h3>
//             <p className="summary-count">{deliveries.normal.length}</p>
//           </div>
//         </div>
//         <div className="summary-card late">
//           <div className="summary-icon">🐌</div>
//           <div className="summary-details">
//             <h3>Eco Orders</h3>
//             <p className="summary-count">{deliveries.late.length}</p>
//           </div>
//         </div>
//       </div>
      
//       {totalDeliveries === 0 && (
//         <div className="no-deliveries">
//           <p>No deliveries found matching the current filters.</p>
//           <button onClick={resetFilters}>Reset Filters</button>
//         </div>
//       )}
      
//       {/* Quick Deliveries Section - Updated header name */}
//       {deliveries.quick.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header quick-header">
//             <h2>
//               <span className="delivery-icon">⚡</span> 
//               Quick Orders ({deliveries.quick.length})
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
//                   <tr key={delivery.id}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{typeof delivery.subtotal === 'number' 
//                          ? delivery.subtotal.toLocaleString('en-IN') 
//                          : '0.00'}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id)}
//                         >
//                           View
//                         </button>
//                         {delivery.status !== 'Delivered' && (
//                           <button
//                             className="deliver-btn"
//                             onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
//                             disabled={updateStatusLoading}
//                           >
//                             {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
      
//       {/* Normal Deliveries Section - Updated header name */}
//       {deliveries.normal.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header normal-header">
//             <h2>
//               <span className="delivery-icon">🚚</span> 
//               Standard Orders ({deliveries.normal.length})
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
//                   <tr key={delivery.id}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{typeof delivery.subtotal === 'number' 
//                          ? delivery.subtotal.toLocaleString('en-IN') 
//                          : '0.00'}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id)}
//                         >
//                           View
//                         </button>
//                         {delivery.status !== 'Delivered' && (
//                           <button
//                             className="deliver-btn"
//                             onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
//                             disabled={updateStatusLoading}
//                           >
//                             {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
      
//       {/* Late Deliveries Section - Updated header name */}
//       {deliveries.late.length > 0 && (
//         <div className="delivery-section">
//           <div className="section-header late-header">
//             <h2>
//               <span className="delivery-icon">🐌</span> 
//               Eco Orders ({deliveries.late.length})
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
//                   <tr key={delivery.id}>
//                     <td>{delivery.orderId.substring(0, 8)}...</td>
//                     <td>{formatDate(delivery.orderDate)}</td>
//                     <td>{delivery.customerName}</td>
//                     <td>{delivery.deliveryAddress.substring(0, 15)}...</td>
//                     <td>₹{typeof delivery.subtotal === 'number' 
//                          ? delivery.subtotal.toLocaleString('en-IN') 
//                          : '0.00'}</td>
//                     <td>
//                       <span className={`status-badge ${getStatusClass(delivery.status)}`}>
//                         {delivery.status}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="action-buttons">
//                         <button 
//                           className="view-btn"
//                           onClick={() => viewDeliveryDetails(delivery.id)}
//                         >
//                           View
//                         </button>
//                         {delivery.status !== 'Delivered' && (
//                           <button
//                             className="deliver-btn"
//                             onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
//                             disabled={updateStatusLoading}
//                           >
//                             {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
//                           </button>
//                         )}
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
//                 ×
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="delivery-info-header">
//                 <div className="delivery-type">
//                   <span className={`delivery-icon ${getDeliverySpeedInfo(selectedDelivery.deliverySpeed).class}`}>
//                     {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).icon}
//                   </span>
//                   <span className="delivery-label">
//                     {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).name} Delivery
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
//                     <span className="value">₹{typeof selectedDelivery.subtotal === 'number'
//                                              ? selectedDelivery.subtotal.toLocaleString('en-IN')
//                                              : '0.00'}</span>
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
//                 <h3>Items for {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).name} Delivery</h3>
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
//                     {selectedDelivery.items && selectedDelivery.items.map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.name}</td>
//                         <td>₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : '0.00'}</td>
//                         <td>{item.quantity || 1}</td>
//                         <td>₹{typeof item.price === 'number' ? 
//                              ((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN') : 
//                              '0.00'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr>
//                       <td colSpan="3" className="total-label">Subtotal:</td>
//                       <td className="total-value">₹{typeof selectedDelivery.subtotal === 'number' ?
//                                                    selectedDelivery.subtotal.toLocaleString('en-IN') :
//                                                    '0.00'}</td>
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
//                                 {getDeliverySpeedInfo(statusUpdate.deliverySpeed).icon} {getDeliverySpeedInfo(statusUpdate.deliverySpeed).name}
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
//                 />
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
//                   {selectedDelivery.status !== 'Delivered' ? (
//                     <button
//                       className="deliver-btn"
//                       onClick={() => updateDeliveryStatus(selectedDelivery.id, 'Delivered')}
//                       disabled={updateStatusLoading}
//                     >
//                       {updateStatusLoading ? 'Updating...' : 'Mark as Delivered'}
//                     </button>
//                   ) : (
//                     <p className="already-delivered">This delivery has been marked as delivered.</p>
//                   )}
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
  getDocs,
  doc, 
  updateDoc, 
  getDoc,
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
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [filteredDeliveries, setFilteredDeliveries] = useState({
    quick: [],
    normal: [],
    late: []
  });

  // We're allowing "All", "Pending", "Delivered", etc. statuses for filtering
  const deliveryStatusOptions = [
    'all',
    'Pending',
    'Processing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Pending Payment'
  ];

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        console.log("Fetching all orders for delivery management...");
        setLoading(true);
        setError(null);

        // Simple query without complex filters - avoid index requirements
        const ordersRef = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersRef);
        
        if (orderSnapshot.empty) {
          console.log("No orders found");
          setDeliveries({ quick: [], normal: [], late: [] });
          setFilteredDeliveries({ quick: [], normal: [], late: [] });
          setAllOrders([]);
          setLoading(false);
          return;
        }

        console.log(`Found ${orderSnapshot.size} orders`);
        
        // Process all orders
        const ordersData = orderSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            orderDate: data.orderDate instanceof Timestamp 
              ? data.orderDate.toDate() 
              : data.orderDate ? new Date(data.orderDate) : new Date()
          };
        });
        
        // Store all orders for filtering
        setAllOrders(ordersData);
        
        // Process and create deliveries from orders
        await processDeliveries(ordersData);
        
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError("Failed to load deliveries. Please try again.");
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []); // Only fetch once on component mount

  // Apply filters when filter criteria change
  useEffect(() => {
    if (deliveries.quick.length > 0 || deliveries.normal.length > 0 || deliveries.late.length > 0) {
      applyFilters();
    }
  }, [statusFilter, dateRange, searchTerm, deliveries]);

  // Create deliveries from orders
  const processDeliveries = async (ordersData) => {
    try {
      const groupedDeliveries = {
        quick: [],
        normal: [],
        late: []
      };

      // Process all orders
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
                // Get the specific status for this delivery speed from statusHistory
                let speedStatus = order.status || 'Pending';
                if (order.statusHistory && Array.isArray(order.statusHistory)) {
                  const speedStatusUpdates = order.statusHistory
                    .filter(update => !update.deliverySpeed || update.deliverySpeed === speed)
                    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                  
                  if (speedStatusUpdates.length > 0) {
                    speedStatus = speedStatusUpdates[0].status;
                  }
                }
                
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
                  status: speedStatus,
                  statusHistory: order.statusHistory?.filter(history => !history.deliverySpeed || history.deliverySpeed === speed) || [],
                  subtotal: speedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
                  notes: order.notes || '',
                  createdAt: serverTimestamp(),
                  lastUpdated: serverTimestamp()
                };
                
                await setDoc(deliveryRef, deliveryData);
              } else {
                deliveryData = deliverySnap.data();
                deliveryData.id = deliverySnap.id; // Make sure ID is included
                deliveryData.orderDate = deliveryData.orderDate instanceof Timestamp 
                  ? deliveryData.orderDate.toDate() 
                  : new Date(deliveryData.orderDate || Date.now());
              }

              groupedDeliveries[speed].push(deliveryData);
            }
          }
        }
      }

      console.log("All deliveries:", groupedDeliveries);
      setDeliveries(groupedDeliveries);
      setFilteredDeliveries(groupedDeliveries); // Initially show all deliveries
      setLoading(false);
    } catch (error) {
      console.error("Error processing orders for delivery:", error);
      setError(`Failed to process orders: ${error.message}`);
      setLoading(false);
    }
  };

  // Apply filters to deliveries
  const applyFilters = () => {
    console.log("Applying filters:", { statusFilter, dateRange, searchTerm });
    
    // Make deep copy of all deliveries
    const allDeliveries = {
      quick: [...deliveries.quick],
      normal: [...deliveries.normal],
      late: [...deliveries.late]
    };
    
    // Apply filters to each category
    const filtered = {
      quick: filterDeliveryCategory(allDeliveries.quick),
      normal: filterDeliveryCategory(allDeliveries.normal),
      late: filterDeliveryCategory(allDeliveries.late)
    };
    
    console.log("Filtered deliveries:", filtered);
    setFilteredDeliveries(filtered);
  };
  
  // Filter a specific delivery category
  const filterDeliveryCategory = (deliveries) => {
    return deliveries.filter(delivery => {
      // Status filter - case insensitive
      if (statusFilter !== 'all') {
        const statusLower = statusFilter.toLowerCase();
        const deliveryStatusLower = (delivery.status || '').toLowerCase();
        
        if (deliveryStatusLower !== statusLower) {
          return false;
        }
      }
      
      // Date range filter
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        
        const orderDate = delivery.orderDate instanceof Date 
          ? delivery.orderDate 
          : new Date(delivery.orderDate || Date.now());
        
        if (orderDate < fromDate || orderDate > toDate) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        
        return (
          (delivery.orderId && delivery.orderId.toLowerCase().includes(term)) || 
          (delivery.customerName && delivery.customerName.toLowerCase().includes(term)) || 
          (delivery.deliveryAddress && delivery.deliveryAddress.toLowerCase().includes(term)) ||
          (delivery.customerId && delivery.customerId.toLowerCase().includes(term))
        );
      }
      
      return true;
    });
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      setUpdateStatusLoading(true);
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const deliveryDoc = await getDoc(deliveryRef);
      
      if (!deliveryDoc.exists()) {
        throw new Error('Delivery not found');
      }
      
      const deliveryData = deliveryDoc.data();
      const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        deliverySpeed: deliveryData.deliverySpeed
      };
      
      // Update the delivery document
      await updateDoc(deliveryRef, {
        status: newStatus,
        statusHistory: arrayUnion(statusUpdate),
        lastUpdated: serverTimestamp()
      });
      
      // Also update the corresponding order document to sync with OrdersManagement
      const orderId = deliveryData.orderId;
      if (orderId) {
        console.log(`Updating order ${orderId} with status ${newStatus} for ${deliveryData.deliverySpeed} delivery`);
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          // Update the status history with the delivery speed to match OrdersManagement
          await updateDoc(orderRef, {
            // This will be used by the OrdersPage component to display the correct status
            statusHistory: arrayUnion(statusUpdate),
            status: newStatus, // Also update the main status field
            lastUpdated: serverTimestamp()
          });
          
          // Update the order in allOrders state
          setAllOrders(prev => prev.map(order => 
            order.id === orderId 
              ? {
                  ...order, 
                  status: newStatus, 
                  statusHistory: [...(order.statusHistory || []), statusUpdate]
                }
              : order
          ));
          
          console.log(`Order ${orderId} status updated to ${newStatus} for ${deliveryData.deliverySpeed} delivery`);
        } else {
          console.error(`Order ${orderId} not found, unable to update status`);
        }
      }
      
      // Update the local state
      setDeliveries(prevDeliveries => {
        const updatedDeliveries = { ...prevDeliveries };
        const speed = deliveryData.deliverySpeed;
        
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
      
      // Reapply filters after update
      setTimeout(() => applyFilters(), 100);
      
      alert(`Delivery status updated to ${newStatus}`);
      
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert("Failed to update delivery status. Please try again.");
    } finally {
      setUpdateStatusLoading(false);
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
            : new Date(deliveryData.orderDate || Date.now()),
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

  const getStatusClass = (status) => {
    // Case-insensitive status matching
    const statusLower = (status || '').toLowerCase();
    
    switch (statusLower) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'out for delivery': return 'status-out-for-delivery';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      case 'pending payment': return 'status-pending-payment';
      default: return '';
    }
  };

  const getDeliverySpeedInfo = (speed) => {
    switch (speed) {
      case 'quick': return { icon: '⚡', class: 'delivery-quick', name: 'Quick' };
      case 'normal': return { icon: '🚚', class: 'delivery-normal', name: 'Standard' };
      case 'late': return { icon: '🐌', class: 'delivery-late', name: 'Eco' };
      default: return { icon: '📦', class: 'delivery-standard', name: 'Standard' };
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
      const deliveryDoc = await getDoc(deliveryRef);
      
      if (!deliveryDoc.exists()) {
        throw new Error('Delivery not found');
      }
      
      // Update the delivery document
      await updateDoc(deliveryRef, {
        notes: notes,
        lastUpdated: serverTimestamp()
      });
      
      // Also update the corresponding order document with the notes
      const orderId = deliveryDoc.data().orderId;
      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          await updateDoc(orderRef, {
            notes: notes,
            lastUpdated: serverTimestamp()
          });
          
          // Update in allOrders state
          setAllOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, notes } : order
          ));
        }
      }
      
      // Update local state
      setDeliveries(prev => {
        const speed = deliveryDoc.data().deliverySpeed;
        const updated = { ...prev };
        
        if (updated[speed]) {
          updated[speed] = updated[speed].map(delivery => 
            delivery.id === deliveryId ? { ...delivery, notes } : delivery
          );
        }
        
        return updated;
      });
      
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        setSelectedDelivery(prev => ({ ...prev, notes: notes }));
      }
      
      // Reapply filters after update
      setTimeout(() => applyFilters(), 100);
      
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
    filteredDeliveries.quick.length + 
    filteredDeliveries.normal.length + 
    filteredDeliveries.late.length;

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
      
      {/* Summary Cards - Updated to use filteredDeliveries */}
      <div className="deliveries-summary">
        <div className="summary-card total">
          <div className="summary-icon">📦</div>
          <div className="summary-details">
            <h3>Total Orders</h3>
            <p className="summary-count">{totalDeliveries}</p>
          </div>
        </div>
        <div className="summary-card quick">
          <div className="summary-icon">⚡</div>
          <div className="summary-details">
            <h3>Quick Orders</h3>
            <p className="summary-count">{filteredDeliveries.quick.length}</p>
          </div>
        </div>
        <div className="summary-card normal">
          <div className="summary-icon">🚚</div>
          <div className="summary-details">
            <h3>Standard Orders</h3>
            <p className="summary-count">{filteredDeliveries.normal.length}</p>
          </div>
        </div>
        <div className="summary-card late">
          <div className="summary-icon">🐌</div>
          <div className="summary-details">
            <h3>Eco Orders</h3>
            <p className="summary-count">{filteredDeliveries.late.length}</p>
          </div>
        </div>
      </div>
      
      {totalDeliveries === 0 && (
        <div className="no-deliveries">
          <p>No deliveries found matching the current filters.</p>
          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      )}
      
      {/* Quick Deliveries Section */}
      {filteredDeliveries.quick.length > 0 && (
        <div className="delivery-section">
          <div className="section-header quick-header">
            <h2>
              <span className="delivery-icon">⚡</span> 
              Quick Orders ({filteredDeliveries.quick.length})
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
                {filteredDeliveries.quick.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress && delivery.deliveryAddress.length > 15 ? 
                      `${delivery.deliveryAddress.substring(0, 15)}...` : 
                      delivery.deliveryAddress || 'Not specified'}</td>
                    <td>₹{typeof delivery.subtotal === 'number' 
                         ? delivery.subtotal.toLocaleString('en-IN') 
                         : '0.00'}</td>
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
                        {(delivery.status || '').toLowerCase() !== 'delivered' && (
                          <button
                            className="deliver-btn"
                            onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                            disabled={updateStatusLoading}
                          >
                            {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Standard Deliveries Section */}
      {filteredDeliveries.normal.length > 0 && (
        <div className="delivery-section">
          <div className="section-header normal-header">
            <h2>
              <span className="delivery-icon">🚚</span> 
              Standard Orders ({filteredDeliveries.normal.length})
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
                {filteredDeliveries.normal.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress && delivery.deliveryAddress.length > 15 ? 
                      `${delivery.deliveryAddress.substring(0, 15)}...` : 
                      delivery.deliveryAddress || 'Not specified'}</td>
                    <td>₹{typeof delivery.subtotal === 'number' 
                         ? delivery.subtotal.toLocaleString('en-IN') 
                         : '0.00'}</td>
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
                        {(delivery.status || '').toLowerCase() !== 'delivered' && (
                          <button
                            className="deliver-btn"
                            onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                            disabled={updateStatusLoading}
                          >
                            {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Eco Deliveries Section */}
      {filteredDeliveries.late.length > 0 && (
        <div className="delivery-section">
          <div className="section-header late-header">
            <h2>
              <span className="delivery-icon">🐌</span> 
              Eco Orders ({filteredDeliveries.late.length})
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
                {filteredDeliveries.late.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.orderId.substring(0, 8)}...</td>
                    <td>{formatDate(delivery.orderDate)}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveryAddress && delivery.deliveryAddress.length > 15 ? 
                      `${delivery.deliveryAddress.substring(0, 15)}...` : 
                      delivery.deliveryAddress || 'Not specified'}</td>
                    <td>₹{typeof delivery.subtotal === 'number' 
                         ? delivery.subtotal.toLocaleString('en-IN') 
                         : '0.00'}</td>
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
                        {(delivery.status || '').toLowerCase() !== 'delivered' && (
                          <button
                            className="deliver-btn"
                            onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                            disabled={updateStatusLoading}
                          >
                            {updateStatusLoading ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delivery Details Modal */}
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
                    {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).name} Delivery
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
                    <span className="value">₹{typeof selectedDelivery.subtotal === 'number'
                                             ? selectedDelivery.subtotal.toLocaleString('en-IN')
                                             : '0.00'}</span>
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
                <h3>Items for {getDeliverySpeedInfo(selectedDelivery.deliverySpeed).name} Delivery</h3>
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
                    {selectedDelivery.items && selectedDelivery.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : '0.00'}</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{typeof item.price === 'number' ? 
                             ((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN') : 
                             '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Subtotal:</td>
                      <td className="total-value">₹{typeof selectedDelivery.subtotal === 'number' ?
                                                   selectedDelivery.subtotal.toLocaleString('en-IN') :
                                                   '0.00'}</td>
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
                        <div className="timeline-content">
                          <div className="timeline-date">{formatDate(statusUpdate.timestamp)}</div>
                          <div className="timeline-status">
                            <span className={`status-badge ${getStatusClass(statusUpdate.status)}`}>
                              {statusUpdate.status}
                            </span>
                          </div>
                          {statusUpdate.deliverySpeed && (
                            <div className="timeline-delivery">
                              <span className={`delivery-badge ${getDeliverySpeedInfo(statusUpdate.deliverySpeed).class}`}>
                                {getDeliverySpeedInfo(statusUpdate.deliverySpeed).icon} {getDeliverySpeedInfo(statusUpdate.deliverySpeed).name}
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
                  {(selectedDelivery.status || '').toLowerCase() !== 'delivered' ? (
                    <button
                      className="deliver-btn"
                      onClick={() => updateDeliveryStatus(selectedDelivery.id, 'Delivered')}
                      disabled={updateStatusLoading}
                    >
                      {updateStatusLoading ? 'Updating...' : 'Mark as Delivered'}
                    </button>
                  ) : (
                    <p className="already-delivered">This delivery has been marked as delivered.</p>
                  )}
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