



// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// // Layout Components
// import Sidebar from './components/layout/Sidebar';
// import Header from './components/layout/Header';

// // Page Components
// import Login from './components/auth/Login';
// import Dashboard from './components/dashboard/Dashboard';
// import UsersList from './components/users/UsersList';
// import AddUser from './components/users/AddUser';
// import BannerManagement from './components/BannerManagement/BannerManagement';
// import ProductManagement from './components/ProductManagement/ProductManagement';
// import CategoryManagement from './components/CategoryManagement/CategoryManagement';
// import ManageItems from './components/ManageItems/ManageItems';
// import OrdersManagement from './components/Ordersmanagement/Ordersmanagement'
// import DeliveryManagement from './components/DeliveryManagement/DeliveryManagement';

// // CSS
// import './App.css';

// function App() {
//   const auth = useAuth();
//   const { currentUser } = auth || {}; // Prevent destructuring errors
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992); // Default open on desktop, closed on mobile
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [mode, setMode] = useState('default'); // Add mode state: 'default', 'items', or 'orders'
//   const navigate = useNavigate();

//   // Reset mode when navigating to dashboard directly
//   useEffect(() => {
//     const handleNavigation = () => {
//       if (window.location.pathname === '/dashboard') {
//         setMode('default');
//       }
//     };
    
//     // Listen for navigation changes
//     handleNavigation();
    
//     return () => {
//       // Cleanup
//     };
//   }, [navigate]);

//   // Track window resizing
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//       if (window.innerWidth > 992) {
//         setSidebarOpen(true);
//       } else if (sidebarOpen && window.innerWidth <= 992) {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [sidebarOpen]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
  
//   const closeSidebar = () => {
//     if (windowWidth <= 992) {
//       setSidebarOpen(false);
//     }
//   };

//   // Protected Route component
//   const ProtectedRoute = ({ children }) => {
//     if (!currentUser) {
//       return <Navigate to="/login" />;
//     }
//     return children;
//   };

//   return (
//     <div className="App">
//       {currentUser ? (
//         <div className={`dashboard ${sidebarOpen && windowWidth <= 992 ? 'sidebar-open' : ''}`}>
//           <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} mode={mode} />
//           <div className="main-content">
//             <Header toggleSidebar={toggleSidebar} />
//             <Routes>
//               <Route path="/" element={<Navigate to="/dashboard" />} />
//               <Route 
//                 path="/dashboard" 
//                 element={
//                   <ProtectedRoute>
//                     <Dashboard setMode={setMode} />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/users" 
//                 element={
//                   <ProtectedRoute>
//                     <UsersList />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/add-user" 
//                 element={
//                   <ProtectedRoute>
//                     <AddUser />
//                   </ProtectedRoute>
//                 } 
//               />
              
//               {/* Items Management Routes */}
//               <Route 
//                 path="/manage-banner" 
//                 element={
//                   <ProtectedRoute>
//                     <BannerManagement />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/create-items" 
//                 element={
//                   <ProtectedRoute>
//                     <ProductManagement />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/manage-items" 
//                 element={
//                   <ProtectedRoute>
//                     <ManageItems />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/manage-footer" 
//                 element={
//                   <ProtectedRoute>
//                     <div className="content"><h1>Manage Footer</h1></div>
//                   </ProtectedRoute>
//                 } 
//               />
              
//               {/* Orders Management Routes */}
//               <Route 
//                 path="/orders" 
//                 element={
//                   <ProtectedRoute>
//                     <OrdersManagement/>
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/delivery" 
//                 element={
//                   <ProtectedRoute>
//                    <DeliveryManagement />
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/customer-support" 
//                 element={
//                   <ProtectedRoute>
//                     <div className="content"><h1>Customer Support</h1></div>
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/reports" 
//                 element={
//                   <ProtectedRoute>
//                     <div className="content"><h1>Reports</h1></div>
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/profile" 
//                 element={
//                   <ProtectedRoute>
//                     <div className="content"><h1>Profile</h1></div>
//                   </ProtectedRoute>
//                 } 
//               />
//               <Route 
//                 path="/settings" 
//                 element={
//                   <ProtectedRoute>
//                     <div className="content"><h1>Settings</h1></div>
//                   </ProtectedRoute>
//                 } 
//               />
              
//               <Route path="*" element={<Navigate to="/dashboard" />} />
//             </Routes>
//           </div>
          
//           {/* Close sidebar when clicking outside on mobile */}
//           {sidebarOpen && windowWidth <= 992 && (
//             <div 
//               className="sidebar-backdrop" 
//               onClick={closeSidebar}
//               style={{
//                 position: 'fixed',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 998
//               }}
//             />
//           )}
//         </div>
//       ) : (
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Page Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import UsersList from './components/users/UsersList';
import AddUser from './components/users/AddUser';
import BannerManagement from './components/BannerManagement/BannerManagement';
import ProductManagement from './components/ProductManagement/ProductManagement';
import CategoryManagement from './components/CategoryManagement/CategoryManagement';
import ManageItems from './components/ManageItems/ManageItems';
import OrdersManagement from './components/Ordersmanagement/Ordersmanagement';
import DeliveryManagement from './components/DeliveryManagement/DeliveryManagement';

// Import ManageFooter component - Fixed the import path based on your file structure
import ManageFooter from './components/Managefooter/ManageFooter';

// CSS
import './App.css';

function App() {
  const auth = useAuth();
  const { currentUser } = auth || {}; // Prevent destructuring errors
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992); // Default open on desktop, closed on mobile
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mode, setMode] = useState('default'); // Add mode state: 'default', 'items', or 'orders'
  const navigate = useNavigate();

  // Reset mode when navigating to dashboard directly
  useEffect(() => {
    const handleNavigation = () => {
      if (window.location.pathname === '/dashboard') {
        setMode('default');
      }
    };
    
    // Listen for navigation changes
    handleNavigation();
    
    return () => {
      // Cleanup
    };
  }, [navigate]);

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 992) {
        setSidebarOpen(true);
      } else if (sidebarOpen && window.innerWidth <= 992) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    if (windowWidth <= 992) {
      setSidebarOpen(false);
    }
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div className="App">
      {currentUser ? (
        <div className={`dashboard ${sidebarOpen && windowWidth <= 992 ? 'sidebar-open' : ''}`}>
          <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} mode={mode} />
          <div className="main-content">
            <Header toggleSidebar={toggleSidebar} />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard setMode={setMode} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <UsersList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-user" 
                element={
                  <ProtectedRoute>
                    <AddUser />
                  </ProtectedRoute>
                } 
              />
              
              {/* Items Management Routes */}
              <Route 
                path="/manage-banner" 
                element={
                  <ProtectedRoute>
                    <BannerManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-items" 
                element={
                  <ProtectedRoute>
                    <ProductManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manage-items" 
                element={
                  <ProtectedRoute>
                    <ManageItems />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manage-footer" 
                element={
                  <ProtectedRoute>
                    <ManageFooter />
                  </ProtectedRoute>
                } 
              />
              
              {/* Orders Management Routes */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrdersManagement/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery" 
                element={
                  <ProtectedRoute>
                   <DeliveryManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer-support" 
                element={
                  <ProtectedRoute>
                    <div className="content"><h1>Customer Support</h1></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <div className="content"><h1>Reports</h1></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="content"><h1>Profile</h1></div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <div className="content"><h1>Settings</h1></div>
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
          
          {/* Close sidebar when clicking outside on mobile */}
          {sidebarOpen && windowWidth <= 992 && (
            <div 
              className="sidebar-backdrop" 
              onClick={closeSidebar}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 998
              }}
            />
          )}
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;