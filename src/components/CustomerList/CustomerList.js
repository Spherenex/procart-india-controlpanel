import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  getDocs,
  doc, 
  getDoc,
  where,
  query,
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './CustomerList.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const searchInputRef = useRef(null);

  // Fetch all customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Query users collection
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        
        if (userSnapshot.empty) {
          setCustomers([]);
          setFilteredCustomers([]);
          setLoading(false);
          return;
        }
        
        // Process customer data
        const customersData = userSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate() 
              : data.createdAt ? new Date(data.createdAt) : new Date(),
            lastLoginAt: data.lastLoginAt instanceof Timestamp
              ? data.lastLoginAt.toDate()
              : data.lastLoginAt ? new Date(data.lastLoginAt) : null
          };
        });
        
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(`Failed to load customers: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Apply filters and sorting to customers
  useEffect(() => {
    if (customers.length === 0) return;
    
    let filtered = [...customers];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        (customer.displayName?.toLowerCase()?.includes(term)) || 
        (customer.email?.toLowerCase()?.includes(term)) ||
        (customer.phone?.toLowerCase()?.includes(term)) ||
        (customer.id?.toLowerCase()?.includes(term))
      );
    }
    
    // Apply date range filter if both dates are provided
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(customer => {
        const createdDate = customer.createdAt instanceof Date 
          ? customer.createdAt 
          : new Date(customer.createdAt || Date.now());
          
        return createdDate >= fromDate && createdDate <= toDate;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'name-desc':
          return (b.displayName || '').localeCompare(a.displayName || '');
        case 'email-asc':
          return (a.email || '').localeCompare(b.email || '');
        case 'email-desc':
          return (b.email || '').localeCompare(a.email || '');
        case 'date-asc':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'date-desc':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'orders-asc':
          return (a.totalOrders || 0) - (b.totalOrders || 0);
        case 'orders-desc':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        default:
          return (a.displayName || '').localeCompare(b.displayName || '');
      }
    });
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, dateRange, sortOption]);
  
  // Fetch customer orders when a customer is selected
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      return;
    }
    
    const fetchCustomerOrders = async () => {
      try {
        setOrderLoading(true);
        
        // Query orders collection for this customer
        const ordersRef = collection(db, 'orders');
        const orderQuery = query(
          ordersRef,
          where('userId', '==', selectedCustomer.id),
          orderBy('orderDate', 'desc')
        );
        
        const orderSnapshot = await getDocs(orderQuery);
        
        if (orderSnapshot.empty) {
          setCustomerOrders([]);
          setOrderLoading(false);
          return;
        }
        
        // Process order data
        const ordersData = orderSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Process delivery speeds in items
          const speedsInOrder = new Set();
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
              const speed = item.deliverySpeed || 'normal';
              speedsInOrder.add(speed);
            });
          }
          
          return {
            id: doc.id,
            ...data,
            orderDate: data.orderDate instanceof Timestamp 
              ? data.orderDate.toDate() 
              : data.orderDate ? new Date(data.orderDate) : new Date(),
            deliverySpeeds: Array.from(speedsInOrder)
          };
        });
        
        setCustomerOrders(ordersData);
        setOrderLoading(false);
      } catch (err) {
        console.error("Error fetching customer orders:", err);
        setError(`Failed to load customer orders: ${err.message}`);
        setOrderLoading(false);
      }
    };
    
    fetchCustomerOrders();
  }, [selectedCustomer]);
  
  // Select a customer and fetch their orders
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    setSortOption('name-asc');
    if (searchInputRef.current) searchInputRef.current.focus();
  };
  
  // Format date helper function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };
  
  // Format timestamp helper function with time
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' at ' + d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };
  
  // Get status class helper function
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'out for delivery':
        return 'status-out-for-delivery';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending payment':
        return 'status-pending-payment';
      default:
        return 'status-pending';
    }
  };
  
  // Get delivery speed info
  const getDeliverySpeedInfo = (speed) => {
    switch (speed) {
      case 'quick': return { icon: '⚡', class: 'delivery-quick', name: 'Quick' };
      case 'express': return { icon: '🚀', class: 'delivery-express', name: 'Express' };
      case 'normal': return { icon: '🚚', class: 'delivery-normal', name: 'Standard' };
      case 'late': return { icon: '🐌', class: 'delivery-late', name: 'Eco' };
      default: return { icon: '📦', class: 'delivery-standard', name: 'Standard' };
    }
  };
  
  // Format amount helper function
  const formatAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
    
    return '₹' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  if (loading) {
    return (
      <div className="customers-loading">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="customers-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="customer-list-container">
      <h1>Customer List</h1>
      
      {/* Filters Section */}
      <div className="customers-filters-container">
        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="search-input"
            ref={searchInputRef}
          />
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <div className="date-inputs">
            <input 
              type="date" 
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              placeholder="From"
              className="date-input"
            />
            <input 
              type="date" 
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              placeholder="To"
              className="date-input"
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="email-desc">Email (Z-A)</option>
            <option value="date-asc">Registration (Oldest First)</option>
            <option value="date-desc">Registration (Newest First)</option>
            <option value="orders-asc">Orders (Low to High)</option>
            <option value="orders-desc">Orders (High to Low)</option>
          </select>
        </div>
        
        <button 
          className="reset-filters-btn"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </div>
      
      {/* Main Content Layout */}
      <div className="customer-list-layout">
        {/* Customers List */}
        <div className="customers-list">
          <div className="list-header">
            <h2>Customers</h2>
            <div className="customers-count">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
            </div>
          </div>
          
          {filteredCustomers.length === 0 ? (
            <div className="no-customers">
              <p>No customers found.</p>
              {(searchTerm || dateRange.from || dateRange.to) && (
                <button 
                  className="clear-filters-btn"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Orders</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr 
                      key={customer.id}
                      className={selectedCustomer?.id === customer.id ? 'selected-row' : ''}
                    >
                      <td>{customer.displayName || 'N/A'}</td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{formatDate(customer.createdAt)}</td>
                      <td>{customer.totalOrders || 0}</td>
                      <td>
                        <button 
                          className="view-customer-btn"
                          onClick={() => selectCustomer(customer)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Customer Details */}
        <div className="customer-details">
          {selectedCustomer ? (
            <>
              <div className="customer-profile">
                <h2>Customer Profile</h2>
                <div className="profile-details">
                  <div className="profile-avatar">
                    {selectedCustomer.photoURL ? (
                      <img 
                        src={selectedCustomer.photoURL} 
                        alt={selectedCustomer.displayName || 'Customer'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/avatar-placeholder.jpg";
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedCustomer.displayName 
                          ? selectedCustomer.displayName.charAt(0).toUpperCase() 
                          : '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="profile-info">
                    <h3>{selectedCustomer.displayName || 'No Name'}</h3>
                    
                    <div className="info-grid">
                      <div className="info-group">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedCustomer.email || 'N/A'}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedCustomer.phone || 'N/A'}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Customer ID:</span>
                        <span className="info-value">{selectedCustomer.id}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Registered:</span>
                        <span className="info-value">{formatDateTime(selectedCustomer.createdAt)}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Last Login:</span>
                        <span className="info-value">
                          {selectedCustomer.lastLoginAt ? formatDateTime(selectedCustomer.lastLoginAt) : 'Never'}
                        </span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Total Orders:</span>
                        <span className="info-value">{selectedCustomer.totalOrders || 0}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Total Spent:</span>
                        <span className="info-value">{formatAmount(selectedCustomer.totalSpent || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                  <div className="customer-addresses">
                    <h3>Saved Addresses</h3>
                    <div className="addresses-list">
                      {selectedCustomer.addresses.map((address, index) => (
                        <div key={index} className="address-card">
                          <div className="address-type">
                            {address.isDefault && <span className="default-badge">Default</span>}
                            {address.type || 'Address'}
                          </div>
                          <div className="address-content">
                            <div>{address.name}</div>
                            <div>{address.line1}</div>
                            {address.line2 && <div>{address.line2}</div>}
                            <div>{address.city}, {address.state} {address.pincode}</div>
                            {address.phone && <div>Phone: {address.phone}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="customer-orders">
                <h3>Order History</h3>
                
                {orderLoading ? (
                  <div className="orders-loading">
                    <div className="spinner-sm"></div>
                    <p>Loading orders...</p>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="no-orders">
                    <p>No orders found for this customer.</p>
                  </div>
                ) : (
                  <div className="orders-table-container">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Amount</th>
                          <th>Delivery</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map(order => (
                          <tr key={order.id}>
                            <td>{order.orderDisplayId || order.id.substring(0, 8)}</td>
                            <td>{formatDateTime(order.orderDate)}</td>
                            <td>{order.items?.length || 0}</td>
                            <td>{formatAmount(order.totalAmount || 0)}</td>
                            <td>
                              <div className="delivery-speeds">
                                {order.deliverySpeeds && order.deliverySpeeds.map((speed, index) => (
                                  <span 
                                    key={index}
                                    className={`delivery-badge ${getDeliverySpeedInfo(speed).class}`}
                                    title={getDeliverySpeedInfo(speed).name}
                                  >
                                    {getDeliverySpeedInfo(speed).icon}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusClass(order.status)}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Add more customer sections here (support tickets, wishlist, etc.) */}
            </>
          ) : (
            <div className="no-customer-selected">
              <div className="no-selection-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3>Select a customer</h3>
              <p>Select a customer from the list to view their profile and order history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;