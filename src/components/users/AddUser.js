// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   getDocs, 
//   doc,
//   getDoc,
//   query,
//   where,
//   orderBy,
//   limit,
//   collectionGroup
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './AddUser.css';

// const AddUser = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showUserDetails, setShowUserDetails] = useState(false);
//   const [userOrders, setUserOrders] = useState([]);
//   const [orderLoading, setOrderLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [verificationFilter, setVerificationFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(12);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [showErrorModal, setShowErrorModal] = useState(false);
  
//   // Fetch all users when component mounts
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         console.log("Fetching all users...");
//         setLoading(true);
//         setError(null);
        
//         const usersRef = collection(db, 'users');
//         const userSnapshot = await getDocs(usersRef);
        
//         console.log(`Found ${userSnapshot.size} users`);
        
//         if (userSnapshot.empty) {
//           setUsers([]);
//           setFilteredUsers([]);
//           setLoading(false);
//           return;
//         }
        
//         // Process all users data
//         const usersData = userSnapshot.docs.map(doc => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             ...data,
//             createdAt: data.createdAt ? formatFirebaseTimestamp(data.createdAt) : new Date(),
//             lastLogin: data.lastLogin ? formatFirebaseTimestamp(data.lastLogin) : new Date(),
//             updatedAt: data.updatedAt ? formatFirebaseTimestamp(data.updatedAt) : new Date(),
//           };
//         });
        
//         // Sort users by creation date (newest first)
//         usersData.sort((a, b) => b.createdAt - a.createdAt);
        
//         setUsers(usersData);
//         setFilteredUsers(usersData);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//         setError(`Failed to load users: ${err.message}`);
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Helper function to format Firebase timestamp
//   const formatFirebaseTimestamp = (timestamp) => {
//     if (!timestamp) return new Date();
    
//     try {
//       // Handle Firestore timestamp objects
//       if (timestamp.toDate && typeof timestamp.toDate === 'function') {
//         return timestamp.toDate();
//       }
      
//       // Handle ISO strings or timestamp numbers
//       if (typeof timestamp === 'string' || typeof timestamp === 'number') {
//         const date = new Date(timestamp);
//         if (!isNaN(date.getTime())) {
//           return date;
//         }
//       }
      
//       // Fallback
//       return new Date();
//     } catch (error) {
//       console.error("Error formatting timestamp:", error);
//       return new Date();
//     }
//   };

//   // Apply filters when filter criteria change
//   useEffect(() => {
//     if (users.length > 0) {
//       applyFilters();
//     }
//   }, [searchTerm, verificationFilter, users]);

//   // Apply filters to users
//   const applyFilters = () => {
//     console.log("Applying filters:", { searchTerm, verificationFilter });
    
//     let filtered = [...users];
    
//     // Search term filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(user => 
//         (user.name && user.name.toLowerCase().includes(term)) ||
//         (user.email && user.email.toLowerCase().includes(term)) ||
//         (user.phone && user.phone.includes(term)) ||
//         (user.deliveryAddress && user.deliveryAddress.toLowerCase().includes(term)) ||
//         (user.id && user.id.toLowerCase().includes(term))
//       );
//     }
    
//     // Verification status filter
//     if (verificationFilter !== 'all') {
//       const isVerified = verificationFilter === 'verified';
//       filtered = filtered.filter(user => user.emailVerified === isVerified);
//     }
    
//     console.log("Filtered users:", filtered.length);
//     setFilteredUsers(filtered);
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   // Pagination logic
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   // Change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Generate random color for user avatar based on user ID
//   const getUserAvatarColor = (userId) => {
//     // List of colors to choose from (matches the image design)
//     const colors = [
//       '#6366f1', // Indigo
//       '#8b5cf6', // Violet
//       '#a855f7', // Purple
//       '#d946ef', // Fuchsia
//       '#ec4899', // Pink
//     ];
    
//     // Use user ID to deterministically select a color
//     const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
//     return colors[charSum % colors.length];
//   };

//   // Try multiple approaches to fetch orders
//   const fetchOrdersForUser = async (userId) => {
//     try {
//       // First attempt: Query the orders collection where userId field equals the user ID
//       const ordersRef = collection(db, 'orders');
//       const orderQuery = query(
//         ordersRef,
//         where('userId', '==', userId)
//       );
      
//       const orderSnapshot = await getDocs(orderQuery);
      
//       if (!orderSnapshot.empty) {
//         console.log(`Found ${orderSnapshot.size} orders using direct query`);
//         return orderSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           orderDate: doc.data().orderDate ? formatFirebaseTimestamp(doc.data().orderDate) : new Date()
//         }));
//       }
      
