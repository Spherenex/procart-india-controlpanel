




// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   where, 
//   Timestamp,
//   onSnapshot
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Locations.css';

// const Locations = () => {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
  
//   const mapContainerRef = useRef(null);
//   const googleMapRef = useRef(null);
//   const markersRef = useRef([]);
//   const geocoderRef = useRef(null);
//   const activeInfoWindowRef = useRef(null);
  
//   // Load Google Maps API
//   useEffect(() => {
//     // Function to load Google Maps API
//     const loadGoogleMapsAPI = () => {
//       // Check if it's already loaded
//       if (window.google && window.google.maps) {
//         initializeMap();
//         return;
//       }

//       // Create script element
//       const script = document.createElement('script');
//       // Use callback function name that doesn't conflict
//       const callbackName = 'initializeGoogleMapsAPI_' + Math.random().toString(36).substr(2, 9);
      
//       // Define the callback function
//       window[callbackName] = function() {
//         initializeMap();
//         // Clean up
//         delete window[callbackName];
//       };
      
//       // Set script attributes with provided API key
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDpcqa07rVqok6Cmgz3QwHRNpx7JSxSdKA&libraries=places&callback=${callbackName}`;
//       script.async = true;
//       script.defer = true;
      
//       // Handle script loading errors
//       script.onerror = () => {
//         setError('Failed to load Google Maps API. Please check your internet connection or API key.');
//         setLoading(false);
//       };
      
//       // Append script to document
//       document.head.appendChild(script);
//     };
    
//     // Initialize the map once Google Maps is loaded
//     const initializeMap = () => {
//       try {
//         if (!mapContainerRef.current) return;
        
//         // Create the map
//         const mapOptions = {
//           center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
//           zoom: 13,
//           streetViewControl: false,
//           mapTypeControl: false,
//           fullscreenControl: true,
//           styles: [
//             {
//               featureType: "poi",
//               elementType: "labels",
//               stylers: [{ visibility: "off" }]
//             }
//           ]
//         };
        
//         const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
//         googleMapRef.current = map;
        
//         // Create geocoder
//         geocoderRef.current = new window.google.maps.Geocoder();
        
//         setMapLoaded(true);
//       } catch (err) {
//         console.error('Error initializing Google Maps:', err);
//         setError('Failed to initialize Google Maps. Please refresh the page.');
//         setLoading(false);
//       }
//     };
    
//     loadGoogleMapsAPI();
    
//     // Clean up function
//     return () => {
//       // Clear all markers when component unmounts
//       if (markersRef.current && markersRef.current.length > 0) {
//         markersRef.current.forEach(marker => {
//           if (marker) marker.setMap(null);
//         });
//         markersRef.current = [];
//       }
//     };
//   }, []);
  
//   // Fetch orders from Firestore
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         // Create a query to fetch orders
//         const ordersRef = collection(db, 'orders');
//         const ordersQuery = query(ordersRef, orderBy('orderDate', 'desc'));
        
//         // Set up real-time listener
//         const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
//           const ordersData = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               ...data,
//               orderDate: data.orderDate instanceof Timestamp 
//                 ? data.orderDate.toDate() 
//                 : new Date(data.orderDate),
//               deliverySpeeds: getDeliverySpeeds(data)
//             };
//           });
          
//           setOrders(ordersData);
//           setLoading(false);
//         }, (err) => {
//           console.error("Error fetching orders:", err);
//           setError("Failed to load orders. Please try again.");
//           setLoading(false);
//         });
        
//         return () => unsubscribe();
//       } catch (err) {
//         console.error("Error setting up orders listener:", err);
//         setError("Failed to load orders. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
  
//   // Extract delivery speeds from order items
//   const getDeliverySpeeds = (order) => {
//     const speeds = new Set();
    
//     if (order.items && Array.isArray(order.items)) {
//       order.items.forEach(item => {
//         const speed = item.deliverySpeed || 'normal';
//         speeds.add(speed);
//       });
//     } else if (order.deliverySpeed) {
//       speeds.add(order.deliverySpeed);
//     } else {
//       speeds.add('normal');
//     }
    
//     return Array.from(speeds);
//   };
  
//   // Filter orders and update map markers when filter or orders change
//   useEffect(() => {
//     if (!orders.length || !mapLoaded) return;
    
//     // Filter orders based on selected filter
//     let filtered;
//     if (selectedFilter === 'all') {
//       filtered = [...orders];
//     } else {
//       filtered = orders.filter(order => 
//         order.deliverySpeeds.includes(selectedFilter)
//       );
//     }
    
//     setFilteredOrders(filtered);
    
//     // Update map markers
//     updateMapMarkers(filtered);
//   }, [orders, selectedFilter, mapLoaded]);
  
//   // Update map markers with filtered orders
//   const updateMapMarkers = async (filteredOrders) => {
//     if (!googleMapRef.current || !geocoderRef.current) {
//       console.error("Google Map or Geocoder not initialized");
//       setError("Map services not fully loaded. Please refresh the page.");
//       return;
//     }
    
//     // Clear existing markers
//     if (markersRef.current.length > 0) {
//       markersRef.current.forEach(marker => {
//         if (marker) marker.setMap(null);
//       });
//       markersRef.current = [];
//     }
    
//     // Close any open info window
//     if (activeInfoWindowRef.current) {
//       activeInfoWindowRef.current.close();
//       activeInfoWindowRef.current = null;
//     }
    
//     const bounds = new window.google.maps.LatLngBounds();
//     const newMarkers = [];
//     let geocodingErrorCount = 0;
//     let successfulMarkers = 0;
    
//     // Show loading state if processing many orders
//     if (filteredOrders.length > 10) {
//       setLoading(true);
//     }
    
//     // Process each order
//     for (const order of filteredOrders) {
//       if (!order.deliveryAddress || typeof order.deliveryAddress !== 'string') {
//         console.log(`Skipping order ${order.id}: Missing or invalid delivery address`);
//         continue;
//       }
      
//       try {
//         // TEMPORARY WORKAROUND: Use hardcoded coordinates if geocoding API is not enabled
//         // Remove this section once Geocoding API is properly enabled
//         const useHardcodedCoordinates = true; // Set to false when Geocoding API is enabled
        
//         let position;
//         if (useHardcodedCoordinates) {
//           // Create a random position near Bengaluru center for demonstration
//           const baseLat = 12.9716;
//           const baseLng = 77.5946;
//           const randomOffset = () => (Math.random() - 0.5) * 0.05; // ~5km range
          
//           position = new window.google.maps.LatLng(
//             baseLat + randomOffset(),
//             baseLng + randomOffset()
//           );
//           console.log(`Using fallback coordinates for order ${order.id}`);
//         } else {
//           // Regular geocoding when API is enabled
//           const geocodeResponse = await geocodeAddress(order.deliveryAddress);
          
//           if (!geocodeResponse || !geocodeResponse.geometry || !geocodeResponse.geometry.location) {
//             console.log(`Geocoding failed for order ${order.id} with address: ${order.deliveryAddress}`);
//             geocodingErrorCount++;
//             continue;
//           }
          
//           position = geocodeResponse.geometry.location;
//         }
        
//         bounds.extend(position);
        
//         // Create marker
//         const marker = createMarker(order, position);
//         if (marker) {
//           newMarkers.push(marker);
//           successfulMarkers++;
//         }
//       } catch (err) {
//         console.log(`Could not geocode address for order ${order.id}: ${err.message}`);
//         geocodingErrorCount++;
//         // Continue with next order
//       }
//     }
    
//     // Set new markers
//     markersRef.current = newMarkers;
    
//     // Adjust map bounds if we have markers
//     if (newMarkers.length > 0 && !bounds.isEmpty()) {
//       googleMapRef.current.fitBounds(bounds);
      
//       // Ensure we don't zoom in too much for single markers
//       const listener = window.google.maps.event.addListenerOnce(
//         googleMapRef.current, 
//         'bounds_changed', 
//         () => {
//           if (googleMapRef.current.getZoom() > 15) {
//             googleMapRef.current.setZoom(15);
//           }
//         }
//       );
//     } else {
//       // Center on Bengaluru if no markers
//       googleMapRef.current.setCenter({ lat: 12.9716, lng: 77.5946 });
//       googleMapRef.current.setZoom(12);
//     }
    
//     setLoading(false);
    
//     // Show warning if there were geocoding errors
//     if (geocodingErrorCount > 0) {
//       console.warn(`${geocodingErrorCount} orders could not be displayed due to geocoding errors`);
//       if (geocodingErrorCount === filteredOrders.length) {
//         setError("Could not display any locations. Please check if the Geocoding API is enabled for your API key.");
//       }
//     }
    
//     console.log(`Successfully displayed ${successfulMarkers} order locations`);
//   };
  
//   // Geocode address with better error handling
//   const geocodeAddress = (address) => {
//     return new Promise((resolve, reject) => {
//       if (!geocoderRef.current) {
//         reject(new Error('Geocoder not initialized'));
//         return;
//       }
      
//       geocoderRef.current.geocode(
//         { address: address },
//         (results, status) => {
//           if (status === 'OK' && results && results.length > 0) {
//             resolve(results[0]);
//           } else {
//             // More descriptive error based on status
//             let errorMessage = `Geocoding failed: ${status}`;
//             if (status === 'REQUEST_DENIED') {
//               errorMessage = 'Geocoding failed: API key not authorized for Geocoding API';
//             } else if (status === 'ZERO_RESULTS') {
//               errorMessage = `Geocoding failed: No results found for address "${address}"`;
//             }
//             reject(new Error(errorMessage));
//           }
//         }
//       );
//     });
//   };
  
//   // Create a marker for an order
//   const createMarker = (order, position) => {
//     if (!googleMapRef.current || !position) return null;
    
//     const speedIcon = getMarkerIcon(order);
    
//     // Create marker with proper error handling
//     try {
//       // Check if SymbolPath is available, otherwise use a default
//       const iconPath = window.google.maps.SymbolPath ? 
//                        window.google.maps.SymbolPath.CIRCLE : 0;
      
//       const marker = new window.google.maps.Marker({
//         position: position,
//         map: googleMapRef.current,
//         animation: window.google.maps.Animation.DROP,
//         icon: {
//           path: iconPath,
//           fillColor: speedIcon === 'quick' ? '#FF6B6B' : 
//                     speedIcon === 'normal' ? '#4ECDC4' : 
//                     speedIcon === 'late' ? '#FFD166' : '#6497b1',
//           fillOpacity: 1,
//           strokeWeight: 2,
//           strokeColor: '#FFFFFF',
//           scale: 14 // Increased marker size
//         },
//         // Fallback in case custom icon fails
//         label: speedIcon === 'quick' ? 'Q' : 
//               speedIcon === 'normal' ? 'S' : 
//               speedIcon === 'late' ? 'E' : ''
//       });
      
//       // Create info window with proper error handling
//       const infoWindow = new window.google.maps.InfoWindow({
//         content: createInfoWindowContent(order)
//       });
      
//       // Add click listener
//       marker.addListener('click', () => {
//         // Close any open info window
//         if (activeInfoWindowRef.current) {
//           activeInfoWindowRef.current.close();
//         }
        
//         // Open this info window
//         infoWindow.open({
//           anchor: marker,
//           map: googleMapRef.current
//         });
        
//         // Store reference to active info window
//         activeInfoWindowRef.current = infoWindow;
//       });
      
//       return marker;
//     } catch (err) {
//       console.error('Error creating marker:', err);
//       return null;
//     }
//   };
  
//   // Create info window content
//   const createInfoWindowContent = (order) => {
//     return `
//       <div class="info-window">
//         <h3>Order Details</h3>
//         <div class="info-detail">
//           <span class="info-label">Order ID:</span>
//           <span class="info-value">${order.id ? order.id.substring(0, 8) + '...' : 'N/A'}</span>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Customer:</span>
//           <span class="info-value">${order.customerName || 'Guest'}</span>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Address:</span>
//           <span class="info-value">${order.deliveryAddress || 'N/A'}</span>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Date:</span>
//           <span class="info-value">${formatDate(order.orderDate)}</span>
//         </div>
//         ${order.totalAmount ? `
//         <div class="info-detail">
//           <span class="info-label">Amount:</span>
//           <span class="info-value">₹${formatAmount(order.totalAmount)}</span>
//         </div>
//         ` : ''}
//         <div class="info-detail">
//           <span class="info-label">Status:</span>
//           <span class="status-badge ${getStatusClass(getMarkerLabel(order))}">
//             ${getMarkerLabel(order)}
//           </span>
//         </div>
//       </div>
//     `;
//   };
  
//   // Handle filter change
//   const handleFilterChange = (filter) => {
//     setSelectedFilter(filter);
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
  
//   // Format amount for display
//   const formatAmount = (amount) => {
//     if (typeof amount !== 'number') return '0.00';
//     return amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };
  
//   // Get status class for styling
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
  
//   // Get marker icon based on delivery speed
//   const getMarkerIcon = (order) => {
//     // Priority: quick > normal > late
//     if (!order || !order.deliverySpeeds) return 'normal';
    
//     const speeds = order.deliverySpeeds;
//     if (speeds.includes('quick')) return 'quick';
//     if (speeds.includes('normal')) return 'normal';
//     if (speeds.includes('late')) return 'late';
//     return 'normal';
//   };
  
//   // Get marker label from status
//   const getMarkerLabel = (order) => {
//     if (!order) return 'Pending';
    
//     // Get the order status based on priority
//     let status = order.status || 'Pending';
    
//     if (order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
//       // For simplicity, get the latest status from history
//       const sortedHistory = [...order.statusHistory].sort((a, b) => {
//         const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
//         const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
//         return dateB - dateA;
//       });
      
//       if (sortedHistory[0] && sortedHistory[0].status) {
//         status = sortedHistory[0].status;
//       }
//     }
    
//     return status;
//   };
  
//   // Get delivery speed info
//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick': return { name: 'Quick', icon: '⚡', class: 'marker-quick' };
//       case 'express': return { name: 'Express', icon: '🚀', class: 'marker-express' };
//       case 'normal': return { name: 'Standard', icon: '🚚', class: 'marker-normal' };
//       case 'late': return { name: 'Eco', icon: '🐌', class: 'marker-late' };
//       default: return { name: 'Standard', icon: '📦', class: 'marker-normal' };
//     }
//   };
  
//   return (
//     <div className="locations-container">
//       <h1>Order Locations</h1>
      
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Filter by Delivery Speed:</label>
//           <div className="filter-buttons">
//             <button 
//               className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('all')}
//             >
//               <span className="filter-icon">📦</span> All Orders
//             </button>
//             <button 
//               className={`filter-btn quick-btn ${selectedFilter === 'quick' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('quick')}
//             >
//               <span className="filter-icon">⚡</span> Quick
//             </button>
//             <button 
//               className={`filter-btn normal-btn ${selectedFilter === 'normal' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('normal')}
//             >
//               <span className="filter-icon">🚚</span> Standard
//             </button>
//             <button 
//               className={`filter-btn late-btn ${selectedFilter === 'late' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('late')}
//             >
//               <span className="filter-icon">🐌</span> Eco
//             </button>
//           </div>
//         </div>
        
//         <div className="order-counts">
//           <span className="count-label">Showing:</span>
//           <span className="count-value">{filteredOrders.length} orders</span>
//         </div>
//       </div>
      
//       <div className="map-container">
//         {loading ? (
//           <div className="map-loading">
//             <div className="spinner"></div>
//             <p>Loading map and order data...</p>
//           </div>
//         ) : error ? (
//           <div className="map-error">
//             <p>{error}</p>
//             <button onClick={() => window.location.reload()}>Retry</button>
//           </div>
//         ) : (
//           <div 
//             ref={mapContainerRef} 
//             className="google-map"
//             style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
//           ></div>
//         )}
//       </div>
      
//       <div className="map-legend">
//         <h3>Map Legend</h3>
//         <div className="legend-items">
//           <div className="legend-item">
//             <div className="legend-marker marker-quick"></div>
//             <span>Quick Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-normal"></div>
//             <span>Standard Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-late"></div>
//             <span>Eco Delivery</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Locations;




// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   where, 
//   Timestamp,
//   onSnapshot
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Locations.css';

// const Locations = () => {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
  
//   const mapContainerRef = useRef(null);
//   const googleMapRef = useRef(null);
//   const markersRef = useRef([]);
//   const geocoderRef = useRef(null);
//   const activeInfoWindowRef = useRef(null);
  
