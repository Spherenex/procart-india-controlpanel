import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AddUser.css';

function AddUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    status: 'Active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, role, status } = formData;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create the user data (excluding password and confirmPassword)
      const userData = {
        name,
        role,
        status
      };
      
      // Create user in Firebase Auth and Firestore
      await signup(email, password, userData);
      
      setSuccess('User created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        status: 'Active'
      });
      
      // Navigate to users list after 2 seconds
      setTimeout(() => {
        navigate('/users');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/users');
  };
  
  return (
    <div className="content">
      <h1 className="page-title">Add New User</h1>
      
      <div className="card form-card">
        <h2 className="form-title">User Information</h2>
        
        {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name<span className="required">*</span></label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-control" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email<span className="required">*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-control" 
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password<span className="required">*</span></label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="form-control" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <small className="form-text">Password must be at least 6 characters</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password<span className="required">*</span></label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                className="form-control" 
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role" 
                name="role" 
                className="form-control" 
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select 
                id="status" 
                name="status" 
                className="form-control" 
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;