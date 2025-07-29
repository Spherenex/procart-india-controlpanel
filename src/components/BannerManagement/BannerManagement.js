
// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   getDocs, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   doc, 
//   query, 
//   orderBy,
//   serverTimestamp 
// } from 'firebase/firestore';
// import { 
//   ref, 
//   uploadBytesResumable, 
//   getDownloadURL, 
//   deleteObject 
// } from 'firebase/storage';
// import { db, storage } from '../../firebase/firebaseConfig';
// import './BannerManagement.css';

// const BannerManagement = () => {
//   // Banner list state
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
//   const [currentBannerId, setCurrentBannerId] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
  
//   // Form data state
//   const [formData, setFormData] = useState({
//     title: '',
//     highlightText: '',
//     description: '',
//     active: true,
//     imageUrl: '',
//     features: [
//       { icon: '⚡', text: 'Genuine Products' },
//       { icon: '🚚', text: 'Fast Delivery' },
//       { icon: '⭐', text: 'Expert Support' }
//     ],
//     badge: {
//       icon: '⚡',
//       text: 'Latest Tech Components'
//     },
//     primaryButtonText: 'Shop Now',
//     secondaryButtonText: 'Watch Demo'
//   });
  
//   // Floating cards state
//   const [floatingCards, setFloatingCards] = useState([
//     { icon: '🔧', text: 'Arduino & IoT' },
//     { icon: '⚡', text: 'Smart Sensors' },
//     { icon: '🔌', text: 'Components' }
//   ]);
  
//   // Fetch banners on component mount
//   useEffect(() => {
//     fetchBanners();
//   }, []);
  
//   // Fetch banners from Firestore
//   const fetchBanners = async () => {
//     try {
//       setLoading(true);
//       const bannersQuery = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(bannersQuery);
      
//       const bannersData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setBanners(bannersData);
//     } catch (error) {
//       console.error('Error fetching banners:', error);
//       alert('Failed to load banners. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };
  
//   // Handle feature text changes
//   const handleFeatureChange = (index, value) => {
//     const updatedFeatures = [...formData.features];
//     updatedFeatures[index].text = value;
//     setFormData({
//       ...formData,
//       features: updatedFeatures
//     });
//   };
  
//   // Handle feature icon changes
//   const handleFeatureIconChange = (index, value) => {
//     const updatedFeatures = [...formData.features];
//     updatedFeatures[index].icon = value;
//     setFormData({
//       ...formData,
//       features: updatedFeatures
//     });
//   };
  
//   // Handle badge changes
//   const handleBadgeChange = (field, value) => {
//     setFormData({
//       ...formData,
//       badge: {
//         ...formData.badge,
//         [field]: value
//       }
//     });
//   };
  
//   // Handle floating card changes
//   const handleCardChange = (index, field, value) => {
//     const updatedCards = [...floatingCards];
//     updatedCards[index][field] = value;
//     setFloatingCards(updatedCards);
//   };
  
//   // Handle image selection
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type and size
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
//       const maxSize = 5 * 1024 * 1024; // 5MB
      
//       if (!validTypes.includes(file.type)) {
//         alert('Please select a valid image file (JPEG, PNG, WEBP, or GIF)');
//         return;
//       }
      
//       if (file.size > maxSize) {
//         alert('Image size should be less than 5MB');
//         return;
//       }
      
//       setImageFile(file);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//     }
//   };
  
//   // Upload image to Firebase Storage
//   const uploadImage = async () => {
//     if (!imageFile) return null;
    
//     setIsUploading(true);
//     setUploadProgress(0);
    
//     try {
//       // Create a unique file path using timestamp and original filename
//       const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, imageFile);
      
//       return new Promise((resolve, reject) => {
//         uploadTask.on(
//           'state_changed',
//           (snapshot) => {
//             const progress = Math.round(
//               (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//             );
//             setUploadProgress(progress);
//           },
//           (error) => {
//             console.error('Error uploading image:', error);
//             setIsUploading(false);
//             reject(error);
//           },
//           async () => {
//             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//             setIsUploading(false);
//             resolve(downloadURL);
//           }
//         );
//       });
//     } catch (error) {
//       console.error('Error in upload process:', error);
//       setIsUploading(false);
//       return null;
//     }
//   };
  
//   // Delete image from Firebase Storage
//   const deleteImage = async (imageUrl) => {
//     if (!imageUrl || !imageUrl.startsWith('https://firebasestorage.googleapis.com')) return;
    