//   // Load Google Maps API
//   useEffect(() => {
//     // Function to load Google Maps API
//     const loadGoogleMapsAPI = () => {
//       // Check if it's already loaded
//       if (window.google && window.google.maps) {
//         initializeMap();
//         return;
//       }

//       // Create script element
//       const script = document.createElement('script');
//       // Use callback function name that doesn't conflict
//       const callbackName = 'initializeGoogleMapsAPI_' + Math.random().toString(36).substr(2, 9);
      
//       // Define the callback function
//       window[callbackName] = function() {
//         initializeMap();
//         // Clean up
//         delete window[callbackName];
//       };
      
//       // Set script attributes with provided API key
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDpcqa07rVqok6Cmgz3QwHRNpx7JSxSdKA&libraries=places&callback=${callbackName}`;
//       script.async = true;
//       script.defer = true;
      
//       // Handle script loading errors
//       script.onerror = () => {
//         setError('Failed to load Google Maps API. Please check your internet connection or API key.');
//         setLoading(false);
//       };
      
//       // Append script to document
//       document.head.appendChild(script);
//     };
    
//     // Initialize the map once Google Maps is loaded
//     const initializeMap = () => {
//       try {
//         if (!mapContainerRef.current) return;
        
//         // Create the map
//         const mapOptions = {
//           center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
//           zoom: 13,
//           streetViewControl: false,
//           mapTypeControl: false,
//           fullscreenControl: true,
//           styles: [
//             {
//               featureType: "poi",
//               elementType: "labels",
//               stylers: [{ visibility: "off" }]
//             }
//           ]
//         };
        
//         const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
//         googleMapRef.current = map;
        
//         // Create geocoder
//         geocoderRef.current = new window.google.maps.Geocoder();
        
//         setMapLoaded(true);
//       } catch (err) {
//         console.error('Error initializing Google Maps:', err);
//         setError('Failed to initialize Google Maps. Please refresh the page.');
//         setLoading(false);
//       }
//     };
    
//     loadGoogleMapsAPI();
    
//     // Clean up function
//     return () => {
//       // Clear all markers when component unmounts
//       if (markersRef.current && markersRef.current.length > 0) {
//         markersRef.current.forEach(marker => {
//           if (marker) marker.setMap(null);
//         });
//         markersRef.current = [];
//       }
//     };
//   }, []);
  
//   // Fetch orders from Firestore
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         // Create a query to fetch orders
//         const ordersRef = collection(db, 'orders');
//         const ordersQuery = query(ordersRef, orderBy('orderDate', 'desc'));
        
//         // Set up real-time listener
//         const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
//           const ordersData = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               ...data,
//               orderDate: data.orderDate instanceof Timestamp 
//                 ? data.orderDate.toDate() 
//                 : new Date(data.orderDate),
//               deliverySpeeds: getDeliverySpeeds(data)
//             };
//           });
          
//           setOrders(ordersData);
//           setLoading(false);
//         }, (err) => {
//           console.error("Error fetching orders:", err);
//           setError("Failed to load orders. Please try again.");
//           setLoading(false);
//         });
        
//         return () => unsubscribe();
//       } catch (err) {
//         console.error("Error setting up orders listener:", err);
//         setError("Failed to load orders. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
  
//   // Extract delivery speeds from order items
//   const getDeliverySpeeds = (order) => {
//     const speeds = new Set();
    
//     if (order.items && Array.isArray(order.items)) {
//       order.items.forEach(item => {
//         const speed = item.deliverySpeed || 'normal';
//         speeds.add(speed);
//       });
//     } else if (order.deliverySpeed) {
//       speeds.add(order.deliverySpeed);
//     } else {
//       speeds.add('normal');
//     }
    
//     return Array.from(speeds);
//   };
  
//   // Filter orders and update map markers when filter or orders change
//   useEffect(() => {
//     if (!orders.length || !mapLoaded) return;
    
//     // Filter orders based on selected filter
//     let filtered;
//     if (selectedFilter === 'all') {
//       filtered = [...orders];
//     } else {
//       filtered = orders.filter(order => 
//         order.deliverySpeeds.includes(selectedFilter)
//       );
//     }
    
//     setFilteredOrders(filtered);
    
//     // Update map markers
//     updateMapMarkers(filtered);
//   }, [orders, selectedFilter, mapLoaded]);
  
//   // Update map markers with filtered orders
//   const updateMapMarkers = async (filteredOrders) => {
//     if (!googleMapRef.current || !geocoderRef.current) {
//       console.error("Google Map or Geocoder not initialized");
//       setError("Map services not fully loaded. Please refresh the page.");
//       return;
//     }
    
//     // Clear existing markers
//     if (markersRef.current.length > 0) {
//       markersRef.current.forEach(marker => {
//         if (marker) marker.setMap(null);
//       });
//       markersRef.current = [];
//     }
    
//     // Close any open info window
//     if (activeInfoWindowRef.current) {
//       activeInfoWindowRef.current.close();
//       activeInfoWindowRef.current = null;
//     }
    
//     const bounds = new window.google.maps.LatLngBounds();
//     const newMarkers = [];
//     let geocodingErrorCount = 0;
//     let successfulMarkers = 0;
    
//     // Show loading state if processing many orders
//     if (filteredOrders.length > 10) {
//       setLoading(true);
//     }
    
//     // Process each order
//     for (const order of filteredOrders) {
//       if (!order.deliveryAddress || typeof order.deliveryAddress !== 'string') {
//         console.log(`Skipping order ${order.id}: Missing or invalid delivery address`);
//         continue;
//       }
      
//       try {
//         // TEMPORARY WORKAROUND: Use hardcoded coordinates if geocoding API is not enabled
//         // Remove this section once Geocoding API is properly enabled
//         const useHardcodedCoordinates = true; // Set to false when Geocoding API is enabled
        
//         let position;
//         if (useHardcodedCoordinates) {
//           // Create a random position near Bengaluru center for demonstration
//           const baseLat = 12.9716;
//           const baseLng = 77.5946;
//           const randomOffset = () => (Math.random() - 0.5) * 0.05; // ~5km range
          
//           position = new window.google.maps.LatLng(
//             baseLat + randomOffset(),
//             baseLng + randomOffset()
//           );
//           console.log(`Using fallback coordinates for order ${order.id}`);
//         } else {
//           // Regular geocoding when API is enabled
//           const geocodeResponse = await geocodeAddress(order.deliveryAddress);
          
//           if (!geocodeResponse || !geocodeResponse.geometry || !geocodeResponse.geometry.location) {
//             console.log(`Geocoding failed for order ${order.id} with address: ${order.deliveryAddress}`);
//             geocodingErrorCount++;
//             continue;
//           }
          
//           position = geocodeResponse.geometry.location;
//         }
        
//         bounds.extend(position);
        
//         // Create marker
//         const marker = createMarker(order, position);
//         if (marker) {
//           newMarkers.push(marker);
//           successfulMarkers++;
//         }
//       } catch (err) {
//         console.log(`Could not geocode address for order ${order.id}: ${err.message}`);
//         geocodingErrorCount++;
//         // Continue with next order
//       }
//     }
    
//     // Set new markers
//     markersRef.current = newMarkers;
    
//     // Adjust map bounds if we have markers
//     if (newMarkers.length > 0 && !bounds.isEmpty()) {
//       googleMapRef.current.fitBounds(bounds);
      
//       // Ensure we don't zoom in too much for single markers
//       const listener = window.google.maps.event.addListenerOnce(
//         googleMapRef.current, 
//         'bounds_changed', 
//         () => {
//           if (googleMapRef.current.getZoom() > 15) {
//             googleMapRef.current.setZoom(15);
//           }
//         }
//       );
//     } else {
//       // Center on Bengaluru if no markers
//       googleMapRef.current.setCenter({ lat: 12.9716, lng: 77.5946 });
//       googleMapRef.current.setZoom(12);
//     }
    
//     setLoading(false);
    
//     // Show warning if there were geocoding errors
//     if (geocodingErrorCount > 0) {
//       console.warn(`${geocodingErrorCount} orders could not be displayed due to geocoding errors`);
//       if (geocodingErrorCount === filteredOrders.length) {
//         setError("Could not display any locations. Please check if the Geocoding API is enabled for your API key.");
//       }
//     }
    
//     console.log(`Successfully displayed ${successfulMarkers} order locations`);
//   };
  
//   // Geocode address with better error handling
//   const geocodeAddress = (address) => {
//     return new Promise((resolve, reject) => {
//       if (!geocoderRef.current) {
//         reject(new Error('Geocoder not initialized'));
//         return;
//       }
      
//       geocoderRef.current.geocode(
//         { address: address },
//         (results, status) => {
//           if (status === 'OK' && results && results.length > 0) {
//             resolve(results[0]);
//           } else {
//             // More descriptive error based on status
//             let errorMessage = `Geocoding failed: ${status}`;
//             if (status === 'REQUEST_DENIED') {
//               errorMessage = 'Geocoding failed: API key not authorized for Geocoding API';
//             } else if (status === 'ZERO_RESULTS') {
//               errorMessage = `Geocoding failed: No results found for address "${address}"`;
//             }
//             reject(new Error(errorMessage));
//           }
//         }
//       );
//     });
//   };
  
//   // Create a marker for an order
//   const createMarker = (order, position) => {
//     if (!googleMapRef.current || !position) return null;
    
//     const speedIcon = getMarkerIcon(order);
    
//     // Create marker with proper error handling
//     try {
//       // Check if SymbolPath is available, otherwise use a default
//       const iconPath = window.google.maps.SymbolPath ? 
//                        window.google.maps.SymbolPath.CIRCLE : 0;
      
//       const marker = new window.google.maps.Marker({
//         position: position,
//         map: googleMapRef.current,
//         animation: window.google.maps.Animation.DROP,
//         icon: {
//           path: iconPath,
//           fillColor: speedIcon === 'quick' ? '#FF6B6B' : 
//                     speedIcon === 'normal' ? '#4ECDC4' : 
//                     speedIcon === 'late' ? '#FFD166' : '#6497b1',
//           fillOpacity: 1,
//           strokeWeight: 2,
//           strokeColor: '#FFFFFF',
//           scale: 14 // Increased marker size
//         },
//         // Fallback in case custom icon fails
//         label: speedIcon === 'quick' ? 'Q' : 
//               speedIcon === 'normal' ? 'S' : 
//               speedIcon === 'late' ? 'E' : ''
//       });
      
//       // Create info window with proper error handling
//       const infoWindow = new window.google.maps.InfoWindow({
//         content: createInfoWindowContent(order)
//       });
      
//       // Add click listener
//       marker.addListener('click', () => {
//         // Close any open info window
//         if (activeInfoWindowRef.current) {
//           activeInfoWindowRef.current.close();
//         }
        
//         // Open this info window
//         infoWindow.open({
//           anchor: marker,
//           map: googleMapRef.current
//         });
        
//         // Store reference to active info window
//         activeInfoWindowRef.current = infoWindow;
        
//         // Add event listener for copy button after info window is fully loaded
//         window.google.maps.event.addListener(infoWindow, 'domready', () => {
//           const copyBtn = document.getElementById(`copy-address-btn-${order.id}`);
//           if (copyBtn) {
//             copyBtn.addEventListener('click', () => {
//               copyAddressToClipboard(order.deliveryAddress, order.id);
//             });
//           }
//         });
//       });
      
//       return marker;
//     } catch (err) {
//       console.error('Error creating marker:', err);
//       return null;
//     }
//   };
  
//   // Function to copy address to clipboard
//   const copyAddressToClipboard = (address, orderId) => {
//     if (!address) return;
    
//     navigator.clipboard.writeText(address)
//       .then(() => {
//         console.log('Address copied to clipboard');
//         // Show visual feedback
//         const copyBtn = document.getElementById(`copy-address-btn-${orderId}`);
//         if (copyBtn) {
//           const originalText = copyBtn.innerHTML;
//           copyBtn.innerHTML = '✓ Copied!';
//           copyBtn.classList.add('copied');
          
//           setTimeout(() => {
//             copyBtn.innerHTML = originalText;
//             copyBtn.classList.remove('copied');
//           }, 2000);
//         }
//       })
//       .catch(err => {
//         console.error('Could not copy text: ', err);
//       });
//   };
  
//   // Create info window content
//   const createInfoWindowContent = (order) => {
//     return `
//       <div class="info-window">
//         <h3>Order Details</h3>
//         <div class="info-detail">
//           <span class="info-label">Order ID:</span>
//           <span class="info-value">${order.id ? order.id.substring(0, 8) + '...' : 'N/A'}</span>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Customer:</span>
//           <span class="info-value">${order.customerName || 'Guest'}</span>
//         </div>
//         <div class="info-detail address-detail">
//           <span class="info-label">Address:</span>
//           <div class="address-container">
//             <span class="info-value address-value">${order.deliveryAddress || 'N/A'}</span>
//             <button id="copy-address-btn-${order.id}" class="copy-address-btn" title="Copy address to clipboard">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
//               </svg>
//               Copy
//             </button>
//           </div>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Date:</span>
//           <span class="info-value">${formatDate(order.orderDate)}</span>
//         </div>
//         ${order.totalAmount ? `
//         <div class="info-detail">
//           <span class="info-label">Amount:</span>
//           <span class="info-value">₹${formatAmount(order.totalAmount)}</span>
//         </div>
//         ` : ''}
//         <div class="info-detail">
//           <span class="info-label">Status:</span>
//           <span class="status-badge ${getStatusClass(getMarkerLabel(order))}">
//             ${getMarkerLabel(order)}
//           </span>
//         </div>
//         <style>
//           .info-window {
//             font-family: Arial, sans-serif;
//             padding: 5px;
//             min-width: 250px;
//           }
//           .info-detail {
//             margin-bottom: 8px;
//             display: flex;
//           }
//           .address-detail {
//             align-items: flex-start;
//           }
//           .info-label {
//             font-weight: bold;
//             width: 80px;
//             flex-shrink: 0;
//           }
//           .address-container {
//             display: flex;
//             flex-direction: column;
//             flex: 1;
//           }
//           .address-value {
//             margin-bottom: 5px;
//             word-break: break-all;
//           }
//           .copy-address-btn {
//             display: flex;
//             align-items: center;
//             padding: 4px 8px;
//             background-color: #f0f0f0;
//             border: 1px solid #ccc;
//             border-radius: 4px;
//             font-size: 12px;
//             cursor: pointer;
//             align-self: flex-start;
//           }
//           .copy-address-btn svg {
//             margin-right: 4px;
//           }
//           .copy-address-btn:hover {
//             background-color: #e0e0e0;
//           }
//           .copy-address-btn.copied {
//             background-color: #4CAF50;
//             color: white;
//           }
//           .status-badge {
//             display: inline-block;
//             padding: 3px 8px;
//             border-radius: 12px;
//             font-size: 11px;
//             color: white;
//             background-color: #888;
//           }
//           .status-pending { background-color: #FFC107; }
//           .status-processing { background-color: #2196F3; }
//           .status-shipped { background-color: #673AB7; }
//           .status-out-for-delivery { background-color: #FF9800; }
//           .status-delivered { background-color: #4CAF50; }
//           .status-cancelled { background-color: #F44336; }
//         </style>
//       </div>
//     `;
//   };
  
//   // Handle filter change
//   const handleFilterChange = (filter) => {
//     setSelectedFilter(filter);
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
  
//   // Format amount for display
//   const formatAmount = (amount) => {
//     if (typeof amount !== 'number') return '0.00';
//     return amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };
  
//   // Get status class for styling
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
  
//   // Get marker icon based on delivery speed
//   const getMarkerIcon = (order) => {
//     // Priority: quick > normal > late
//     if (!order || !order.deliverySpeeds) return 'normal';
    
//     const speeds = order.deliverySpeeds;
//     if (speeds.includes('quick')) return 'quick';
//     if (speeds.includes('normal')) return 'normal';
//     if (speeds.includes('late')) return 'late';
//     return 'normal';
//   };
  
//   // Get marker label from status
//   const getMarkerLabel = (order) => {
//     if (!order) return 'Pending';
    
//     // Get the order status based on priority
//     let status = order.status || 'Pending';
    
//     if (order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
//       // For simplicity, get the latest status from history
//       const sortedHistory = [...order.statusHistory].sort((a, b) => {
//         const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
//         const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
//         return dateB - dateA;
//       });
      
//       if (sortedHistory[0] && sortedHistory[0].status) {
//         status = sortedHistory[0].status;
//       }
//     }
    
//     return status;
//   };
  
