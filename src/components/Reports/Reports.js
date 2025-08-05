// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   getDocs, 
//   Timestamp
// } from 'firebase/firestore';
// import { db } from '../../firebase/firebaseConfig';
// import './Reports.css';

// // Import Recharts components for data visualization
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
//   CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';

// const Reports = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [dateRange, setDateRange] = useState({
//     from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
//     to: new Date().toISOString().split('T')[0]
//   });
  
//   // Analytics data states
//   const [overviewStats, setOverviewStats] = useState({
//     totalOrders: 0,
//     totalRevenue: 0,
//     averageOrderValue: 0,
//     totalItems: 0
//   });
  
//   const [orderStatusData, setOrderStatusData] = useState([]);
//   const [deliverySpeedData, setDeliverySpeedData] = useState([]);
//   const [revenueByDeliverySpeed, setRevenueByDeliverySpeed] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);

//   // Colors for charts
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
//   const DELIVERY_COLORS = {
//     quick: '#FF6B6B',
//     normal: '#4ECDC4',
//     late: '#C7F464'
//   };
//   const STATUS_COLORS = {
//     'Pending': '#FFC107',
//     'Processing': '#2196F3',
//     'Shipped': '#9C27B0',
//     'Out for Delivery': '#3F51B5',
//     'Delivered': '#4CAF50',
//     'Cancelled': '#F44336'
//   };

//   useEffect(() => {
//     fetchReportData();
//   }, [dateRange]);

//   const fetchReportData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Get all orders without date filtering first to ensure we get all orders
//       // Use collectionGroup to get all orders across the database
//       const ordersQuery = query(
//         collection(db, 'orders'),
//         orderBy('createdAt', 'desc')
//       );

//       const orderSnapshot = await getDocs(ordersQuery);
      
//       if (orderSnapshot.empty) {
//         setLoading(false);
//         // Set empty data
//         setOverviewStats({
//           totalOrders: 0,
//           totalRevenue: 0,
//           averageOrderValue: 0,
//           totalItems: 0
//         });
//         setOrderStatusData([]);
//         setDeliverySpeedData([]);
//         setRevenueByDeliverySpeed([]);
//         setTopProducts([]);
//         return;
//       }

//       // Process order data
//       processOrderData(orderSnapshot);
      
//     } catch (err) {
//       console.error("Error fetching report data:", err);
//       setError("Failed to load report data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processOrderData = (orderSnapshot) => {
//     // Initialize aggregation variables
//     let totalOrders = 0;
//     let totalRevenue = 0;
//     let totalItems = 0;
    
//     // For status distribution
//     const statusCounts = {};
    
//     // For delivery speed distribution
//     const speedCounts = {
//       quick: { count: 0, revenue: 0 },
//       normal: { count: 0, revenue: 0 },
//       late: { count: 0, revenue: 0 }
//     };
    
//     // For top products
//     const productsSold = {};

//     console.log("Total documents in snapshot:", orderSnapshot.docs.length);

//     // Convert date range strings to Date objects for comparison
//     const fromDate = new Date(dateRange.from);
//     fromDate.setHours(0, 0, 0, 0); // Start of day
    
//     const toDate = new Date(dateRange.to);
//     toDate.setHours(23, 59, 59, 999); // End of day

//     console.log("Filtering orders from:", fromDate, "to:", toDate);

//     // Helper function to normalize orders (same as OrdersManagement)
//     const normalizeOrder = (orderData) => {
//       // If order already has items array (cart order), return as is
//       if (orderData.items && Array.isArray(orderData.items)) {
//         return orderData;
//       }
      
//       // If it's an individual order, convert to items array format
//       if (orderData.productId || orderData.productName) {
//         return {
//           ...orderData,
//           items: [{
//             id: orderData.productId || 'unknown',
//             name: orderData.productName || 'Unknown Product',
//             productName: orderData.productName || 'Unknown Product',
//             price: orderData.price || 0,
//             quantity: orderData.quantity || 1,
//             deliverySpeed: orderData.deliverySpeed || orderData.deliveryOption || orderData.originalDeliveryOption || 'normal'
//           }]
//         };
//       }
      
//       // Fallback for orders without clear structure
//       return {
//         ...orderData,
//         items: []
//       };
//     };

//     orderSnapshot.forEach((doc) => {
//       const rawOrderData = doc.data();
      