//       // Second attempt: Check if there's a subcollection called 'orders' under this user
//       const userOrdersRef = collection(db, 'users', userId, 'orders');
//       const userOrdersSnapshot = await getDocs(userOrdersRef);
      
//       if (!userOrdersSnapshot.empty) {
//         console.log(`Found ${userOrdersSnapshot.size} orders in user subcollection`);
//         return userOrdersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           orderDate: doc.data().orderDate ? formatFirebaseTimestamp(doc.data().orderDate) : new Date()
//         }));
//       }
      
//       // Third attempt: Try using collectionGroup query (in case orders are in subcollections)
//       const groupQuery = query(
//         collectionGroup(db, 'orders'),
//         where('userId', '==', userId)
//       );
      
//       const groupSnapshot = await getDocs(groupQuery);
      
//       if (!groupSnapshot.empty) {
//         console.log(`Found ${groupSnapshot.size} orders using collectionGroup query`);
//         return groupSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           orderDate: doc.data().orderDate ? formatFirebaseTimestamp(doc.data().orderDate) : new Date()
//         }));
//       }
      
//       // Fourth attempt: Try to look for customerId instead of userId
//       const customerQuery = query(
//         ordersRef,
//         where('customerId', '==', userId)
//       );
      
//       const customerSnapshot = await getDocs(customerQuery);
      
//       if (!customerSnapshot.empty) {
//         console.log(`Found ${customerSnapshot.size} orders using customerId`);
//         return customerSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           orderDate: doc.data().orderDate ? formatFirebaseTimestamp(doc.data().orderDate) : new Date()
//         }));
//       }
      
//       console.log("No orders found for this user with any method");
//       return [];
//     } catch (error) {
//       console.error("Error in fetchOrdersForUser:", error);
//       throw error;
//     }
//   };

//   // View user details and fetch their orders
//   const viewUserDetails = async (userId) => {
//     try {
//       setOrderLoading(true);
//       setErrorMessage(null);
      
//       // Get the user
//       const user = users.find(u => u.id === userId);
//       if (!user) throw new Error("User not found");
      
//       setSelectedUser(user);
//       setShowUserDetails(true);
      
//       console.log(`Fetching orders for user ID: ${userId}`);
      
//       // Fetch orders using our multi-attempt function
//       const ordersData = await fetchOrdersForUser(userId);
      
//       // Sort orders by date (newest first)
//       ordersData.sort((a, b) => b.orderDate - a.orderDate);
      
//       console.log(`Processed ${ordersData.length} orders for display`);
      
//       // Normalize order data
//       const normalizedOrders = ordersData.map(order => ({
//         id: order.id,
//         customerId: order.userId || order.customerId || userId,
//         customerName: order.customerName || user.name || 'Unknown',
//         customerEmail: order.customerEmail || user.email || 'Unknown',
//         orderDate: order.orderDate || new Date(),
//         status: order.status || 'Pending',
//         items: Array.isArray(order.items) ? order.items : [],
//         totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : 0,
//         deliverySpeed: order.deliverySpeed || 'normal',
//         deliveryAddress: order.deliveryAddress || user.deliveryAddress || 'Not specified',
//         paymentMethod: order.paymentMethod || 'Not specified'
//       }));
      
//       setUserOrders(normalizedOrders);
//       setOrderLoading(false);
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       setOrderLoading(false);
//       setErrorMessage(`Failed to load user details: ${error.message}`);
//       setShowErrorModal(true);
//     }
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     if (!date) return 'N/A';
    
//     try {
//       const d = date instanceof Date ? date : new Date(date);
//       if (isNaN(d.getTime())) return 'Invalid Date';
      
//       return d.toLocaleString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return 'Invalid Date';
//     }
//   };

//   // Format amount
//   const formatAmount = (amount) => {
//     if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
    
//     return amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };

//   // Get order status class
//   const getStatusClass = (status) => {
//     const normalizedStatus = (status || '').toLowerCase();
    
//     switch (normalizedStatus) {
//       case 'pending': return 'status-pending';
//       case 'processing': return 'status-processing';
//       case 'shipped': return 'status-shipped';
//       case 'out for delivery': return 'status-out-for-delivery';
//       case 'delivered': return 'status-delivered';
//       case 'cancelled': return 'status-cancelled';
//       case 'pending payment': return 'status-pending-payment';
//       default: return '';
//     }
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchTerm('');
//     setVerificationFilter('all');
//   };

//   // Get user initials for avatar
//   const getUserInitials = (name) => {
//     if (!name) return '?';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   if (loading) {
//     return (
//       <div className="users-loading">
//         <div className="spinner"></div>
//         <p>Loading users...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="users-error">
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <div className="user-management">
//       <h1>User Management</h1>
      
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Search:</label>
//           <input 
//             type="text" 
//             value={searchTerm} 
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Name, Email, Phone..."
//           />
//         </div>
        
