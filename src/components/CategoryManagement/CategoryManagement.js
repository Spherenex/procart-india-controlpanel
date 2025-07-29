import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './CategoryManagement.css';

// Create base64 placeholder image for categories when image fails to load
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+Q2F0ZWdvcnkgSW1hZ2U8L3RleHQ+PC9zdmc+';

const CategoryManagement = () => {
  // Categories list state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    path: '',
    displayOrder: 0,
    active: true,
    imageUrl: ''
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesQuery = query(collection(db, 'categories'), orderBy('displayOrder'));
      const querySnapshot = await getDocs(categoriesQuery);
      
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'displayOrder') {
      // Ensure displayOrder is a valid number
      const numberValue = value === '' ? 0 : parseInt(value, 10);
      if (!isNaN(numberValue) || value === '') {
        setFormData({
          ...formData,
          [name]: value === '' ? 0 : numberValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Handle path generation from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      // Auto-generate path from name unless manually edited
      path: formData.path === '' || formData.path === `/products?category=${formData.name.toLowerCase().replace(/\s+/g, '-')}` 
        ? `/products?category=${name.toLowerCase().replace(/\s+/g, '-')}`
        : formData.path
    });
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WEBP, or GIF)');
        return;
      }
      
      if (file.size > maxSize) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file path using timestamp and original filename
      const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Error uploading image:', error);
            setIsUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      setIsUploading(false);
      return null;
    }
  };
  
  // Delete image from Firebase Storage
  const deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) return;
    
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Continue with the process even if image deletion fails
    }
  };
  
  // Add new category
  const addCategory = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.name.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      const categoryData = {
        ...formData,
        imageUrl: imageUrl || PLACEHOLDER_IMAGE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Adding new category with data:", categoryData);
      
      await addDoc(collection(db, 'categories'), categoryData);
      resetForm();
      fetchCategories();
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };
  
  // Update existing category
  const updateCategory = async (e) => {
    e.preventDefault();
    
    if (!currentCategoryId) return;
    
    // Validate form
    if (formData.name.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        // Delete old image if updating with new one
        if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          await deleteImage(imageUrl);
        }
        
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      const categoryData = {
        ...formData,
        imageUrl: imageUrl || PLACEHOLDER_IMAGE,
        updatedAt: serverTimestamp()
      };
      
      console.log("Updating category with data:", categoryData);
      
      const categoryRef = doc(db, 'categories', currentCategoryId);
      await updateDoc(categoryRef, categoryData);
      
      resetForm();
      fetchCategories();
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };
  
  // Delete category
  const handleDeleteCategory = async (categoryId, imageUrl) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // Delete category document from Firestore
        await deleteDoc(doc(db, 'categories', categoryId));
        
        // Delete category image from Storage if it's a Firebase Storage URL
        if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          await deleteImage(imageUrl);
        }
        
        fetchCategories();
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };
  
  // Toggle category active status
  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Category ${categoryId} ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Failed to update category status. Please try again.');
    }
  };
  
  // Edit category (load data into form)
  const handleEditCategory = (category) => {
    setFormMode('edit');
    setCurrentCategoryId(category.id);
    
    setFormData({
      name: category.name || '',
      description: category.description || '',
      path: category.path || '',
      displayOrder: category.displayOrder || 0,
      active: category.active !== undefined ? category.active : true,
      imageUrl: category.imageUrl || ''
    });
    
    setImagePreview(category.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset form
  const resetForm = () => {
    setFormMode('add');
    setCurrentCategoryId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setFormData({
      name: '',
      description: '',
      path: '',
      displayOrder: categories.length, // Set to next order by default
      active: true,
      imageUrl: ''
    });
  };

  // Calculate next display order
  useEffect(() => {
    if (formMode === 'add') {
      setFormData(prev => ({
        ...prev,
        displayOrder: categories.length
      }));
    }
  }, [categories.length, formMode]);
  
  return (
    <div className="content">
      <h1 className="page-title">Category Management</h1>
      
      {/* Category Form */}
      <div className="card form-card">
        <h2>{formMode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
        
        <form onSubmit={formMode === 'add' ? addCategory : updateCategory}>
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Microcontrollers"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Arduino, ESP32, STM32 and more"
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label>Path</label>
              <input
                type="text"
                name="path"
                value={formData.path}
                onChange={handleInputChange}
                placeholder="/products?category=microcontrollers"
              />
              <small className="form-text">
                URL path to products page with this category filter. Generated automatically from name.
              </small>
            </div>
            
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
              />
              <small className="form-text">
                Categories are displayed in ascending order (0, 1, 2, etc.)
              </small>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Category Image</h3>
            
            <div className="form-group">
              <label>Category Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
              />
              
              {isUploading && (
                <div className="upload-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Category Preview" />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Status</h3>
            
            <div className="form-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <label htmlFor="active">Active (visible on website)</label>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={resetForm}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isUploading}
            >
              {formMode === 'add' ? 'Add Category' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Categories List */}
      <div className="card table-card">
        <h2>Existing Categories</h2>
        
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : (
          <div className="categories-list">
            {categories.length > 0 ? (
              categories.map(category => (
                <div className="category-item" key={category.id}>
                  <div className="category-preview">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  
                  <div className="category-details">
                    <h3>{category.name || 'Untitled Category'}</h3>
                    <p className="category-description">{category.description || 'No description'}</p>
                    <p className="category-path">{category.path || ''}</p>
                    
                    <div className="status-badge">
                      <span className={category.active ? 'active' : 'inactive'}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="order-badge">
                        Order: {category.displayOrder}
                      </span>
                    </div>
                  </div>
                  
                  <div className="category-actions">
                    <button 
                      className={`status-toggle-btn ${category.active ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleCategoryStatus(category.id, category.active)}
                    >
                      {category.active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditCategory(category)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCategory(category.id, category.imageUrl)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No categories found. Add your first category above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;