//       // Normalize the order first
//       const orderData = normalizeOrder(rawOrderData);
      
//       // Get order date
//       let orderDate = null;
//       if (orderData.orderDate) {
//         if (orderData.orderDate instanceof Timestamp) {
//           orderDate = orderData.orderDate.toDate();
//         } else if (orderData.orderDate.seconds) {
//           orderDate = new Date(orderData.orderDate.seconds * 1000);
//         } else {
//           orderDate = new Date(orderData.orderDate);
//         }
//       } else if (orderData.createdAt) {
//         if (orderData.createdAt instanceof Timestamp) {
//           orderDate = orderData.createdAt.toDate();
//         } else if (orderData.createdAt.seconds) {
//           orderDate = new Date(orderData.createdAt.seconds * 1000);
//         } else {
//           orderDate = new Date(orderData.createdAt);
//         }
//       }

//       // Skip documents without a valid date
//       if (!orderDate || isNaN(orderDate.getTime())) {
//         console.log("Skipping order with no valid date:", doc.id);
//         return;
//       }

//       // Apply date filter - only process orders within the selected date range
//       if (orderDate < fromDate || orderDate > toDate) {
//         console.log("Skipping order outside date range:", doc.id, "Order date:", orderDate);
//         return;
//       }

//       console.log("Processing order:", doc.id, "Order date:", orderDate);
      
//       // Count the order (only orders within date range)
//       totalOrders++;
      
//       // Process order items
//       if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
//         // Get unique delivery speeds in this order
//         const speedsInOrder = new Set();
//         orderData.items.forEach(item => {
//           const speed = item.deliverySpeed || item.originalDeliverySpeed || 'normal';
//           speedsInOrder.add(speed);
          
//           // Count items and accumulate revenue
//           totalItems += (item.quantity || 1);
//           const itemRevenue = (item.price || item.finalPrice || 0) * (item.quantity || 1);
//           totalRevenue += itemRevenue;
          
//           // Track product popularity
//           const productId = item.id || 'unknown';
//           const productName = item.name || item.productName || 'Unknown Product';
//           if (!productsSold[productId]) {
//             productsSold[productId] = {
//               id: productId,
//               name: productName,
//               quantity: 0,
//               revenue: 0
//             };
//           }
//           productsSold[productId].quantity += (item.quantity || 1);
//           productsSold[productId].revenue += itemRevenue;
//         });
        
//         // Process speeds and calculate revenue by speed
//         speedsInOrder.forEach(speed => {
//           if (['quick', 'normal', 'late'].includes(speed)) {
//             // Count orders by speed
//             speedCounts[speed].count++;
            
//             // Calculate revenue for this speed
//             const speedItems = orderData.items.filter(item => 
//               (item.deliverySpeed || item.originalDeliverySpeed || 'normal') === speed
//             );
            
//             const speedRevenue = speedItems.reduce((sum, item) => 
//               sum + ((item.price || item.finalPrice || 0) * (item.quantity || 1)), 0
//             );
            
//             speedCounts[speed].revenue += speedRevenue;
//           }
//         });
//       } else {
//         // Fallback for orders without items array (normalize as normal delivery)
//         speedCounts.normal.count++;
        
//         // Use totalAmount if available
//         if (orderData.totalAmount) {
//           totalRevenue += orderData.totalAmount;
//           speedCounts.normal.revenue += orderData.totalAmount;
//           totalItems += 1; // Count as 1 item for orders without item details
//         } else if (orderData.price) {
//           const revenue = orderData.price * (orderData.quantity || 1);
//           totalRevenue += revenue;
//           speedCounts.normal.revenue += revenue;
//           totalItems += (orderData.quantity || 1);
          
//           // Track product for individual orders
//           const productId = orderData.productId || 'unknown';
//           const productName = orderData.productName || 'Unknown Product';
//           if (!productsSold[productId]) {
//             productsSold[productId] = {
//               id: productId,
//               name: productName,
//               quantity: 0,
//               revenue: 0
//             };
//           }
//           productsSold[productId].quantity += (orderData.quantity || 1);
//           productsSold[productId].revenue += revenue;
//         }
//       }
      
//       // Process order status
//       const status = orderData.status || 'Pending';
//       if (!statusCounts[status]) {
//         statusCounts[status] = 0;
//       }
//       statusCounts[status]++;
//     });
    
