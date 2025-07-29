// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   getDocs, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   doc, 
//   serverTimestamp, 
//   query, 
//   orderBy,
//   where, 
//  setDoc
// } from 'firebase/firestore';
// import { 
//   ref, 
//   uploadBytesResumable, 
//   getDownloadURL, 
//   deleteObject ,
// } from 'firebase/storage';
// import { db, storage } from '../../firebase/firebaseConfig';
// import './DesignHouseManagement.css';

// function ModelBannerManagement() {
//   // State for banner form
//   const [bannerForm, setBannerForm] = useState({
//     title: '',
//     description: '',
//     ctaText: '',
//     categoryId: '',
//     imageFile: null,
//     imagePreview: ''
//   });

//   // State for banners list, categories, and selected banner for editing
//   const [banners, setBanners] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedBanner, setSelectedBanner] = useState(null);
  
//   // Loading and error states
//   const [loading, setLoading] = useState(false);
//   const [categoryLoading, setCategoryLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Fetch categories on component mount
//   useEffect(() => {
//     const fetchCategories = async () => {
//       setCategoryLoading(true);
//       try {
//         const categoriesQuery = query(collection(db, 'designCategories'), orderBy('name'));
//         const querySnapshot = await getDocs(categoriesQuery);
        
//         if (querySnapshot.empty) {
//           // If no categories exist, create default categories
//           await createDefaultCategories();
//           return; // The function will be called again due to listener
//         }
        
//         const categoriesList = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setCategories(categoriesList);
        
//         // Set default category if exists
//         if (categoriesList.length > 0 && !bannerForm.categoryId) {
//           setBannerForm(prev => ({ ...prev, categoryId: categoriesList[0].id }));
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//         setError('Failed to load categories. Please try again.');
//       } finally {
//         setCategoryLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Create default categories if none exist
//   const createDefaultCategories = async () => {
//     try {
//       const defaultCategories = [
//         {
//           id: 'fast-prototyping',
//           name: 'Fast Prototyping',
//           icon: '⚡',
//           description: 'Quick turnaround for your prototype needs',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         },
//         {
//           id: 'pcb-manufacturing',
//           name: 'PCB Manufacturing',
//           icon: '🔌',
//           description: 'Professional PCB fabrication services',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         },
//         {
//           id: '3d-printing',
//           name: '3D Printing',
//           icon: '🖨️',
//           description: 'Bring your 3D designs to life',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         },
//         {
//           id: 'laser-cutting',
//           name: 'Laser Cutting',
//           icon: '✂️',
//           description: 'Precision laser cutting for your projects',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         },
//         {
//           id: 'custom-battery',
//           name: 'Custom Battery Pack',
//           icon: '🔋',
//           description: 'Tailored battery solutions for any application',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         },
//         {
//           id: 'iot-components',
//           name: 'IoT Components',
//           icon: '📱',
//           description: 'Connected devices and components',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         }
//       ];

//       // Add each category with custom ID
//       for (const category of defaultCategories) {
//         const { id, ...categoryData } = category;
//         await setDoc(doc(db, 'designCategories', id), categoryData);
//       }

//       console.log('Default categories created');
//     } catch (error) {
//       console.error('Error creating default categories:', error);
//       setError('Failed to create default categories');
//     }
//   };

//   // Fetch banners when category changes
//   useEffect(() => {
//     const fetchBanners = async () => {
//       if (!bannerForm.categoryId) return;
      
//       setLoading(true);
//       try {
//         const bannersQuery = query(
//           collection(db, 'categoryBanners'),
//           where('categoryId', '==', bannerForm.categoryId),
//           orderBy('createdAt', 'desc')
//         );
        
