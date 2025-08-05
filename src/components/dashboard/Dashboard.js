





// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   query, 
//   getDocs, 
//   onSnapshot,
//   where,
//   orderBy,
//   limit
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import { useNavigate } from 'react-router-dom';
// import './Dashboard.css';

// function Dashboard({ setMode }) {
//   const navigate = useNavigate();

//   // State for dashboard metrics
//   const [metrics, setMetrics] = useState({
//     users: 0,
//     orders: 0,
//     products: 0,
//     revenue: 0,
//     hackathons: 0,
//     featuredProducts: 0
//   });

//   // Loading states
//   const [loading, setLoading] = useState({
//     users: true,
//     orders: true,
//     products: true,
//     revenue: true,
//     hackathons: true,
//     featuredProducts: true
//   });

//   // Fetch users count
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const usersQuery = query(collection(db, 'users'));
//         const userSnapshot = await getDocs(usersQuery);
//         setMetrics(prev => ({ ...prev, users: userSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, users: false }));
//       }
//     };

//     fetchUsers();

//     // Set up real-time listener for users collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'users'),
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, users: snapshot.size }));
//         setLoading(prev => ({ ...prev, users: false }));
//       },
//       (error) => {
//         console.error('Error in users listener:', error);
//         setLoading(prev => ({ ...prev, users: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch orders count and calculate revenue
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const ordersQuery = query(collection(db, 'orders'));
//         const orderSnapshot = await getDocs(ordersQuery);

//         // Set orders count
//         setMetrics(prev => ({ ...prev, orders: orderSnapshot.size }));

//         // Calculate total revenue
//         let totalRevenue = 0;
//         orderSnapshot.forEach(doc => {
//           const orderData = doc.data();
//           if (orderData.totalAmount) {
//             totalRevenue += orderData.totalAmount;
//           }
//         });

//         setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       }
//     };

//     fetchOrders();

//     // Set up real-time listener for orders collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'orders'),
//       (snapshot) => {
//         // Update orders count
//         setMetrics(prev => ({ ...prev, orders: snapshot.size }));

//         // Recalculate total revenue
//         let totalRevenue = 0;
//         snapshot.forEach(doc => {
//           const orderData = doc.data();
//           if (orderData.totalAmount) {
//             totalRevenue += orderData.totalAmount;
//           }
//         });

//         setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       },
//       (error) => {
//         console.error('Error in orders listener:', error);
//         setLoading(prev => ({ ...prev, orders: false, revenue: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch products count
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         // Count from categoryItems collection (or products if you have one)
//         const productsQuery = query(collection(db, 'categoryItems'));
//         const productSnapshot = await getDocs(productsQuery);
//         setMetrics(prev => ({ ...prev, products: productSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, products: false }));
//       }
//     };

//     fetchProducts();

//     // Set up real-time listener for products collection
//     const unsubscribe = onSnapshot(
//       collection(db, 'categoryItems'), // Use your actual products collection
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, products: snapshot.size }));
//         setLoading(prev => ({ ...prev, products: false }));
//       },
//       (error) => {
//         console.error('Error in products listener:', error);
//         setLoading(prev => ({ ...prev, products: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch hackathons count
//   useEffect(() => {
//     const fetchHackathons = async () => {
//       try {
//         const hackathonsQuery = query(collection(db, 'liveHackathons'));
//         const hackathonsSnapshot = await getDocs(hackathonsQuery);
//         setMetrics(prev => ({ ...prev, hackathons: hackathonsSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching hackathons:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, hackathons: false }));
//       }
//     };

//     fetchHackathons();

//     // Set up real-time listener
//     const unsubscribe = onSnapshot(
//       collection(db, 'liveHackathons'),
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, hackathons: snapshot.size }));
//         setLoading(prev => ({ ...prev, hackathons: false }));
//       },
//       (error) => {
//         console.error('Error in hackathons listener:', error);
//         setLoading(prev => ({ ...prev, hackathons: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch featured products count
//   useEffect(() => {
//     const fetchFeaturedProducts = async () => {
//       try {
//         const featuredQuery = query(
//           collection(db, 'featuredProducts')
//         );
//         const featuredSnapshot = await getDocs(featuredQuery);
//         setMetrics(prev => ({ ...prev, featuredProducts: featuredSnapshot.size }));
//       } catch (error) {
//         console.error('Error fetching featured products:', error);
//       } finally {
//         setLoading(prev => ({ ...prev, featuredProducts: false }));
//       }
//     };

//     fetchFeaturedProducts();