//     // Calculate average order value
//     const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
//     console.log("Filtered results:", {
//       totalOrders,
//       totalRevenue,
//       averageOrderValue,
//       totalItems,
//       dateRange
//     });
    
//     // Set overview stats
//     setOverviewStats({
//       totalOrders,
//       totalRevenue,
//       averageOrderValue,
//       totalItems
//     });
    
//     // Format status data for pie chart
//     const statusData = Object.keys(statusCounts).map(status => ({
//       name: status,
//       value: statusCounts[status],
//       color: STATUS_COLORS[status] || '#CCCCCC'
//     }));
//     setOrderStatusData(statusData);
    
//     // Format delivery speed data for pie chart
//     const speedData = Object.keys(speedCounts).map(speed => ({
//       name: getDeliverySpeedDisplayName(speed),
//       value: speedCounts[speed].count,
//       color: DELIVERY_COLORS[speed] || '#CCCCCC'
//     }));
//     setDeliverySpeedData(speedData);
    
//     // Format revenue by delivery speed for bar chart
//     const revenueData = Object.keys(speedCounts).map(speed => ({
//       name: getDeliverySpeedDisplayName(speed),
//       revenue: speedCounts[speed].revenue,
//       color: DELIVERY_COLORS[speed] || '#CCCCCC'
//     }));
//     setRevenueByDeliverySpeed(revenueData);
    
//     // Format top products data for bar chart
//     const productsArray = Object.values(productsSold)
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 10);
//     setTopProducts(productsArray);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const getDeliverySpeedDisplayName = (speed) => {
//     if (!speed) return 'Standard';

//     switch (speed.toLowerCase()) {
//       case 'quick':
//       case 'express':
//         return 'Quick';
//       case 'normal':
//       case 'standard':
//         return 'Standard';
//       case 'late':
//       case 'eco':
//         return 'Eco';
//       default:
//         return 'Standard';
//     }
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="custom-tooltip">
//           <p className="label">{`${label}`}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color || entry.fill }}>
//               {entry.name}: {entry.dataKey === 'revenue' 
//                 ? formatCurrency(entry.value) 
//                 : entry.value}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   const renderPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
//     return (
//       <text 
//         x={x} 
//         y={y} 
//         fill="white" 
//         textAnchor={x > cx ? 'start' : 'end'} 
//         dominantBaseline="central"
//         className="pie-chart-label"
//       >
//         {`${name} (${(percent * 100).toFixed(0)}%)`}
//       </text>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="reports-container">
//         <div className="loading-spinner"></div>
//         <p>Loading report data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="reports-container">
//         <div className="error-message">
//           <h2>Error</h2>
//           <p>{error}</p>
//           <button onClick={fetchReportData}>Retry</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="reports-container">
//       <h1>Sales & Delivery Reports</h1>
      
//       {/* Date Range Filter */}
//       <div className="date-filter-section">
//         <h3>Filter by Date Range</h3>
//         <div className="date-inputs">
//           <div className="date-input-group">
//             <label>From:</label>
//             <input 
//               type="date" 
//               value={dateRange.from} 
//               onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
//             />
//           </div>
//           <div className="date-input-group">
//             <label>To:</label>
//             <input 
//               type="date" 
//               value={dateRange.to} 
//               onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
//             />
//           </div>
//           <button 
//             className="apply-filter-btn"
//             onClick={fetchReportData}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Apply Filter'}
//           </button>
//           <button 
//             className="reset-filter-btn"
//             onClick={() => {
//               setDateRange({
//                 from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
//                 to: new Date().toISOString().split('T')[0]
//               });
//             }}
//             disabled={loading}
//           >
//             Reset to Last 30 Days
//           </button>
//         </div>
//         <div className="current-filter-info">
//           <p>Showing data from <strong>{new Date(dateRange.from).toLocaleDateString()}</strong> to <strong>{new Date(dateRange.to).toLocaleDateString()}</strong></p>
//         </div>
//       </div>
      
//       {/* Overview Stats */}
//       <div className="overview-section">
//         <h2>Overview</h2>
//         <div className="stats-cards">
//           <div className="stat-card">
//             <div className="stat-icon">📊</div>
//             <div className="stat-details">
//               <h3>Total Orders</h3>
//               <p className="stat-value">{overviewStats.totalOrders}</p>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">💰</div>
//             <div className="stat-details">
//               <h3>Total Revenue</h3>
//               <p className="stat-value">{formatCurrency(overviewStats.totalRevenue)}</p>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">📈</div>
//             <div className="stat-details">
//               <h3>Average Order Value</h3>
//               <p className="stat-value">{formatCurrency(overviewStats.averageOrderValue)}</p>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">📦</div>
//             <div className="stat-details">
//               <h3>Total Items Sold</h3>
//               <p className="stat-value">{overviewStats.totalItems}</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Main Analytics Section */}
//       <div className="analytics-section">
//         {/* Order Status Distribution */}
//         <div className="analytics-card">
//           <h2>Order Status Distribution</h2>
//           {orderStatusData.length > 0 ? (
//             <div className="chart-container">
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={orderStatusData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={renderPieChartLabel}
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {orderStatusData.map((entry, index) => (
//                       <Cell 
//                         key={`cell-${index}`} 
//                         fill={entry.color || COLORS[index % COLORS.length]} 
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip content={<CustomTooltip />} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="chart-legend">
//                 {orderStatusData.map((entry, index) => (
//                   <div className="legend-item" key={index}>
//                     <div 
//                       className="legend-color" 
//                       style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} 
//                     />
//                     <span>{entry.name}: {entry.value} orders</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <p className="no-data-message">
//               No orders found for the selected date range ({new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}). 
//               Try expanding the date range or check if there are any orders in the system.
//             </p>
//           )}
//         </div>
        
//         {/* Delivery Speed Distribution */}
//         <div className="analytics-card">
//           <h2>Delivery Speed Distribution</h2>
//           {deliverySpeedData.length > 0 ? (
//             <div className="chart-container">
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={deliverySpeedData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={renderPieChartLabel}
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {deliverySpeedData.map((entry, index) => (
//                       <Cell 
//                         key={`cell-${index}`} 
//                         fill={entry.color || COLORS[index % COLORS.length]} 
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip content={<CustomTooltip />} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="chart-legend">
//                 {deliverySpeedData.map((entry, index) => (
//                   <div className="legend-item" key={index}>
//                     <div 
//                       className="legend-color" 
//                       style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} 
//                     />
//                     <span>{entry.name}: {entry.value} orders</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <p className="no-data-message">No data available for the selected date range.</p>
//           )}
//         </div>
        
//         {/* Revenue by Delivery Speed */}
//         <div className="analytics-card">
//           <h2>Revenue by Delivery Speed</h2>
//           {revenueByDeliverySpeed.length > 0 ? (
//             <div className="chart-container">
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart
//                   data={revenueByDeliverySpeed}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis tickFormatter={(value) => formatCurrency(value)} />
//                   <Tooltip 
//                     formatter={(value) => formatCurrency(value)} 
//                     content={<CustomTooltip />} 
//                   />
//                   <Bar dataKey="revenue" name="Revenue">
//                     {revenueByDeliverySpeed.map((entry, index) => (
//                       <Cell 
//                         key={`cell-${index}`} 
//                         fill={entry.color || COLORS[index % COLORS.length]} 
//                       />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <p className="no-data-message">No data available for the selected date range.</p>
//           )}
//         </div>
        
//         {/* Top Products */}
//         <div className="analytics-card full-width">
//           <h2>Top 10 Products by Revenue</h2>
//           {topProducts.length > 0 ? (
//             <div className="chart-container top-products-chart">
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart
//                   data={topProducts}
//                   layout="vertical"
//                   margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
//                   <YAxis 
//                     type="category" 
//                     dataKey="name" 
//                     width={200}
//                     tick={{ fontSize: 12 }}
//                   />
//                   <Tooltip formatter={(value) => formatCurrency(value)} />
//                   <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <p className="no-data-message">No data available for the selected date range.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;





import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  where, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './Reports.css';

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];
const DELIVERY_COLORS = {
  quick: '#FF6B6B',
  normal: '#4ECDC4',
  late: '#C7F464'
};
const STATUS_COLORS = {
  'Pending': '#FFC107',
  'Processing': '#2196F3',
  'Shipped': '#9C27B0',
  'Out for Delivery': '#3F51B5',
  'Delivered': '#4CAF50',
  'Cancelled': '#F44336'
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const [overviewStats, setOverviewStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [deliverySpeedData, setDeliverySpeedData] = useState([]);
  const [revenueByDeliverySpeed, setRevenueByDeliverySpeed] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert string dates to Firestore Timestamps
      const fromTimestamp = Timestamp.fromDate(new Date(dateRange.from + 'T00:00:00'));
      const toTimestamp = Timestamp.fromDate(new Date(dateRange.to + 'T23:59:59'));

      // Query Firestore orders in date range, sorted by createdAt
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', fromTimestamp),
        where('createdAt', '<=', toTimestamp),
        orderBy('createdAt', 'desc')
      );
      const orderSnapshot = await getDocs(ordersQuery);

      if (orderSnapshot.empty) {
        setOverviewStats({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, totalItems: 0 });
        setOrderStatusData([]);
        setDeliverySpeedData([]);
        setRevenueByDeliverySpeed([]);
        setTopProducts([]);
        setLoading(false);
        return;
      }

      // Process and aggregate order data
      processOrderData(orderSnapshot);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (orderSnapshot) => {
    let totalOrders = 0, totalRevenue = 0, totalItems = 0;
    const statusCounts = {};
    const speedCounts = { quick: { count: 0, revenue: 0 }, normal: { count: 0, revenue: 0 }, late: { count: 0, revenue: 0 } };
    const productsSold = {};

    // Helper: Standardize order shape
    const normalizeOrder = (orderData) => {
      if (orderData.items && Array.isArray(orderData.items)) return orderData;
      if (orderData.productId || orderData.productName) {
        return {
          ...orderData,
          items: [{
            id: orderData.productId || 'unknown',
            name: orderData.productName || 'Unknown Product',
            price: orderData.price || 0,
            quantity: orderData.quantity || 1,
            deliverySpeed: orderData.deliverySpeed || orderData.deliveryOption || 'normal'
          }]
        };
      }
      return { ...orderData, items: [] };
    };

    orderSnapshot.forEach((doc) => {
      const rawOrderData = doc.data();
      const orderData = normalizeOrder(rawOrderData);

      // We already filtered by createdAt in query, so no date filtering needed here
      totalOrders++;

      // Process items in the order
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        const speedsInOrder = new Set();
        orderData.items.forEach(item => {
          const speed = (item.deliverySpeed || item.originalDeliverySpeed || 'normal').toLowerCase();
          speedsInOrder.add(speed);

          // Revenue & item count
          const quantity = item.quantity || 1;
          const price = item.price || item.finalPrice || 0;
          const itemRevenue = price * quantity;
          totalItems += quantity;
          totalRevenue += itemRevenue;

          // Track product popularity
          const productId = item.id || 'unknown';
          const productName = item.name || item.productName || 'Unknown Product';
          if (!productsSold[productId]) {
            productsSold[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
          }
          productsSold[productId].quantity += quantity;
          productsSold[productId].revenue += itemRevenue;
        });
        // For each speed in order, count and sum revenue
        speedsInOrder.forEach(speed => {
          if (speedCounts[speed]) {
            speedCounts[speed].count++;
            // Revenue for this speed: sum all matching items
            const speedRevenue = orderData.items.filter(item => (item.deliverySpeed || 'normal').toLowerCase() === speed)
              .reduce((sum, item) => sum + ((item.price || item.finalPrice || 0) * (item.quantity || 1)), 0);
            speedCounts[speed].revenue += speedRevenue;
          }
        });
      } else {
        // Orders with no items (fallback, rare)
        speedCounts.normal.count++;
        if (orderData.totalAmount) {
          totalRevenue += orderData.totalAmount;
          speedCounts.normal.revenue += orderData.totalAmount;
          totalItems += 1;
        } else if (orderData.price) {
          const revenue = orderData.price * (orderData.quantity || 1);
          totalRevenue += revenue;
          speedCounts.normal.revenue += revenue;
          totalItems += (orderData.quantity || 1);
          const productId = orderData.productId || 'unknown';
          const productName = orderData.productName || 'Unknown Product';
          if (!productsSold[productId]) {
            productsSold[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
          }
          productsSold[productId].quantity += (orderData.quantity || 1);
          productsSold[productId].revenue += revenue;
        }
      }

      // Order status
      const status = orderData.status || 'Pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Overview stats
    setOverviewStats({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalItems
    });

    // Pie: status distribution
    const statusData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      color: STATUS_COLORS[status] || '#CCCCCC'
    }));
    setOrderStatusData(statusData);

    // Pie: delivery speed
    const speedData = Object.keys(speedCounts).map(speed => ({
      name: getDeliverySpeedDisplayName(speed),
      value: speedCounts[speed].count,
      color: DELIVERY_COLORS[speed] || '#CCCCCC'
    }));
    setDeliverySpeedData(speedData);

    // Bar: revenue by delivery speed
    const revenueData = Object.keys(speedCounts).map(speed => ({
      name: getDeliverySpeedDisplayName(speed),
      revenue: speedCounts[speed].revenue,
      color: DELIVERY_COLORS[speed] || '#CCCCCC'
    }));
    setRevenueByDeliverySpeed(revenueData);

    // Top 10 products by revenue
    const productsArray = Object.values(productsSold)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    setTopProducts(productsArray);
  };

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDeliverySpeedDisplayName = (speed) => {
    switch ((speed || '').toLowerCase()) {
      case 'quick': case 'express': return 'Quick';
      case 'normal': case 'standard': return 'Standard';
      case 'late': case 'eco': return 'Eco';
      default: return 'Standard';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.dataKey === 'revenue' 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="pie-chart-label"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // --- UI ---

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchReportData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <h1>Sales & Delivery Reports</h1>

      {/* Date Range Filter */}
      <div className="date-filter-section">
        <h3>Filter by Date Range</h3>
        <div className="date-inputs">
          <div className="date-input-group">
            <label>From:</label>
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
          </div>
          <div className="date-input-group">
            <label>To:</label>
            <input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>
          <button 
            className="apply-filter-btn"
            onClick={fetchReportData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply Filter'}
          </button>
          <button 
            className="reset-filter-btn"
            onClick={() => {
              const newDateRange = {
                from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              };
              setDateRange(newDateRange);
            }}
            disabled={loading}
          >
            Reset to Last 30 Days
          </button>
        </div>
        <div className="current-filter-info">
          <p>Showing data from <strong>{new Date(dateRange.from).toLocaleDateString()}</strong> to <strong>{new Date(dateRange.to).toLocaleDateString()}</strong></p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="overview-section">
        <h2>Overview</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <h3>Total Orders</h3>
              <p className="stat-value">{overviewStats.totalOrders}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(overviewStats.totalRevenue)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-details">
              <h3>Average Order Value</h3>
              <p className="stat-value">{formatCurrency(overviewStats.averageOrderValue)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-details">
              <h3>Total Items Sold</h3>
              <p className="stat-value">{overviewStats.totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="analytics-section">
        {/* Order Status Distribution */}
        <div className="analytics-card">
          <h2>Order Status Distribution</h2>
          {orderStatusData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieChartLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-status-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {orderStatusData.map((entry, index) => (
                  <div className="legend-item" key={index}>
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} 
                    />
                    <span>{entry.name}: {entry.value} orders</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-data-message">
              No orders found for the selected date range ({new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}). 
              Try expanding the date range or check if there are any orders in the system.
            </p>
          )}
        </div>

        {/* Delivery Speed Distribution */}
        <div className="analytics-card">
          <h2>Delivery Speed Distribution</h2>
          {deliverySpeedData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliverySpeedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieChartLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deliverySpeedData.map((entry, index) => (
                      <Cell 
                        key={`cell-speed-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {deliverySpeedData.map((entry, index) => (
                  <div className="legend-item" key={index}>
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} 
                    />
                    <span>{entry.name}: {entry.value} orders</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-data-message">No data available for the selected date range.</p>
          )}
        </div>

        {/* Revenue by Delivery Speed */}
        <div className="analytics-card">
          <h2>Revenue by Delivery Speed</h2>
          {revenueByDeliverySpeed.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueByDeliverySpeed}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    content={<CustomTooltip />} 
                  />
                  <Bar dataKey="revenue" name="Revenue">
                    {revenueByDeliverySpeed.map((entry, index) => (
                      <Cell 
                        key={`cell-revenue-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data-message">No data available for the selected date range.</p>
          )}
        </div>

        {/* Top Products */}
        <div className="analytics-card full-width">
          <h2>Top 10 Products by Revenue</h2>
          {topProducts.length > 0 ? (
            <div className="chart-container top-products-chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={200}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data-message">No data available for the selected date range.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