//   // Get delivery speed info
//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick': return { name: 'Quick', icon: '⚡', class: 'marker-quick' };
//       case 'express': return { name: 'Express', icon: '🚀', class: 'marker-express' };
//       case 'normal': return { name: 'Standard', icon: '🚚', class: 'marker-normal' };
//       case 'late': return { name: 'Eco', icon: '🐌', class: 'marker-late' };
//       default: return { name: 'Standard', icon: '📦', class: 'marker-normal' };
//     }
//   };
  
//   return (
//     <div className="locations-container">
//       <h1>Order Locations</h1>
      
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Filter by Delivery Speed:</label>
//           <div className="filter-buttons">
//             <button 
//               className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('all')}
//             >
//               <span className="filter-icon">📦</span> All Orders
//             </button>
//             <button 
//               className={`filter-btn quick-btn ${selectedFilter === 'quick' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('quick')}
//             >
//               <span className="filter-icon">⚡</span> Quick
//             </button>
//             <button 
//               className={`filter-btn normal-btn ${selectedFilter === 'normal' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('normal')}
//             >
//               <span className="filter-icon">🚚</span> Standard
//             </button>
//             <button 
//               className={`filter-btn late-btn ${selectedFilter === 'late' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('late')}
//             >
//               <span className="filter-icon">🐌</span> Eco
//             </button>
//           </div>
//         </div>
        
//         <div className="order-counts">
//           <span className="count-label">Showing:</span>
//           <span className="count-value">{filteredOrders.length} orders</span>
//         </div>
//       </div>
      
//       <div className="map-container">
//         {loading ? (
//           <div className="map-loading">
//             <div className="spinner"></div>
//             <p>Loading map and order data...</p>
//           </div>
//         ) : error ? (
//           <div className="map-error">
//             <p>{error}</p>
//             <button onClick={() => window.location.reload()}>Retry</button>
//           </div>
//         ) : (
//           <div 
//             ref={mapContainerRef} 
//             className="google-map"
//             style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
//           ></div>
//         )}
//       </div>
      
//       <div className="map-legend">
//         <h3>Map Legend</h3>
//         <div className="legend-items">
//           <div className="legend-item">
//             <div className="legend-marker marker-quick"></div>
//             <span>Quick Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-normal"></div>
//             <span>Standard Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-late"></div>
//             <span>Eco Delivery</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Locations;










import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Locations.css';