//     try {
//       const imageRef = ref(storage, imageUrl);
//       await deleteObject(imageRef);
//     } catch (error) {
//       console.error('Error deleting image:', error);
//       // Continue with the process even if image deletion fails
//       // The image might have been deleted already or URL might be invalid
//     }
//   };
  
//   // Add new banner
//   const addBanner = async (e) => {
//     e.preventDefault();
    
//     try {
//       let imageUrl = formData.imageUrl;
      
//       if (imageFile) {
//         imageUrl = await uploadImage();
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }
      
//       // Check if this is the first active banner
//       let makeActive = formData.active;
      
//       // If making this banner active, deactivate all other banners
//       if (makeActive) {
//         const activeBanners = banners.filter(banner => banner.active);
//         for (const banner of activeBanners) {
//           const bannerRef = doc(db, 'banners', banner.id);
//           await updateDoc(bannerRef, {
//             active: false,
//             updatedAt: serverTimestamp()
//           });
//         }
//       }
      
//       const bannerData = {
//         ...formData,
//         floatingCards,
//         imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Adding new banner with data:", bannerData);
      
//       await addDoc(collection(db, 'banners'), bannerData);
//       resetForm();
//       fetchBanners();
//       alert('Banner added successfully!');
//     } catch (error) {
//       console.error('Error adding banner:', error);
//       alert('Failed to add banner. Please try again.');
//     }
//   };
  
//   // Update existing banner
//   const updateBanner = async (e) => {
//     e.preventDefault();
    
//     if (!currentBannerId) return;
    
//     try {
//       let imageUrl = formData.imageUrl;
      
//       if (imageFile) {
//         // Delete old image if updating with new one
//         if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
//           await deleteImage(imageUrl);
//         }
        
//         imageUrl = await uploadImage();
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }
      
//       // Check if we're activating this banner
//       const currentBanner = banners.find(banner => banner.id === currentBannerId);
//       const isActivating = formData.active && (!currentBanner || !currentBanner.active);
      
//       // If activating this banner, deactivate all other banners
//       if (isActivating) {
//         const activeBanners = banners.filter(banner => banner.active && banner.id !== currentBannerId);
//         for (const banner of activeBanners) {
//           const bannerRef = doc(db, 'banners', banner.id);
//           await updateDoc(bannerRef, {
//             active: false,
//             updatedAt: serverTimestamp()
//           });
//         }
//       }
      
//       const bannerData = {
//         ...formData,
//         floatingCards,
//         imageUrl,
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Updating banner with data:", bannerData);
      
//       const bannerRef = doc(db, 'banners', currentBannerId);
//       await updateDoc(bannerRef, bannerData);
      
//       resetForm();
//       fetchBanners();
//       alert('Banner updated successfully!');
//     } catch (error) {
//       console.error('Error updating banner:', error);
//       alert('Failed to update banner. Please try again.');
//     }
//   };
  
//   // Delete banner
//   const handleDeleteBanner = async (bannerId, imageUrl) => {
//     if (window.confirm('Are you sure you want to delete this banner?')) {
//       try {
//         // Delete banner document from Firestore
//         await deleteDoc(doc(db, 'banners', bannerId));
        
//         // Delete banner image from Storage if it's a Firebase Storage URL
//         if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
//           await deleteImage(imageUrl);
//         }
        
//         fetchBanners();
//         alert('Banner deleted successfully!');
//       } catch (error) {
//         console.error('Error deleting banner:', error);
//         alert('Failed to delete banner. Please try again.');
//       }
//     }
//   };
  
//   // Toggle banner active status
//   const toggleBannerStatus = async (bannerId, currentStatus) => {
//     try {
//       // If activating this banner, deactivate all other banners first
//       if (!currentStatus) {
//         console.log("Activating banner, deactivating others...");
        
//         // Get all active banners
//         const activeBanners = banners.filter(banner => banner.active);
        
//         // Deactivate all currently active banners
//         for (const banner of activeBanners) {
//           const bannerRef = doc(db, 'banners', banner.id);
//           await updateDoc(bannerRef, {
//             active: false,
//             updatedAt: serverTimestamp()
//           });
//         }
//       }
      
//       // Update the status of the current banner
//       const bannerRef = doc(db, 'banners', bannerId);
//       await updateDoc(bannerRef, {
//         active: !currentStatus,
//         updatedAt: serverTimestamp()
//       });
      
//       console.log(`Banner ${bannerId} ${!currentStatus ? 'activated' : 'deactivated'}`);
//       fetchBanners();
//     } catch (error) {
//       console.error('Error toggling banner status:', error);
//       alert('Failed to update banner status. Please try again.');
//     }
//   };
  
//   // Edit banner (load data into form)
//   const handleEditBanner = (banner) => {
//     setFormMode('edit');
//     setCurrentBannerId(banner.id);
//     setFormData({
//       title: banner.title || '',
//       highlightText: banner.highlightText || '',
//       description: banner.description || '',
//       active: banner.active !== undefined ? banner.active : true,
//       imageUrl: banner.imageUrl || '',
//       features: banner.features || [
//         { icon: '⚡', text: 'Genuine Products' },
//         { icon: '🚚', text: 'Fast Delivery' },
//         { icon: '⭐', text: 'Expert Support' }
//       ],
//       badge: banner.badge || {
//         icon: '⚡',
//         text: 'Latest Tech Components'
//       },
//       primaryButtonText: banner.primaryButtonText || 'Shop Now',
//       secondaryButtonText: banner.secondaryButtonText || 'Watch Demo'
//     });
    
//     setFloatingCards(banner.floatingCards || [
//       { icon: '🔧', text: 'Arduino & IoT' },
//       { icon: '⚡', text: 'Smart Sensors' },
//       { icon: '🔌', text: 'Components' }
//     ]);
    
//     setImagePreview(banner.imageUrl);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
  
//   // Reset form
//   const resetForm = () => {
//     setFormMode('add');
//     setCurrentBannerId(null);
//     setImageFile(null);
//     setImagePreview(null);
//     setUploadProgress(0);
//     setFormData({
//       title: '',
//       highlightText: '',
//       description: '',
//       active: true,
//       imageUrl: '',
//       features: [
//         { icon: '⚡', text: 'Genuine Products' },
//         { icon: '🚚', text: 'Fast Delivery' },
//         { icon: '⭐', text: 'Expert Support' }
//       ],
//       badge: {
//         icon: '⚡',
//         text: 'Latest Tech Components'
//       },
//       primaryButtonText: 'Shop Now',
//       secondaryButtonText: 'Watch Demo'
//     });
    
//     setFloatingCards([
//       { icon: '🔧', text: 'Arduino & IoT' },
//       { icon: '⚡', text: 'Smart Sensors' },
//       { icon: '🔌', text: 'Components' }
//     ]);
//   };
  
//   return (
//     <div className="content">
//       <h1 className="page-title">Banner Management</h1>
      
//       {/* Banner Form */}
//       <div className="card form-card">
//         <h2>{formMode === 'add' ? 'Add New Banner' : 'Edit Banner'}</h2>
        
//         <form onSubmit={formMode === 'add' ? addBanner : updateBanner}>
//           <div className="form-section">
//             <h3>Banner Content</h3>
            
//             <div className="form-group">
//               <label>Banner Title</label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleInputChange}
//                 placeholder="Power Your Innovation with Premium Electronics"
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label>Highlight Text (will be colored differently)</label>
//               <input
//                 type="text"
//                 name="highlightText"
//                 value={formData.highlightText}
//                 onChange={handleInputChange}
//                 placeholder="Innovation"
//               />
//             </div>
            
//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Discover cutting-edge Arduino boards, sensors, components and development tools..."
//                 rows="3"
//                 required
//               />
//             </div>
//           </div>
          
//           <div className="form-section">
//             <h3>Banner Image</h3>
            
//             <div className="form-group">
//               <label>Banner Image</label>
//               <input
//                 type="file"
//                 accept="image/jpeg,image/png,image/webp,image/gif"
//                 onChange={handleImageChange}
//               />
              
//               {isUploading && (
//                 <div className="upload-progress">
//                   <div 
//                     className="progress-bar" 
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                   <span>{uploadProgress}%</span>
//                 </div>
//               )}
              
//               {imagePreview && (
//                 <div className="image-preview">
//                   <img src={imagePreview} alt="Banner Preview" />
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="form-section">
//             <h3>Badge</h3>
            
//             <div className="form-row">
//               <div className="form-group half">
//                 <label>Badge Icon</label>
//                 <input
//                   type="text"
//                   value={formData.badge.icon}
//                   onChange={(e) => handleBadgeChange('icon', e.target.value)}
//                   placeholder="⚡"
//                 />
//               </div>
              
//               <div className="form-group half">
//                 <label>Badge Text</label>
//                 <input
//                   type="text"
//                   value={formData.badge.text}
//                   onChange={(e) => handleBadgeChange('text', e.target.value)}
//                   placeholder="Latest Tech Components"
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="form-section">
//             <h3>Features</h3>
            
//             {formData.features.map((feature, index) => (
//               <div className="form-row" key={index}>
//                 <div className="form-group quarter">
//                   <label>Icon {index + 1}</label>
//                   <input
//                     type="text"
//                     value={feature.icon}
//                     onChange={(e) => handleFeatureIconChange(index, e.target.value)}
//                     placeholder="⚡"
//                   />
//                 </div>
                
//                 <div className="form-group three-quarters">
//                   <label>Text {index + 1}</label>
//                   <input
//                     type="text"
//                     value={feature.text}
//                     onChange={(e) => handleFeatureChange(index, e.target.value)}
//                     placeholder="Feature description"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="form-section">
//             <h3>Floating Cards</h3>
            
//             {floatingCards.map((card, index) => (
//               <div className="form-row" key={index}>
//                 <div className="form-group quarter">
//                   <label>Icon {index + 1}</label>
//                   <input
//                     type="text"
//                     value={card.icon}
//                     onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
//                     placeholder="🔧"
//                   />
//                 </div>
                
//                 <div className="form-group three-quarters">
//                   <label>Text {index + 1}</label>
//                   <input
//                     type="text"
//                     value={card.text}
//                     onChange={(e) => handleCardChange(index, 'text', e.target.value)}
//                     placeholder="Arduino & IoT"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="form-section">
//             <h3>Buttons</h3>
            
//             <div className="form-row">
//               <div className="form-group half">
//                 <label>Primary Button Text</label>
//                 <input
//                   type="text"
//                   name="primaryButtonText"
//                   value={formData.primaryButtonText}
//                   onChange={handleInputChange}
//                   placeholder="Shop Now"
//                 />
//               </div>
              
//               <div className="form-group half">
//                 <label>Secondary Button Text</label>
//                 <input
//                   type="text"
//                   name="secondaryButtonText"
//                   value={formData.secondaryButtonText}
//                   onChange={handleInputChange}
//                   placeholder="Watch Demo"
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="form-section">
//             <h3>Status</h3>
            
//             <div className="form-group">
//               <div className="checkbox-container">
//                 <input
//                   type="checkbox"
//                   name="active"
//                   id="active"
//                   checked={formData.active}
//                   onChange={handleInputChange}
//                 />
//                 <label htmlFor="active">Active (visible on website)</label>
//               </div>
//             </div>
//           </div>
          
//           <div className="form-actions">
//             <button 
//               type="button" 
//               className="cancel-btn" 
//               onClick={resetForm}
//             >
//               Cancel
//             </button>
            
//             <button 
//               type="submit" 
//               className="submit-btn"
//               disabled={isUploading}
//             >
//               {formMode === 'add' ? 'Add Banner' : 'Update Banner'}
//             </button>
//           </div>
//         </form>
//       </div>
      
//       {/* Banners List */}
//       <div className="card table-card">
//         <h2>Existing Banners</h2>
        
//         {loading ? (
//           <div className="loading">Loading banners...</div>
//         ) : (
//           <div className="banners-list">
//             {banners.length > 0 ? (
//               banners.map(banner => (
//                 <div className="banner-item" key={banner.id}>
//                   <div className="banner-preview">
//                     {banner.imageUrl ? (
//                       <img src={banner.imageUrl} alt={banner.title} />
//                     ) : (
//                       <div className="no-image">No Image</div>
//                     )}
//                   </div>
                  
//                   <div className="banner-details">
//                     <h3>{banner.title || 'Untitled Banner'}</h3>
//                     <p>{banner.description || 'No description'}</p>
                    
//                     <div className="status-badge">
//                       <span className={banner.active ? 'active' : 'inactive'}>
//                         {banner.active ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="banner-actions">
//                     <button 
//                       className={`status-toggle-btn ${banner.active ? 'deactivate' : 'activate'}`}
//                       onClick={() => toggleBannerStatus(banner.id, banner.active)}
//                     >
//                       {banner.active ? 'Deactivate' : 'Activate'}
//                     </button>
                    
//                     <button 
//                       className="edit-btn"
//                       onClick={() => handleEditBanner(banner)}
//                     >
//                       <i className="fas fa-edit"></i> Edit
//                     </button>
                    
//                     <button 
//                       className="delete-btn"
//                       onClick={() => handleDeleteBanner(banner.id, banner.imageUrl)}
//                     >
//                       <i className="fas fa-trash"></i> Delete
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="no-data">No banners found. Add your first banner above.</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BannerManagement;