//         <div className="filter-group">
//           <label>Verification Status:</label>
//           <select 
//             value={verificationFilter} 
//             onChange={(e) => setVerificationFilter(e.target.value)}
//           >
//             <option value="all">All Users</option>
//             <option value="verified">Verified</option>
//             <option value="unverified">Unverified</option>
//           </select>
//         </div>
        
//         <button className="reset-filters-btn" onClick={resetFilters}>
//           Reset Filters
//         </button>
//       </div>
      
//       <div className="users-summary">
//         <div className="summary-card total">
//           <div className="summary-icon">👥</div>
//           <div className="summary-details">
//             <h3>Total Users</h3>
//             <p className="summary-count">{filteredUsers.length}</p>
//           </div>
//         </div>
//         <div className="summary-card verified">
//           <div className="summary-icon">✅</div>
//           <div className="summary-details">
//             <h3>Verified Users</h3>
//             <p className="summary-count">
//               {filteredUsers.filter(user => user.emailVerified).length}
//             </p>
//           </div>
//         </div>
//         <div className="summary-card unverified">
//           <div className="summary-icon">⚠️</div>
//           <div className="summary-details">
//             <h3>Unverified Users</h3>
//             <p className="summary-count">
//               {filteredUsers.filter(user => !user.emailVerified).length}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {filteredUsers.length === 0 ? (
//         <div className="no-users">
//           <p>No users found matching the current filters.</p>
//           <button onClick={resetFilters}>Reset Filters</button>
//         </div>
//       ) : (
//         <>
//           <div className="user-cards-container">
//             {currentUsers.map(user => {
//               const avatarColor = getUserAvatarColor(user.id);
//               return (
//                 <div className="user-card" key={user.id}>
//                   <div className="user-card-header">
//                     <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
//                       {getUserInitials(user.name)}
//                     </div>
//                     <div className="user-header-info">
//                       <h3 className="user-name">{user.name || 'Unnamed User'}</h3>
//                       <p className="user-email">{user.email || 'No Email'}</p>
//                       {!user.emailVerified && <span className="verification-badge">Unverified</span>}
//                     </div>
//                   </div>
                  
//                   <div className="user-card-details">
//                     <div className="detail-item">
//                       <span className="detail-label">Phone:</span>
//                       <span className="detail-value">{user.phone || 'Not provided'}</span>
//                     </div>
                    
//                     <div className="detail-item">
//                       <span className="detail-label">Location:</span>
//                       <span className="detail-value">{user.deliveryAddress || 'Not provided'}</span>
//                     </div>
                    
//                     <div className="detail-item">
//                       <span className="detail-label">Joined:</span>
//                       <span className="detail-value">{formatDate(user.createdAt)}</span>
//                     </div>
                    
//                     <div className="detail-item">
//                       <span className="detail-label">Last Active:</span>
//                       <span className="detail-value">{formatDate(user.lastLogin)}</span>
//                     </div>
//                   </div>
                  
//                   <div className="user-card-footer">
//                     <div className="user-points">
//                       <span className="points-value">{user.points || 0}</span>
//                       <span className="points-label">Points</span>
//                     </div>
                    
//                     <button 
//                       className="view-details-btn"
//                       onClick={() => viewUserDetails(user.id)}
//                     >
//                       View Details
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
          
//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="pagination">
//               <button 
//                 onClick={() => paginate(currentPage - 1)} 
//                 disabled={currentPage === 1}
//                 className="pagination-btn"
//               >
//                 &laquo; Prev
//               </button>
              
//               <div className="page-numbers">
//                 {Array.from({ length: totalPages }).map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => paginate(index + 1)}
//                     className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}
//               </div>
              
//               <button 
//                 onClick={() => paginate(currentPage + 1)} 
//                 disabled={currentPage === totalPages}
//                 className="pagination-btn"
//               >
//                 Next &raquo;
//               </button>
//             </div>
//           )}
//         </>
//       )}
      
//       {/* User Details Modal */}
//       {showUserDetails && selectedUser && (
//         <div className="user-details-modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h2>User Details</h2>
//               <button 
//                 className="close-btn"
//                 onClick={() => {
//                   setShowUserDetails(false);
//                   setSelectedUser(null);
//                   setUserOrders([]);
//                 }}
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="user-profile-section">
//                 <div className="profile-header">
//                   <div className="profile-avatar" style={{ backgroundColor: getUserAvatarColor(selectedUser.id) }}>
//                     {getUserInitials(selectedUser.name)}
//                   </div>
//                   <div className="profile-info">
//                     <h3>{selectedUser.name || 'Unnamed User'}</h3>
//                     <p className="profile-email">{selectedUser.email || 'No Email'}</p>
//                     {selectedUser.emailVerified ? (
//                       <span className="verification-badge verified">Verified</span>
//                     ) : (
//                       <span className="verification-badge">Unverified</span>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="profile-details">
//                   <div className="details-grid">
//                     <div className="detail-card">
//                       <span className="detail-card-label">User ID</span>
//                       <span className="detail-card-value">{selectedUser.id}</span>
//                     </div>
                    
