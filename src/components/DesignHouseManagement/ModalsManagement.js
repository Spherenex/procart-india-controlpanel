import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  where,
  Timestamp,
  setDoc,
  getDoc,
    writeBatch

} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './DesignHouseManagement.css';

function ModalsManagement() {
  // Active tab state
  const [activeTab, setActiveTab] = useState('modals');

  // State for modal form
  const [modalForm, setModalForm] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    type: 'announcement',
    targetPage: 'all',
    imageFile: null,
    imagePreview: '',
    isActive: true,
    startDate: '',
    endDate: '',
    showCloseButton: true,
    position: 'center',
    priority: '5'
  });

  // State for category form
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    icon: '⚡',
    description: '',
    isEditing: false
  });

  // State for modals list and selected modal for editing
  const [modals, setModals] = useState([]);
  const [selectedModal, setSelectedModal] = useState(null);
  
  // State for categories list
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBannerCounts, setCategoryBannerCounts] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [success, setSuccess] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // Modal types and positions
  const modalTypes = [
    { id: 'announcement', name: 'Announcement' },
    { id: 'promotion', name: 'Promotion' },
    { id: 'newsletter', name: 'Newsletter Signup' },
    { id: 'event', name: 'Event Information' },
    { id: 'welcome', name: 'Welcome Message' },
    { id: 'hackathon', name: 'Hackathon Announcement' },
    { id: 'product', name: 'New Product' },
    { id: 'feature', name: 'New Feature' }
  ];

  const targetPages = [
    { id: 'all', name: 'All Pages' },
    { id: 'home', name: 'Home Page' },
    { id: 'designMakersHub', name: 'Design Makers Hub' },
    { id: 'categories', name: 'Categories Page' },
    { id: 'products', name: 'Products Page' },
    { id: 'checkout', name: 'Checkout Page' }
  ];

  const positions = [
    { id: 'center', name: 'Center' },
    { id: 'top', name: 'Top' },
    { id: 'bottom', name: 'Bottom' },
    { id: 'left', name: 'Left' },
    { id: 'right', name: 'Right' },
    { id: 'top-left', name: 'Top Left' },
    { id: 'top-right', name: 'Top Right' },
    { id: 'bottom-left', name: 'Bottom Left' },
    { id: 'bottom-right', name: 'Bottom Right' }
  ];

  // Available emoji icons for categories
  const availableIcons = [
    '⚡', '🔌', '🖨️', '✂️', '🔋', '📱', '🔧', '🔬', '📊', '🛠️', '📈',
    '💻', '🎮', '🎨', '📷', '🔍', '🧪', '🧰', '🧲', '📡', '🤖', '🏠', 
    '⌚', '🎓', '🏭', '🎵', '🚗', '📚', '🌱', '🔋', '📝', '💡', '🔑'
  ];

  // Fetch modals on component mount
  useEffect(() => {
    if (activeTab === 'modals') {
      fetchModals();
    }
  }, [activeTab]);

  // Fetch categories on component mount
  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  // Count banners per category
  useEffect(() => {
    if (categories.length > 0 && activeTab === 'categories') {
      fetchCategoryBannerCounts();
    }
  }, [categories, activeTab]);

  // Fetch modals function
  const fetchModals = async () => {
    setLoading(true);
    try {
      const modalsQuery = query(
        collection(db, 'designModals'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(modalsQuery);
      const modalsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate ? doc.data().startDate.toDate().toISOString().split('T')[0] : '',
        endDate: doc.data().endDate ? doc.data().endDate.toDate().toISOString().split('T')[0] : ''
      }));
      
      setModals(modalsList);
    } catch (error) {
      console.error('Error fetching modals:', error);
      setError('Failed to load modals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories function
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const categoriesQuery = query(
        collection(db, 'designCategories'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(categoriesQuery);
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryError('Failed to load categories. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Fetch banner counts per category
  const fetchCategoryBannerCounts = async () => {
    try {
      const bannersQuery = query(
        collection(db, 'categoryBanners')
      );
      
      const querySnapshot = await getDocs(bannersQuery);
      const banners = querySnapshot.docs.map(doc => doc.data());
      
      // Count banners per category
      const counts = {};
      banners.forEach(banner => {
        const categoryId = banner.categoryId;
        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        }
      });
      
      setCategoryBannerCounts(counts);
    } catch (error) {
      console.error('Error fetching banner counts:', error);
    }
  };

  // Handle form input changes for modals
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle form input changes for categories
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // Handle category ID input (with validation and formatting)
  const handleCategoryIdChange = (e) => {
    const value = e.target.value;
    // Format ID: lowercase, hyphens instead of spaces, alphanumeric only
    const formattedId = value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    setCategoryForm(prev => ({ 
      ...prev, 
      id: formattedId 
    }));
  };

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setCategoryForm(prev => ({ 
      ...prev, 
      icon 
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setModalForm(prev => ({ 
        ...prev, 
        imageFile: file,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file, modalId) => {
    if (!file) return null;

    try {
      setUploading(true);
      const storageRef = ref(storage, `modals/${modalId}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Optional: Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Error uploading image:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: `modals/${modalId}_${file.name}`
            });
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission for adding/updating a modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!modalForm.title || !modalForm.description || !modalForm.buttonText) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedModal && !modalForm.imageFile) {
      setError('Please select an image for the modal');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare date objects if dates are provided
      const startDate = modalForm.startDate ? Timestamp.fromDate(new Date(modalForm.startDate)) : null;
      const endDate = modalForm.endDate ? Timestamp.fromDate(new Date(modalForm.endDate)) : null;

      if (startDate && endDate && startDate.toMillis() > endDate.toMillis()) {
        setError('Start date cannot be after end date');
        setLoading(false);
        return;
      }

      if (selectedModal) {
        // Update existing modal
        const modalRef = doc(db, 'designModals', selectedModal.id);
        const updateData = {
          title: modalForm.title,
          description: modalForm.description,
          buttonText: modalForm.buttonText,
          buttonLink: modalForm.buttonLink,
          type: modalForm.type,
          targetPage: modalForm.targetPage,
          isActive: modalForm.isActive,
          startDate: startDate,
          endDate: endDate,
          showCloseButton: modalForm.showCloseButton,
          position: modalForm.position,
          priority: parseInt(modalForm.priority),
          updatedAt: serverTimestamp()
        };

        // Update image if a new one is selected
        if (modalForm.imageFile) {
          // Delete old image if exists
          if (selectedModal.imagePath) {
            try {
              const oldImageRef = ref(storage, selectedModal.imagePath);
              await deleteObject(oldImageRef);
            } catch (error) {
              console.error('Error deleting old image:', error);
              // Continue with update even if delete fails
            }
          }

          // Upload new image
          const imageData = await uploadImage(modalForm.imageFile, selectedModal.id);
          updateData.imageUrl = imageData.url;
          updateData.imagePath = imageData.path;
        }

        await updateDoc(modalRef, updateData);
        setSuccess('Modal updated successfully!');

        // Update modals list
        setModals(prev => 
          prev.map(modal => 
            modal.id === selectedModal.id 
              ? { 
                  ...modal, 
                  ...updateData, 
                  imageUrl: updateData.imageUrl || modal.imageUrl,
                  startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
                  endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : ''
                } 
              : modal
          )
        );
      } else {
        // Add new modal
        const newModal = {
          title: modalForm.title,
          description: modalForm.description,
          buttonText: modalForm.buttonText,
          buttonLink: modalForm.buttonLink,
          type: modalForm.type,
          targetPage: modalForm.targetPage,
          isActive: modalForm.isActive,
          startDate: startDate,
          endDate: endDate,
          showCloseButton: modalForm.showCloseButton,
          position: modalForm.position,
          priority: parseInt(modalForm.priority),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Add document first to get an ID
        const docRef = await addDoc(collection(db, 'designModals'), newModal);
        
        // Upload image and update document with URL
        const imageData = await uploadImage(modalForm.imageFile, docRef.id);
        
        await updateDoc(docRef, {
          imageUrl: imageData.url,
          imagePath: imageData.path
        });

        // Add to modals list
        setModals(prev => [
          { 
            id: docRef.id, 
            ...newModal, 
            imageUrl: imageData.url,
            imagePath: imageData.path,
            startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
            endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : ''
          }, 
          ...prev
        ]);

        setSuccess('Modal added successfully!');
      }

      // Reset form
      setModalForm({
        title: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        type: 'announcement',
        targetPage: 'all',
        imageFile: null,
        imagePreview: '',
        isActive: true,
        startDate: '',
        endDate: '',
        showCloseButton: true,
        position: 'center',
        priority: '5'
      });
      setSelectedModal(null);
    } catch (error) {
      console.error('Error adding/updating modal:', error);
      setError('Failed to save modal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for adding/updating a category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!categoryForm.id || !categoryForm.name || !categoryForm.description) {
      setCategoryError('Please fill in all required fields');
      return;
    }

    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(categoryForm.id)) {
      setCategoryError('Category ID must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    setCategoryLoading(true);
    setCategoryError('');
    setCategorySuccess('');

    try {
      if (categoryForm.isEditing) {
        // Check if ID has changed
        const originalId = selectedCategory.id;
        const isIdChanged = originalId !== categoryForm.id;
        
        if (isIdChanged) {
          // Check if the new ID already exists
          const categoryRef = doc(db, 'designCategories', categoryForm.id);
          const categoryDoc = await getDoc(categoryRef);
          
          if (categoryDoc.exists()) {
            setCategoryError(`Category with ID "${categoryForm.id}" already exists`);
            setCategoryLoading(false);
            return;
          }
          
          // Update all banners with the old category ID
          const bannersQuery = query(
            collection(db, 'categoryBanners'),
            where('categoryId', '==', originalId)
          );
          
          const bannersSnapshot = await getDocs(bannersQuery);
          
          // Batch update for all banners
          const batch = writeBatch(db);
          
          bannersSnapshot.docs.forEach(bannerDoc => {
            const bannerRef = doc(db, 'categoryBanners', bannerDoc.id);
            batch.update(bannerRef, { categoryId: categoryForm.id });
          });
          
          // Create new category document with the new ID
          const newCategoryRef = doc(db, 'designCategories', categoryForm.id);
          batch.set(newCategoryRef, {
            name: categoryForm.name,
            icon: categoryForm.icon,
            description: categoryForm.description,
            createdAt: selectedCategory.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Delete the old category document
          const oldCategoryRef = doc(db, 'designCategories', originalId);
          batch.delete(oldCategoryRef);
          
          // Commit all the changes
          await batch.commit();
          
          setCategorySuccess('Category updated successfully!');
        } else {
          // Just update the existing category
          const categoryRef = doc(db, 'designCategories', categoryForm.id);
          await updateDoc(categoryRef, {
            name: categoryForm.name,
            icon: categoryForm.icon,
            description: categoryForm.description,
            updatedAt: serverTimestamp()
          });
          
          setCategorySuccess('Category updated successfully!');
        }
        
        // Update categories list
        setCategories(prev => 
          prev.map(category => 
            category.id === originalId
              ? { 
                  id: categoryForm.id,
                  name: categoryForm.name,
                  icon: categoryForm.icon,
                  description: categoryForm.description,
                  createdAt: category.createdAt,
                  updatedAt: serverTimestamp()
                } 
              : category
          )
        );
      } else {
        // Check if category ID already exists
        const categoryRef = doc(db, 'designCategories', categoryForm.id);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          setCategoryError(`Category with ID "${categoryForm.id}" already exists`);
          setCategoryLoading(false);
          return;
        }
        
        // Add new category with specific ID
        await setDoc(doc(db, 'designCategories', categoryForm.id), {
          name: categoryForm.name,
          icon: categoryForm.icon,
          description: categoryForm.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Add to categories list
        setCategories(prev => [
          ...prev,
          { 
            id: categoryForm.id,
            name: categoryForm.name,
            icon: categoryForm.icon,
            description: categoryForm.description,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        ]);
        
        setCategorySuccess('Category added successfully!');
      }

      // Reset form
      setCategoryForm({
        id: '',
        name: '',
        icon: '⚡',
        description: '',
        isEditing: false
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error adding/updating category:', error);
      setCategoryError('Failed to save category. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Handle modal selection for editing
  const handleEditModal = (modal) => {
    setSelectedModal(modal);
    setModalForm({
      title: modal.title,
      description: modal.description,
      buttonText: modal.buttonText,
      buttonLink: modal.buttonLink || '',
      type: modal.type,
      targetPage: modal.targetPage || 'all',
      imageFile: null,
      imagePreview: modal.imageUrl,
      isActive: modal.isActive !== false, // Default to true if undefined
      startDate: modal.startDate || '',
      endDate: modal.endDate || '',
      showCloseButton: modal.showCloseButton !== false, // Default to true if undefined
      position: modal.position || 'center',
      priority: (modal.priority || 5).toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category selection for editing
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      isEditing: true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle modal deletion
  const handleDeleteModal = async (modalId, imagePath) => {
    if (!window.confirm('Are you sure you want to delete this modal?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete document from Firestore
      await deleteDoc(doc(db, 'designModals', modalId));
      
      // Delete image from Storage if exists
      if (imagePath) {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      }

      // Update modals list
      setModals(prev => prev.filter(modal => modal.id !== modalId));
      
      // Reset form if the deleted modal was selected
      if (selectedModal && selectedModal.id === modalId) {
        setModalForm({
          title: '',
          description: '',
          buttonText: '',
          buttonLink: '',
          type: 'announcement',
          targetPage: 'all',
          imageFile: null,
          imagePreview: '',
          isActive: true,
          startDate: '',
          endDate: '',
          showCloseButton: true,
          position: 'center',
          priority: '5'
        });
        setSelectedModal(null);
      }

      setSuccess('Modal deleted successfully!');
    } catch (error) {
      console.error('Error deleting modal:', error);
      setError('Failed to delete modal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId) => {
    // Check if category has associated banners
    const bannerCount = categoryBannerCounts[categoryId] || 0;
    
    if (bannerCount > 0) {
      setCategoryError(`Cannot delete category: it has ${bannerCount} banner(s) associated with it. Please delete or reassign the banners first.`);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setCategoryLoading(true);
    try {
      // Delete document from Firestore
      await deleteDoc(doc(db, 'designCategories', categoryId));

      // Update categories list
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      
      // Reset form if the deleted category was selected
      if (selectedCategory && selectedCategory.id === categoryId) {
        setCategoryForm({
          id: '',
          name: '',
          icon: '⚡',
          description: '',
          isEditing: false
        });
        setSelectedCategory(null);
      }

      setCategorySuccess('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      setCategoryError('Failed to delete category. Please try again.');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedModal(null);
    setModalForm({
      title: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      type: 'announcement',
      targetPage: 'all',
      imageFile: null,
      imagePreview: '',
      isActive: true,
      startDate: '',
      endDate: '',
      showCloseButton: true,
      position: 'center',
      priority: '5'
    });
  };

  // Cancel category editing
  const handleCancelCategoryEdit = () => {
    setSelectedCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      icon: '⚡',
      description: '',
      isEditing: false
    });
  };

  // Get status class based on modal active state and dates
  const getStatusClass = (modal) => {
    if (!modal.isActive) return 'bg-secondary';
    
    const now = new Date();
    const startDate = modal.startDate ? new Date(modal.startDate) : null;
    const endDate = modal.endDate ? new Date(modal.endDate) : null;
    
    if (startDate && now < startDate) return 'bg-warning'; // Scheduled
    if (endDate && now > endDate) return 'bg-danger'; // Expired
    
    return 'bg-success'; // Active
  };

  // Get status text
  const getStatusText = (modal) => {
    if (!modal.isActive) return 'Inactive';
    
    const now = new Date();
    const startDate = modal.startDate ? new Date(modal.startDate) : null;
    const endDate = modal.endDate ? new Date(modal.endDate) : null;
    
    if (startDate && now < startDate) return 'Scheduled';
    if (endDate && now > endDate) return 'Expired';
    
    return 'Active';
  };

  // Get formatted date for displaying in table
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="content">
      <h1 className="page-title">Design House Management</h1>
      
      {/* Tab Navigation */}
      <div className="tabs-navigation mb-4">
        <button 
          className={`tab-button ${activeTab === 'modals' ? 'active' : ''}`}
          onClick={() => setActiveTab('modals')}
        >
          <i className="fas fa-window-restore me-2"></i> Modals
        </button>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <i className="fas fa-tags me-2"></i> Categories
        </button>
      </div>
      
      {/* Modals Management */}
      {activeTab === 'modals' && (
        <>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="row">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h3>{selectedModal ? 'Edit Modal' : 'Add New Modal'}</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Modal Type */}
                    <div className="form-group mb-3">
                      <label htmlFor="type">Modal Type:</label>
                      <select
                        id="type"
                        name="type"
                        className="form-control"
                        value={modalForm.type}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                      >
                        {modalTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Target Page */}
                    <div className="form-group mb-3">
                      <label htmlFor="targetPage">Display on Page:</label>
                      <select
                        id="targetPage"
                        name="targetPage"
                        className="form-control"
                        value={modalForm.targetPage}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                      >
                        {targetPages.map(page => (
                          <option key={page.id} value={page.id}>
                            {page.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Modal Title */}
                    <div className="form-group mb-3">
                      <label htmlFor="title">Modal Title:</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={modalForm.title}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                        required
                        placeholder="e.g. New Hackathon Announcement"
                      />
                    </div>
                    
                    {/* Modal Description */}
                    <div className="form-group mb-3">
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={modalForm.description}
                        onChange={handleInputChange}
                        rows="3"
                        disabled={loading || uploading}
                        required
                        placeholder="e.g. Join our upcoming hackathon event this weekend..."
                      ></textarea>
                    </div>
                    
                    {/* Button Text */}
                    <div className="form-group mb-3">
                      <label htmlFor="buttonText">Button Text:</label>
                      <input
                        type="text"
                        id="buttonText"
                        name="buttonText"
                        className="form-control"
                        value={modalForm.buttonText}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                        required
                        placeholder="e.g. Register Now"
                      />
                    </div>
                    
                    {/* Link URL */}
                    <div className="form-group mb-3">
                      <label htmlFor="buttonLink">Button Link URL (optional):</label>
                      <input
                        type="text"
                        id="buttonLink"
                        name="buttonLink"
                        className="form-control"
                        value={modalForm.buttonLink}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                        placeholder="e.g. /hackathons/register"
                      />
                    </div>

                    {/* Position */}
                    <div className="form-group mb-3">
                      <label htmlFor="position">Modal Position:</label>
                      <select
                        id="position"
                        name="position"
                        className="form-control"
                        value={modalForm.position}
                        onChange={handleInputChange}
                        disabled={loading || uploading}
                      >
                        {positions.map(pos => (
                          <option key={pos.id} value={pos.id}>
                            {pos.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="form-group mb-3">
                      <label htmlFor="priority">Priority (1-10):</label>
                      <input
                        type="number"
                        id="priority"
                        name="priority"
                        className="form-control"
                        value={modalForm.priority}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        disabled={loading || uploading}
                      />
                      <small className="form-text text-muted">
                        Higher numbers show first (10 = highest priority)
                      </small>
                    </div>
                    
                    {/* Modal Image */}
                    <div className="form-group mb-3">
                      <label htmlFor="modalImage">Modal Image:</label>
                      <input
                        type="file"
                        id="modalImage"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading || uploading}
                      />
                      <small className="form-text text-muted">
                        Recommended size: 600x400 pixels
                      </small>
                    </div>
                    
                    {/* Image Preview */}
                    {modalForm.imagePreview && (
                      <div className="image-preview mb-3">
                        <img 
                          src={modalForm.imagePreview} 
                          alt="Modal preview" 
                          className="img-fluid rounded"
                        />
                      </div>
                    )}
                    
                    {/* Settings */}
                    <div className="form-group mb-3">
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActive"
                          name="isActive"
                          checked={modalForm.isActive}
                          onChange={handleInputChange}
                          disabled={loading || uploading}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                      
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="showCloseButton"
                          name="showCloseButton"
                          checked={modalForm.showCloseButton}
                          onChange={handleInputChange}
                          disabled={loading || uploading}
                        />
                        <label className="form-check-label" htmlFor="showCloseButton">
                          Show Close Button
                        </label>
                      </div>
                    </div>
                    
                    {/* Schedule */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="startDate">Start Date (optional):</label>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            className="form-control"
                            value={modalForm.startDate}
                            onChange={handleInputChange}
                            disabled={loading || uploading}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="endDate">End Date (optional):</label>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            className="form-control"
                            value={modalForm.endDate}
                            onChange={handleInputChange}
                            disabled={loading || uploading}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="form-group d-flex justify-content-between">
                      {selectedModal ? (
                        <>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                            disabled={loading || uploading}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading || uploading}
                          >
                            {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Update Modal'}
                          </button>
                        </>
                      ) : (
                        <button 
                          type="submit" 
                          className="btn btn-primary w-100"
                          disabled={loading || uploading}
                        >
                          {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Add Modal'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h3>Modals List</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : modals.length === 0 ? (
                    <div className="alert alert-info">
                      No modals found. Please add a new modal.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modals.map(modal => (
                            <tr key={modal.id}>
                              <td>
                                <img 
                                  src={modal.imageUrl} 
                                  alt={modal.title} 
                                  className="thumbnail"
                                  width="80"
                                  height="50"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x50?text=No+Image';
                                  }}
                                />
                              </td>
                              <td>
                                <div className="modal-title-cell">
                                  <strong>{modal.title}</strong>
                                  <small>{modal.buttonText}</small>
                                </div>
                              </td>
                              <td>
                                {modalTypes.find(type => type.id === modal.type)?.name || modal.type}
                              </td>
                              <td>
                                {targetPages.find(page => page.id === modal.targetPage)?.name || modal.targetPage || 'All Pages'}
                              </td>
                              <td>
                                <span className={`badge ${getStatusClass(modal)}`}>
                                  {getStatusText(modal)}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {modal.priority || 5}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleEditModal(modal)}
                                  disabled={loading}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteModal(modal.id, modal.imagePath)}
                                  disabled={loading}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Preview */}
              {modalForm.title && modalForm.description && modalForm.imagePreview && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h3>Modal Preview</h3>
                  </div>
                  <div className="card-body">
                    <div className="modal-preview">
                      <div className={`modal-preview-container position-${modalForm.position}`}>
                        <div className="modal-preview-content">
                          {modalForm.showCloseButton && (
                            <button className="modal-preview-close">×</button>
                          )}
                          <div className="modal-preview-header">
                            <h4>{modalForm.title}</h4>
                          </div>
                          <div className="modal-preview-body">
                            <div className="modal-preview-image">
                              <img src={modalForm.imagePreview} alt={modalForm.title} />
                            </div>
                            <p>{modalForm.description}</p>
                          </div>
                          <div className="modal-preview-footer">
                            <button className="modal-preview-button">{modalForm.buttonText}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Categories Management */}
      {activeTab === 'categories' && (
        <>
          {categoryError && <div className="alert alert-danger">{categoryError}</div>}
          {categorySuccess && <div className="alert alert-success">{categorySuccess}</div>}
          
          <div className="row">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h3>{selectedCategory ? 'Edit Category' : 'Add New Category'}</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCategorySubmit}>
                    {/* Category ID */}
                    <div className="form-group mb-3">
                      <label htmlFor="id">Category ID:</label>
                      <input
                        type="text"
                        id="id"
                        name="id"
                        className="form-control"
                        value={categoryForm.id}
                        onChange={handleCategoryIdChange}
                        disabled={categoryLoading || (categoryForm.isEditing && categoryBannerCounts[selectedCategory?.id] > 0)}
                        required
                        placeholder="e.g. iot-components"
                      />
                      <small className="form-text text-muted">
                        Lowercase letters, numbers, and hyphens only. No spaces.
                        {categoryForm.isEditing && categoryBannerCounts[selectedCategory?.id] > 0 && (
                          <div className="text-warning mt-1">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Cannot change ID: category has {categoryBannerCounts[selectedCategory?.id]} banner(s)
                          </div>
                        )}
                      </small>
                    </div>
                    
                    {/* Category Name */}
                    <div className="form-group mb-3">
                      <label htmlFor="name">Category Name:</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={categoryForm.name}
                        onChange={handleCategoryInputChange}
                        disabled={categoryLoading}
                        required
                        placeholder="e.g. IoT Components"
                      />
                    </div>
                    
                    {/* Category Icon */}
                    <div className="form-group mb-3">
                      <label htmlFor="icon">Category Icon:</label>
                      <div className="current-icon-display mb-2">
                        <span className="selected-icon">{categoryForm.icon}</span>
                        <span className="selected-icon-label">Current icon</span>
                      </div>
                      <div className="icon-selector">
                        {availableIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            className={`icon-button ${categoryForm.icon === icon ? 'selected' : ''}`}
                            onClick={() => handleIconSelect(icon)}
                            disabled={categoryLoading}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Category Description */}
                    <div className="form-group mb-3">
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={categoryForm.description}
                        onChange={handleCategoryInputChange}
                        rows="3"
                        disabled={categoryLoading}
                        required
                        placeholder="e.g. Connected devices and components for smart applications"
                      ></textarea>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="form-group d-flex justify-content-between">
                      {selectedCategory ? (
                        <>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleCancelCategoryEdit}
                            disabled={categoryLoading}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={categoryLoading}
                          >
                            {categoryLoading ? 'Saving...' : 'Update Category'}
                          </button>
                        </>
                      ) : (
                        <button 
                          type="submit" 
                          className="btn btn-primary w-100"
                          disabled={categoryLoading}
                        >
                          {categoryLoading ? 'Saving...' : 'Add Category'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h3>Categories List</h3>
                </div>
                <div className="card-body">
                  {categoryLoading && !categories.length ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="alert alert-info">
                      No categories found. Please add a new category.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Icon</th>
                            <th>Name</th>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Banners</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map(category => (
                            <tr key={category.id}>
                              <td className="text-center">
                                <span className="category-icon-display">{category.icon}</span>
                              </td>
                              <td>{category.name}</td>
                              <td><code>{category.id}</code></td>
                              <td>
                                {category.description.length > 60 
                                  ? `${category.description.substring(0, 60)}...` 
                                  : category.description}
                              </td>
                              <td>
                                <span className="badge bg-primary">
                                  {categoryBannerCounts[category.id] || 0}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleEditCategory(category)}
                                  disabled={categoryLoading}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  disabled={categoryLoading || (categoryBannerCounts[category.id] > 0)}
                                  title={categoryBannerCounts[category.id] > 0 ? 'Cannot delete: has associated banners' : 'Delete category'}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Usage Info */}
              <div className="card mt-3">
                <div className="card-header">
                  <h3>Category Management Tips</h3>
                </div>
                <div className="card-body">
                  <div className="alert alert-info mb-0">
                    <h4 className="alert-heading"><i className="fas fa-info-circle me-2"></i>Important Information</h4>
                    <p>Categories are used across the Design Makers Hub for:</p>
                    <ul>
                      <li><strong>Banner Display:</strong> Each category can have multiple banners that display in the carousel.</li>
                      <li><strong>Featured Products:</strong> Products can be filtered by category.</li>
                      <li><strong>Navigation:</strong> Categories appear in the navigation grid for users to click.</li>
                    </ul>
                    <hr />
                    <p className="mb-0"><strong>Note:</strong> You cannot delete a category that has banners associated with it. You must first delete or reassign those banners.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ModalsManagement;