// BannerManagement.js
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
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './BannerManagement.css';

const BannerManagement = () => {
  // Banner list state
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    highlightText: '',
    description: '',
    active: true,
    imageUrl: '',
    features: [
      { icon: '⚡', text: 'Genuine Products' },
      { icon: '🚚', text: 'Fast Delivery' },
      { icon: '⭐', text: 'Expert Support' }
    ],
    badge: {
      icon: '⚡',
      text: 'Latest Tech Components'
    },
    primaryButtonText: 'Shop Now',
    secondaryButtonText: 'Watch Demo'
  });
  
  // Floating cards state
  const [floatingCards, setFloatingCards] = useState([
    { icon: '🔧', text: 'Arduino & IoT' },
    { icon: '⚡', text: 'Smart Sensors' },
    { icon: '🔌', text: 'Components' }
  ]);
  
  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);
  
  // Fetch banners from Firestore
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const bannersQuery = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(bannersQuery);
      
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Failed to load banners. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle feature text changes
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index].text = value;
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };
  
  // Handle feature icon changes
  const handleFeatureIconChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index].icon = value;
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };
  
  // Handle badge changes
  const handleBadgeChange = (field, value) => {
    setFormData({
      ...formData,
      badge: {
        ...formData.badge,
        [field]: value
      }
    });
  };
  
  // Handle floating card changes
  const handleCardChange = (index, field, value) => {
    const updatedCards = [...floatingCards];
    updatedCards[index][field] = value;
    setFloatingCards(updatedCards);
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
      const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
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
      // The image might have been deleted already or URL might be invalid
    }
  };
  
  // Add new banner
  const addBanner = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      // No need to deactivate other banners - we want multiple active banners
      
      const bannerData = {
        ...formData,
        floatingCards,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Adding new banner with data:", bannerData);
      
      await addDoc(collection(db, 'banners'), bannerData);
      resetForm();
      fetchBanners();
      alert('Banner added successfully!');
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner. Please try again.');
    }
  };
  
  // Update existing banner
  const updateBanner = async (e) => {
    e.preventDefault();
    
    if (!currentBannerId) return;
    
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
      
      // No need to deactivate other banners - we want multiple active banners
      
      const bannerData = {
        ...formData,
        floatingCards,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      console.log("Updating banner with data:", bannerData);
      
      const bannerRef = doc(db, 'banners', currentBannerId);
      await updateDoc(bannerRef, bannerData);
      
      resetForm();
      fetchBanners();
      alert('Banner updated successfully!');
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Failed to update banner. Please try again.');
    }
  };
  
  // Delete banner
  const handleDeleteBanner = async (bannerId, imageUrl) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        // Delete banner document from Firestore
        await deleteDoc(doc(db, 'banners', bannerId));
        
        // Delete banner image from Storage if it's a Firebase Storage URL
        if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          await deleteImage(imageUrl);
        }
        
        fetchBanners();
        alert('Banner deleted successfully!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Failed to delete banner. Please try again.');
      }
    }
  };
  
  // Toggle banner active status
  const toggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      // Simply toggle the status without affecting other banners
      const bannerRef = doc(db, 'banners', bannerId);
      await updateDoc(bannerRef, {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Banner ${bannerId} ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Failed to update banner status. Please try again.');
    }
  };
  
  // Edit banner (load data into form)
  const handleEditBanner = (banner) => {
    setFormMode('edit');
    setCurrentBannerId(banner.id);
    setFormData({
      title: banner.title || '',
      highlightText: banner.highlightText || '',
      description: banner.description || '',
      active: banner.active !== undefined ? banner.active : true,
      imageUrl: banner.imageUrl || '',
      features: banner.features || [
        { icon: '⚡', text: 'Genuine Products' },
        { icon: '🚚', text: 'Fast Delivery' },
        { icon: '⭐', text: 'Expert Support' }
      ],
      badge: banner.badge || {
        icon: '⚡',
        text: 'Latest Tech Components'
      },
      primaryButtonText: banner.primaryButtonText || 'Shop Now',
      secondaryButtonText: banner.secondaryButtonText || 'Watch Demo'
    });
    
    setFloatingCards(banner.floatingCards || [
      { icon: '🔧', text: 'Arduino & IoT' },
      { icon: '⚡', text: 'Smart Sensors' },
      { icon: '🔌', text: 'Components' }
    ]);
    
    setImagePreview(banner.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset form
  const resetForm = () => {
    setFormMode('add');
    setCurrentBannerId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setFormData({
      title: '',
      highlightText: '',
      description: '',
      active: true,
      imageUrl: '',
      features: [
        { icon: '⚡', text: 'Genuine Products' },
        { icon: '🚚', text: 'Fast Delivery' },
        { icon: '⭐', text: 'Expert Support' }
      ],
      badge: {
        icon: '⚡',
        text: 'Latest Tech Components'
      },
      primaryButtonText: 'Shop Now',
      secondaryButtonText: 'Watch Demo'
    });
    
    setFloatingCards([
      { icon: '🔧', text: 'Arduino & IoT' },
      { icon: '⚡', text: 'Smart Sensors' },
      { icon: '🔌', text: 'Components' }
    ]);
  };
  
  return (
    <div className="content">
      <h1 className="page-title">Banner Management</h1>
      
      {/* Banner Form */}
      <div className="card form-card">
        <h2>{formMode === 'add' ? 'Add New Banner' : 'Edit Banner'}</h2>
        
        <form onSubmit={formMode === 'add' ? addBanner : updateBanner}>
          <div className="form-section">
            <h3>Banner Content</h3>
            
            <div className="form-group">
              <label>Banner Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Power Your Innovation with Premium Electronics"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Highlight Text (will be colored differently)</label>
              <input
                type="text"
                name="highlightText"
                value={formData.highlightText}
                onChange={handleInputChange}
                placeholder="Innovation"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Discover cutting-edge Arduino boards, sensors, components and development tools..."
                rows="3"
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Banner Image</h3>
            
            <div className="form-group">
              <label>Banner Image</label>
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
                  <img src={imagePreview} alt="Banner Preview" />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Badge</h3>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Badge Icon</label>
                <input
                  type="text"
                  value={formData.badge.icon}
                  onChange={(e) => handleBadgeChange('icon', e.target.value)}
                  placeholder="⚡"
                />
              </div>
              
              <div className="form-group half">
                <label>Badge Text</label>
                <input
                  type="text"
                  value={formData.badge.text}
                  onChange={(e) => handleBadgeChange('text', e.target.value)}
                  placeholder="Latest Tech Components"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Features</h3>
            
            {formData.features.map((feature, index) => (
              <div className="form-row" key={index}>
                <div className="form-group quarter">
                  <label>Icon {index + 1}</label>
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => handleFeatureIconChange(index, e.target.value)}
                    placeholder="⚡"
                  />
                </div>
                
                <div className="form-group three-quarters">
                  <label>Text {index + 1}</label>
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Feature description"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <h3>Floating Cards</h3>
            
            {floatingCards.map((card, index) => (
              <div className="form-row" key={index}>
                <div className="form-group quarter">
                  <label>Icon {index + 1}</label>
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
                    placeholder="🔧"
                  />
                </div>
                
                <div className="form-group three-quarters">
                  <label>Text {index + 1}</label>
                  <input
                    type="text"
                    value={card.text}
                    onChange={(e) => handleCardChange(index, 'text', e.target.value)}
                    placeholder="Arduino & IoT"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <h3>Buttons</h3>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Primary Button Text</label>
                <input
                  type="text"
                  name="primaryButtonText"
                  value={formData.primaryButtonText}
                  onChange={handleInputChange}
                  placeholder="Shop Now"
                />
              </div>
              
              <div className="form-group half">
                <label>Secondary Button Text</label>
                <input
                  type="text"
                  name="secondaryButtonText"
                  value={formData.secondaryButtonText}
                  onChange={handleInputChange}
                  placeholder="Watch Demo"
                />
              </div>
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
              {formMode === 'add' ? 'Add Banner' : 'Update Banner'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Banners List */}
      <div className="card table-card">
        <h2>Existing Banners</h2>
        
        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : (
          <div className="banners-list">
            {banners.length > 0 ? (
              banners.map(banner => (
                <div className="banner-item" key={banner.id}>
                  <div className="banner-preview">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  
                  <div className="banner-details">
                    <h3>{banner.title || 'Untitled Banner'}</h3>
                    <p>{banner.description || 'No description'}</p>
                    
                    <div className="status-badge">
                      <span className={banner.active ? 'active' : 'inactive'}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="banner-actions">
                    <button 
                      className={`status-toggle-btn ${banner.active ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleBannerStatus(banner.id, banner.active)}
                    >
                      {banner.active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditBanner(banner)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteBanner(banner.id, banner.imageUrl)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No banners found. Add your first banner above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;