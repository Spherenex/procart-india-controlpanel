




// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// // Layout Components
// import Sidebar from './components/layout/Sidebar';
// import Header from './components/layout/Header';

// // Auth Components
// import Login from './components/auth/Login';

// // Dashboard Component
// import Dashboard from './components/dashboard/Dashboard';

// // User Management Components
// import UsersList from './components/users/UsersList';
// import AddUser from './components/users/AddUser';

// // Items Management Components
// import BannerManagement from './components/BannerManagement/BannerManagement';
// import ProductManagement from './components/ProductManagement/ProductManagement';
// import ManageItems from './components/ManageItems/ManageItems';
// import ManageFooter from './components/Managefooter/ManageFooter';

// // Orders Management Components
// import OrdersManagement from './components/Ordersmanagement/Ordersmanagement';
// import Reports from './components/Reports/Reports';
// import DeliveryManagement from './components/DeliveryManagement/DeliveryManagement';
// import Locations from './components/Locations/Locations'; // Import the Locations component
// import CustomerSupportPage from './components/CustomerSupportPage/CustomerSupportPage';

// // Design House Management Components
// import ModelBannerManagement from './components/DesignHouseManagement/ModelBannerManagement';
// import ModalsManagement from './components/DesignHouseManagement/ModalsManagement';
// import LiveHackathonsManagement from './components/DesignHouseManagement/LiveHackathonsManagement';
// import FeaturedProductsManagement from './components/DesignHouseManagement/FeaturedProductsManagement';
// import TestimonialsManagement from './components/DesignHouseManagement/TestimonialsManagement';
// import ProjectShowcaseManagement from './components/DesignHouseManagement/ProjectShowcaseManagement';

// // CSS
// import './App.css';

// function App() {
//   const auth = useAuth();
//   const { currentUser } = auth || {}; // Prevent destructuring errors
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992); // Default open on desktop, closed on mobile
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [mode, setMode] = useState('default'); // Add mode state: 'default', 'items', 'orders', or 'designHouse'
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Reset mode when navigating to dashboard directly
//   useEffect(() => {
//     const handleNavigation = () => {
//       if (location.pathname === '/dashboard') {
//         setMode('default');
//       } else if (
//         ['/model-banner', '/manage-modals', '/live-hackathons', '/featured-products', '/testimonials', '/project-showcase'].includes(location.pathname)
//       ) {
//         setMode('designHouse');
//       } else if (
//         ['/manage-banner', '/create-items', '/manage-items', '/manage-footer'].includes(location.pathname)
//       ) {
//         setMode('items');
//       } else if (
//         ['/orders', '/delivery', '/customer-support', '/reports', '/locations'].includes(location.pathname)
//       ) {
//         setMode('orders');
//       }
//     };

//     // Handle mode changes when navigating directly to a route
//     handleNavigation();
//   }, [location.pathname]);

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

//               {/* User Management Routes */}
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
//                     <ManageFooter />
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Orders Management Routes */}
//               <Route
//                 path="/orders"
//                 element={
//                   <ProtectedRoute>
//                     <OrdersManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/delivery"
//                 element={
//                   <ProtectedRoute>
//                     <DeliveryManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/customer-support"
//                 element={
//                   <ProtectedRoute>
//                     <CustomerSupportPage/>
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/reports"
//                 element={
//                   <ProtectedRoute>
//                     <Reports />
//                   </ProtectedRoute>
//                 }
//               />
//               {/* Locations Route - Added for order location tracking */}
//               <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />

//               {/* Design House Management Routes */}
//               <Route
//                 path="/model-banner"
//                 element={
//                   <ProtectedRoute>
//                     <ModelBannerManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/manage-modals"
//                 element={
//                   <ProtectedRoute>
//                     <ModalsManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/live-hackathons"
//                 element={
//                   <ProtectedRoute>
//                     <LiveHackathonsManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/featured-products"
//                 element={
//                   <ProtectedRoute>
//                     <FeaturedProductsManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/testimonials"
//                 element={
//                   <ProtectedRoute>
//                     <TestimonialsManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/project-showcase"
//                 element={
//                   <ProtectedRoute>
//                     <ProjectShowcaseManagement />
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Settings Route */}
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
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Auth Components
import Login from './components/auth/Login';

