import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, closeSidebar, mode = 'default' }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle menu item click - navigate and close sidebar on mobile
  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 992) {
      closeSidebar();
    }
  };
  
  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Define menu items based on current mode
  const getMenuItems = () => {
    const defaultItems = [
      { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      { path: '/users', icon: 'fas fa-users', label: 'Users' },
      { path: '/add-user', icon: 'fas fa-user-plus', label: 'Add User' },
      { path: '/profile', icon: 'fas fa-user-circle', label: 'Profile' },
      { path: '/settings', icon: 'fas fa-cog', label: 'Settings' }
    ];
    
    const itemsMode = [
      { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      { path: '/manage-banner', icon: 'fas fa-image', label: 'Manage Banner' },
      { path: '/create-items', icon: 'fas fa-plus-circle', label: 'Create Items' },
      { path: '/manage-items', icon: 'fas fa-boxes', label: 'Manage Items' },
      { path: '/manage-footer', icon: 'fas fa-shoe-prints', label: 'Manage Footer' }
    ];
    
    const ordersMode = [
      { path: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      { path: '/orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
      { path: '/delivery', icon: 'fas fa-truck', label: 'Delivery' },
      { path: '/users', icon: 'fas fa-users', label: 'Users' },
      { path: '/customer-support', icon: 'fas fa-headset', label: 'Customer Support' },
      { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' }
    ];
    
    switch(mode) {
      case 'items':
        return itemsMode;
      case 'orders':
        return ordersMode;
      default:
        return defaultItems;
    }
  };
  
  const menuItems = getMenuItems();
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>ProCart</h2>
        <button className="sidebar-close" onClick={closeSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.path)}
          >
            <i className={item.icon}></i> {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;