//     // Set up real-time listener
//     const unsubscribe = onSnapshot(
//       collection(db, 'featuredProducts'),
//       (snapshot) => {
//         setMetrics(prev => ({ ...prev, featuredProducts: snapshot.size }));
//         setLoading(prev => ({ ...prev, featuredProducts: false }));
//       },
//       (error) => {
//         console.error('Error in featured products listener:', error);
//         setLoading(prev => ({ ...prev, featuredProducts: false }));
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Format currency (Indian Rupees)
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   // Handle mode changes and navigation
//   const handleModeChange = (newMode, path = null) => {
//     setMode(newMode);
//     if (path) {
//       navigate(path);
//     }
//   };

//   return (
//     <div className="content">
//       <h1 className="page-title">Dashboard</h1>

//       <div className="dashboard-cards">
//         <div className="card stats-card">
//           <div className="stats-icon primary">
//             <i className="fas fa-users"></i>
//           </div>
//           <div className="stats-info">
//             {loading.users ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{metrics.users}</h3>
//             )}
//             <p>Total Users</p>
//           </div>
//         </div>

//         <div className="card stats-card">
//           <div className="stats-icon success">
//             <i className="fas fa-shopping-cart"></i>
//           </div>
//           <div className="stats-info">
//             {loading.orders ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{metrics.orders}</h3>
//             )}
//             <p>Orders</p>
//           </div>
//         </div>

//         <div className="card stats-card">
//           <div className="stats-icon info">
//             <i className="fas fa-rupee-sign"></i>
//           </div>
//           <div className="stats-info">
//             {loading.revenue ? (
//               <div className="loading-spinner-small"></div>
//             ) : (
//               <h3>{formatCurrency(metrics.revenue)}</h3>
//             )}
//             <p>Revenue</p>
//           </div>
//         </div>

//       </div>

//       <div className="management-buttons">
//         <button 
//           className="manage-btn btn-primary" 
//           onClick={() => handleModeChange('items', '/manage-items')}
//         >
//           <i className="fas fa-boxes mr-2"></i> Manage Items
//         </button>
//         <button 
//           className="manage-btn btn-success" 
//           onClick={() => handleModeChange('orders', '/orders')}
//         >
//           <i className="fas fa-shopping-cart mr-2"></i> Manage Orders
//         </button>
//         <button 
//           className="manage-btn btn-warning" 
//           onClick={() => handleModeChange('designHouse', '/model-banner')}
//         >
//           <i className="fas fa-microchip mr-2"></i> Manage Design House
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;





