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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Ordersmanagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Define order status options
  const statusOptions = [
    'all',
    'Pending Payment',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Base query - orders collection, ordered by orderDate (descending)
        let ordersQuery = query(
          collection(db, 'orders'),
          orderBy('orderDate', 'desc')
        );

        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          ordersQuery = query(
            collection(db, 'orders'),
            where('status', '==', statusFilter),
            orderBy('orderDate', 'desc')
          );
        }

        // Execute the query
        const querySnapshot = await getDocs(ordersQuery);
        
        // Process the results
        let ordersData = [];
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          
          // Add the document ID to the order data
          ordersData.push({
            id: doc.id,
            ...orderData,
            // Convert Firestore timestamp to JS Date if needed
            orderDate: orderData.orderDate instanceof Timestamp 
              ? orderData.orderDate.toDate() 
              : new Date(orderData.orderDate)
          });
        });

        // Apply date range filter if provided
        if (dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999); // Set to end of day
          
          ordersData = ordersData.filter(order => {
            const orderDate = order.orderDate instanceof Date 
              ? order.orderDate 
              : new Date(order.orderDate);
            
            return orderDate >= fromDate && orderDate <= toDate;
          });
        }

        // Apply search filter if provided
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          ordersData = ordersData.filter(order => 
            order.id.toLowerCase().includes(term) || 
            (order.userId && order.userId.toLowerCase().includes(term)) ||
            (order.customerName && order.customerName.toLowerCase().includes(term)) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(term))
          );
        }

        console.log("Fetched orders:", ordersData);
        setOrders(ordersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, dateRange, searchTerm]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Update the status
      await updateDoc(orderRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() } 
            : order
        )
      );

      // If this is the selected order, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, lastUpdated: new Date().toISOString() }));
      }
      
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        setSelectedOrder({
          id: orderSnap.id,
          ...orderData,
          orderDate: orderData.orderDate instanceof Timestamp 
            ? orderData.orderDate.toDate() 
            : new Date(orderData.orderDate)
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

  // Format date for display
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

  // Get appropriate status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending Payment':
        return 'status-pending';
      case 'Processing':
        return 'status-processing';
      case 'Shipped':
        return 'status-shipped';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="orders-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <h1>Orders Management</h1>
      
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(status => (
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
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            placeholder="From"
          />
          <input 
            type="date" 
            value={dateRange.to} 
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
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
      
      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching the current filters.</p>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{order.customerName || order.userId.substring(0, 8)}</td>
                  <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</td>
                  {/* <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td> */}
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-btn"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        View
                      </button>
                      {/* <select
                        className="status-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateOrderStatus(order.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Update Status</option>
                        {statusOptions
                          .filter(status => status !== 'all' && status !== order.status)
                          .map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))
                        }
                      </select> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedOrder(null);
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info">
                <div className="info-group">
                  <span className="label">Order ID:</span>
                  <span className="value">{selectedOrder.id}</span>
                </div>
                <div className="info-group">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(selectedOrder.orderDate)}</span>
                </div>
                <div className="info-group">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-group">
                  <span className="label">Payment Method:</span>
                  <span className="value">
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div className="info-group">
                    <span className="label">Payment ID:</span>
                    <span className="value">{selectedOrder.paymentId}</span>
                  </div>
                )}
                <div className="info-group">
                  <span className="label">Customer ID:</span>
                  <span className="value">{selectedOrder.userId}</span>
                </div>
                {selectedOrder.customerName && (
                  <div className="info-group">
                    <span className="label">Customer Name:</span>
                    <span className="value">{selectedOrder.customerName}</span>
                  </div>
                )}
                <div className="info-group">
                  <span className="label">Delivery Address:</span>
                  <span className="value">{selectedOrder.deliveryAddress}</span>
                </div>
              </div>
              
              <div className="order-items">
                <h3>Order Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Delivery</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>₹{item.price.toLocaleString('en-IN')}</td>
                        <td>{item.quantity || 1}</td>
                        <td>
                          <span className={`delivery-badge ${item.deliverySpeed}`}>
                            {item.deliverySpeed.charAt(0).toUpperCase() + item.deliverySpeed.slice(1)}
                          </span>
                        </td>
                        <td>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="total-label">Total Amount:</td>
                      <td className="total-value">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="order-actions">
                {/* <h3>Update Status</h3> */}
                {/* <div className="status-update-form">
                  <select
                    className="status-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Select New Status</option>
                    {statusOptions
                      .filter(status => status !== 'all' && status !== selectedOrder.status)
                      .map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))
                    }
                  </select>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;