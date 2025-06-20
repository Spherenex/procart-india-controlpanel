import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header({ toggleSidebar }) {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const getInitials = (user) => {
    if (!user || !user.email) return 'A';
    return user.email.charAt(0).toUpperCase();
  };
  
  return (
    <div className="header">
      <button onClick={toggleSidebar} className="toggle-menu">
        <i className="fas fa-bars"></i>
      </button>
      
      <div className="header-right">
        <div className="admin-profile" onClick={toggleDropdown}>
          <div className="admin-avatar">
            {getInitials(currentUser)}
          </div>
          <div className="admin-name">
            {currentUser?.email}
          </div>
          <i className="fas fa-chevron-down dropdown-icon"></i>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user-circle"></i> Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                <i className="fas fa-cog"></i> Settings
              </Link>
              <a href="#" onClick={handleSignOut} className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;