import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ setMode }) {
  const navigate = useNavigate();

  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0,
    hackathons: 0,
    featuredProducts: 0
  });

  // State for bulk orders
  const [bulkOrders, setBulkOrders] = useState([]);
  const [bulkOrdersLoading, setBulkOrdersLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Loading states
  const [loading, setLoading] = useState({
    users: true,
    orders: true,
    products: true,
    revenue: true,
    hackathons: true,
    featuredProducts: true
  });

  // Fetch users count
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const userSnapshot = await getDocs(usersQuery);
        setMetrics(prev => ({ ...prev, users: userSnapshot.size }));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    fetchUsers();

    // Set up real-time listener for users collection
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setMetrics(prev => ({ ...prev, users: snapshot.size }));
        setLoading(prev => ({ ...prev, users: false }));
      },
      (error) => {
        console.error('Error in users listener:', error);
        setLoading(prev => ({ ...prev, users: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch orders count and calculate revenue
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(collection(db, 'orders'));
        const orderSnapshot = await getDocs(ordersQuery);

        // Set orders count
        setMetrics(prev => ({ ...prev, orders: orderSnapshot.size }));

        // Calculate total revenue
        let totalRevenue = 0;
        orderSnapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
        });

        setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      }
    };

    fetchOrders();

    // Set up real-time listener for orders collection
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        // Update orders count
        setMetrics(prev => ({ ...prev, orders: snapshot.size }));

        // Recalculate total revenue
        let totalRevenue = 0;
        snapshot.forEach(doc => {
          const orderData = doc.data();
          if (orderData.totalAmount) {
            totalRevenue += orderData.totalAmount;
          }
        });

        setMetrics(prev => ({ ...prev, revenue: totalRevenue }));
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      },
      (error) => {
        console.error('Error in orders listener:', error);
        setLoading(prev => ({ ...prev, orders: false, revenue: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch products count
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Count from categoryItems collection (or products if you have one)
        const productsQuery = query(collection(db, 'categoryItems'));
        const productSnapshot = await getDocs(productsQuery);
        setMetrics(prev => ({ ...prev, products: productSnapshot.size }));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();

    // Set up real-time listener for products collection
    const unsubscribe = onSnapshot(
      collection(db, 'categoryItems'), // Use your actual products collection
      (snapshot) => {
        setMetrics(prev => ({ ...prev, products: snapshot.size }));
        setLoading(prev => ({ ...prev, products: false }));
      },
      (error) => {
        console.error('Error in products listener:', error);
        setLoading(prev => ({ ...prev, products: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch bulk orders
  useEffect(() => {
    const fetchBulkOrders = async () => {
      try {
        setBulkOrdersLoading(true);
        const bulkOrdersQuery = query(
          collection(db, 'bulkEnquiries'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        // Set up real-time listener for bulk orders
        const unsubscribe = onSnapshot(
          bulkOrdersQuery,
          (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            setBulkOrders(orders);
            setBulkOrdersLoading(false);
          },
          (error) => {
            console.error('Error in bulk orders listener:', error);
            setBulkOrdersLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching bulk orders:', error);
        setBulkOrdersLoading(false);
      }
    };

    fetchBulkOrders();
  }, []);

  // Update bulk order status
  const updateBulkOrderStatus = async (orderId, newStatus) => {
    try {
      setStatusUpdating(orderId);
      const orderRef = doc(db, 'bulkEnquiries', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      // The UI will update automatically through the onSnapshot listener
    } catch (error) {
      console.error('Error updating bulk order status:', error);
    } finally {
      setStatusUpdating(null);
    }
  };

  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'processing':
        return 'status-badge processing';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  // Handle mode changes and navigation
  const handleModeChange = (newMode, path = null) => {
    setMode(newMode);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="content">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard-cards">
        <div className="card stats-card">
          <div className="stats-icon primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="stats-info">
            {loading.users ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{metrics.users}</h3>
            )}
            <p>Total Users</p>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon success">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stats-info">
            {loading.orders ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{metrics.orders}</h3>
            )}
            <p>Orders</p>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon info">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stats-info">
            {loading.revenue ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <h3>{formatCurrency(metrics.revenue)}</h3>
            )}
            <p>Revenue</p>
          </div>
        </div>
      </div>

      <div className="management-buttons">
        <button
          className="manage-btn btn-primary"
          onClick={() => handleModeChange('items', '/manage-items')}
        >
          <i className="fas fa-boxes mr-2"></i> Manage Items
        </button>
        <button
          className="manage-btn btn-success"
          onClick={() => handleModeChange('orders', '/orders')}
        >
          <i className="fas fa-shopping-cart mr-2"></i> Manage Orders
        </button>
        <button
          className="manage-btn btn-warning"
          onClick={() => handleModeChange('designHouse', '/model-banner')}
        >
          <i className="fas fa-microchip mr-2"></i> Manage Design House
        </button>
      </div>

      {/* Bulk Orders Section */}
      <div className="bulk-orders-section">
        <div className="section-header">
          <h2> Bulk Enquiries</h2>
        </div>

        {/* <button
          className="view-all-button"
          onClick={() => handleModeChange('bulkOrders', '/bulk-orders')}
        >
          View All
        </button> */}

        {bulkOrdersLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bulk orders...</p>
          </div>
        ) : bulkOrders.length === 0 ? (
          <div className="no-data">
            <p>No bulk enquiries found</p>
          </div>
        ) : (
          <div className="bulk-enquiries-table-wrapper">
            <table className="bulk-enquiries-table">
              <thead>
                <tr>
                  <th className="product-column">Product</th>
                  <th className="quantity-column">Quantity</th>
                  <th className="status-column">Status</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bulkOrders.map(order => (
                  <tr key={order.id}>
                    <td className="product-column">
                      <div className="product-info">
                        <div className="product-name">{order.productName}</div>
                        <div className="product-id">ID: {order.productId}</div>
                         <div className="product-name">PH: {order.customerPhone}</div>
                        <div className="product-name">Qnt: {order.requestedQuantity}</div>
                      </div>
                    </td>
                    <td className="quantity-column">
                      {order.requestedQuantity || 0}
                    </td>
                    <td className="status-column">
                      <div className={getStatusBadgeClass(order.status || 'pending')}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </div>
                    </td>
                    <td className="actions-column">
                      {statusUpdating === order.id ? (
                        <div className="status-updating">Updating...</div>
                      ) : (
                        <div className="action-buttons">
                          {order.status === 'pending' && (
                            <>
                              <button
                                className="action-btn process-btn"
                                onClick={() => updateBulkOrderStatus(order.id, 'processing')}
                              >
                                Process
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => updateBulkOrderStatus(order.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <>
                              <button
                                className="action-btn complete-btn"
                                onClick={() => updateBulkOrderStatus(order.id, 'completed')}
                              >
                                Complete
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => updateBulkOrderStatus(order.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <button
                              className="action-btn done-btn"
                              disabled
                            >
                              Done
                            </button>
                          )}
                          {order.status === 'cancelled' && (
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleModeChange('bulkOrderDetails', `/bulk-order/${order.id}`)}
                            >
                              View
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;