//                     <div className="detail-card">
//                       <span className="detail-card-label">Phone</span>
//                       <span className="detail-card-value">{selectedUser.phone || 'Not provided'}</span>
//                     </div>
                    
//                     <div className="detail-card">
//                       <span className="detail-card-label">Location</span>
//                       <span className="detail-card-value">{selectedUser.deliveryAddress || 'Not provided'}</span>
//                     </div>
                    
//                     <div className="detail-card">
//                       <span className="detail-card-label">Points</span>
//                       <span className="detail-card-value points">{selectedUser.points || 0}</span>
//                     </div>
                    
//                     <div className="detail-card">
//                       <span className="detail-card-label">Joined</span>
//                       <span className="detail-card-value">{formatDate(selectedUser.createdAt)}</span>
//                     </div>
                    
//                     <div className="detail-card">
//                       <span className="detail-card-label">Last Login</span>
//                       <span className="detail-card-value">{formatDate(selectedUser.lastLogin)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="order-history-section">
//                 <h3>Order History</h3>
                
//                 {orderLoading ? (
//                   <div className="orders-loading">
//                     <div className="spinner"></div>
//                     <p>Loading orders...</p>
//                   </div>
//                 ) : userOrders.length === 0 ? (
//                   <div className="no-orders-message">
//                     <p>This user has not placed any orders yet.</p>
//                   </div>
//                 ) : (
//                   <div className="orders-list">
//                     {userOrders.map(order => (
//                       <div className="order-card" key={order.id}>
//                         <div className="order-header">
//                           <div className="order-id">Order #{order.id.substring(0, 6)}</div>
//                           <div className={`order-status ${getStatusClass(order.status)}`}>
//                             {order.status}
//                           </div>
//                         </div>
                        
//                         <div className="order-details">
//                           <div className="order-detail-item">
//                             <span className="order-detail-label">Date:</span>
//                             <span className="order-detail-value">{formatDate(order.orderDate)}</span>
//                           </div>
                          
//                           <div className="order-detail-item">
//                             <span className="order-detail-label">Items:</span>
//                             <span className="order-detail-value">{order.items.length}</span>
//                           </div>
                          
//                           <div className="order-detail-item">
//                             <span className="order-detail-label">Total:</span>
//                             <span className="order-detail-value amount">₹{formatAmount(order.totalAmount)}</span>
//                           </div>
                          
//                           <div className="order-detail-item">
//                             <span className="order-detail-label">Delivery:</span>
//                             <span className="order-detail-value">
//                               {order.deliverySpeed === 'quick' ? '⚡ Quick' : 
//                                order.deliverySpeed === 'normal' ? '🚚 Standard' : 
//                                order.deliverySpeed === 'late' ? '🐌 Eco' : 
//                                '📦 Standard'}
//                             </span>
//                           </div>
//                         </div>
                        
//                         {order.items.length > 0 && (
//                           <div className="order-items">
//                             <h4>Items</h4>
//                             <div className="items-list">
//                               {order.items.map((item, index) => (
//                                 <div className="item" key={index}>
//                                   <span className="item-name">{item.name}</span>
//                                   <div className="item-details">
//                                     <span className="item-quantity">x{item.quantity || 1}</span>
//                                     <span className="item-price">₹{formatAmount(item.price || 0)}</span>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Error Modal */}
//       {showErrorModal && (
//         <div className="error-modal">
//           <div className="error-modal-content">
//             <div className="error-modal-header">
//               <h3>localhost:3000 says</h3>
//             </div>
//             <div className="error-modal-body">
//               <p>{errorMessage || "Failed to load user details. Please try again."}</p>
//             </div>
//             <div className="error-modal-footer">
//               <button className="ok-btn" onClick={() => setShowErrorModal(false)}>
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddUser;



