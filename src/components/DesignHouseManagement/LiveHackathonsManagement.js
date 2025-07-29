import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig'; // Adjust path as needed
import './LiveHackathonsManagement.css';

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    date: '',
    location: '',
    description: '',
    imageUrl: '',
    link: '',
    registrationOpen: true
  });

  // Fetch hackathons from Firestore
  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const hackathonsQuery = query(
        collection(db, 'hackathons'),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(hackathonsQuery);
      
      const hackathonsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHackathons(hackathonsList);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      setFormError("Failed to load hackathons. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Store file for upload
    setFormData({
      ...formData,
      imageFile: file
    });
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      // Create a unique filename
      const filename = `hackathon-images/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploadingImage(false);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      setFormError("Failed to upload image. Please try again.");
      setUploadingImage(false);
      return null;
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      organizer: '',
      date: '',
      location: '',
      description: '',
      imageUrl: '',
      link: '',
      registrationOpen: true
    });
    setPreviewImage(null);
    setIsEditing(false);
    setEditId(null);
    setFormError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title || !formData.organizer || !formData.date || 
        !formData.location || !formData.description || !formData.link) {
      setFormError('Please fill in all required fields');
      return false;
    }
    
    if (!formData.imageUrl && !formData.imageFile && !previewImage) {
      setFormError('Please upload an image or provide an image URL');
      return false;
    }
    
    setFormError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // First, upload the image if a new one was selected
      let imageUrl = formData.imageUrl;
      
      if (formData.imageFile) {
        const uploadedUrl = await uploadImage(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // If image upload failed and we don't have an existing URL, show error
          if (!formData.imageUrl) {
            setFormError('Image upload failed. Please try again.');
            return;
          }
        }
      }
      
      // Prepare the data to save (remove the file property)
      const hackathonData = {
        ...formData,
        imageUrl: imageUrl
      };
      delete hackathonData.imageFile;
      
      if (isEditing && editId) {
        // Update existing hackathon
        await updateDoc(doc(db, 'hackathons', editId), hackathonData);
        setFormSuccess('Hackathon updated successfully!');
      } else {
        // Add new hackathon
        await addDoc(collection(db, 'hackathons'), hackathonData);
        setFormSuccess('New hackathon added successfully!');
      }
      
      // Refresh hackathons list
      fetchHackathons();
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
    } catch (error) {
      console.error("Error saving hackathon:", error);
      setFormError('Failed to save hackathon. Please try again.');
    }
  };

  // Edit hackathon
  const handleEdit = (hackathon) => {
    setIsEditing(true);
    setEditId(hackathon.id);
    setFormData({
      title: hackathon.title || '',
      organizer: hackathon.organizer || '',
      date: hackathon.date || '',
      location: hackathon.location || '',
      description: hackathon.description || '',
      imageUrl: hackathon.imageUrl || '',
      link: hackathon.link || '',
      registrationOpen: hackathon.registrationOpen || false
    });
    setPreviewImage(hackathon.imageUrl || null);
  };

  // Delete hackathon
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hackathon?')) {
      try {
        await deleteDoc(doc(db, 'hackathons', id));
        setFormSuccess('Hackathon deleted successfully!');
        fetchHackathons();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setFormSuccess('');
        }, 3000);
      } catch (error) {
        console.error("Error deleting hackathon:", error);
        setFormError('Failed to delete hackathon. Please try again.');
      }
    }
  };

  // Toggle registration status
  const toggleRegistration = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'hackathons', id), {
        registrationOpen: !currentStatus
      });
      setFormSuccess('Registration status updated!');
      fetchHackathons();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
    } catch (error) {
      console.error("Error updating registration status:", error);
      setFormError('Failed to update registration status. Please try again.');
    }
  };

  // Test registration link
  const testLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Hackathons Admin Panel</h1>
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading hackathons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Hackathons Admin Panel</h1>
      </div>
      
      {/* Success and Error Messages */}
      {formSuccess && <div className="success-message">{formSuccess}</div>}
      {formError && <div className="error-message">{formError}</div>}
      
      {/* Hackathon Form */}
      <div className="form-container">
        <h2>{isEditing ? 'Edit Hackathon' : 'Add New Hackathon'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter hackathon title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="organizer">Organizer *</label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Enter organizer name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="e.g., July 15-17, 2025"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country or Virtual"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter hackathon description"
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="link">Registration Link *</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://example.com/register"
              required
            />
            {formData.link && (
              <button 
                type="button" 
                className="test-link-btn"
                onClick={() => testLink(formData.link)}
              >
                Test Link
              </button>
            )}
          </div>
          
          <div className="form-group image-upload-group">
            <label>Hackathon Image *</label>
            
            <div className="image-upload-container">
              <div className="image-preview-area">
                {previewImage ? (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({...formData, imageUrl: '', imageFile: null});
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>No image selected</span>
                  </div>
                )}
              </div>
              
              <div className="upload-controls">
                <input
                  type="file"
                  id="imageFile"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file-input"
                />
                <label htmlFor="imageFile" className="file-input-label">
                  Choose Image
                </label>
                
                <div className="image-url-input">
                  <span>or</span>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                    disabled={!!formData.imageFile}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label htmlFor="registrationOpen">
              <input
                type="checkbox"
                id="registrationOpen"
                name="registrationOpen"
                checked={formData.registrationOpen}
                onChange={handleInputChange}
              />
              Registration Open
            </label>
          </div>
          
          <div className="form-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : (isEditing ? 'Update Hackathon' : 'Add Hackathon')}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Hackathons List */}
      <div className="hackathons-list">
        <h2>Manage Hackathons</h2>
        {hackathons.length === 0 ? (
          <div className="no-hackathons">
            <p>No hackathons found. Add your first hackathon above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="hackathons-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Registration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hackathons.map((hackathon) => (
                  <tr key={hackathon.id}>
                    <td className="image-cell">
                      <div className="table-image">
                        <img src={hackathon.imageUrl} alt={hackathon.title} />
                      </div>
                    </td>
                    <td>{hackathon.title}</td>
                    <td>{hackathon.organizer}</td>
                    <td>{hackathon.date}</td>
                    <td>{hackathon.location}</td>
                    <td>
                      <div className="toggle-container">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={hackathon.registrationOpen}
                            onChange={() => toggleRegistration(hackathon.id, hackathon.registrationOpen)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span className={`status-text ${hackathon.registrationOpen ? 'open' : 'closed'}`}>
                          {hackathon.registrationOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(hackathon)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(hackathon.id)}
                        >
                          Delete
                        </button>
                        <button 
                          className="link-btn"
                          onClick={() => testLink(hackathon.link)}
                        >
                          Test Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}