// Dashboard Component
import Dashboard from './components/dashboard/Dashboard';

// User Management Components
import UsersList from './components/users/UsersList';
import AddUser from './components/users/AddUser';

// Items Management Components
import BannerManagement from './components/BannerManagement/BannerManagement';
import ProductManagement from './components/ProductManagement/ProductManagement';
import ManageItems from './components/ManageItems/ManageItems';
import ManageFooter from './components/Managefooter/ManageFooter';

// Orders Management Components
import OrdersManagement from './components/Ordersmanagement/Ordersmanagement';
import Reports from './components/Reports/Reports';
import DeliveryManagement from './components/DeliveryManagement/DeliveryManagement';
import Locations from './components/Locations/Locations'; // Import the Locations component
import CustomerSupportPage from './components/CustomerSupportPage/CustomerSupportPage';

// Design House Management Components
import ModelBannerManagement from './components/DesignHouseManagement/ModelBannerManagement';
import ModalsManagement from './components/DesignHouseManagement/ModalsManagement';
import LiveHackathonsManagement from './components/DesignHouseManagement/LiveHackathonsManagement';
import FeaturedProductsManagement from './components/DesignHouseManagement/FeaturedProductsManagement';
import TestimonialsManagement from './components/DesignHouseManagement/TestimonialsManagement';
import ProjectShowcaseManagement from './components/DesignHouseManagement/ProjectShowcaseManagement';

// Notifications
import NotificationsPage from './pages/NotificationsPage';

// CSS
import './App.css';

function App() {
  const auth = useAuth();
  const { currentUser } = auth || {}; // Prevent destructuring errors
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992); // Default open on desktop, closed on mobile
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mode, setMode] = useState('default'); // Add mode state: 'default', 'items', 'orders', or 'designHouse'
  const navigate = useNavigate();
  const location = useLocation();

  // Reset mode when navigating to dashboard directly
  useEffect(() => {
    const handleNavigation = () => {
      if (location.pathname === '/dashboard') {
        setMode('default');
      } else if (
        ['/model-banner', '/manage-modals', '/live-hackathons', '/featured-products', '/testimonials', '/project-showcase'].includes(location.pathname)
      ) {
        setMode('designHouse');
      } else if (
        ['/manage-banner', '/create-items', '/manage-items', '/manage-footer'].includes(location.pathname)
      ) {
        setMode('items');
      } else if (
        ['/orders', '/delivery', '/customer-support', '/reports', '/locations', '/notifications'].includes(location.pathname)
      ) {
        setMode('orders');
      }
    };

    // Handle mode changes when navigating directly to a route
    handleNavigation();
  }, [location.pathname]);

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

              {/* User Management Routes */}
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
                    <OrdersManagement />
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
                    <CustomerSupportPage/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              {/* Locations Route - Added for order location tracking */}
              <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
              
              {/* Notifications Route */}
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Design House Management Routes */}
              <Route
                path="/model-banner"
                element={
                  <ProtectedRoute>
                    <ModelBannerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-modals"
                element={
                  <ProtectedRoute>
                    <ModalsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-hackathons"
                element={
                  <ProtectedRoute>
                    <LiveHackathonsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/featured-products"
                element={
                  <ProtectedRoute>
                    <FeaturedProductsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/testimonials"
                element={
                  <ProtectedRoute>
                    <TestimonialsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project-showcase"
                element={
                  <ProtectedRoute>
                    <ProjectShowcaseManagement />
                  </ProtectedRoute>
                }
              />

              {/* Settings Route */}
              {/* <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="content"><h1>Settings</h1></div>
                  </ProtectedRoute>
                }
              /> */}

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