import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './AddUser.css';

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching all users...");
        setLoading(true);
        setError(null);
        
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        
        console.log(`Found ${userSnapshot.size} users`);
        
        if (userSnapshot.empty) {
          setUsers([]);
          setFilteredUsers([]);
          setLoading(false);
          return;
        }
        
        // Process all users data
        const usersData = userSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? formatFirebaseTimestamp(data.createdAt) : new Date(),
            lastLogin: data.lastLogin ? formatFirebaseTimestamp(data.lastLogin) : new Date(),
            updatedAt: data.updatedAt ? formatFirebaseTimestamp(data.updatedAt) : new Date(),
          };
        });
        
        // Sort users by creation date (newest first)
        usersData.sort((a, b) => b.createdAt - a.createdAt);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(`Failed to load users: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper function to format Firebase timestamp
  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    
    try {
      // Handle Firestore timestamp objects
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      
      // Handle ISO strings or timestamp numbers
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Fallback
      return new Date();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return new Date();
    }
  };

  // Apply filters when filter criteria change
  useEffect(() => {
    if (users.length > 0) {
      applyFilters();
    }
  }, [searchTerm, verificationFilter, users]);

  // Apply filters to users
  const applyFilters = () => {
    console.log("Applying filters:", { searchTerm, verificationFilter });
    
    let filtered = [...users];
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.phone && user.phone.includes(term)) ||
        (user.deliveryAddress && user.deliveryAddress.toLowerCase().includes(term)) ||
        (user.id && user.id.toLowerCase().includes(term))
      );
    }
    
    // Verification status filter
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter(user => user.emailVerified === isVerified);
    }
    
    console.log("Filtered users:", filtered.length);
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Generate random color for user avatar based on user ID
  const getUserAvatarColor = (userId) => {
    // List of colors to choose from (matches the image design)
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#a855f7', // Purple
      '#d946ef', // Fuchsia
      '#ec4899', // Pink
    ];
    
    // Use user ID to deterministically select a color
    const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  // Improved approach to fetch orders for a user
  const fetchOrdersForUser = async (userId) => {
    try {
      console.log(`Fetching orders for user ID: ${userId}`);
      
      // Get all orders from the orders collection
      const ordersRef = collection(db, 'orders');
      const orderSnapshot = await getDocs(ordersRef);
      
      if (orderSnapshot.empty) {
        console.log("No orders found in the database");
        return { orders: [], error: null };
      }
      
      // Filter orders to find those belonging to this user
      const userOrders = [];
      
      orderSnapshot.docs.forEach(doc => {
        const orderData = doc.data();
        
        // Check if this order belongs to the user
        // using userId, customerId, or if an item in the order contains the userId
        const belongsToUser = 
          (orderData.userId && orderData.userId === userId) || 
          (orderData.customerId && orderData.customerId === userId);
        
        if (belongsToUser) {
          // Convert timestamps
          const processedOrder = {
            id: doc.id,
            ...orderData,
            orderDate: orderData.orderDate instanceof Timestamp 
              ? orderData.orderDate.toDate() 
              : orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
            createdAt: orderData.createdAt instanceof Timestamp 
              ? orderData.createdAt.toDate() 
              : orderData.createdAt ? new Date(orderData.createdAt) : new Date()
          };
          
          userOrders.push(processedOrder);
        }
      });
      
      console.log(`Found ${userOrders.length} orders for user`);
      return { orders: userOrders, error: null };
    } catch (error) {
      console.error("Error in fetchOrdersForUser:", error);
      return { orders: [], error: { message: error.message } };
    }
  };

  // View user details and fetch their orders
  const viewUserDetails = async (userId) => {
    try {
      setOrderLoading(true);
      setErrorMessage(null);
      
      // Get the user
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      
      setSelectedUser(user);
      setShowUserDetails(true);
      
      console.log(`Fetching orders for user ID: ${userId}`);
      
      // Fetch orders using our improved function
      const { orders: ordersData, error: orderError } = await fetchOrdersForUser(userId);
      
      if (orderError) {
        setErrorMessage(`Failed to load user details: ${orderError.message}`);
        setShowErrorModal(true);
        // Still proceed with showing the user details, just with empty orders
        setUserOrders([]);
        setOrderLoading(false);
        return;
      }
      
      // Sort orders by date (newest first)
      ordersData.sort((a, b) => {
        const dateA = a.createdAt || a.orderDate || new Date();
        const dateB = b.createdAt || b.orderDate || new Date();
        return dateB - dateA;
      });
      
      console.log(`Processed ${ordersData.length} orders for display`);
      
      // Normalize order data
      const normalizedOrders = ordersData.map(order => ({
        id: order.id,
        customerId: order.userId || order.customerId || userId,
        customerName: order.customerName || user.name || 'Unknown',
        customerEmail: order.customerEmail || user.email || 'Unknown',
        orderDate: order.orderDate || order.createdAt || new Date(),
        createdAt: order.createdAt || order.orderDate || new Date(),
        status: order.status || 'Pending',
        items: Array.isArray(order.items) ? order.items : [],
        totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : 0,
        deliverySpeed: order.deliverySpeed || 'normal',
        deliveryAddress: order.deliveryAddress || user.deliveryAddress || 'Not specified',
        paymentMethod: order.paymentMethod || 'Not specified',
        statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : []
      }));
      
      setUserOrders(normalizedOrders);
      setOrderLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setOrderLoading(false);
      setErrorMessage(`Failed to load user details: ${error.message}`);
      setShowErrorModal(true);
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

  // Get overall order status (most advanced status across all delivery speeds)
  const getOverallOrderStatus = (order) => {
    const statusPriority = {
      'delivered': 5,
      'out for delivery': 4,
      'shipped': 3,
      'processing': 2,
      'pending': 1,
      'cancelled': 0
    };

    let highestStatus = 'pending';
    let highestPriority = 0;

    // Check main status
    const mainStatus = (order.status || 'pending').toLowerCase();
    if (statusPriority[mainStatus] > highestPriority) {
      highestStatus = mainStatus;
      highestPriority = statusPriority[mainStatus];
    }

    // Check status history for all delivery speeds
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.forEach(update => {
        const status = (update.status || 'pending').toLowerCase();
        if (statusPriority[status] > highestPriority) {
          highestStatus = status;
          highestPriority = statusPriority[status];
        }
      });
    }

    return highestStatus;
  };

  // Group order items by delivery speed
  const getOrdersByDeliverySpeed = (order) => {
    const grouped = {
      quick: [],
      normal: [],
      late: []
    };

    if (order.items && order.items.length > 0) {
      const speedsInOrder = new Set();
      order.items.forEach(item => {
        const speed = item.deliverySpeed || 'normal';
        speedsInOrder.add(speed);
      });

      speedsInOrder.forEach(speed => {
        if (['quick', 'normal', 'late'].includes(speed)) {
          const speedItems = order.items.filter(item =>
            (item.deliverySpeed || 'normal') === speed
          );

          const speedStatus = getLatestStatusForDeliverySpeed(order, speed);
          const subtotal = speedItems.reduce((total, item) =>
            total + ((item.price || 0) * (item.quantity || 1)), 0);

          const orderEntry = {
            ...order,
            items: speedItems,
            deliverySpeed: speed,
            status: speedStatus,
            subtotal: subtotal
          };

          grouped[speed].push(orderEntry);
        }
      });
    }

    return grouped;
  };

  // Get delivery speed counts from order
  const getDeliverySpeedCounts = (order) => {
    const counts = { quick: 0, normal: 0, late: 0 };
    
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const speed = item.deliverySpeed || 'normal';
        if (counts.hasOwnProperty(speed)) {
          counts[speed]++;
        }
      });
    }
    
    return counts;
  };

  // Get order total amount
  const getOrderTotal = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return total + (price * quantity);
      }, 0);
    }
    return order.totalAmount || 0;
  };

  // Format date for display
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

  // Get order status class
  const getStatusClass = (status) => {
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

  // Get speed subtotal
  const getSpeedSubtotal = (order) => {
    if (typeof order.subtotal === 'number') {
      return formatAmount(order.subtotal);
    }
    
    if (order.items && order.items.length > 0) {
      const subtotal = order.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (price * quantity);
      }, 0);
      return formatAmount(subtotal);
    }
    
    return '0.00';
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setVerificationFilter('all');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, Email, Phone..."
          />
        </div>
        
        
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      <div className="users-summary">
        <div className="summary-card total">
          <div className="summary-icon">👥</div>
          <div className="summary-details">
            <h3>Total Users</h3>
            <p className="summary-count">{filteredUsers.length}</p>
          </div>
        </div>
       
        <div className="summary-card verified">
          <div className="summary-icon">✅</div>
          <div className="summary-details">
            <h3>Users</h3>
            <p className="summary-count">
              {filteredUsers.filter(user => !user.emailVerified).length}
            </p>
          </div>
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <p>No users found matching the current filters.</p>
          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      ) : (
        <>
          <div className="user-cards-container">
            {currentUsers.map(user => {
              const avatarColor = getUserAvatarColor(user.id);
              return (
                <div className="user-card" key={user.id}>
                  <div className="user-card-header">
                    <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
                      {getUserInitials(user.name)}
                    </div>
                    <div className="user-header-info">
                      <h3 className="user-name">{user.name || 'Unnamed User'}</h3>
                      <p className="user-email">{user.email || 'No Email'}</p>
                    
                    </div>
                  </div>
                  
                  <div className="user-card-details">
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{user.phone || 'Not provided'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{user.deliveryAddress || 'Not provided'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">{formatDate(user.createdAt)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Last Active:</span>
                      <span className="detail-value">{formatDate(user.lastLogin)}</span>
                    </div>
                  </div>
                  
                  <div className="user-card-footer">
                    <div className="user-points">
                      <span className="points-value">{user.points || 0}</span>
                      <span className="points-label">Points</span>
                    </div>
                    
                    <button 
                      className="view-details-btn"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                &laquo; Prev
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="user-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                  setUserOrders([]);
                  setExpandedOrders(new Set());
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-profile-section">
                <div className="profile-header">
                  <div className="profile-avatar" style={{ backgroundColor: getUserAvatarColor(selectedUser.id) }}>
                    {getUserInitials(selectedUser.name)}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedUser.name || 'Unnamed User'}</h3>
                    <p className="profile-email">{selectedUser.email || 'No Email'}</p>
                    
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="details-grid">
                    <div className="detail-card">
                      <span className="detail-card-label">User ID</span>
                      <span className="detail-card-value">{selectedUser.id}</span>
                    </div>
                    
                    <div className="detail-card">
                      <span className="detail-card-label">Phone</span>
                      <span className="detail-card-value">{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    
                    <div className="detail-card">
                      <span className="detail-card-label">Location</span>
                      <span className="detail-card-value">{selectedUser.deliveryAddress || 'Not provided'}</span>
                    </div>
                    
                    <div className="detail-card">
                      <span className="detail-card-label">Points</span>
                      <span className="detail-card-value points">{selectedUser.points || 0}</span>
                    </div>
                    
                    <div className="detail-card">
                      <span className="detail-card-label">Joined</span>
                      <span className="detail-card-value">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    
                    <div className="detail-card">
                      <span className="detail-card-label">Last Login</span>
                      <span className="detail-card-value">{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-history-section">
                <h3>Order History</h3>
                
                {orderLoading ? (
                  <div className="orders-loading">
                    <div className="spinner"></div>
                    <p>Loading orders...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="no-orders-message">
                    <p>This user has not placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {userOrders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id);
                      const overallStatus = getOverallOrderStatus(order);
                      const orderTotal = getOrderTotal(order);
                      const speedCounts = getDeliverySpeedCounts(order);
                      const groupedOrders = getOrdersByDeliverySpeed(order);

                      return (
                        <div key={order.id} className="order-card-wrapper">
                          {/* Main Order Card */}
                          <div className="order-card main-order-card">
                            <div className="order-header">
                              <div className="order-id">
                                <span className="label">Order ID:</span>
                                <span className="value">{order.orderId || order.displayOrderId || order.id.substring(0, 8).toUpperCase()}</span>
                              </div>
                              <div className={`order-status ${getStatusClass(overallStatus)}`}>
                                {overallStatus || 'Pending'}
                              </div>
                            </div>

                            <div className="order-summary">
                              <div className="order-info">
                                <div className="order-details">
                                  <div className="order-date">
                                    <span className="label">Ordered on:</span>
                                    <span className="value">{formatDate(order.createdAt || order.orderDate)}</span>
                                  </div>
                                  <div className="order-total">
                                    <span className="label">Total Amount:</span>
                                    <span className="value">₹{formatAmount(orderTotal)}</span>
                                  </div>
                                  <div className="items-count">
                                    <span className="label">Items:</span>
                                    <span className="value">{order.items?.length || 0}</span>
                                  </div>
                                </div>
                                
                                <div className="delivery-speed-summary">
                                  <div className="speed-counts">
                                    {speedCounts.quick > 0 && (
                                      <div className="speed-count quick">
                                        <span className="speed-icon">⚡</span>
                                        <span>Quick: {speedCounts.quick}</span>
                                      </div>
                                    )}
                                    {speedCounts.normal > 0 && (
                                      <div className="speed-count normal">
                                        <span className="speed-icon">🚚</span>
                                        <span>Standard: {speedCounts.normal}</span>
                                      </div>
                                    )}
                                    {speedCounts.late > 0 && (
                                      <div className="speed-count late">
                                        <span className="speed-icon">🐌</span>
                                        <span>Eco: {speedCounts.late}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="order-actions">
                              <button
                                className="view-orders-btn"
                                onClick={() => toggleOrderExpansion(order.id)}
                              >
                                {isExpanded ? 'Hide Orders' : 'View Orders'}
                                <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Expanded Order Details */}
                          {isExpanded && (
                            <div className="expanded-orders">
                              {/* Quick Delivery Orders */}
                              {groupedOrders.quick.length > 0 && (
                                <div className="delivery-speed-section">
                                  <div className="delivery-speed-header quick-header">
                                    <span className="delivery-icon">⚡</span>
                                    Quick Delivery ({groupedOrders.quick.length} {groupedOrders.quick.length === 1 ? 'item' : 'items'})
                                  </div>
                                  <div className="speed-orders">
                                    {groupedOrders.quick.map((speedOrder, index) => (
                                      <div key={`quick-${index}`} className="speed-order-card">
                                        <div className="speed-order-header">
                                          <div className={`speed-order-status ${getStatusClass(speedOrder.status)}`}>
                                            {speedOrder.status || 'Pending'}
                                          </div>
                                        </div>
                                        
                                        <div className="order-items">
                                          {speedOrder.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="order-item">
                                              <div className="item-image">
                                                {(item.imageUrl || item.image) ? (
                                                  <img 
                                                    src={item.imageUrl || item.image} 
                                                    alt={item.name}
                                                    onError={(e) => {
                                                      e.target.onerror = null;
                                                      e.target.src = "/images/product-placeholder.jpg";
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="no-image">No Image</div>
                                                )}
                                              </div>
                                              <div className="item-details">
                                                <h3 className="item-name">{item.name}</h3>
                                                <div className="item-meta">
                                                  <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                                  <span className="item-price">₹{item.price}</span>
                                                </div>
                                                {item.discountPercentage > 0 && (
                                                  <div className="item-discount">
                                                    {item.discountPercentage}% off
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="speed-order-total">
                                          <span className="total-label">Subtotal:</span>
                                          <span className="total-value">₹{getSpeedSubtotal(speedOrder)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Normal Delivery Orders */}
                              {groupedOrders.normal.length > 0 && (
                                <div className="delivery-speed-section">
                                  <div className="delivery-speed-header normal-header">
                                    <span className="delivery-icon">🚚</span>
                                    Standard Delivery ({groupedOrders.normal.length} {groupedOrders.normal.length === 1 ? 'item' : 'items'})
                                  </div>
                                  <div className="speed-orders">
                                    {groupedOrders.normal.map((speedOrder, index) => (
                                      <div key={`normal-${index}`} className="speed-order-card">
                                        <div className="speed-order-header">
                                          <div className={`speed-order-status ${getStatusClass(speedOrder.status)}`}>
                                            {speedOrder.status || 'Pending'}
                                          </div>
                                        </div>
                                        
                                        <div className="order-items">
                                          {speedOrder.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="order-item">
                                              <div className="item-image">
                                                {(item.imageUrl || item.image) ? (
                                                  <img 
                                                    src={item.imageUrl || item.image} 
                                                    alt={item.name}
                                                    onError={(e) => {
                                                      e.target.onerror = null;
                                                      e.target.src = "/images/product-placeholder.jpg";
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="no-image">No Image</div>
                                                )}
                                              </div>
                                              <div className="item-details">
                                                <h3 className="item-name">{item.name}</h3>
                                                <div className="item-meta">
                                                  <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                                  <span className="item-price">₹{item.price}</span>
                                                </div>
                                                {item.discountPercentage > 0 && (
                                                  <div className="item-discount">
                                                    {item.discountPercentage}% off
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="speed-order-total">
                                          <span className="total-label">Subtotal:</span>
                                          <span className="total-value">₹{getSpeedSubtotal(speedOrder)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Late Delivery Orders */}
                              {groupedOrders.late.length > 0 && (
                                <div className="delivery-speed-section">
                                  <div className="delivery-speed-header late-header">
                                    <span className="delivery-icon">🐌</span>
                                    Eco Delivery ({groupedOrders.late.length} {groupedOrders.late.length === 1 ? 'item' : 'items'})
                                  </div>
                                  <div className="speed-orders">
                                    {groupedOrders.late.map((speedOrder, index) => (
                                      <div key={`late-${index}`} className="speed-order-card">
                                        <div className="speed-order-header">
                                          <div className={`speed-order-status ${getStatusClass(speedOrder.status)}`}>
                                            {speedOrder.status || 'Pending'}
                                          </div>
                                        </div>
                                        
                                        <div className="order-items">
                                          {speedOrder.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="order-item">
                                              <div className="item-image">
                                                {(item.imageUrl || item.image) ? (
                                                  <img 
                                                    src={item.imageUrl || item.image} 
                                                    alt={item.name}
                                                    onError={(e) => {
                                                      e.target.onerror = null;
                                                      e.target.src = "/images/product-placeholder.jpg";
                                                    }}
                                                  />
                                                ) : (
                                                  <div className="no-image">No Image</div>
                                                )}
                                              </div>
                                              <div className="item-details">
                                                <h3 className="item-name">{item.name}</h3>
                                                <div className="item-meta">
                                                  <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                                  <span className="item-price">₹{item.price}</span>
                                                </div>
                                                {item.discountPercentage > 0 && (
                                                  <div className="item-discount">
                                                    {item.discountPercentage}% off
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="speed-order-total">
                                          <span className="total-label">Subtotal:</span>
                                          <span className="total-value">₹{getSpeedSubtotal(speedOrder)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal">
          <div className="error-modal-content">
            <div className="error-modal-header">
              <h3>localhost:3000 says</h3>
            </div>
            <div className="error-modal-body">
              <p>{errorMessage}</p>
            </div>
            <div className="error-modal-footer">
              <button className="ok-btn" onClick={() => setShowErrorModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;