const Locations = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // New state variables for route optimization
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [distanceMatrix, setDistanceMatrix] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const geocoderRef = useRef(null);
  const activeInfoWindowRef = useRef(null);
  const polylineRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const distanceMatrixServiceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  
  // Load Google Maps API
  useEffect(() => {
    // Function to load Google Maps API
    const loadGoogleMapsAPI = () => {
      // Check if it's already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      // Use callback function name that doesn't conflict
      const callbackName = 'initializeGoogleMapsAPI_' + Math.random().toString(36).substr(2, 9);
      
      // Define the callback function
      window[callbackName] = function() {
        initializeMap();
        // Clean up
        delete window[callbackName];
      };
      
      // Set script attributes with provided API key
      // IMPORTANT: Load only maps and places libraries initially to prevent errors
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDpcqa07rVqok6Cmgz3QwHRNpx7JSxSdKA&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      // Handle script loading errors
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your internet connection or API key.');
        setLoading(false);
      };
      
      // Append script to document
      document.head.appendChild(script);
    };
    
    // Initialize the map once Google Maps is loaded
    const initializeMap = () => {
      try {
        if (!mapContainerRef.current) return;
        
        // Create the map
        const mapOptions = {
          center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
          zoom: 13,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        };
        
        const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
        googleMapRef.current = map;
        
        // Create geocoder
        geocoderRef.current = new window.google.maps.Geocoder();
        
        // Check if DistanceMatrixService is available
        if (window.google.maps.DistanceMatrixService) {
          distanceMatrixServiceRef.current = new window.google.maps.DistanceMatrixService();
        } else {
          console.warn("Distance Matrix Service not available");
        }
        
        // Check if DirectionsService is available
        if (window.google.maps.DirectionsService) {
          directionsServiceRef.current = new window.google.maps.DirectionsService();
        } else {
          console.warn("Directions Service not available");
        }
        
        // Check if DirectionsRenderer is available
        if (window.google.maps.DirectionsRenderer) {
          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true, // Don't show markers as we already have our own
            polylineOptions: {
              strokeColor: '#4285F4',
              strokeWeight: 5,
              strokeOpacity: 0.7
            }
          });
          
          // Attach directions renderer to the map
          directionsRendererRef.current.setMap(map);
        } else {
          console.warn("Directions Renderer not available");
        }
        
        setMapLoaded(true);
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Failed to initialize Google Maps. Please refresh the page.');
        setLoading(false);
      }
    };
    
    loadGoogleMapsAPI();
    
    // Clean up function
    return () => {
      // Clear all markers when component unmounts
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        markersRef.current = [];
      }
      
      // Clear polylines
      clearPolylines();
      
      // Clear directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);
  
  // Safely clear polylines
  const clearPolylines = () => {
    if (Array.isArray(polylineRef.current)) {
      // If it's an array of polylines
      polylineRef.current.forEach(item => {
        if (item && typeof item.setMap === 'function') {
          item.setMap(null);
        }
      });
    } else if (polylineRef.current && typeof polylineRef.current.setMap === 'function') {
      // If it's a single polyline
      polylineRef.current.setMap(null);
    }
    polylineRef.current = null;
  };
  
  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Create a query to fetch orders
        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(ordersRef, orderBy('orderDate', 'desc'));
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              orderDate: data.orderDate instanceof Timestamp 
                ? data.orderDate.toDate() 
                : new Date(data.orderDate),
              deliverySpeeds: getDeliverySpeeds(data)
            };
          });
          
          setOrders(ordersData);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching orders:", err);
          setError("Failed to load orders. Please try again.");
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up orders listener:", err);
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  
  // Extract delivery speeds from order items
  const getDeliverySpeeds = (order) => {
    const speeds = new Set();
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const speed = item.deliverySpeed || 'normal';
        speeds.add(speed);
      });
    } else if (order.deliverySpeed) {
      speeds.add(order.deliverySpeed);
    } else {
      speeds.add('normal');
    }
    
    return Array.from(speeds);
  };
  
  // Filter orders and update map markers when filter or orders change
  useEffect(() => {
    if (!orders.length || !mapLoaded) return;
    
    // Filter orders based on selected filter
    let filtered;
    if (selectedFilter === 'all') {
      filtered = [...orders];
    } else {
      filtered = orders.filter(order => 
        order.deliverySpeeds.includes(selectedFilter)
      );
    }
    
    setFilteredOrders(filtered);
    
    // Update map markers
    updateMapMarkers(filtered);
    
    // Reset selected orders when filter changes
    setSelectedOrders([]);
    clearRoutes();
  }, [orders, selectedFilter, mapLoaded]);
  
  // Update map markers with filtered orders
  const updateMapMarkers = async (filteredOrders) => {
    if (!googleMapRef.current || !geocoderRef.current) {
      console.error("Google Map or Geocoder not initialized");
      setError("Map services not fully loaded. Please refresh the page.");
      return;
    }
    
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];
    }
    
    // Close any open info window
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }
    
    // Clear routes
    clearRoutes();
    
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers = [];
    let geocodingErrorCount = 0;
    let successfulMarkers = 0;
    
    // Show loading state if processing many orders
    if (filteredOrders.length > 10) {
      setLoading(true);
    }
    
    // Process each order
    for (const order of filteredOrders) {
      if (!order.deliveryAddress || typeof order.deliveryAddress !== 'string') {
        console.log(`Skipping order ${order.id}: Missing or invalid delivery address`);
        continue;
      }
      
      try {
        // TEMPORARY WORKAROUND: Use hardcoded coordinates if geocoding API is not enabled
        // Remove this section once Geocoding API is properly enabled
        const useHardcodedCoordinates = true; // Set to false when Geocoding API is enabled
        
        let position;
        if (useHardcodedCoordinates) {
          // Create a random position near Bengaluru center for demonstration
          const baseLat = 12.9716;
          const baseLng = 77.5946;
          const randomOffset = () => (Math.random() - 0.5) * 0.05; // ~5km range
          
          position = new window.google.maps.LatLng(
            baseLat + randomOffset(),
            baseLng + randomOffset()
          );
          
          // Store the position with the order
          order.position = position;
          console.log(`Using fallback coordinates for order ${order.id}`);
        } else {
          // Regular geocoding when API is enabled
          const geocodeResponse = await geocodeAddress(order.deliveryAddress);
          
          if (!geocodeResponse || !geocodeResponse.geometry || !geocodeResponse.geometry.location) {
            console.log(`Geocoding failed for order ${order.id} with address: ${order.deliveryAddress}`);
            geocodingErrorCount++;
            continue;
          }
          
          position = geocodeResponse.geometry.location;
          // Store the position with the order
          order.position = position;
        }
        
        bounds.extend(position);
        
        // Create marker
        const marker = createMarker(order, position);
        if (marker) {
          newMarkers.push(marker);
          successfulMarkers++;
        }
      } catch (err) {
        console.log(`Could not geocode address for order ${order.id}: ${err.message}`);
        geocodingErrorCount++;
        // Continue with next order
      }
    }
    
    // Set new markers
    markersRef.current = newMarkers;
    
    // Adjust map bounds if we have markers
    if (newMarkers.length > 0 && !bounds.isEmpty()) {
      googleMapRef.current.fitBounds(bounds);
      
      // Ensure we don't zoom in too much for single markers
      const listener = window.google.maps.event.addListenerOnce(
        googleMapRef.current, 
        'bounds_changed', 
        () => {
          if (googleMapRef.current.getZoom() > 15) {
            googleMapRef.current.setZoom(15);
          }
        }
      );
    } else {
      // Center on Bengaluru if no markers
      googleMapRef.current.setCenter({ lat: 12.9716, lng: 77.5946 });
      googleMapRef.current.setZoom(12);
    }
    
    setLoading(false);
    
    // Show warning if there were geocoding errors
    if (geocodingErrorCount > 0) {
      console.warn(`${geocodingErrorCount} orders could not be displayed due to geocoding errors`);
      if (geocodingErrorCount === filteredOrders.length) {
        setError("Could not display any locations. Please check if the Geocoding API is enabled for your API key.");
      }
    }
    
    console.log(`Successfully displayed ${successfulMarkers} order locations`);
  };
  
  // Geocode address with better error handling
  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      if (!geocoderRef.current) {
        reject(new Error('Geocoder not initialized'));
        return;
      }
      
      geocoderRef.current.geocode(
        { address: address },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0]);
          } else {
            // More descriptive error based on status
            let errorMessage = `Geocoding failed: ${status}`;
            if (status === 'REQUEST_DENIED') {
              errorMessage = 'Geocoding failed: API key not authorized for Geocoding API';
            } else if (status === 'ZERO_RESULTS') {
              errorMessage = `Geocoding failed: No results found for address "${address}"`;
            }
            reject(new Error(errorMessage));
          }
        }
      );
    });
  };
  
  // Create a marker for an order
  const createMarker = (order, position) => {
    if (!googleMapRef.current || !position) return null;
    
    const speedIcon = getMarkerIcon(order);
    
    // Create marker with proper error handling
    try {
      // Check if SymbolPath is available, otherwise use a default
      const iconPath = window.google.maps.SymbolPath ? 
                       window.google.maps.SymbolPath.CIRCLE : 0;
      
      const marker = new window.google.maps.Marker({
        position: position,
        map: googleMapRef.current,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: iconPath,
          fillColor: speedIcon === 'quick' ? '#FF6B6B' : 
                    speedIcon === 'normal' ? '#4ECDC4' : 
                    speedIcon === 'late' ? '#FFD166' : '#6497b1',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 14 // Increased marker size
        },
        // Fallback in case custom icon fails
        label: speedIcon === 'quick' ? 'Q' : 
              speedIcon === 'normal' ? 'S' : 
              speedIcon === 'late' ? 'E' : ''
      });
      
      // Store order data with marker
      marker.set('order', order);
      
      // Create info window with proper error handling
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(order)
      });
      
      // Add click listener
      marker.addListener('click', () => {
        // Close any open info window
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        
        // Open this info window
        infoWindow.open({
          anchor: marker,
          map: googleMapRef.current
        });
        
        // Store reference to active info window
        activeInfoWindowRef.current = infoWindow;
        
        // Add event listener for copy button after info window is fully loaded
        window.google.maps.event.addListener(infoWindow, 'domready', () => {
          const copyBtn = document.getElementById(`copy-address-btn-${order.id}`);
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              copyAddressToClipboard(order.deliveryAddress, order.id);
            });
          }
          
          // Add event listener for select order button
          const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
          if (selectBtn) {
            selectBtn.addEventListener('click', () => {
              toggleOrderSelection(order);
            });
          }
        });
      });
      
      return marker;
    } catch (err) {
      console.error('Error creating marker:', err);
      return null;
    }
  };
  
  // Toggle order selection for route planning
  const toggleOrderSelection = (order) => {
    setSelectedOrders(prev => {
      // Check if order is already selected
      const isSelected = prev.some(selected => selected.id === order.id);
      
      if (isSelected) {
        // Remove from selection
        const newSelection = prev.filter(selected => selected.id !== order.id);
        
        // Update button text
        const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
        if (selectBtn) {
          selectBtn.textContent = 'Select for Route';
          selectBtn.classList.remove('selected');
        }
        
        // Update markers
        updateMarkerAppearance(order.id, false);
        
        // Clear routes if we have fewer than 2 orders selected
        if (newSelection.length < 2) {
          clearRoutes();
        }
        
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, order];
        
        // Update button text
        const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
        if (selectBtn) {
          selectBtn.textContent = 'Deselect';
          selectBtn.classList.add('selected');
        }
        
        // Update marker appearance
        updateMarkerAppearance(order.id, true);
        
        return newSelection;
      }
    });
  };
  
  // Update marker appearance based on selection
  const updateMarkerAppearance = (orderId, isSelected) => {
    markersRef.current.forEach(marker => {
      const markerOrder = marker.get('order');
      if (markerOrder && markerOrder.id === orderId) {
        if (isSelected) {
          // Highlight selected marker
          marker.setZIndex(1000); // Bring to front
          
          // Add a circle around the marker
          const circle = new window.google.maps.Circle({
            map: googleMapRef.current,
            radius: 100, // meters
            fillColor: '#FFEB3B',
            fillOpacity: 0.3,
            strokeColor: '#FFC107',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            center: marker.getPosition()
          });
          
          marker.set('selectionCircle', circle);
        } else {
          // Remove highlight
          marker.setZIndex(null);
          
          // Remove circle
          const circle = marker.get('selectionCircle');
          if (circle) {
            circle.setMap(null);
            marker.set('selectionCircle', null);
          }
        }
      }
    });
  };
  
  // Clear all route visualizations
  const clearRoutes = () => {
    // Clear polylines safely
    clearPolylines();
    
    // Clear directions if renderer exists
    if (directionsRendererRef.current && typeof directionsRendererRef.current.setDirections === 'function') {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
    
    // Reset route info
    setRouteInfo(null);
    setOptimizedRoute(null);
    setShowRoutes(false);
    setApiError(null);
  };
  
  // Calculate distances between selected orders
  const calculateDistances = () => {
    if (selectedOrders.length < 2) {
      alert('Please select at least two orders to calculate distances.');
      return;
    }
    
    setCalculatingRoute(true);
    setApiError(null);
    
    // Check if Distance Matrix Service is available
    if (!distanceMatrixServiceRef.current) {
      setApiError("Distance Matrix API is not available. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
      setCalculatingRoute(false);
      return;
    }
    
    const origins = selectedOrders.map(order => order.position);
    const destinations = selectedOrders.map(order => order.position);
    
    try {
      distanceMatrixServiceRef.current.getDistanceMatrix({
        origins: origins,
        destinations: destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      }, (response, status) => {
        if (status === 'OK') {
          setDistanceMatrix(response);
          displayDistanceResults(response);
        } else {
          console.error('Distance Matrix failed:', status);
          if (status === 'REQUEST_DENIED') {
            setApiError("Distance Matrix API request was denied. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
          } else {
            setApiError(`Distance calculation failed: ${status}`);
          }
        }
        setCalculatingRoute(false);
      });
    } catch (error) {
      console.error('Error calling Distance Matrix service:', error);
      setApiError(`Error: ${error.message}`);
      setCalculatingRoute(false);
    }
  };
  
  // Display distance results
  const displayDistanceResults = (response) => {
    const distances = [];
    
    for (let i = 0; i < selectedOrders.length; i++) {
      for (let j = 0; j < selectedOrders.length; j++) {
        if (i !== j) { // Skip same order
          const element = response.rows[i].elements[j];
          if (element.status === 'OK') {
            const distance = element.distance.text;
            const duration = element.duration.text;
            
            distances.push({
              from: selectedOrders[i],
              to: selectedOrders[j],
              distance: distance,
              duration: duration
            });
          }
        }
      }
    }
    
    setRouteInfo({
      distances: distances,
      totalSelected: selectedOrders.length
    });
    
    setShowRoutes(true);
    
    // Draw lines between selected orders
    drawRouteLines(selectedOrders);
  };
  
  // Draw straight lines between selected orders
  const drawRouteLines = (routeOrders) => {
    if (routeOrders.length < 2) return;
    
    // Clear existing polylines
    clearPolylines();
    
    const points = routeOrders.map(order => order.position);
    
    try {
      // Create polyline
      const polyline = new window.google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
      
      polyline.setMap(googleMapRef.current);
      polylineRef.current = polyline;
    } catch (error) {
      console.error('Error creating polyline:', error);
      setApiError(`Failed to draw route lines: ${error.message}`);
    }
  };
  
  // Calculate optimized route
  const calculateOptimizedRoute = () => {
    if (selectedOrders.length < 2) {
      alert('Please select at least two orders to optimize a route.');
      return;
    }
    
    setCalculatingRoute(true);
    setApiError(null);
    
    // Simple nearest neighbor algorithm for route optimization
    // For a real application, consider more advanced algorithms
    
    // Check if we have the distance matrix calculated
    if (!distanceMatrix) {
      // Calculate distances first if not already done
      if (!distanceMatrixServiceRef.current) {
        setApiError("Distance Matrix API is not available. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
        setCalculatingRoute(false);
        return;
      }
      
      const origins = selectedOrders.map(order => order.position);
      const destinations = selectedOrders.map(order => order.position);
      
      try {
        distanceMatrixServiceRef.current.getDistanceMatrix({
          origins: origins,
          destinations: destinations,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        }, (response, status) => {
          if (status === 'OK') {
            setDistanceMatrix(response);
            const optimized = findOptimizedRoute(selectedOrders, response);
            
            // Show the optimized route
            if (optimized) {
              setOptimizedRoute(optimized);
              
              // Calculate and display the actual route using Directions Service
              displayOptimizedRoute(optimized.route);
            }
          } else {
            console.error('Distance Matrix failed:', status);
            if (status === 'REQUEST_DENIED') {
              setApiError("Distance Matrix API request was denied. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
            } else {
              setApiError(`Distance calculation failed: ${status}`);
            }
            setCalculatingRoute(false);
          }
        });
      } catch (error) {
        console.error('Error calling Distance Matrix service:', error);
        setApiError(`Error: ${error.message}`);
        setCalculatingRoute(false);
      }
    } else {
      // Use existing distance matrix
      const optimized = findOptimizedRoute(selectedOrders, distanceMatrix);
      
      // Show the optimized route
      if (optimized) {
        setOptimizedRoute(optimized);
        
        // Calculate and display the actual route using Directions Service
        displayOptimizedRoute(optimized.route);
      } else {
        setCalculatingRoute(false);
      }
    }
  };
  
  // Find optimized route using a simple nearest neighbor algorithm
  const findOptimizedRoute = (orders, distMatrix) => {
    if (!distMatrix || orders.length < 2) return null;
    
    // We'll start from the first selected order
    // In a real app, you might want to start from a warehouse or distribution center
    const startOrder = orders[0];
    let remainingOrders = orders.slice(1);
    let route = [startOrder];
    let totalDistance = 0;
    let totalDuration = 0;
    
    let currentOrder = startOrder;
    
    // Find the closest order each time
    while (remainingOrders.length > 0) {
      const currentIndex = orders.findIndex(o => o.id === currentOrder.id);
      
      let minDistance = Number.MAX_VALUE;
      let closestOrderIndex = -1;
      
      for (let i = 0; i < remainingOrders.length; i++) {
        const remainingIndex = orders.findIndex(o => o.id === remainingOrders[i].id);
        
        // Get distance from current to this order
        const element = distMatrix.rows[currentIndex].elements[remainingIndex];
        
        if (element.status === 'OK') {
          const distance = element.distance.value; // in meters
          
          if (distance < minDistance) {
            minDistance = distance;
            closestOrderIndex = i;
          }
        }
      }
      
      if (closestOrderIndex >= 0) {
        const nextOrder = remainingOrders[closestOrderIndex];
        route.push(nextOrder);
        
        // Add distance and duration
        const nextIndex = orders.findIndex(o => o.id === nextOrder.id);
        const element = distMatrix.rows[currentIndex].elements[nextIndex];
        
        if (element.status === 'OK') {
          totalDistance += element.distance.value;
          totalDuration += element.duration.value;
        }
        
        // Set as current and remove from remaining
        currentOrder = nextOrder;
        remainingOrders = remainingOrders.filter(o => o.id !== nextOrder.id);
      } else {
        break;
      }
    }
    
    return {
      route: route,
      totalDistanceMeters: totalDistance,
      totalDistanceText: formatDistance(totalDistance),
      totalDurationSeconds: totalDuration,
      totalDurationText: formatDuration(totalDuration)
    };
  };
  
  // Format distance in meters to a readable format
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };
  
  // Format duration in seconds to a readable format
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };
  
  // Display optimized route using Google Directions Service
  const displayOptimizedRoute = (routeOrders) => {
    if (routeOrders.length < 2) {
      setCalculatingRoute(false);
      return;
    }
    
    // Check if Directions Service is available
    if (!directionsServiceRef.current || !directionsRendererRef.current) {
      setApiError("Directions API is not available. This feature requires the Directions API to be enabled for your Google Maps API key.");
      setCalculatingRoute(false);
      
      // Fall back to simple polyline
      drawRouteLines(routeOrders);
      return;
    }
    
    // Generate waypoints for the route
    // Skip first and last as they will be origin and destination
    const waypoints = routeOrders.slice(1, routeOrders.length - 1).map(order => ({
      location: order.position,
      stopover: true
    }));
    
    const origin = routeOrders[0].position;
    const destination = routeOrders[routeOrders.length - 1].position;
    
    try {
      directionsServiceRef.current.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: false, // We've already optimized the order
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(response);
          
          // Calculate actual route stats
          let totalDistance = 0;
          let totalDuration = 0;
          
          response.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });
          
          // Update optimized route with actual route data
          setOptimizedRoute(prev => ({
            ...prev,
            actualDistanceMeters: totalDistance,
            actualDistanceText: formatDistance(totalDistance),
            actualDurationSeconds: totalDuration,
            actualDurationText: formatDuration(totalDuration)
          }));
        } else {
          console.error('Directions request failed:', status);
          
          if (status === 'REQUEST_DENIED') {
            setApiError("Directions API request was denied. This feature requires the Directions API to be enabled for your Google Maps API key.");
          } else {
            setApiError(`Failed to display route: ${status}`);
          }
          
          // Fall back to simple polyline
          drawRouteLines(routeOrders);
        }
        
        setCalculatingRoute(false);
      });
    } catch (error) {
      console.error('Error calling Directions service:', error);
      setApiError(`Error: ${error.message}`);
      
      // Fall back to simple polyline
      drawRouteLines(routeOrders);
      setCalculatingRoute(false);
    }
  };
  
  // Generate connections for delivery optimization
  const generateConnections = () => {
    if (filteredOrders.length < 2) {
      alert('Not enough orders to generate connections.');
      return;
    }
    
    setCalculatingRoute(true);
    setApiError(null);
    
    // Group orders by delivery speed
    const groupedOrders = {
      quick: filteredOrders.filter(order => order.deliverySpeeds.includes('quick')),
      normal: filteredOrders.filter(order => order.deliverySpeeds.includes('normal')),
      late: filteredOrders.filter(order => order.deliverySpeeds.includes('late'))
    };
    
    // Clear existing routes
    clearRoutes();
    
    // Generate a basic spanning tree for each group
    // In a real app, you might want to use a more sophisticated algorithm
    const currentDeliveryType = selectedFilter === 'all' ? 'normal' : selectedFilter;
    const ordersToConnect = groupedOrders[currentDeliveryType] || [];
    
    if (ordersToConnect.length < 2) {
      alert(`Not enough ${currentDeliveryType} orders to generate connections.`);
      setCalculatingRoute(false);
      return;
    }
    
    // Create a simple spanning tree using nearest neighbor
    const connections = [];
    const visited = new Set();
    
    // Start with the first order
    visited.add(ordersToConnect[0].id);
    
    while (visited.size < ordersToConnect.length) {
      let minDistance = Number.MAX_VALUE;
      let bestConnection = null;
      
      // For each visited node, find the closest unvisited node
      for (const visitedId of visited) {
        const visitedOrder = ordersToConnect.find(order => order.id === visitedId);
        
        for (const order of ordersToConnect) {
          if (!visited.has(order.id)) {
            const distance = calculateHaversineDistance(
              visitedOrder.position.lat(), 
              visitedOrder.position.lng(),
              order.position.lat(),
              order.position.lng()
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              bestConnection = {
                from: visitedOrder,
                to: order,
                distance: distance
              };
            }
          }
        }
      }
      
      if (bestConnection) {
        connections.push(bestConnection);
        visited.add(bestConnection.to.id);
      } else {
        break;
      }
    }
    
    // Display connections
    displayConnections(connections, currentDeliveryType);
    
    setCalculatingRoute(false);
  };
  
  // Calculate distance between two points using Haversine formula
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  };
  
  // Display connections between orders
  const displayConnections = (connections, deliveryType) => {
    if (!connections || connections.length === 0) {
      return;
    }
    
    // Clear any existing polylines
    clearPolylines();
    
    // Store all created visual elements to clean up later
    const visualElements = [];
    
    // Create polylines for each connection
    connections.forEach(connection => {
      try {
        const polyline = new window.google.maps.Polyline({
          path: [connection.from.position, connection.to.position],
          geodesic: true,
          strokeColor: 
            deliveryType === 'quick' ? '#FF6B6B' : 
            deliveryType === 'normal' ? '#4ECDC4' : 
            '#FFD166',
          strokeOpacity: 0.7,
          strokeWeight: 3
        });
        
        polyline.setMap(googleMapRef.current);
        visualElements.push(polyline);
        
        // Add distance label
        const midPoint = new window.google.maps.LatLng(
          (connection.from.position.lat() + connection.to.position.lat()) / 2,
          (connection.from.position.lng() + connection.to.position.lng()) / 2
        );
        
        const distanceInKm = (connection.distance / 1000).toFixed(1);
        
        try {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="distance-label">${distanceInKm} km</div>`,
            position: midPoint,
            pixelOffset: new window.google.maps.Size(0, -10)
          });
          
          infoWindow.open(googleMapRef.current);
          visualElements.push(infoWindow);
        } catch (error) {
          console.error('Error creating distance label:', error);
        }
      } catch (error) {
        console.error('Error creating connection line:', error);
      }
    });
    
    // Store references to clean up later
    polylineRef.current = visualElements;
    
    // Calculate total distance
    const totalDistance = connections.reduce((sum, conn) => sum + conn.distance, 0);
    const totalKm = (totalDistance / 1000).toFixed(1);
    
    setRouteInfo({
      connections: connections,
      totalConnections: connections.length,
      totalDistance: totalKm,
      deliveryType: deliveryType
    });
    
    setShowRoutes(true);
  };
  
  // Function to copy address to clipboard
  const copyAddressToClipboard = (address, orderId) => {
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        console.log('Address copied to clipboard');
        // Show visual feedback
        const copyBtn = document.getElementById(`copy-address-btn-${orderId}`);
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ Copied!';
          copyBtn.classList.add('copied');
          
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Create info window content
  const createInfoWindowContent = (order) => {
    return `
      <div class="info-window">
        <h3>Order Details</h3>
        <div class="info-detail">
          <span class="info-label">Order ID:</span>
          <span class="info-value">${order.id ? order.id.substring(0, 8) + '...' : 'N/A'}</span>
        </div>
        <div class="info-detail">
          <span class="info-label">Customer:</span>
          <span class="info-value">${order.customerName || 'Guest'}</span>
        </div>
        <div class="info-detail address-detail">
          <span class="info-label">Address:</span>
          <div class="address-container">
            <span class="info-value address-value">${order.deliveryAddress || 'N/A'}</span>
            <button id="copy-address-btn-${order.id}" class="copy-address-btn" title="Copy address to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
        <div class="info-detail">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDate(order.orderDate)}</span>
        </div>
        ${order.totalAmount ? `
        <div class="info-detail">
          <span class="info-label">Amount:</span>
          <span class="info-value">₹${formatAmount(order.totalAmount)}</span>
        </div>
        ` : ''}
        <div class="info-detail">
          <span class="info-label">Status:</span>
          <span class="status-badge ${getStatusClass(getMarkerLabel(order))}">
            ${getMarkerLabel(order)}
          </span>
        </div>
        <div class="info-actions">
          <button id="select-order-btn-${order.id}" class="select-order-btn">
            Select for Route
          </button>
        </div>
        <style>
          .info-window {
            font-family: Arial, sans-serif;
            padding: 5px;
            min-width: 250px;
          }
          .info-detail {
            margin-bottom: 8px;
            display: flex;
          }
          .address-detail {
            align-items: flex-start;
          }
          .info-label {
            font-weight: bold;
            width: 80px;
            flex-shrink: 0;
          }
          .address-container {
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .address-value {
            margin-bottom: 5px;
            word-break: break-all;
          }
          .copy-address-btn {
            display: flex;
            align-items: center;
            padding: 4px 8px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            align-self: flex-start;
          }
          .copy-address-btn svg {
            margin-right: 4px;
          }
          .copy-address-btn:hover {
            background-color: #e0e0e0;
          }
          .copy-address-btn.copied {
            background-color: #4CAF50;
            color: white;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: white;
            background-color: #888;
          }
          .status-pending { background-color: #FFC107; }
          .status-processing { background-color: #2196F3; }
          .status-shipped { background-color: #673AB7; }
          .status-out-for-delivery { background-color: #FF9800; }
          .status-delivered { background-color: #4CAF50; }
          .status-cancelled { background-color: #F44336; }
          .info-actions {
            margin-top: 10px;
            display: flex;
            justify-content: center;
          }
          .select-order-btn {
            padding: 6px 12px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }
          .select-order-btn:hover {
            background-color: #0b7dda;
          }
          .select-order-btn.selected {
            background-color: #F44336;
          }
        </style>
      </div>
    `;
  };
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
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
  
  // Format amount for display
  const formatAmount = (amount) => {
    if (typeof amount !== 'number') return '0.00';
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Shipped': return 'status-shipped';
      case 'Out for Delivery': return 'status-out-for-delivery';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  // Get marker icon based on delivery speed
  const getMarkerIcon = (order) => {
    // Priority: quick > normal > late
    if (!order || !order.deliverySpeeds) return 'normal';
    
    const speeds = order.deliverySpeeds;
    if (speeds.includes('quick')) return 'quick';
    if (speeds.includes('normal')) return 'normal';
    if (speeds.includes('late')) return 'late';
    return 'normal';
  };
  
  // Get marker label from status
  const getMarkerLabel = (order) => {
    if (!order) return 'Pending';
    
    // Get the order status based on priority
    let status = order.status || 'Pending';
    
    if (order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
      // For simplicity, get the latest status from history
      const sortedHistory = [...order.statusHistory].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
      });
      
      if (sortedHistory[0] && sortedHistory[0].status) {
        status = sortedHistory[0].status;
      }
    }
    
    return status;
  };
  
  // Get delivery speed info
  const getDeliverySpeedInfo = (speed) => {
    switch (speed) {
      case 'quick': return { name: 'Quick', icon: '⚡', class: 'marker-quick' };
      case 'express': return { name: 'Express', icon: '🚀', class: 'marker-express' };
      case 'normal': return { name: 'Standard', icon: '🚚', class: 'marker-normal' };
      case 'late': return { name: 'Eco', icon: '🐌', class: 'marker-late' };
      default: return { name: 'Standard', icon: '📦', class: 'marker-normal' };
    }
  };
  
  return (
    <div className="locations-container">
      <h1>Order Locations</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Delivery Speed:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <span className="filter-icon">📦</span> All Orders
            </button>
            <button 
              className={`filter-btn quick-btn ${selectedFilter === 'quick' ? 'active' : ''}`}
              onClick={() => handleFilterChange('quick')}
            >
              <span className="filter-icon">⚡</span> Quick
            </button>
            <button 
              className={`filter-btn normal-btn ${selectedFilter === 'normal' ? 'active' : ''}`}
              onClick={() => handleFilterChange('normal')}
            >
              <span className="filter-icon">🚚</span> Standard
            </button>
            <button 
              className={`filter-btn late-btn ${selectedFilter === 'late' ? 'active' : ''}`}
              onClick={() => handleFilterChange('late')}
            >
              <span className="filter-icon">🐌</span> Eco
            </button>
          </div>
        </div>
        
        <div className="order-counts">
          <span className="count-label">Showing:</span>
          <span className="count-value">{filteredOrders.length} orders</span>
          <span className="selected-count">
            {selectedOrders.length > 0 && `(${selectedOrders.length} selected)`}
          </span>
        </div>
      </div>
      
      {/* Route Planning Tools */}
      <div className="route-planning-tools">
        <div className="tools-header">
          <h3>Route Planning Tools</h3>
          {selectedOrders.length > 0 && (
            <button 
              className="clear-selection-btn"
              onClick={() => {
                // Clear selected orders
                selectedOrders.forEach(order => {
                  updateMarkerAppearance(order.id, false);
                });
                setSelectedOrders([]);
                clearRoutes();
              }}
            >
              Clear Selection
            </button>
          )}
        </div>
        
        <div className="tools-buttons">
          <button 
            className="tool-btn calculate-distances-btn"
            onClick={calculateDistances}
            disabled={selectedOrders.length < 2 || calculatingRoute}
          >
            <span className="tool-icon">📏</span> Calculate Distances
          </button>
          {/* <button 
            className="tool-btn optimize-route-btn"
            onClick={calculateOptimizedRoute}
            disabled={selectedOrders.length < 2 || calculatingRoute}
          >
            <span className="tool-icon">🔄</span> Optimize Route
          </button> */}
          <button 
            className="tool-btn generate-connections-btn"
            onClick={generateConnections}
            disabled={filteredOrders.length < 2 || calculatingRoute}
          >
            <span className="tool-icon">🔗</span> Suggest Connections
          </button>
        </div>
        
        {calculatingRoute && (
          <div className="calculating-indicator">
            <div className="spinner small"></div>
            <span>Calculating...</span>
          </div>
        )}
        
        {/* API Error Message */}
        {apiError && (
          <div className="api-error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <div className="error-title">API Error</div>
              <div className="error-details">{apiError}</div>
              <div className="error-help">
                To fix this issue, please enable the required APIs in your 
                <a href="https://console.cloud.google.com/apis/dashboard" target="_blank" rel="noopener noreferrer">
                  Google Cloud Console
                </a>. 
                You need to enable: Directions API, Distance Matrix API, and Geocoding API.
              </div>
            </div>
          </div>
        )}
        
        {/* Route Information */}
        {showRoutes && routeInfo && !apiError && (
          <div className="route-info-panel">
            {routeInfo.distances && (
              <div className="distances-info">
                <h4>Distance Matrix</h4>
                <div className="distances-table-container">
                  <table className="distances-table">
                    <thead>
                      <tr>
                        <th>From Order</th>
                        <th>To Order</th>
                        <th>Distance</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeInfo.distances.slice(0, 10).map((dist, index) => (
                        <tr key={index}>
                          <td>{dist.from.id.substring(0, 6)}...</td>
                          <td>{dist.to.id.substring(0, 6)}...</td>
                          <td>{dist.distance}</td>
                          <td>{dist.duration}</td>
                        </tr>
                      ))}
                      {routeInfo.distances.length > 10 && (
                        <tr>
                          <td colSpan="4" className="more-distances">
                            {routeInfo.distances.length - 10} more distances...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {optimizedRoute && (
              <div className="optimized-route-info">
                <h4>Optimized Route</h4>
                <div className="route-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Distance:</span>
                    <span className="stat-value">{optimizedRoute.actualDistanceText || optimizedRoute.totalDistanceText}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Estimated Time:</span>
                    <span className="stat-value">{optimizedRoute.actualDurationText || optimizedRoute.totalDurationText}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Order Sequence:</span>
                    <div className="route-sequence">
                      {optimizedRoute.route.map((order, index) => (
                        <div key={index} className="sequence-item">
                          <span className="sequence-number">{index + 1}</span>
                          <span className="sequence-id">{order.id.substring(0, 6)}...</span>
                          {index < optimizedRoute.route.length - 1 && (
                            <span className="sequence-arrow">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {routeInfo.connections && (
              <div className="connections-info">
                <h4>
                  {getDeliverySpeedInfo(routeInfo.deliveryType).icon} 
                  {getDeliverySpeedInfo(routeInfo.deliveryType).name} Delivery Connections
                </h4>
                <div className="connections-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Connections:</span>
                    <span className="stat-value">{routeInfo.totalConnections}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Distance:</span>
                    <span className="stat-value">{routeInfo.totalDistance} km</span>
                  </div>
                </div>
                <p className="connections-note">
                  Lines show suggested connections between orders for efficient delivery.
                  Distances are shown directly on the map.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="map-container">
        {loading ? (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading map and order data...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div 
            ref={mapContainerRef} 
            className="google-map"
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          ></div>
        )}
      </div>
      
      <div className="map-legend">
        <h3>Map Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker marker-quick"></div>
            <span>Quick Delivery</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker marker-normal"></div>
            <span>Standard Delivery</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker marker-late"></div>
            <span>Eco Delivery</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker selected-marker"></div>
            <span>Selected Order</span>
          </div>
          <div className="legend-item">
            <div className="legend-line route-line"></div>
            <span>Route Line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;


// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   where, 
//   Timestamp,
//   onSnapshot
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Locations.css';

// const Locations = () => {
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
  
//   // State variables for route optimization
//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [showRoutes, setShowRoutes] = useState(false);
//   const [routeInfo, setRouteInfo] = useState(null);
//   const [optimizedRoute, setOptimizedRoute] = useState(null);
//   const [distanceMatrix, setDistanceMatrix] = useState(null);
//   const [calculatingRoute, setCalculatingRoute] = useState(false);
//   const [apiError, setApiError] = useState(null);
  
//   const mapContainerRef = useRef(null);
//   const googleMapRef = useRef(null);
//   const markersRef = useRef([]);
//   const geocoderRef = useRef(null);
//   const activeInfoWindowRef = useRef(null);
//   const polylineRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const distanceMatrixServiceRef = useRef(null);
//   const directionsServiceRef = useRef(null);
  
//   // Load Google Maps API
//   useEffect(() => {
//     // Function to load Google Maps API
//     const loadGoogleMapsAPI = () => {
//       // Check if it's already loaded
//       if (window.google && window.google.maps) {
//         initializeMap();
//         return;
//       }

//       // Add error handler for API loading errors - this catches authentication failures
//       window.gm_authFailure = function() {
//         console.error('Google Maps authentication failed - API key may be restricted');
//         setError('Google Maps API Key Error: Your API key may be invalid, restricted, or has billing issues. Please check your Google Cloud Console.');
//         setLoading(false);
//       };

//       // Create script element
//       const script = document.createElement('script');
//       // Use callback function name that doesn't conflict
//       const callbackName = 'initializeGoogleMapsAPI_' + Math.random().toString(36).substr(2, 9);
      
//       // Define the callback function
//       window[callbackName] = function() {
//         console.log('Google Maps API loaded successfully');
//         initializeMap();
//         // Clean up
//         delete window[callbackName];
//       };
      
//       // Set script attributes with API key
//       // IMPORTANT: Load ONLY the Maps JavaScript API initially
//       // Don't load any additional libraries to keep it simple
//       // const YOUR_API_KEY = 'AIzaSyAOFbpbOwdren9NlNtWvRVyf4DsDf9-2H4'; // Using the key you provided
      
//       // Include loading of the marker library to use Advanced Markers
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDpcqa07rVqok6Cmgz3QwHRNpx7JSxSdKA&libraries=places&callback=${callbackName}`;
//       script.async = true;
//       script.defer = true;
      
//       // Handle script loading errors
//       script.onerror = () => {
//         console.error('Google Maps script failed to load');
//         setError('Failed to load Google Maps API. Please check your API key restrictions and billing status in Google Cloud Console.');
//         setLoading(false);
//       };
      
//       // Append script to document
//       document.head.appendChild(script);
//     };
    
//     loadGoogleMapsAPI();
    
//     // Clean up function
//     return () => {
//       // Clear all markers when component unmounts
//       if (markersRef.current && markersRef.current.length > 0) {
//         markersRef.current.forEach(marker => {
//           if (marker && typeof marker.setMap === 'function') {
//             marker.setMap(null);
//           }
//         });
//         markersRef.current = [];
//       }
      
//       // Clear polylines
//       clearPolylines();
      
//       // Clear directions
//       if (directionsRendererRef.current && typeof directionsRendererRef.current.setMap === 'function') {
//         directionsRendererRef.current.setMap(null);
//       }
//     };
//   }, []);
    
//   // Initialize the map once Google Maps is loaded
//     const initializeMap = () => {
//       try {
//         if (!mapContainerRef.current) {
//           console.error('Map container reference is not available');
//           return;
//         }
        
//         console.log('Initializing Google Map...');
        
//         // Create a simple map first, before trying to use additional features
//         const mapOptions = {
//           center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru
//           zoom: 13,
//           streetViewControl: false,
//           mapTypeControl: false,
//           fullscreenControl: true
//         };
        
//         // Create the basic map
//         const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
//         googleMapRef.current = map;
        
//         console.log('Basic map initialized successfully');
        
//         // Now try to load additional services one by one
//         try {
//           // Try to create geocoder
//           if (window.google.maps.Geocoder) {
//             geocoderRef.current = new window.google.maps.Geocoder();
//             console.log('Geocoder initialized successfully');
//           } else {
//             console.warn("Geocoder not available - Geocoding API may not be enabled");
//           }
//         } catch (err) {
//           console.error('Error initializing Geocoder:', err);
//         }
        
//         // Try to initialize Distance Matrix Service
//         try {
//           if (window.google.maps.DistanceMatrixService) {
//             distanceMatrixServiceRef.current = new window.google.maps.DistanceMatrixService();
//             console.log('Distance Matrix Service initialized successfully');
//           } else {
//             console.warn("Distance Matrix Service not available - Distance Matrix API may not be enabled");
//           }
//         } catch (err) {
//           console.error('Error initializing Distance Matrix Service:', err);
//         }
        
//         // Try to initialize Directions Service
//         try {
//           if (window.google.maps.DirectionsService) {
//             directionsServiceRef.current = new window.google.maps.DirectionsService();
//             console.log('Directions Service initialized successfully');
            
//             // Only set up renderer if service is available
//             if (window.google.maps.DirectionsRenderer) {
//               directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
//                 suppressMarkers: true,
//                 polylineOptions: {
//                   strokeColor: '#4285F4',
//                   strokeWeight: 5,
//                   strokeOpacity: 0.7
//                 }
//               });
              
//               directionsRendererRef.current.setMap(map);
//               console.log('Directions Renderer initialized successfully');
//             }
//           } else {
//             console.warn("Directions Service not available - Directions API may not be enabled");
//           }
//         } catch (err) {
//           console.error('Error initializing Directions Service:', err);
//         }
        
//         // Show a marker on Bengaluru to verify the map is working
//         try {
//           const bengaluruMarker = new window.google.maps.Marker({
//             position: { lat: 12.9716, lng: 77.5946 },
//             map: map,
//             title: 'Bengaluru'
//           });
//           console.log('Test marker placed successfully');
//         } catch (err) {
//           console.error('Error placing test marker:', err);
//         }
        
//         setMapLoaded(true);
//         setLoading(false);
//         console.log('Map initialization complete');
        
//       } catch (err) {
//         console.error('Error in map initialization:', err);
//         setError(`Failed to initialize Google Maps: ${err.message}. Please check console for details.`);
//         setLoading(false);
//       }
//     };
    
//   // (No duplicate useEffect or cleanup here; this block should be removed)
  
//   // Safely clear polylines
//   const clearPolylines = () => {
//     if (Array.isArray(polylineRef.current)) {
//       // If it's an array of polylines
//       polylineRef.current.forEach(item => {
//         if (item && typeof item.setMap === 'function') {
//           item.setMap(null);
//         }
//       });
//     } else if (polylineRef.current && typeof polylineRef.current.setMap === 'function') {
//       // If it's a single polyline
//       polylineRef.current.setMap(null);
//     }
//     polylineRef.current = null;
//   };
  
//   // Fetch orders from Firestore
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         // Create a query to fetch orders
//         const ordersRef = collection(db, 'orders');
//         const ordersQuery = query(ordersRef, orderBy('orderDate', 'desc'));
        
//         // Set up real-time listener
//         const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
//           const ordersData = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               ...data,
//               orderDate: data.orderDate instanceof Timestamp 
//                 ? data.orderDate.toDate() 
//                 : new Date(data.orderDate),
//               deliverySpeeds: getDeliverySpeeds(data)
//             };
//           });
          
//           setOrders(ordersData);
//           setLoading(false);
//         }, (err) => {
//           console.error("Error fetching orders:", err);
//           setError("Failed to load orders. Please try again.");
//           setLoading(false);
//         });
        
//         return () => unsubscribe();
//       } catch (err) {
//         console.error("Error setting up orders listener:", err);
//         setError("Failed to load orders. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
  
//   // Extract delivery speeds from order items
//   const getDeliverySpeeds = (order) => {
//     const speeds = new Set();
    
//     if (order.items && Array.isArray(order.items)) {
//       order.items.forEach(item => {
//         const speed = item.deliverySpeed || 'normal';
//         speeds.add(speed);
//       });
//     } else if (order.deliverySpeed) {
//       speeds.add(order.deliverySpeed);
//     } else {
//       speeds.add('normal');
//     }
    
//     return Array.from(speeds);
//   };
  
//   // Filter orders and update map markers when filter or orders change
//   useEffect(() => {
//     if (!orders.length || !mapLoaded) return;
    
//     // Filter orders based on selected filter
//     let filtered;
//     if (selectedFilter === 'all') {
//       filtered = [...orders];
//     } else {
//       filtered = orders.filter(order => 
//         order.deliverySpeeds.includes(selectedFilter)
//       );
//     }
    
//     setFilteredOrders(filtered);
    
//     // Update map markers
//     updateMapMarkers(filtered);
    
//     // Reset selected orders when filter changes
//     setSelectedOrders([]);
//     clearRoutes();
//   }, [orders, selectedFilter, mapLoaded]);
  
//   // Update map markers with filtered orders
//   const updateMapMarkers = async (filteredOrders) => {
//     if (!googleMapRef.current) {
//       console.error("Google Map not initialized");
//       setError("Map services not fully loaded. Please refresh the page.");
//       return;
//     }
    
//     // Clear existing markers
//     if (markersRef.current.length > 0) {
//       markersRef.current.forEach(marker => {
//         if (marker) marker.setMap(null);
//       });
//       markersRef.current = [];
//     }
    
//     // Close any open info window
//     if (activeInfoWindowRef.current) {
//       activeInfoWindowRef.current.close();
//       activeInfoWindowRef.current = null;
//     }
    
//     // Clear routes
//     clearRoutes();
    
//     const bounds = new window.google.maps.LatLngBounds();
//     const newMarkers = [];
//     let successfulMarkers = 0;
    
//     // Show loading state if processing many orders
//     if (filteredOrders.length > 10) {
//       setLoading(true);
//     }
    
//     // Use simple random positions for Bengaluru
//     // This avoids relying on the Geocoding API initially
//     console.log(`Creating ${filteredOrders.length} markers with random positions`);
    
//     // Process each order
//     for (const order of filteredOrders) {
//       if (!order) continue;
      
//       try {
//         // Create a random position near Bengaluru center for demonstration
//         const baseLat = 12.9716;
//         const baseLng = 77.5946;
//         const randomOffset = () => (Math.random() - 0.5) * 0.05; // ~5km range
        
//         const position = new window.google.maps.LatLng(
//           baseLat + randomOffset(),
//           baseLng + randomOffset()
//         );
        
//         // Store the position with the order
//         order.position = position;
        
//         bounds.extend(position);
        
//         // Create marker
//         const marker = createMarker(order, position);
//         if (marker) {
//           newMarkers.push(marker);
//           successfulMarkers++;
//         }
//       } catch (err) {
//         console.error(`Could not create marker for order ${order.id}:`, err);
//       }
//     }
    
//     // Set new markers
//     markersRef.current = newMarkers;
    
//     // Adjust map bounds if we have markers
//     if (newMarkers.length > 0 && !bounds.isEmpty()) {
//       googleMapRef.current.fitBounds(bounds);
      
//       // Ensure we don't zoom in too much for single markers
//       const listener = window.google.maps.event.addListenerOnce(
//         googleMapRef.current, 
//         'bounds_changed', 
//         () => {
//           if (googleMapRef.current.getZoom() > 15) {
//             googleMapRef.current.setZoom(15);
//           }
//         }
//       );
//     } else {
//       // Center on Bengaluru if no markers
//       googleMapRef.current.setCenter({ lat: 12.9716, lng: 77.5946 });
//       googleMapRef.current.setZoom(12);
//     }
    
//     setLoading(false);
    
//     console.log(`Successfully displayed ${successfulMarkers} order locations`);
//   };
  
//   // Geocode address with better error handling
//   const geocodeAddress = (address) => {
//     return new Promise((resolve, reject) => {
//       if (!geocoderRef.current) {
//         reject(new Error('Geocoder not initialized'));
//         return;
//       }
      
//       geocoderRef.current.geocode(
//         { address: address },
//         (results, status) => {
//           if (status === 'OK' && results && results.length > 0) {
//             resolve(results[0]);
//           } else {
//             // More descriptive error based on status
//             let errorMessage = `Geocoding failed: ${status}`;
//             if (status === 'REQUEST_DENIED') {
//               errorMessage = 'Geocoding failed: API key not authorized for Geocoding API';
//             } else if (status === 'ZERO_RESULTS') {
//               errorMessage = `Geocoding failed: No results found for address "${address}"`;
//             }
//             reject(new Error(errorMessage));
//           }
//         }
//       );
//     });
//   };
  
//   // Create a marker for an order
//   const createMarker = (order, position) => {
//     if (!googleMapRef.current || !position) return null;
    
//     try {
//       // Check if Advanced Markers are available
//       if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
//         // Use new Advanced Marker API (recommended by Google)
//         try {
//           const advancedMarkerElement = new window.google.maps.marker.AdvancedMarkerElement({
//             position: position,
//             map: googleMapRef.current,
//             title: order.id || 'Order'
//           });
          
//           // Store order data with marker
//           advancedMarkerElement.order = order;
          
//           // Add click event listener
//           advancedMarkerElement.addListener('click', () => {
//             handleMarkerClick(advancedMarkerElement, order);
//           });
          
//           return advancedMarkerElement;
//         } catch (advMarkerErr) {
//           console.error('Error creating advanced marker, falling back to standard marker:', advMarkerErr);
//           // Fall through to standard marker
//         }
//       }
      
//       // Fallback to standard marker
//       const speedIcon = getMarkerIcon(order);
//       const marker = new window.google.maps.Marker({
//         position: position,
//         map: googleMapRef.current,
//         title: order.id || 'Order',
//         label: speedIcon === 'quick' ? 'Q' : 
//               speedIcon === 'normal' ? 'S' : 
//               speedIcon === 'late' ? 'E' : ''
//       });
      
//       // Store order data with marker
//       marker.set('order', order);
      
//       // Add click listener
//       marker.addListener('click', () => {
//         handleMarkerClick(marker, order);
//       });
      
//       return marker;
//     } catch (err) {
//       console.error('Error creating marker:', err);
//       return null;
//     }
//   };
  
//   // Handle marker click event
//   const handleMarkerClick = (marker, order) => {
//     // Close any open info window
//     if (activeInfoWindowRef.current) {
//       activeInfoWindowRef.current.close();
//     }
    
//     // Create simple info window content
//     const infoContent = `
//       <div style="padding: 10px; min-width: 200px;">
//         <h3>Order ${order.id ? order.id.substring(0, 8) + '...' : 'Details'}</h3>
//         <p>Customer: ${order.customerName || 'Guest'}</p>
//         <button id="select-order-btn-${order.id}" style="background: #2196F3; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
//           Select for Route
//         </button>
//       </div>
//     `;
    
//     // Create info window
//     const infoWindow = new window.google.maps.InfoWindow({
//       content: infoContent
//     });
    
//     // Open this info window
//     infoWindow.open({
//       anchor: marker,
//       map: googleMapRef.current
//     });
    
//     // Store reference to active info window
//     activeInfoWindowRef.current = infoWindow;
    
//     // Add event listener for select order button after info window is fully loaded
//     window.google.maps.event.addListener(infoWindow, 'domready', () => {
//       const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
//       if (selectBtn) {
//         selectBtn.addEventListener('click', () => {
//           toggleOrderSelection(order);
//         });
//       }
//     });
//   };
  
//   // Toggle order selection for route planning
//   const toggleOrderSelection = (order) => {
//     if (!order || !order.id) {
//       console.error('Invalid order object for selection');
//       return;
//     }
    
//     setSelectedOrders(prev => {
//       // Check if order is already selected
//       const isSelected = prev.some(selected => selected.id === order.id);
      
//       if (isSelected) {
//         // Remove from selection
//         const newSelection = prev.filter(selected => selected.id !== order.id);
        
//         // Update button text
//         const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
//         if (selectBtn) {
//           selectBtn.textContent = 'Select for Route';
//           selectBtn.classList.remove('selected');
//         }
        
//         // Update markers
//         updateMarkerAppearance(order.id, false);
        
//         // Clear routes if we have fewer than 2 orders selected
//         if (newSelection.length < 2) {
//           clearRoutes();
//         }
        
//         return newSelection;
//       } else {
//         // Add to selection
//         const newSelection = [...prev, order];
        
//         // Update button text
//         const selectBtn = document.getElementById(`select-order-btn-${order.id}`);
//         if (selectBtn) {
//           selectBtn.textContent = 'Deselect';
//           selectBtn.classList.add('selected');
//         }
        
//         // Update marker appearance
//         updateMarkerAppearance(order.id, true);
        
//         return newSelection;
//       }
//     });
//   };
  
//   // Update marker appearance based on selection
//   const updateMarkerAppearance = (orderId, isSelected) => {
//     try {
//       markersRef.current.forEach(marker => {
//         // Check if marker exists and has order data
//         if (!marker) return;
        
//         // Handle both regular Marker and AdvancedMarkerElement
//         const markerOrder = marker.get ? marker.get('order') : marker.order;
        
//         if (markerOrder && markerOrder.id === orderId) {
//           if (isSelected) {
//             // Highlight selected marker
//             if (marker.setZIndex) {
//               marker.setZIndex(1000); // Bring to front for standard markers
//             }
            
//             // Add a circle around the marker
//             try {
//               const position = marker.getPosition ? marker.getPosition() : marker.position;
//               const circle = new window.google.maps.Circle({
//                 map: googleMapRef.current,
//                 radius: 100, // meters
//                 fillColor: '#FFEB3B',
//                 fillOpacity: 0.3,
//                 strokeColor: '#FFC107',
//                 strokeOpacity: 0.8,
//                 strokeWeight: 2,
//                 center: position
//               });
              
//               // Store circle reference
//               if (marker.set) {
//                 marker.set('selectionCircle', circle);
//               } else {
//                 marker.selectionCircle = circle;
//               }
//             } catch (circleErr) {
//               console.error('Error creating highlight circle:', circleErr);
//             }
//           } else {
//             // Remove highlight
//             if (marker.setZIndex) {
//               marker.setZIndex(null);
//             }
            
//             // Remove circle
//             const circle = marker.get ? marker.get('selectionCircle') : marker.selectionCircle;
//             if (circle) {
//               circle.setMap(null);
//               if (marker.set) {
//                 marker.set('selectionCircle', null);
//               } else {
//                 marker.selectionCircle = null;
//               }
//             }
//           }
//         }
//       });
//     } catch (err) {
//       console.error('Error updating marker appearance:', err);
//     }
//   };
  
//   // Clear all route visualizations
//   const clearRoutes = () => {
//     // Clear polylines safely
//     clearPolylines();
    
//     // Clear directions if renderer exists
//     if (directionsRendererRef.current && typeof directionsRendererRef.current.setDirections === 'function') {
//       directionsRendererRef.current.setDirections({ routes: [] });
//     }
    
//     // Reset route info
//     setRouteInfo(null);
//     setOptimizedRoute(null);
//     setShowRoutes(false);
//     setApiError(null);
//   };
  
//   // Calculate distances between selected orders
//   const calculateDistances = () => {
//     if (selectedOrders.length < 2) {
//       alert('Please select at least two orders to calculate distances.');
//       return;
//     }
    
//     setCalculatingRoute(true);
//     setApiError(null);
    
//     // First check if we can use the Distance Matrix API
//     // If we get API errors, fall back to a basic calculation
//     const useBasicCalculation = true;
    
//     if (useBasicCalculation) {
//       // Use a basic Haversine distance calculation instead of API calls
//       calculateBasicDistances();
//     } else if (distanceMatrixServiceRef.current) {
//       // Try the legacy Distance Matrix API
//       calculateDistancesWithLegacyAPI();
//     } else {
//       setApiError("Distance Matrix API is not available. Using basic distance calculation instead.");
//       // Fall back to basic calculation
//       calculateBasicDistances();
//     }
//   };
  
//   // Calculate basic distances without API calls
//   const calculateBasicDistances = () => {
//     try {
//       const distances = [];
      
//       // Calculate distance between each pair of selected orders
//       for (let i = 0; i < selectedOrders.length; i++) {
//         for (let j = 0; j < selectedOrders.length; j++) {
//           if (i !== j) { // Skip same order
//             const fromOrder = selectedOrders[i];
//             const toOrder = selectedOrders[j];
            
//             // Ensure position exists
//             if (!fromOrder.position || !toOrder.position) continue;
            
//             // Get lat/lng values
//             const fromLat = typeof fromOrder.position.lat === 'function' ? fromOrder.position.lat() : fromOrder.position.lat;
//             const fromLng = typeof fromOrder.position.lng === 'function' ? fromOrder.position.lng() : fromOrder.position.lng;
//             const toLat = typeof toOrder.position.lat === 'function' ? toOrder.position.lat() : toOrder.position.lat;
//             const toLng = typeof toOrder.position.lng === 'function' ? toOrder.position.lng() : toOrder.position.lng;
            
//             // Calculate distance using Haversine formula
//             const distanceMeters = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
            
//             // Estimate duration (very rough estimate: ~40 km/h average speed in city)
//             const durationSeconds = Math.round(distanceMeters / (40 * 1000 / 3600));
            
//             distances.push({
//               from: fromOrder,
//               to: toOrder,
//               distance: formatDistance(distanceMeters),
//               duration: formatDuration(durationSeconds)
//             });
//           }
//         }
//       }
      
//       setRouteInfo({
//         distances: distances,
//         totalSelected: selectedOrders.length,
//         isEstimated: true
//       });
      
//       setShowRoutes(true);
      
//       // Draw lines between selected orders
//       drawRouteLines(selectedOrders);
      
//       setCalculatingRoute(false);
      
//     } catch (error) {
//       console.error('Error calculating basic distances:', error);
//       setApiError(`Failed to calculate distances: ${error.message}`);
//       setCalculatingRoute(false);
//     }
//   };
  
//   // Calculate distances using the newer Routes API
//   const calculateDistancesWithRoutesAPI = async () => {
//     try {
//       const origins = selectedOrders.map(order => ({
//         waypoint: {
//           location: {
//             latLng: {
//               latitude: order.position.lat(),
//               longitude: order.position.lng()
//             }
//           }
//         }
//       }));
      
//       const destinations = origins; // Same points for the matrix
      
//       // Create the Distance Matrix Service
//       const distanceMatrixService = new window.google.maps.routes.DistanceMatrixService();
      
//       // Calculate distance matrix
//       const request = {
//         origins: origins,
//         destinations: destinations,
//         travelMode: 'DRIVE',
//         routingPreference: 'TRAFFIC_AWARE',
//         units: 'METRIC'
//       };
      
//       const response = await distanceMatrixService.computeDistanceMatrix(request);
//       if (response && response.distanceMatrix) {
//         // Process the newer API response format
//         const matrix = response.distanceMatrix;
        
//         // Convert the response to a format similar to the legacy API for compatibility
//         const legacyFormatResponse = {
//           rows: matrix.rows.map(row => ({
//             elements: row.elements.map(element => ({
//               status: element.status,
//               distance: {
//                 value: element.distanceMeters,
//                 text: formatDistance(element.distanceMeters)
//               },
//               duration: {
//                 value: Math.floor(Number(element.duration.replace('s', ''))),
//                 text: formatDuration(Math.floor(Number(element.duration.replace('s', ''))))
//               }
//             }))
//           }))
//         };
        
//         setDistanceMatrix(legacyFormatResponse);
//         displayDistanceResults(legacyFormatResponse);
//       } else {
//         throw new Error('Invalid response from Distance Matrix API');
//       }
//     } catch (error) {
//       console.error('Error using Routes Distance Matrix API:', error);
//       setApiError(`Error calculating distances: ${error.message}`);
//       setCalculatingRoute(false);
      
//       // Try legacy API as fallback
//       if (distanceMatrixServiceRef.current) {
//         console.log('Falling back to legacy Distance Matrix API');
//         calculateDistancesWithLegacyAPI();
//       }
//     }
//   };
  
//   // Calculate distances using the legacy Distance Matrix API
//   const calculateDistancesWithLegacyAPI = () => {
//     const origins = selectedOrders.map(order => order.position);
//     const destinations = selectedOrders.map(order => order.position);
    
//     try {
//       distanceMatrixServiceRef.current.getDistanceMatrix({
//         origins: origins,
//         destinations: destinations,
//         travelMode: window.google.maps.TravelMode.DRIVING,
//         unitSystem: window.google.maps.UnitSystem.METRIC
//       }, (response, status) => {
//         if (status === 'OK') {
//           setDistanceMatrix(response);
//           displayDistanceResults(response);
//         } else {
//           console.error('Distance Matrix failed:', status);
//           if (status === 'REQUEST_DENIED') {
//             setApiError("Distance Matrix API request was denied. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
//           } else {
//             setApiError(`Distance calculation failed: ${status}`);
//           }
//         }
//         setCalculatingRoute(false);
//       });
//     } catch (error) {
//       console.error('Error calling Distance Matrix service:', error);
//       setApiError(`Error: ${error.message}`);
//       setCalculatingRoute(false);
//     }
//   };
  
//   // Display distance results
//   const displayDistanceResults = (response) => {
//     const distances = [];
    
//     for (let i = 0; i < selectedOrders.length; i++) {
//       for (let j = 0; j < selectedOrders.length; j++) {
//         if (i !== j) { // Skip same order
//           const element = response.rows[i].elements[j];
//           if (element.status === 'OK') {
//             const distance = element.distance.text;
//             const duration = element.duration.text;
            
//             distances.push({
//               from: selectedOrders[i],
//               to: selectedOrders[j],
//               distance: distance,
//               duration: duration
//             });
//           }
//         }
//       }
//     }
    
//     setRouteInfo({
//       distances: distances,
//       totalSelected: selectedOrders.length
//     });
    
//     setShowRoutes(true);
    
//     // Draw lines between selected orders
//     drawRouteLines(selectedOrders);
//   };
  
//   // Draw straight lines between selected orders
//   const drawRouteLines = (routeOrders) => {
//     if (routeOrders.length < 2) return;
    
//     // Clear existing polylines
//     clearPolylines();
    
//     const points = routeOrders.map(order => order.position);
    
//     try {
//       // Create polyline
//       const polyline = new window.google.maps.Polyline({
//         path: points,
//         geodesic: true,
//         strokeColor: '#FF0000',
//         strokeOpacity: 0.8,
//         strokeWeight: 2
//       });
      
//       polyline.setMap(googleMapRef.current);
//       polylineRef.current = polyline;
//     } catch (error) {
//       console.error('Error creating polyline:', error);
//       setApiError(`Failed to draw route lines: ${error.message}`);
//     }
//   };
  
//   // Calculate optimized route
//   const calculateOptimizedRoute = () => {
//     if (selectedOrders.length < 2) {
//       alert('Please select at least two orders to optimize a route.');
//       return;
//     }
    
//     setCalculatingRoute(true);
//     setApiError(null);
    
//     // Use basic optimization without API calls
//     calculateBasicOptimizedRoute();
//   };
  
//   // Calculate a basic optimized route without API calls
//   const calculateBasicOptimizedRoute = () => {
//     try {
//       // Create a distance matrix using Haversine distances
//       const matrix = [];
      
//       for (let i = 0; i < selectedOrders.length; i++) {
//         const row = [];
//         for (let j = 0; j < selectedOrders.length; j++) {
//           if (i === j) {
//             // Distance to self is 0
//             row.push({
//               status: 'OK',
//               distance: { value: 0, text: '0 km' },
//               duration: { value: 0, text: '0 min' }
//             });
//           } else {
//             const fromOrder = selectedOrders[i];
//             const toOrder = selectedOrders[j];
            
//             // Get lat/lng values
//             const fromLat = typeof fromOrder.position.lat === 'function' ? fromOrder.position.lat() : fromOrder.position.lat;
//             const fromLng = typeof fromOrder.position.lng === 'function' ? fromOrder.position.lng() : fromOrder.position.lng;
//             const toLat = typeof toOrder.position.lat === 'function' ? toOrder.position.lat() : toOrder.position.lat;
//             const toLng = typeof toOrder.position.lng === 'function' ? toOrder.position.lng() : toOrder.position.lng;
            
//             // Calculate distance
//             const distanceMeters = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
            
//             // Estimate duration (very rough estimate: ~40 km/h average speed in city)
//             const durationSeconds = Math.round(distanceMeters / (40 * 1000 / 3600));
            
//             row.push({
//               status: 'OK',
//               distance: { 
//                 value: distanceMeters, 
//                 text: formatDistance(distanceMeters) 
//               },
//               duration: { 
//                 value: durationSeconds, 
//                 text: formatDuration(durationSeconds) 
//               }
//             });
//           }
//         }
//         matrix.push({ elements: row });
//       }
      
//       // Use nearest neighbor algorithm to find an optimized route
//       const optimized = findOptimizedRoute(selectedOrders, { rows: matrix });
      
//       if (optimized) {
//         setOptimizedRoute({
//           ...optimized,
//           isEstimated: true
//         });
        
//         // Draw route lines
//         drawRouteLines(optimized.route);
        
//         setShowRoutes(true);
//       }
      
//       setCalculatingRoute(false);
//     } catch (error) {
//       console.error('Error calculating basic optimized route:', error);
//       setApiError(`Failed to optimize route: ${error.message}`);
//       setCalculatingRoute(false);
//     }
//   };
  
//   // Calculate optimized route using the newer Routes API
//   const calculateOptimizedRouteWithRoutesAPI = async () => {
//     try {
//       // Prepare waypoints for the route
//       const waypoints = selectedOrders.map(order => ({
//         location: {
//           latLng: {
//             latitude: order.position.lat(),
//             longitude: order.position.lng()
//           }
//         }
//       }));
      
//       // Create the Routes Service
//       const routesService = new window.google.maps.routes.RoutesService();
      
//       // Calculate route
//       const request = {
//         origin: waypoints[0],
//         destination: waypoints[waypoints.length - 1],
//         intermediates: waypoints.slice(1, waypoints.length - 1),
//         travelMode: 'DRIVE',
//         routingPreference: 'TRAFFIC_AWARE',
//         languageCode: 'en-US',
//         units: 'METRIC'
//       };
      
//       const response = await routesService.computeRoutes(request);
      
//       if (response && response.routes && response.routes.length > 0) {
//         const route = response.routes[0];
        
//         // Create a polyline for the route
//         if (googleMapRef.current) {
//           // Clear existing routes
//           clearRoutes();
          
//           // Convert the route path to LatLng format for polylines
//           const path = route.polyline.encodedPolyline;
//           const decodedPath = decodePath(path);
          
//           const polyline = new window.google.maps.Polyline({
//             path: decodedPath,
//             geodesic: true,
//             strokeColor: '#4285F4',
//             strokeWeight: 5,
//             strokeOpacity: 0.7
//           });
          
//           polyline.setMap(googleMapRef.current);
//           polylineRef.current = polyline;
//         }
        
//         // Create optimized route object
//         const optimized = {
//           route: selectedOrders,
//           actualDistanceMeters: route.distanceMeters,
//           actualDistanceText: formatDistance(route.distanceMeters),
//           actualDurationSeconds: Math.floor(Number(route.duration.replace('s', ''))),
//           actualDurationText: formatDuration(Math.floor(Number(route.duration.replace('s', ''))))
//         };
        
//         setOptimizedRoute(optimized);
//         setShowRoutes(true);
//       } else {
//         throw new Error('No routes found');
//       }
      
//       setCalculatingRoute(false);
//     } catch (error) {
//       console.error('Error using Routes API:', error);
//       setApiError(`Error calculating route: ${error.message}`);
      
//       // Try legacy approach as fallback
//       if (directionsServiceRef.current) {
//         console.log('Falling back to legacy Directions API');
//         calculateOptimizedRouteWithLegacyAPI();
//       } else {
//         setCalculatingRoute(false);
//       }
//     }
//   };
  
//   // Helper function to decode polyline path
//   const decodePath = (encoded) => {
//     // If the Maps API includes the utility, use it
//     if (window.google.maps.geometry && window.google.maps.geometry.encoding) {
//       return window.google.maps.geometry.encoding.decodePath(encoded);
//     }
    
//     // Otherwise implement our own decoder
//     const poly = [];
//     let index = 0, lat = 0, lng = 0;
    
//     while (index < encoded.length) {
//       let b, shift = 0, result = 0;
      
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
      
//       const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lat += dlat;
      
//       shift = 0;
//       result = 0;
      
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
      
//       const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lng += dlng;
      
//       const point = new window.google.maps.LatLng(lat * 1e-5, lng * 1e-5);
//       poly.push(point);
//     }
    
//     return poly;
//   };
  
//   // Calculate optimized route using legacy approach
//   const calculateOptimizedRouteWithLegacyAPI = () => {
//     // First we need the distance matrix to optimize the route
//     if (!distanceMatrix) {
//       // Calculate distances first if not already done
//       if (!distanceMatrixServiceRef.current) {
//         setApiError("Distance Matrix API is not available. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
//         setCalculatingRoute(false);
//         return;
//       }
      
//       const origins = selectedOrders.map(order => order.position);
//       const destinations = selectedOrders.map(order => order.position);
      
//       try {
//         distanceMatrixServiceRef.current.getDistanceMatrix({
//           origins: origins,
//           destinations: destinations,
//           travelMode: window.google.maps.TravelMode.DRIVING,
//           unitSystem: window.google.maps.UnitSystem.METRIC
//         }, (response, status) => {
//           if (status === 'OK') {
//             setDistanceMatrix(response);
//             const optimized = findOptimizedRoute(selectedOrders, response);
            
//             // Show the optimized route
//             if (optimized) {
//               setOptimizedRoute(optimized);
              
//               // Calculate and display the actual route using Directions Service
//               displayOptimizedRoute(optimized.route);
//             }
//           } else {
//             console.error('Distance Matrix failed:', status);
//             if (status === 'REQUEST_DENIED') {
//               setApiError("Distance Matrix API request was denied. This feature requires the Distance Matrix API to be enabled for your Google Maps API key.");
//             } else {
//               setApiError(`Distance calculation failed: ${status}`);
//             }
//             setCalculatingRoute(false);
//           }
//         });
//       } catch (error) {
//         console.error('Error calling Distance Matrix service:', error);
//         setApiError(`Error: ${error.message}`);
//         setCalculatingRoute(false);
//       }
//     } else {
//       // Use existing distance matrix
//       const optimized = findOptimizedRoute(selectedOrders, distanceMatrix);
      
//       // Show the optimized route
//       if (optimized) {
//         setOptimizedRoute(optimized);
        
//         // Calculate and display the actual route using Directions Service
//         displayOptimizedRoute(optimized.route);
//       } else {
//         setCalculatingRoute(false);
//       }
//     }
//   };
  
//   // Find optimized route using a simple nearest neighbor algorithm
//   const findOptimizedRoute = (orders, distMatrix) => {
//     if (!distMatrix || orders.length < 2) return null;
    
//     // We'll start from the first selected order
//     const startOrder = orders[0];
//     let remainingOrders = orders.slice(1);
//     let route = [startOrder];
//     let totalDistance = 0;
//     let totalDuration = 0;
    
//     let currentOrder = startOrder;
    
//     // Find the closest order each time
//     while (remainingOrders.length > 0) {
//       const currentIndex = orders.findIndex(o => o.id === currentOrder.id);
      
//       let minDistance = Number.MAX_VALUE;
//       let closestOrderIndex = -1;
      
//       for (let i = 0; i < remainingOrders.length; i++) {
//         const remainingIndex = orders.findIndex(o => o.id === remainingOrders[i].id);
        
//         // Get distance from current to this order
//         const element = distMatrix.rows[currentIndex].elements[remainingIndex];
        
//         if (element.status === 'OK') {
//           const distance = element.distance.value; // in meters
          
//           if (distance < minDistance) {
//             minDistance = distance;
//             closestOrderIndex = i;
//           }
//         }
//       }
      
//       if (closestOrderIndex >= 0) {
//         const nextOrder = remainingOrders[closestOrderIndex];
//         route.push(nextOrder);
        
//         // Add distance and duration
//         const nextIndex = orders.findIndex(o => o.id === nextOrder.id);
//         const element = distMatrix.rows[currentIndex].elements[nextIndex];
        
//         if (element.status === 'OK') {
//           totalDistance += element.distance.value;
//           totalDuration += element.duration.value;
//         }
        
//         // Set as current and remove from remaining
//         currentOrder = nextOrder;
//         remainingOrders = remainingOrders.filter(o => o.id !== nextOrder.id);
//       } else {
//         break;
//       }
//     }
    
//     return {
//       route: route,
//       totalDistanceMeters: totalDistance,
//       totalDistanceText: formatDistance(totalDistance),
//       totalDurationSeconds: totalDuration,
//       totalDurationText: formatDuration(totalDuration)
//     };
//   };
  
//   // Format distance in meters to a readable format
//   const formatDistance = (meters) => {
//     if (meters < 1000) {
//       return `${meters} m`;
//     } else {
//       return `${(meters / 1000).toFixed(1)} km`;
//     }
//   };
  
//   // Format duration in seconds to a readable format
//   const formatDuration = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
    
//     if (hours > 0) {
//       return `${hours} hr ${minutes} min`;
//     } else {
//       return `${minutes} min`;
//     }
//   };
  
//   // Display optimized route using Google Directions Service
//   const displayOptimizedRoute = (routeOrders) => {
//     if (routeOrders.length < 2) {
//       setCalculatingRoute(false);
//       return;
//     }
    
//     // Check if Directions Service is available
//     if (!directionsServiceRef.current || !directionsRendererRef.current) {
//       setApiError("Directions API is not available. This feature requires the Directions API to be enabled for your Google Maps API key.");
//       setCalculatingRoute(false);
      
//       // Fall back to simple polyline
//       drawRouteLines(routeOrders);
//       return;
//     }
    
//     // Generate waypoints for the route
//     // Skip first and last as they will be origin and destination
//     const waypoints = routeOrders.slice(1, routeOrders.length - 1).map(order => ({
//       location: order.position,
//       stopover: true
//     }));
    
//     const origin = routeOrders[0].position;
//     const destination = routeOrders[routeOrders.length - 1].position;
    
//     try {
//       directionsServiceRef.current.route({
//         origin: origin,
//         destination: destination,
//         waypoints: waypoints,
//         optimizeWaypoints: false, // We've already optimized the order
//         travelMode: window.google.maps.TravelMode.DRIVING
//       }, (response, status) => {
//         if (status === 'OK') {
//           directionsRendererRef.current.setDirections(response);
          
//           // Calculate actual route stats
//           let totalDistance = 0;
//           let totalDuration = 0;
          
//           response.routes[0].legs.forEach(leg => {
//             totalDistance += leg.distance.value;
//             totalDuration += leg.duration.value;
//           });
          
//           // Update optimized route with actual route data
//           setOptimizedRoute(prev => ({
//             ...prev,
//             actualDistanceMeters: totalDistance,
//             actualDistanceText: formatDistance(totalDistance),
//             actualDurationSeconds: totalDuration,
//             actualDurationText: formatDuration(totalDuration)
//           }));
//         } else {
//           console.error('Directions request failed:', status);
          
//           if (status === 'REQUEST_DENIED') {
//             setApiError("Directions API request was denied. This feature requires the Directions API to be enabled for your Google Maps API key.");
//           } else {
//             setApiError(`Failed to display route: ${status}`);
//           }
          
//           // Fall back to simple polyline
//           drawRouteLines(routeOrders);
//         }
        
//         setCalculatingRoute(false);
//       });
//     } catch (error) {
//       console.error('Error calling Directions service:', error);
//       setApiError(`Error: ${error.message}`);
      
//       // Fall back to simple polyline
//       drawRouteLines(routeOrders);
//       setCalculatingRoute(false);
//     }
//   };
  
//   // Generate connections for delivery optimization
//   const generateConnections = () => {
//     if (filteredOrders.length < 2) {
//       alert('Not enough orders to generate connections.');
//       return;
//     }
    
//     setCalculatingRoute(true);
//     setApiError(null);
    
//     // Group orders by delivery speed
//     const groupedOrders = {
//       quick: filteredOrders.filter(order => order.deliverySpeeds.includes('quick')),
//       normal: filteredOrders.filter(order => order.deliverySpeeds.includes('normal')),
//       late: filteredOrders.filter(order => order.deliverySpeeds.includes('late'))
//     };
    
//     // Clear existing routes
//     clearRoutes();
    
//     // Generate a basic spanning tree for each group
//     const currentDeliveryType = selectedFilter === 'all' ? 'normal' : selectedFilter;
//     const ordersToConnect = groupedOrders[currentDeliveryType] || [];
    
//     if (ordersToConnect.length < 2) {
//       alert(`Not enough ${currentDeliveryType} orders to generate connections.`);
//       setCalculatingRoute(false);
//       return;
//     }
    
//     // Create a simple spanning tree using nearest neighbor
//     const connections = [];
//     const visited = new Set();
    
//     // Start with the first order
//     visited.add(ordersToConnect[0].id);
    
//     while (visited.size < ordersToConnect.length) {
//       let minDistance = Number.MAX_VALUE;
//       let bestConnection = null;
      
//       // For each visited node, find the closest unvisited node
//       for (const visitedId of visited) {
//         const visitedOrder = ordersToConnect.find(order => order.id === visitedId);
        
//         for (const order of ordersToConnect) {
//           if (!visited.has(order.id)) {
//             const distance = calculateHaversineDistance(
//               visitedOrder.position.lat(), 
//               visitedOrder.position.lng(),
//               order.position.lat(),
//               order.position.lng()
//             );
            
//             if (distance < minDistance) {
//               minDistance = distance;
//               bestConnection = {
//                 from: visitedOrder,
//                 to: order,
//                 distance: distance
//               };
//             }
//           }
//         }
//       }
      
//       if (bestConnection) {
//         connections.push(bestConnection);
//         visited.add(bestConnection.to.id);
//       } else {
//         break;
//       }
//     }
    
//     // Display connections
//     displayConnections(connections, currentDeliveryType);
    
//     setCalculatingRoute(false);
//   };
  
//   // Calculate distance between two points using Haversine formula
//   const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3; // Earth radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;
    
//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
//     return R * c; // Distance in meters
//   };
  
//   // Display connections between orders
//   const displayConnections = (connections, deliveryType) => {
//     if (!connections || connections.length === 0) {
//       return;
//     }
    
//     // Clear any existing polylines
//     clearPolylines();
    
//     // Store all created visual elements to clean up later
//     const visualElements = [];
    
//     // Create polylines for each connection
//     connections.forEach(connection => {
//       try {
//         const polyline = new window.google.maps.Polyline({
//           path: [connection.from.position, connection.to.position],
//           geodesic: true,
//           strokeColor: 
//             deliveryType === 'quick' ? '#FF6B6B' : 
//             deliveryType === 'normal' ? '#4ECDC4' : 
//             '#FFD166',
//           strokeOpacity: 0.7,
//           strokeWeight: 3
//         });
        
//         polyline.setMap(googleMapRef.current);
//         visualElements.push(polyline);
        
//         // Add distance label
//         const midPoint = new window.google.maps.LatLng(
//           (connection.from.position.lat() + connection.to.position.lat()) / 2,
//           (connection.from.position.lng() + connection.to.position.lng()) / 2
//         );
        
//         const distanceInKm = (connection.distance / 1000).toFixed(1);
        
//         try {
//           const infoWindow = new window.google.maps.InfoWindow({
//             content: `<div class="distance-label">${distanceInKm} km</div>`,
//             position: midPoint,
//             pixelOffset: new window.google.maps.Size(0, -10)
//           });
          
//           infoWindow.open(googleMapRef.current);
//           visualElements.push(infoWindow);
//         } catch (error) {
//           console.error('Error creating distance label:', error);
//         }
//       } catch (error) {
//         console.error('Error creating connection line:', error);
//       }
//     });
    
//     // Store references to clean up later
//     polylineRef.current = visualElements;
    
//     // Calculate total distance
//     const totalDistance = connections.reduce((sum, conn) => sum + conn.distance, 0);
//     const totalKm = (totalDistance / 1000).toFixed(1);
    
//     setRouteInfo({
//       connections: connections,
//       totalConnections: connections.length,
//       totalDistance: totalKm,
//       deliveryType: deliveryType
//     });
    
//     setShowRoutes(true);
//   };
  
//   // Function to copy address to clipboard
//   const copyAddressToClipboard = (address, orderId) => {
//     if (!address) return;
    
//     navigator.clipboard.writeText(address)
//       .then(() => {
//         console.log('Address copied to clipboard');
//         // Show visual feedback
//         const copyBtn = document.getElementById(`copy-address-btn-${orderId}`);
//         if (copyBtn) {
//           const originalText = copyBtn.innerHTML;
//           copyBtn.innerHTML = '✓ Copied!';
//           copyBtn.classList.add('copied');
          
//           setTimeout(() => {
//             copyBtn.innerHTML = originalText;
//             copyBtn.classList.remove('copied');
//           }, 2000);
//         }
//       })
//       .catch(err => {
//         console.error('Could not copy text: ', err);
//       });
//   };
  
//   // Create info window content
//   const createInfoWindowContent = (order) => {
//     return `
//       <div class="info-window">
//         <h3>Order Details</h3>
//         <div class="info-detail">
//           <span class="info-label">Order ID:</span>
//           <span class="info-value">${order.id ? order.id.substring(0, 8) + '...' : 'N/A'}</span>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Customer:</span>
//           <span class="info-value">${order.customerName || 'Guest'}</span>
//         </div>
//         <div class="info-detail address-detail">
//           <span class="info-label">Address:</span>
//           <div class="address-container">
//             <span class="info-value address-value">${order.deliveryAddress || 'N/A'}</span>
//             <button id="copy-address-btn-${order.id}" class="copy-address-btn" title="Copy address to clipboard">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
//               </svg>
//               Copy
//             </button>
//           </div>
//         </div>
//         <div class="info-detail">
//           <span class="info-label">Date:</span>
//           <span class="info-value">${formatDate(order.orderDate)}</span>
//         </div>
//         ${order.totalAmount ? `
//         <div class="info-detail">
//           <span class="info-label">Amount:</span>
//           <span class="info-value">₹${formatAmount(order.totalAmount)}</span>
//         </div>
//         ` : ''}
//         <div class="info-detail">
//           <span class="info-label">Status:</span>
//           <span class="status-badge ${getStatusClass(getMarkerLabel(order))}">
//             ${getMarkerLabel(order)}
//           </span>
//         </div>
//         <div class="info-actions">
//           <button id="select-order-btn-${order.id}" class="select-order-btn">
//             Select for Route
//           </button>
//         </div>
//         <style>
//           .info-window {
//             font-family: Arial, sans-serif;
//             padding: 5px;
//             min-width: 250px;
//           }
//           .info-detail {
//             margin-bottom: 8px;
//             display: flex;
//           }
//           .address-detail {
//             align-items: flex-start;
//           }
//           .info-label {
//             font-weight: bold;
//             width: 80px;
//             flex-shrink: 0;
//           }
//           .address-container {
//             display: flex;
//             flex-direction: column;
//             flex: 1;
//           }
//           .address-value {
//             margin-bottom: 5px;
//             word-break: break-all;
//           }
//           .copy-address-btn {
//             display: flex;
//             align-items: center;
//             padding: 4px 8px;
//             background-color: #f0f0f0;
//             border: 1px solid #ccc;
//             border-radius: 4px;
//             font-size: 12px;
//             cursor: pointer;
//             align-self: flex-start;
//           }
//           .copy-address-btn svg {
//             margin-right: 4px;
//           }
//           .copy-address-btn:hover {
//             background-color: #e0e0e0;
//           }
//           .copy-address-btn.copied {
//             background-color: #4CAF50;
//             color: white;
//           }
//           .status-badge {
//             display: inline-block;
//             padding: 3px 8px;
//             border-radius: 12px;
//             font-size: 11px;
//             color: white;
//             background-color: #888;
//           }
//           .status-pending { background-color: #FFC107; }
//           .status-processing { background-color: #2196F3; }
//           .status-shipped { background-color: #673AB7; }
//           .status-out-for-delivery { background-color: #FF9800; }
//           .status-delivered { background-color: #4CAF50; }
//           .status-cancelled { background-color: #F44336; }
//           .info-actions {
//             margin-top: 10px;
//             display: flex;
//             justify-content: center;
//           }
//           .select-order-btn {
//             padding: 6px 12px;
//             background-color: #2196F3;
//             color: white;
//             border: none;
//             border-radius: 4px;
//             cursor: pointer;
//             font-size: 12px;
//           }
//           .select-order-btn:hover {
//             background-color: #0b7dda;
//           }
//           .select-order-btn.selected {
//             background-color: #F44336;
//           }
//         </style>
//       </div>
//     `;
//   };
  
//   // Handle filter change
//   const handleFilterChange = (filter) => {
//     setSelectedFilter(filter);
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
  
//   // Format amount for display
//   const formatAmount = (amount) => {
//     if (typeof amount !== 'number') return '0.00';
//     return amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   };
  
//   // Get status class for styling
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
  
//   // Get marker icon based on delivery speed
//   const getMarkerIcon = (order) => {
//     // Priority: quick > normal > late
//     if (!order || !order.deliverySpeeds) return 'normal';
    
//     const speeds = order.deliverySpeeds;
//     if (speeds.includes('quick')) return 'quick';
//     if (speeds.includes('normal')) return 'normal';
//     if (speeds.includes('late')) return 'late';
//     return 'normal';
//   };
  
//   // Get marker label from status
//   const getMarkerLabel = (order) => {
//     if (!order) return 'Pending';
    
//     // Get the order status based on priority
//     let status = order.status || 'Pending';
    
//     if (order.statusHistory && Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
//       // For simplicity, get the latest status from history
//       const sortedHistory = [...order.statusHistory].sort((a, b) => {
//         const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
//         const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
//         return dateB - dateA;
//       });
      
//       if (sortedHistory[0] && sortedHistory[0].status) {
//         status = sortedHistory[0].status;
//       }
//     }
    
//     return status;
//   };
  
//   // Get delivery speed info
//   const getDeliverySpeedInfo = (speed) => {
//     switch (speed) {
//       case 'quick': return { name: 'Quick', icon: '⚡', class: 'marker-quick' };
//       case 'express': return { name: 'Express', icon: '🚀', class: 'marker-express' };
//       case 'normal': return { name: 'Standard', icon: '🚚', class: 'marker-normal' };
//       case 'late': return { name: 'Eco', icon: '🐌', class: 'marker-late' };
//       default: return { name: 'Standard', icon: '📦', class: 'marker-normal' };
//     }
//   };
  
//   return (
//     <div className="locations-container">
//       <h1>Order Locations</h1>
      
//       <div className="filters-section">
//         <div className="filter-group">
//           <label>Filter by Delivery Speed:</label>
//           <div className="filter-buttons">
//             <button 
//               className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('all')}
//             >
//               <span className="filter-icon">📦</span> All Orders
//             </button>
//             <button 
//               className={`filter-btn quick-btn ${selectedFilter === 'quick' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('quick')}
//             >
//               <span className="filter-icon">⚡</span> Quick
//             </button>
//             <button 
//               className={`filter-btn normal-btn ${selectedFilter === 'normal' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('normal')}
//             >
//               <span className="filter-icon">🚚</span> Standard
//             </button>
//             <button 
//               className={`filter-btn late-btn ${selectedFilter === 'late' ? 'active' : ''}`}
//               onClick={() => handleFilterChange('late')}
//             >
//               <span className="filter-icon">🐌</span> Eco
//             </button>
//           </div>
//         </div>
        
//         <div className="order-counts">
//           <span className="count-label">Showing:</span>
//           <span className="count-value">{filteredOrders.length} orders</span>
//           <span className="selected-count">
//             {selectedOrders.length > 0 && `(${selectedOrders.length} selected)`}
//           </span>
//         </div>
//       </div>
      
//       {/* Route Planning Tools */}
//       <div className="route-planning-tools">
//         <div className="tools-header">
//           <h3>Route Planning Tools</h3>
//           {selectedOrders.length > 0 && (
//             <button 
//               className="clear-selection-btn"
//               onClick={() => {
//                 // Clear selected orders
//                 selectedOrders.forEach(order => {
//                   updateMarkerAppearance(order.id, false);
//                 });
//                 setSelectedOrders([]);
//                 clearRoutes();
//               }}
//             >
//               Clear Selection
//             </button>
//           )}
//         </div>
        
//         <div className="tools-buttons">
//           <button 
//             className="tool-btn calculate-distances-btn"
//             onClick={calculateDistances}
//             disabled={selectedOrders.length < 2 || calculatingRoute}
//           >
//             <span className="tool-icon">📏</span> Calculate Distances
//           </button>
//           <button 
//             className="tool-btn optimize-route-btn"
//             onClick={calculateOptimizedRoute}
//             disabled={selectedOrders.length < 2 || calculatingRoute}
//           >
//             <span className="tool-icon">🔄</span> Optimize Route
//           </button>
//           <button 
//             className="tool-btn generate-connections-btn"
//             onClick={generateConnections}
//             disabled={filteredOrders.length < 2 || calculatingRoute}
//           >
//             <span className="tool-icon">🔗</span> Suggest Connections
//           </button>
//         </div>
        
//         {calculatingRoute && (
//           <div className="calculating-indicator">
//             <div className="spinner small"></div>
//             <span>Calculating...</span>
//           </div>
//         )}
        
//         {/* API Error Message */}
//         {apiError && (
//           <div className="api-error-message">
//             <div className="error-icon">⚠️</div>
//             <div className="error-content">
//               <div className="error-title">API Error</div>
//               <div className="error-details">{apiError}</div>
//               <div className="error-help">
//                 <p>To fix this issue, please check the following:</p>
//                 <ol>
//                   <li><strong>API Key Restrictions:</strong> If you're seeing "ApiTargetBlockedMapError", your key may have HTTP referrer restrictions. Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console → Credentials</a> and set Application Restrictions to "None" or add your development domains like "localhost".</li>
//                   <li><strong>API Activation:</strong> Ensure these APIs are enabled in your <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">API Library</a>:
//                     <ul>
//                       <li>Maps JavaScript API</li>
//                       <li>Routes API (recommended, new version)</li>
//                       <li>Directions API</li>
//                       <li>Distance Matrix API</li>
//                       <li>Geocoding API</li>
//                     </ul>
//                   </li>
//                   <li><strong>Billing Status:</strong> Verify that billing is enabled and active for your Google Cloud project.</li>
//                   <li><strong>Quota Limits:</strong> Check if you've exceeded your API usage quotas.</li>
//                 </ol>
//                 <p>After making changes in Google Cloud Console, you may need to wait a few minutes and then refresh this page.</p>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Route Information */}
//         {showRoutes && routeInfo && !apiError && (
//           <div className="route-info-panel">
//             {routeInfo.distances && (
//               <div className="distances-info">
//                 <h4>Distance Matrix</h4>
//                 <div className="distances-table-container">
//                   <table className="distances-table">
//                     <thead>
//                       <tr>
//                         <th>From Order</th>
//                         <th>To Order</th>
//                         <th>Distance</th>
//                         <th>Duration</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {routeInfo.distances.slice(0, 10).map((dist, index) => (
//                         <tr key={index}>
//                           <td>{dist.from.id.substring(0, 6)}...</td>
//                           <td>{dist.to.id.substring(0, 6)}...</td>
//                           <td>{dist.distance}</td>
//                           <td>{dist.duration}</td>
//                         </tr>
//                       ))}
//                       {routeInfo.distances.length > 10 && (
//                         <tr>
//                           <td colSpan="4" className="more-distances">
//                             {routeInfo.distances.length - 10} more distances...
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
            
//             {optimizedRoute && (
//               <div className="optimized-route-info">
//                 <h4>Optimized Route</h4>
//                 <div className="route-stats">
//                   <div className="stat-item">
//                     <span className="stat-label">Total Distance:</span>
//                     <span className="stat-value">{optimizedRoute.actualDistanceText || optimizedRoute.totalDistanceText}</span>
//                   </div>
//                   <div className="stat-item">
//                     <span className="stat-label">Estimated Time:</span>
//                     <span className="stat-value">{optimizedRoute.actualDurationText || optimizedRoute.totalDurationText}</span>
//                   </div>
//                   <div className="stat-item">
//                     <span className="stat-label">Order Sequence:</span>
//                     <div className="route-sequence">
//                       {optimizedRoute.route.map((order, index) => (
//                         <div key={index} className="sequence-item">
//                           <span className="sequence-number">{index + 1}</span>
//                           <span className="sequence-id">{order.id.substring(0, 6)}...</span>
//                           {index < optimizedRoute.route.length - 1 && (
//                             <span className="sequence-arrow">→</span>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {routeInfo.connections && (
//               <div className="connections-info">
//                 <h4>
//                   {getDeliverySpeedInfo(routeInfo.deliveryType).icon} 
//                   {getDeliverySpeedInfo(routeInfo.deliveryType).name} Delivery Connections
//                 </h4>
//                 <div className="connections-stats">
//                   <div className="stat-item">
//                     <span className="stat-label">Total Connections:</span>
//                     <span className="stat-value">{routeInfo.totalConnections}</span>
//                   </div>
//                   <div className="stat-item">
//                     <span className="stat-label">Total Distance:</span>
//                     <span className="stat-value">{routeInfo.totalDistance} km</span>
//                   </div>
//                 </div>
//                 <p className="connections-note">
//                   Lines show suggested connections between orders for efficient delivery.
//                   Distances are shown directly on the map.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
      
//       <div className="map-container">
//         {loading ? (
//           <div className="map-loading">
//             <div className="spinner"></div>
//             <p>Loading map and order data...</p>
//           </div>
//         ) : error ? (
//           <div className="map-error">
//             <div className="error-icon">⚠️</div>
//             <div className="error-title">Google Maps Error</div>
//             <p>{error}</p>
//             <div className="error-details">
//               <h4>Troubleshooting Steps:</h4>
//               <ol>
//                 <li>
//                   <strong>Fix API Key Restrictions:</strong>
//                   <ul>
//                     <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console → Credentials</a></li>
//                     <li>Find your API key (AIzaSyAOFbpbOwdren9NlNtWvRVyf4DsDf9-2H4)</li>
//                     <li>Set "Application restrictions" to "None" (temporarily)</li>
//                     <li>Wait 5 minutes for changes to propagate</li>
//                   </ul>
//                 </li>
//                 <li>
//                   <strong>Enable Required APIs:</strong>
//                   <ul>
//                     <li>Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer">Google Cloud Console → API Library</a></li>
//                     <li>Search for and enable: "Maps JavaScript API" (most important)</li>
//                     <li>Also enable: "Directions API", "Distance Matrix API", "Geocoding API"</li>
//                   </ul>
//                 </li>
//                 <li>
//                   <strong>Check Billing:</strong>
//                   <ul>
//                     <li>Verify billing is set up at <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer">Google Cloud Console → Billing</a></li>
//                   </ul>
//                 </li>
//               </ol>
//               <p>After making these changes, refresh this page or click the button below.</p>
//             </div>
//             <button onClick={() => window.location.reload()} className="retry-button">Retry Loading Map</button>
//           </div>
//         ) : (
//           <div 
//             ref={mapContainerRef} 
//             className="google-map"
//             style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
//           ></div>
//         )}
//       </div>
      
//       <div className="map-legend">
//         <h3>Map Legend</h3>
//         <div className="legend-items">
//           <div className="legend-item">
//             <div className="legend-marker marker-quick"></div>
//             <span>Quick Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-normal"></div>
//             <span>Standard Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker marker-late"></div>
//             <span>Eco Delivery</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-marker selected-marker"></div>
//             <span>Selected Order</span>
//           </div>
//           <div className="legend-item">
//             <div className="legend-line route-line"></div>
//             <span>Route Line</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Locations;