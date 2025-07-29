// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import './Header.css';

// function Header({ toggleSidebar }) {
//   const { currentUser, logout } = useAuth();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const navigate = useNavigate();
  
//   const handleSignOut = async () => {
//     try {
//       await logout();
//       navigate('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };
  
//   const toggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };
  
//   const getInitials = (user) => {
//     if (!user || !user.email) return 'A';
//     return user.email.charAt(0).toUpperCase();
//   };
  
//   return (
//     <div className="header">
//       <button onClick={toggleSidebar} className="toggle-menu">
//         <i className="fas fa-bars"></i>
//       </button>
      
//       <div className="header-right">
//         <div className="admin-profile" onClick={toggleDropdown}>
//           <div className="admin-avatar">
//             {getInitials(currentUser)}
//           </div>
//           <div className="admin-name">
//             {currentUser?.email}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Header;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationSystem from '../NotificationSystem/NotificationSystem';
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
        {/* Notification System */}
        <div className="notification-container">
          <NotificationSystem />
        </div>
        
        <div className="admin-profile" onClick={toggleDropdown}>
          <div className="admin-avatar">
            {getInitials(currentUser)}
          </div>
          <div className="admin-name">
            {currentUser?.email}
          </div>
          
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-divider"></div>
              <button onClick={handleSignOut} className="dropdown-item sign-out">
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;