//         const querySnapshot = await getDocs(bannersQuery);
//         const bannersList = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setBanners(bannersList);
//       } catch (error) {
//         console.error('Error fetching banners:', error);
//         setError('Failed to load banners. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBanners();
//   }, [bannerForm.categoryId]);

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setBannerForm(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle category change
//   const handleCategoryChange = (e) => {
//     const categoryId = e.target.value;
//     setBannerForm(prev => ({ 
//       ...prev, 
//       categoryId,
//       title: '',
//       description: '',
//       ctaText: '',
//       imageFile: null,
//       imagePreview: ''
//     }));
//     setSelectedBanner(null);
//   };

//   // Handle image selection
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (!validTypes.includes(file.type)) {
//       setError('Please select a valid image file (JPEG, PNG, WebP)');
//       return;
//     }

//     // Create a preview
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setBannerForm(prev => ({ 
//         ...prev, 
//         imageFile: file,
//         imagePreview: reader.result
//       }));
//     };
//     reader.readAsDataURL(file);
//   };

//   // Upload image to Firebase Storage
//   const uploadImage = async (file, bannerId) => {
//     if (!file) return null;

//     try {
//       setUploading(true);
//       const storageRef = ref(storage, `banners/${bannerId}_${file.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, file);

//       return new Promise((resolve, reject) => {
//         uploadTask.on(
//           'state_changed',
//           (snapshot) => {
//             // Optional: Track upload progress
//             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             console.log('Upload is ' + progress + '% done');
//           },
//           (error) => {
//             console.error('Error uploading image:', error);
//             reject(error);
//           },
//           async () => {
//             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//             resolve({
//               url: downloadURL,
//               path: `banners/${bannerId}_${file.name}`
//             });
//           }
//         );
//       });
//     } catch (error) {
//       console.error('Error in uploadImage:', error);
//       throw error;
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Handle form submission for adding/updating a banner
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (!bannerForm.title || !bannerForm.description || !bannerForm.ctaText || !bannerForm.categoryId) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     if (!selectedBanner && !bannerForm.imageFile) {
//       setError('Please select an image for the banner');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       if (selectedBanner) {
//         // Update existing banner
//         const bannerRef = doc(db, 'categoryBanners', selectedBanner.id);
//         const updateData = {
//           title: bannerForm.title,
//           description: bannerForm.description,
//           ctaText: bannerForm.ctaText,
//           updatedAt: serverTimestamp()
//         };

//         // Update image if a new one is selected
//         if (bannerForm.imageFile) {
//           // Delete old image if exists
//           if (selectedBanner.imagePath) {
//             try {
//               const oldImageRef = ref(storage, selectedBanner.imagePath);
//               await deleteObject(oldImageRef);
//             } catch (error) {
//               console.error('Error deleting old image:', error);
//               // Continue with update even if delete fails
//             }
//           }

//           // Upload new image
//           const imageData = await uploadImage(bannerForm.imageFile, selectedBanner.id);
//           updateData.imageUrl = imageData.url;
//           updateData.imagePath = imageData.path;
//         }

//         await updateDoc(bannerRef, updateData);
//         setSuccess('Banner updated successfully!');

//         // Update banners list
//         setBanners(prev => 
//           prev.map(banner => 
//             banner.id === selectedBanner.id 
//               ? { ...banner, ...updateData, imageUrl: updateData.imageUrl || banner.imageUrl } 
//               : banner
//           )
//         );
//       } else {
//         // Add new banner
//         const newBanner = {
//           title: bannerForm.title,
//           description: bannerForm.description,
//           ctaText: bannerForm.ctaText,
//           categoryId: bannerForm.categoryId,
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         };

//         // Add document first to get an ID
//         const docRef = await addDoc(collection(db, 'categoryBanners'), newBanner);
        
//         // Upload image and update document with URL
//         const imageData = await uploadImage(bannerForm.imageFile, docRef.id);
        
//         await updateDoc(docRef, {
//           imageUrl: imageData.url,
//           imagePath: imageData.path
//         });

//         // Add to banners list
//         setBanners(prev => [
//           { 
//             id: docRef.id, 
//             ...newBanner, 
//             imageUrl: imageData.url,
//             imagePath: imageData.path
//           }, 
//           ...prev
//         ]);

//         setSuccess('Banner added successfully!');
//       }

//       // Reset form
//       setBannerForm(prev => ({ 
//         ...prev, 
//         title: '',
//         description: '',
//         ctaText: '',
//         imageFile: null,
//         imagePreview: ''
//       }));
//       setSelectedBanner(null);
//     } catch (error) {
//       console.error('Error adding/updating banner:', error);
//       setError('Failed to save banner. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle banner selection for editing
//   const handleEditBanner = (banner) => {
//     setSelectedBanner(banner);
//     setBannerForm({
//       title: banner.title,
//       description: banner.description,
//       ctaText: banner.ctaText,
//       categoryId: banner.categoryId,
//       imageFile: null,
//       imagePreview: banner.imageUrl
//     });
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Handle banner deletion
//   const handleDeleteBanner = async (bannerId, imagePath) => {
//     if (!window.confirm('Are you sure you want to delete this banner?')) {
//       return;
//     }

//     setLoading(true);
//     try {
//       // Delete document from Firestore
//       await deleteDoc(doc(db, 'categoryBanners', bannerId));
      
//       // Delete image from Storage if exists
//       if (imagePath) {
//         const imageRef = ref(storage, imagePath);
//         await deleteObject(imageRef);
//       }

//       // Update banners list
//       setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      
//       // Reset form if the deleted banner was selected
//       if (selectedBanner && selectedBanner.id === bannerId) {
//         setBannerForm(prev => ({ 
//           ...prev, 
//           title: '',
//           description: '',
//           ctaText: '',
//           imageFile: null,
//           imagePreview: ''
//         }));
//         setSelectedBanner(null);
//       }

//       setSuccess('Banner deleted successfully!');
//     } catch (error) {
//       console.error('Error deleting banner:', error);
//       setError('Failed to delete banner. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setSelectedBanner(null);
//     setBannerForm(prev => ({ 
//       ...prev, 
//       title: '',
//       description: '',
//       ctaText: '',
//       imageFile: null,
//       imagePreview: ''
//     }));
//   };

//   return (
//     <div className="content">
//       <h1 className="page-title">Model Banner Management</h1>
      
//       {error && <div className="alert alert-danger">{error}</div>}
//       {success && <div className="alert alert-success">{success}</div>}
      
//       <div className="row">
//         <div className="col-lg-4">
//           <div className="card">
//             <div className="card-header">
//               <h3>{selectedBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleSubmit}>
//                 {/* Category Selector */}
//                 <div className="form-group mb-3">
//                   <label htmlFor="categoryId">Category:</label>
//                   <select
//                     id="categoryId"
//                     name="categoryId"
//                     className="form-control"
//                     value={bannerForm.categoryId}
//                     onChange={handleCategoryChange}
//                     disabled={loading || uploading || categoryLoading}
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map(category => (
//                       <option key={category.id} value={category.id}>
//                         {category.name} {category.icon}
//                       </option>
//                     ))}
//                   </select>
//                   {categoryLoading && <small className="text-muted">Loading categories...</small>}
//                 </div>
                
//                 {/* Banner Title */}
//                 <div className="form-group mb-3">
//                   <label htmlFor="title">Banner Title:</label>
//                   <input
//                     type="text"
//                     id="title"
//                     name="title"
//                     className="form-control"
//                     value={bannerForm.title}
//                     onChange={handleInputChange}
//                     disabled={loading || uploading}
//                     placeholder="e.g. Rapid Prototyping Solutions"
//                   />
//                 </div>
                
//                 {/* Banner Description */}
//                 <div className="form-group mb-3">
//                   <label htmlFor="description">Description:</label>
//                   <textarea
//                     id="description"
//                     name="description"
//                     className="form-control"
//                     value={bannerForm.description}
//                     onChange={handleInputChange}
//                     rows="3"
//                     disabled={loading || uploading}
//                     placeholder="e.g. Get your ideas from concept to prototype in days"
//                   ></textarea>
//                 </div>
                
//                 {/* CTA Text */}
//                 <div className="form-group mb-3">
//                   <label htmlFor="ctaText">Call-to-Action Button Text:</label>
//                   <input
//                     type="text"
//                     id="ctaText"
//                     name="ctaText"
//                     className="form-control"
//                     value={bannerForm.ctaText}
//                     onChange={handleInputChange}
//                     disabled={loading || uploading}
//                     placeholder="e.g. Learn More"
//                   />
//                 </div>
                
//                 {/* Banner Image */}
//                 <div className="form-group mb-3">
//                   <label htmlFor="bannerImage">Banner Image:</label>
//                   <input
//                     type="file"
//                     id="bannerImage"
//                     className="form-control"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     disabled={loading || uploading}
//                   />
//                   <small className="form-text text-muted">
//                     Recommended size: 1200x600 pixels (16:9 ratio)
//                   </small>
//                 </div>
                
//                 {/* Image Preview */}
//                 {bannerForm.imagePreview && (
//                   <div className="image-preview mb-3">
//                     <img 
//                       src={bannerForm.imagePreview} 
//                       alt="Banner preview" 
//                       className="img-fluid rounded"
//                     />
//                   </div>
//                 )}
                
//                 {/* Submit Button */}
//                 <div className="form-group d-flex justify-content-between">
//                   {selectedBanner ? (
//                     <>
//                       <button 
//                         type="button" 
//                         className="btn btn-secondary"
//                         onClick={handleCancelEdit}
//                         disabled={loading || uploading}
//                       >
//                         Cancel
//                       </button>
//                       <button 
//                         type="submit" 
//                         className="btn btn-primary"
//                         disabled={loading || uploading}
//                       >
//                         {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Update Banner'}
//                       </button>
//                     </>
//                   ) : (
//                     <button 
//                       type="submit" 
//                       className="btn btn-primary w-100"
//                       disabled={loading || uploading || !bannerForm.categoryId}
//                     >
//                       {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Add Banner'}
//                     </button>
//                   )}
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
        
//         <div className="col-lg-8">
//           <div className="card">
//             <div className="card-header d-flex justify-content-between align-items-center">
//               <h3>
//                 {categories.find(cat => cat.id === bannerForm.categoryId)?.name || 'Category'} Banners
//               </h3>
//               <div className="banner-count badge bg-primary">
//                 {banners.length} Banner{banners.length !== 1 ? 's' : ''}
//               </div>
//             </div>
//             <div className="card-body">
//               {loading ? (
//                 <div className="text-center py-5">
//                   <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : banners.length === 0 ? (
//                 <div className="alert alert-info">
//                   No banners found for this category. Please add a new banner.
//                 </div>
//               ) : (
//                 <div className="banners-grid">
//                   {banners.map(banner => (
//                     <div key={banner.id} className="banner-card">
//                       <div className="banner-card-image">
//                         <img 
//                           src={banner.imageUrl} 
//                           alt={banner.title} 
//                           className="img-fluid rounded"
//                         />
//                       </div>
//                       <div className="banner-card-content">
//                         <h4>{banner.title}</h4>
//                         <p>{banner.description}</p>
//                         <div className="banner-card-cta">
//                           Button: <span className="badge bg-secondary">{banner.ctaText}</span>
//                         </div>
//                         <div className="banner-card-actions">
//                           <button 
//                             className="btn btn-sm btn-outline-primary"
//                             onClick={() => handleEditBanner(banner)}
//                             disabled={loading}
//                           >
//                             <i className="fas fa-edit"></i> Edit
//                           </button>
//                           <button 
//                             className="btn btn-sm btn-outline-danger"
//                             onClick={() => handleDeleteBanner(banner.id, banner.imagePath)}
//                             disabled={loading}
//                           >
//                             <i className="fas fa-trash"></i> Delete
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ModelBannerManagement;




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
  setDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './DesignHouseManagement.css';

function ModelBannerManagement() {
  // State for banner form
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    ctaText: '',
    categoryId: '',
    imageFile: null,
    imagePreview: ''
  });

  // State for banners list, categories, and selected banner for editing
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        const categoriesQuery = query(collection(db, 'designCategories'), orderBy('name'));
        const querySnapshot = await getDocs(categoriesQuery);
        
        if (querySnapshot.empty) {
          // If no categories exist, create default categories
          await createDefaultCategories();
          return; // The function will be called again due to listener
        }
        
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCategories(categoriesList);
        
        // Set default category if exists
        if (categoriesList.length > 0 && !bannerForm.categoryId) {
          setBannerForm(prev => ({ ...prev, categoryId: categoriesList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Create default categories if none exist
  const createDefaultCategories = async () => {
    try {
      const defaultCategories = [
        {
          id: 'fast-prototyping',
          name: 'Fast Prototyping',
          icon: '⚡',
          description: 'Quick turnaround for your prototype needs',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'pcb-manufacturing',
          name: 'PCB Manufacturing',
          icon: '🔌',
          description: 'Professional PCB fabrication services',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: '3d-printing',
          name: '3D Printing',
          icon: '🖨️',
          description: 'Bring your 3D designs to life',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'laser-cutting',
          name: 'Laser Cutting',
          icon: '✂️',
          description: 'Precision laser cutting for your projects',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'custom-battery',
          name: 'Custom Battery Pack',
          icon: '🔋',
          description: 'Tailored battery solutions for any application',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'iot-components',
          name: 'IoT Components',
          icon: '📱',
          description: 'Connected devices and components',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Add each category with custom ID
      for (const category of defaultCategories) {
        const { id, ...categoryData } = category;
        await setDoc(doc(db, 'designCategories', id), categoryData);
      }

      console.log('Default categories created');
    } catch (error) {
      console.error('Error creating default categories:', error);
      setError('Failed to create default categories');
    }
  };

  // Fetch banners when category changes
  useEffect(() => {
    const fetchBanners = async () => {
      if (!bannerForm.categoryId) return;
      
      setLoading(true);
      try {
        const bannersQuery = query(
          collection(db, 'categoryBanners'),
          where('categoryId', '==', bannerForm.categoryId)
        );
        
        const querySnapshot = await getDocs(bannersQuery);
        const bannersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBanners(bannersList);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError('Failed to load banners. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [bannerForm.categoryId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setBannerForm(prev => ({ 
      ...prev, 
      categoryId,
      title: '',
      description: '',
      ctaText: '',
      imageFile: null,
      imagePreview: ''
    }));
    setSelectedBanner(null);
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
      setBannerForm(prev => ({ 
        ...prev, 
        imageFile: file,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file, bannerId) => {
    if (!file) return null;

    try {
      setUploading(true);
      // Create a unique filename using the bannerId and original filename
      const filename = `${bannerId}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `banners/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
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
              path: `banners/${filename}`
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

  // Handle form submission for adding/updating a banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!bannerForm.title || !bannerForm.description || !bannerForm.ctaText || !bannerForm.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedBanner && !bannerForm.imageFile) {
      setError('Please select an image for the banner');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedBanner) {
        // Update existing banner
        const bannerRef = doc(db, 'categoryBanners', selectedBanner.id);
        const updateData = {
          title: bannerForm.title,
          description: bannerForm.description,
          ctaText: bannerForm.ctaText,
          updatedAt: serverTimestamp()
        };

        // Update image if a new one is selected
        if (bannerForm.imageFile) {
          // Delete old image if exists
          if (selectedBanner.imagePath) {
            try {
              const oldImageRef = ref(storage, selectedBanner.imagePath);
              await deleteObject(oldImageRef);
            } catch (error) {
              console.error('Error deleting old image:', error);
              // Continue with update even if delete fails
            }
          }

          // Upload new image
          const imageData = await uploadImage(bannerForm.imageFile, selectedBanner.id);
          updateData.imageUrl = imageData.url;
          updateData.imagePath = imageData.path;
        }

        await updateDoc(bannerRef, updateData);
        setSuccess('Banner updated successfully!');

        // Update banners list
        setBanners(prev => 
          prev.map(banner => 
            banner.id === selectedBanner.id 
              ? { ...banner, ...updateData, imageUrl: updateData.imageUrl || banner.imageUrl } 
              : banner
          )
        );
      } else {
        // Add new banner
        const newBanner = {
          title: bannerForm.title,
          description: bannerForm.description,
          ctaText: bannerForm.ctaText,
          categoryId: bannerForm.categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Add document first to get an ID
        const docRef = await addDoc(collection(db, 'categoryBanners'), newBanner);
        
        // Upload image and update document with URL
        const imageData = await uploadImage(bannerForm.imageFile, docRef.id);
        
        await updateDoc(docRef, {
          imageUrl: imageData.url,
          imagePath: imageData.path
        });

        // Add to banners list
        setBanners(prev => [
          { 
            id: docRef.id, 
            ...newBanner, 
            imageUrl: imageData.url,
            imagePath: imageData.path
          }, 
          ...prev
        ]);

        setSuccess('Banner added successfully!');
      }

      // Reset form
      setBannerForm(prev => ({ 
        ...prev, 
        title: '',
        description: '',
        ctaText: '',
        imageFile: null,
        imagePreview: ''
      }));
      setSelectedBanner(null);
    } catch (error) {
      console.error('Error adding/updating banner:', error);
      setError('Failed to save banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle banner selection for editing
  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setBannerForm({
      title: banner.title,
      description: banner.description,
      ctaText: banner.ctaText,
      categoryId: banner.categoryId,
      imageFile: null,
      imagePreview: banner.imageUrl
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle banner deletion
  const handleDeleteBanner = async (bannerId, imagePath) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete document from Firestore
      await deleteDoc(doc(db, 'categoryBanners', bannerId));
      
      // Delete image from Storage if exists
      if (imagePath) {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      }

      // Update banners list
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      
      // Reset form if the deleted banner was selected
      if (selectedBanner && selectedBanner.id === bannerId) {
        setBannerForm(prev => ({ 
          ...prev, 
          title: '',
          description: '',
          ctaText: '',
          imageFile: null,
          imagePreview: ''
        }));
        setSelectedBanner(null);
      }

      setSuccess('Banner deleted successfully!');
    } catch (error) {
      console.error('Error deleting banner:', error);
      setError('Failed to delete banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedBanner(null);
    setBannerForm(prev => ({ 
      ...prev, 
      title: '',
      description: '',
      ctaText: '',
      imageFile: null,
      imagePreview: ''
    }));
  };

  // Preview the banner on the Design Makers Hub
  const previewBanner = () => {
    const previewData = {
      id: selectedBanner ? selectedBanner.id : 'preview',
      title: bannerForm.title || 'Banner Title',
      description: bannerForm.description || 'Banner Description',
      ctaText: bannerForm.ctaText || 'Action Button',
      imageUrl: bannerForm.imagePreview || 'https://via.placeholder.com/1200x600?text=Banner+Preview',
      categoryId: bannerForm.categoryId
    };

    const previewHTML = `
      <div style="max-width: 800px; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
        <div style="position: relative; height: 400px; background-image: url('${previewData.imageUrl}'); background-size: cover; background-position: center;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);">
            <div style="position: absolute; top: 50%; left: 5%; transform: translateY(-50%); max-width: 50%; color: white; padding: 20px;">
              <h3 style="font-size: 28px; font-weight: 700; margin-bottom: 15px;">${previewData.title}</h3>
              <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">${previewData.description}</p>
              <button style="background-color: #e74c3c; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: 600;">${previewData.ctaText}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Open preview in a new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Banner Preview</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Banner Preview</h2>
          ${previewHTML}
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  return (
    <div className="content">
      <h1 className="page-title">Model Banner Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="row">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3>{selectedBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Category Selector */}
                <div className="form-group mb-3">
                  <label htmlFor="categoryId">Category:</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="form-control"
                    value={bannerForm.categoryId}
                    onChange={handleCategoryChange}
                    disabled={loading || uploading || categoryLoading}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} {category.icon}
                      </option>
                    ))}
                  </select>
                  {categoryLoading && <small className="text-muted">Loading categories...</small>}
                </div>
                
                {/* Banner Title */}
                <div className="form-group mb-3">
                  <label htmlFor="title">Banner Title:</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={bannerForm.title}
                    onChange={handleInputChange}
                    disabled={loading || uploading}
                    placeholder="e.g. 3D Printing Services"
                  />
                </div>
                
                {/* Banner Description */}
                <div className="form-group mb-3">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={bannerForm.description}
                    onChange={handleInputChange}
                    rows="3"
                    disabled={loading || uploading}
                    placeholder="e.g. Advanced 3D printing technologies for any project"
                  ></textarea>
                </div>
                
                {/* CTA Text */}
                <div className="form-group mb-3">
                  <label htmlFor="ctaText">Call-to-Action Button Text:</label>
                  <input
                    type="text"
                    id="ctaText"
                    name="ctaText"
                    className="form-control"
                    value={bannerForm.ctaText}
                    onChange={handleInputChange}
                    disabled={loading || uploading}
                    placeholder="e.g. Learn More"
                  />
                </div>
                
                {/* Banner Image */}
                <div className="form-group mb-3">
                  <label htmlFor="bannerImage">Banner Image:</label>
                  <input
                    type="file"
                    id="bannerImage"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading || uploading}
                  />
                  <small className="form-text text-muted">
                    Recommended size: 1200x600 pixels (16:9 ratio)
                  </small>
                </div>
                
                {/* Image Preview */}
                {bannerForm.imagePreview && (
                  <div className="image-preview mb-3">
                    <img 
                      src={bannerForm.imagePreview} 
                      alt="Banner preview" 
                      className="img-fluid rounded"
                    />
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="form-group d-flex justify-content-between">
                  {selectedBanner ? (
                    <>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        disabled={loading || uploading}
                      >
                        Cancel
                      </button>
                      <div>
                        <button
                          type="button"
                          className="btn btn-info me-2"
                          onClick={previewBanner}
                          disabled={loading || uploading || !bannerForm.title || !bannerForm.description}
                        >
                          <i className="fas fa-eye"></i> Preview
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={loading || uploading}
                        >
                          {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Update Banner'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-100 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={previewBanner}
                        disabled={loading || uploading || !bannerForm.title || !bannerForm.description || !bannerForm.imagePreview}
                      >
                        <i className="fas fa-eye"></i> Preview
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading || uploading || !bannerForm.categoryId}
                      >
                        {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Add Banner'}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>
                {categories.find(cat => cat.id === bannerForm.categoryId)?.name || 'Category'} Banners
              </h3>
              <div className="banner-count badge bg-primary">
                {banners.length} Banner{banners.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : banners.length === 0 ? (
                <div className="alert alert-info">
                  No banners found for this category. Please add a new banner.
                </div>
              ) : (
                <div className="banners-grid">
                  {banners.map(banner => (
                    <div key={banner.id} className="banner-card">
                      <div className="banner-card-image">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          className="img-fluid"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x180?text=Image+Not+Found';
                          }}
                        />
                      </div>
                      <div className="banner-card-content">
                        <h4>{banner.title}</h4>
                        <p>{banner.description}</p>
                        <div className="banner-card-cta">
                          Button: <span className="badge bg-secondary">{banner.ctaText}</span>
                        </div>
                        <div className="banner-card-actions">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditBanner(banner)}
                            disabled={loading}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteBanner(banner.id, banner.imagePath)}
                            disabled={loading}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelBannerManagement;