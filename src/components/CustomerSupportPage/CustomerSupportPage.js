import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './CustomerSupportPage.css';

const CustomerSupportPage = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [indexNeeded, setIndexNeeded] = useState(false);
  const [indexUrl, setIndexUrl] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  
  // Extract index URL from error message
  const extractIndexUrl = (errorMessage) => {
    if (!errorMessage) return null;
    
    // Regular expression to find the Firestore index creation URL
    const urlRegex = /https:\/\/console\.firebase\.google\.com\/[^\s]+/;
    const match = errorMessage.match(urlRegex);
    
    return match ? match[0] : null;
  };

  // Fetch support requests
  useEffect(() => {
    let unsubscribe = () => {};
    
    const fetchSupportRequests = async () => {
      setLoading(true);
      // Don't clear error here to prevent flashing
      
      try {
        let supportQuery;
        
        if (statusFilter === 'all') {
          // Simple query with only orderBy - should work without special index
          supportQuery = query(
            collection(db, 'support'),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Query with both where and orderBy - needs composite index
          supportQuery = query(
            collection(db, 'support'),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc')
          );
        }

        // Try to execute the query
        try {
          unsubscribe = onSnapshot(
            supportQuery,
            (snapshot) => {
              if (snapshot.empty) {
                setSupportRequests([]);
                setLoading(false);
                // Clear error if query succeeds but returns empty results
                if (!useFallback) {
                  setError(null);
                  setIndexNeeded(false);
                }
                return;
              }

              const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));

              setSupportRequests(requests);
              setLoading(false);
              
              // Clear error if query succeeds
              if (!useFallback) {
                setError(null);
                setIndexNeeded(false);
              }
            },
            (err) => {
              console.error("Error in onSnapshot:", err);
              
              // Check if this is an index error
              const isIndexError = err.message && (
                err.message.includes("index") || 
                err.message.includes("Index") || 
                err.message.includes("COLLECTION_GROUP_ASC")
              );
              
              if (isIndexError) {
                // Extract the index creation URL
                const url = extractIndexUrl(err.message);
                if (url) {
                  setIndexNeeded(true);
                  setIndexUrl(url);
                  setUseFallback(true);
                  // Customized error message indicating a fallback will be used
                  setError(`Failed to load support requests. This query requires a composite index. Using client-side filtering as a fallback.`);
                } else {
                  setError(`Failed to load support requests. This query requires a composite index.`);
                }
                
                // Fallback to a simpler query
                fallbackQuery();
              } else {
                setError(`Failed to load support requests: ${err.message}`);
                setLoading(false);
              }
            }
          );
        } catch (err) {
          console.error("Error setting up onSnapshot:", err);
          
          // Check if this is an index error
          if (err.message && (err.message.includes("index") || err.message.includes("Index"))) {
            const url = extractIndexUrl(err.message);
            if (url) {
              setIndexNeeded(true);
              setIndexUrl(url);
              setUseFallback(true);
              setError(`Failed to load support requests. This query requires a composite index. Using client-side filtering as a fallback.`);
            } else {
              setError(`Failed to load support requests. This query requires a composite index.`);
            }
            
            // Fallback to a simpler query
            fallbackQuery();
          } else {
            setError(`Failed to load support requests: ${err.message}`);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error in fetchSupportRequests:", err);
        setError(`Failed to load support requests: ${err.message}`);
        setLoading(false);
      }
    };

    // Fallback to a simpler query that doesn't require a composite index
    const fallbackQuery = async () => {
      try {
        console.log("Using fallback query approach");
        
        // Get all support requests first
        const simpleQuery = query(
          collection(db, 'support'),
          orderBy('createdAt', 'desc'),
          limit(100) // Limit to a reasonable number
        );
        
        const snapshot = await getDocs(simpleQuery);
        
        if (snapshot.empty) {
          setSupportRequests([]);
          setLoading(false);
          return;
        }
        
        // Process and filter the results in memory
        let requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If status filter is not 'all', filter the results in memory
        if (statusFilter !== 'all') {
          requests = requests.filter(req => req.status === statusFilter);
        }
        
        setSupportRequests(requests);
        setLoading(false);
        
        // Keep the error message, but make it clear we're using a fallback
        setError(`This query requires a composite index (client-side filtering is being used as a fallback). For better performance, create the index here:`);
        
      } catch (fallbackErr) {
        console.error("Error in fallback query:", fallbackErr);
        setError(`Failed to load support requests: ${fallbackErr.message}`);
        setLoading(false);
      }
    };

    fetchSupportRequests();
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [statusFilter]);

  // Select a support request
  const selectRequest = (request) => {
    setSelectedRequest(request);
    setResponse('');
  };

  // Handle response text change
  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  // Update request status (processing, resolved, etc.)
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      setSubmitting(true);
      const requestRef = doc(db, 'support', requestId);
      
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'resolved' ? { resolvedAt: serverTimestamp() } : {})
      });
      
      // Update the selected request in the local state
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(prev => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date(),
          ...(newStatus === 'resolved' ? { resolvedAt: new Date() } : {})
        }));
      }
      
      // Also update the request in the list
      setSupportRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? {
                ...req,
                status: newStatus,
                updatedAt: new Date(),
                ...(newStatus === 'resolved' ? { resolvedAt: new Date() } : {})
              } 
            : req
        )
      );
      
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating request status:", error);
      setError("Failed to update request status. Please try again.");
      setSubmitting(false);
    }
  };

  // Submit response to customer
  const submitResponse = async () => {
    if (!selectedRequest || !response.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const requestRef = doc(db, 'support', selectedRequest.id);
      
      const currentRequest = await getDoc(requestRef);
      if (!currentRequest.exists()) {
        throw new Error("Support request not found");
      }
      
      // Get existing responses or initialize an empty array
      const currentData = currentRequest.data();
      const responses = currentData.responses || [];
      
      // Create new response with current timestamp instead of serverTimestamp
      const now = new Date();
      const newResponse = {
        message: response,
        timestamp: now,
        isAdmin: true,
        adminName: "Admin" // You might want to replace this with the actual admin name
      };
      
      await updateDoc(requestRef, {
        responses: [...responses, newResponse],
        status: 'responded',
        updatedAt: serverTimestamp()
      });
      
      setResponse('');
      
      // Update the selected request in the local state
      setSelectedRequest(prev => ({
        ...prev,
        responses: [...(prev.responses || []), newResponse],
        status: 'responded',
        updatedAt: new Date()
      }));
      
      // Also update the request in the list
      setSupportRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? {
                ...req,
                responses: [...(req.responses || []), newResponse],
                status: 'responded',
                updatedAt: new Date()
              } 
            : req
        )
      );
      
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("Failed to submit response. Please try again.");
      setSubmitting(false);
    }
  };

  // Normalize item data to ensure consistent structure
  const normalizeOrderItems = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => {
      // Make sure we have a consistent structure for each item
      return {
        id: item.id || item.productId || '',
        name: item.name || item.productName || 'Unknown Product',
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
        image: item.image || item.imageUrl || item.img || '',
        deliverySpeed: item.deliverySpeed || 'normal'
      };
    });
  };

  // Format date helper function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      let date;

      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-IN', {
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
      case 'responded':
        return 'status-responded';
      case 'resolved':
        return 'status-resolved';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // Clear error message
  const clearError = () => {
    setError(null);
    setIndexNeeded(false);
    setUseFallback(false);
  };

  // Check if an image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // Check if it's a proper URL or a path starting with '/'
    return (
      url.startsWith('http://') || 
      url.startsWith('https://') || 
      url.startsWith('/')
    );
  };

  if (loading && supportRequests.length === 0) {
    return (
      <div className="support-admin-container">
        <div className="loading-spinner"></div>
        <p>Loading support requests...</p>
      </div>
    );
  }

  return (
    <div className="support-admin-container">
      <h1>Customer Support</h1>
      
      {error && (
        <div className="error-banner">
          <div className="error-message">
            <p>{error}</p>
            {indexNeeded && indexUrl && (
              <div className="create-index-button">
                <a href={indexUrl} target="_blank" rel="noopener noreferrer" className="index-link">
                  Create Index
                </a>
              </div>
            )}
          </div>
          <button className="close-error-btn" onClick={clearError}>×</button>
        </div>
      )}
      
      <div className="status-filter">
        <span>Filter by status:</span>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-select"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="responded">Responded</option>
          <option value="resolved">Resolved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="support-admin-layout">
        {/* Support Requests List */}
        <div className="support-requests-list">
          <h2>Support Tickets</h2>
          
          {supportRequests.length === 0 ? (
            <div className="no-requests">
              <p>No support requests found.</p>
            </div>
          ) : (
            supportRequests.map(request => (
              <div 
                key={request.id} 
                className={`support-request-card ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                onClick={() => selectRequest(request)}
              >
                <div className="request-header">
                  <div className="request-id">
                    #{request.orderDisplayId || request.orderId || request.id.substring(0, 8).toUpperCase()}
                  </div>
                  <div className={`request-status ${getStatusClass(request.status)}`}>
                    {request.status || 'pending'}
                  </div>
                </div>
                
                <div className="request-meta">
                  <div className="customer-name">{request.customerName || 'Unknown'}</div>
                  <div className="request-date">{formatDate(request.createdAt)}</div>
                </div>
                
                <div className="request-issue">
                  <strong>{request.issueType === 'other' ? 'Other Issue' : request.issueDescription}</strong>
                  {request.issueType === 'other' && request.customDescription && (
                    <p className="custom-description">{request.customDescription}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Selected Request Details */}
        <div className="support-request-details">
          {selectedRequest ? (
            <>
              <h2>Request Details</h2>
              
              <div className="request-detail-header">
                <div className="detail-order-id">
                  <strong>Order ID:</strong> {selectedRequest.orderDisplayId || selectedRequest.orderId || selectedRequest.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="detail-status">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusClass(selectedRequest.status)}`}>
                    {selectedRequest.status || 'pending'}
                  </span>
                </div>
              </div>
              
              <div className="request-detail-meta">
                <div className="detail-item">
                  <strong>Customer:</strong> {selectedRequest.customerName || 'Unknown'}
                </div>
                <div className="detail-item">
                  <strong>Order Date:</strong> {formatDate(selectedRequest.orderDate)}
                </div>
                <div className="detail-item">
                  <strong>Request Date:</strong> {formatDate(selectedRequest.createdAt)}
                </div>
                <div className="detail-item">
                  <strong>Order Amount:</strong> ₹{selectedRequest.orderAmount?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0.00'}
                </div>
              </div>
              
              <div className="request-issue-details">
                <h3>Issue Details</h3>
                <div className="issue-type">
                  <strong>Type:</strong> {selectedRequest.issueType === 'other' ? 'Other Issue' : selectedRequest.issueDescription}
                </div>
                {selectedRequest.issueType === 'other' && selectedRequest.customDescription && (
                  <div className="issue-description">
                    <strong>Description:</strong>
                    <p>{selectedRequest.customDescription}</p>
                  </div>
                )}
              </div>
              
              <div className="request-items">
                <h3>Order Items</h3>
                {selectedRequest.orderItems && selectedRequest.orderItems.length > 0 ? (
                  <div className="order-items-list">
                    {normalizeOrderItems(selectedRequest.orderItems).map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          {isValidImageUrl(item.image) ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite error loop
                                e.target.src = "/images/product-placeholder.jpg";
                              }}
                            />
                          ) : (
                            <div className="no-image-placeholder">
                              <span>{item.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          <div className="item-meta">
                            <span>Qty: {item.quantity}</span>
                            <span>₹{item.price.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-items">
                    <p>No items information available</p>
                  </div>
                )}
              </div>
              
              <div className="response-history">
                <h3>Communication History</h3>
                <div className="messages-container">
                  {/* Initial support request message */}
                  <div className="message customer-message">
                    <div className="message-header">
                      <div className="message-sender">{selectedRequest.customerName || 'Customer'}</div>
                      <div className="message-time">{formatDate(selectedRequest.createdAt)}</div>
                    </div>
                    <div className="message-content">
                      <p>{selectedRequest.issueType === 'other' 
                        ? selectedRequest.customDescription 
                        : selectedRequest.issueDescription}
                      </p>
                    </div>
                  </div>
                  
                  {/* Response messages */}
                  {selectedRequest.responses && selectedRequest.responses.length > 0 && 
                    selectedRequest.responses.map((responseMsg, index) => (
                      <div 
                        key={index} 
                        className={`message ${responseMsg.isAdmin ? 'admin-message' : 'customer-message'}`}
                      >
                        <div className="message-header">
                          <div className="message-sender">
                            {responseMsg.isAdmin 
                              ? (responseMsg.adminName || 'Admin') 
                              : selectedRequest.customerName || 'Customer'}
                          </div>
                          <div className="message-time">{formatDate(responseMsg.timestamp)}</div>
                        </div>
                        <div className="message-content">
                          <p>{responseMsg.message}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="response-form">
                <h3>Respond to Customer</h3>
                <textarea
                  value={response}
                  onChange={handleResponseChange}
                  placeholder="Type your response to the customer..."
                  className="response-textarea"
                  disabled={submitting || selectedRequest.status === 'resolved'}
                />
                
                <div className="response-actions">
                  <div className="status-update-buttons">
                    <button 
                      className={`status-btn status-processing ${selectedRequest.status === 'processing' ? 'active' : ''}`}
                      onClick={() => updateRequestStatus(selectedRequest.id, 'processing')}
                      disabled={submitting}
                    >
                      Mark as Processing
                    </button>
                    <button 
                      className={`status-btn status-resolved ${selectedRequest.status === 'resolved' ? 'active' : ''}`}
                      onClick={() => updateRequestStatus(selectedRequest.id, 'resolved')}
                      disabled={submitting}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                  
                  <button 
                    className="send-response-btn"
                    onClick={submitResponse}
                    disabled={!response.trim() || submitting || selectedRequest.status === 'resolved'}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-small"></span> 
                        Sending...
                      </>
                    ) : (
                      'Send Response'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <h3>Select a support request</h3>
              <p>Select a request from the list to view details and respond to the customer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;