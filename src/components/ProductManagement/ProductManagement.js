



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
//   where,
//   writeBatch,
//   getDoc,
//   serverTimestamp 
// } from 'firebase/firestore';
// import { 
//   ref, 
//   uploadBytesResumable, 
//   getDownloadURL, 
//   deleteObject 
// } from 'firebase/storage';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { db, storage } from '../../firebase/firebaseConfig';
// import './ProductManagement.css';

// const ProductManagement = () => {
//   // Navigation
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const urlMode = queryParams.get('mode');
//   const editId = queryParams.get('edit');
  
//   // Mode state
//   const [activeMode, setActiveMode] = useState(urlMode || 'trending'); // 'trending', 'categories', or 'categoryItems'
  
//   // Products (Trending Components) state
//   const [products, setProducts] = useState([]);
  
//   // Categories state
//   const [categories, setCategories] = useState([]);
  
//   // Category Items state
//   const [categoryItems, setCategoryItems] = useState([]);
  
//   // Shared state
//   const [loading, setLoading] = useState(true);
//   const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
//   const [currentItemId, setCurrentItemId] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
  
//   // Product form state
//   const [productFormData, setProductFormData] = useState({
//     name: '',
//     price: '',
//     description: '',
//     fullDescription: '',
//     material: '',
//     dimensions: '',
//     weight: '',
//     warranty: '',
//     projectUsages: ['', '', '', ''],
//     isQuick: true,
//     active: true,
//     imageUrl: ''
//   });
  
//   // Category form state
//   const [categoryFormData, setCategoryFormData] = useState({
//     name: '',
//     description: '',
//     active: true,
//     imageUrl: ''
//   });
  
//   // Category Item form state
//   const [categoryItemFormData, setCategoryItemFormData] = useState({
//     categoryId: '',
//     categoryName: '',
//     name: '',
//     price: '',
//     description: '',
//     fullDescription: '',
//     material: '',
//     dimensions: '',
//     active: true,
//     imageUrl: ''
//   });
  
//   // Fetch data on component mount
//   useEffect(() => {
//     fetchData();
    
//     // If edit mode is activated via URL params
//     if (editId && urlMode) {
//       loadItemForEdit(editId, urlMode);
//     }
//   }, []);
  
//   // Fetch data when active mode changes
//   useEffect(() => {
//     fetchData();
//   }, [activeMode]);
  
//   // Fetch categories whenever needed for category items form
//   useEffect(() => {
//     if (activeMode === 'categoryItems') {
//       fetchCategories();
//     }
//   }, [activeMode]);
  
//   // Fetch data based on active mode
//   const fetchData = async () => {
//     switch(activeMode) {
//       case 'trending':
//         fetchProducts();
//         break;
//       case 'categories':
//         fetchCategories();
//         break;
//       case 'categoryItems':
//         fetchCategoryItems();
//         fetchCategories(); // Need categories for the dropdown
//         break;
//       default:
//         fetchProducts();
//     }
//   };
  
//   // Load item for edit
//   const loadItemForEdit = async (itemId, mode) => {
//     try {
//       setLoading(true);
//       setFormMode('edit');
//       setCurrentItemId(itemId);
      
//       let collectionName;
      
//       switch(mode) {
//         case 'trending':
//           collectionName = 'products';
//           break;
//         case 'categories':
//           collectionName = 'categories';
//           break;
//         case 'categoryItems':
//           collectionName = 'categoryItems';
//           break;
//         default:
//           collectionName = 'products';
//       }
      
//       const itemDoc = await getDoc(doc(db, collectionName, itemId));
      
//       if (itemDoc.exists()) {
//         const itemData = itemDoc.data();
        
//         switch(mode) {
//           case 'trending':
//             // Ensure project usages is an array with 4 elements
//             let projectUsages = Array.isArray(itemData.projectUsages) ? [...itemData.projectUsages] : [];
//             while (projectUsages.length < 4) {
//               projectUsages.push('');
//             }
            
//             setProductFormData({
//               name: itemData.name || '',
//               price: itemData.price || '',
//               description: itemData.description || '',
//               fullDescription: itemData.fullDescription || '',
//               material: itemData.material || '',
//               dimensions: itemData.dimensions || '',
//               weight: itemData.weight || '',
//               warranty: itemData.warranty || '',
//               projectUsages,
//               isQuick: itemData.isQuick !== undefined ? itemData.isQuick : true,
//               active: itemData.active !== undefined ? itemData.active : true,
//               imageUrl: itemData.imageUrl || ''
//             });
//             break;
//           case 'categories':
//             setCategoryFormData({
//               name: itemData.name || '',
//               description: itemData.description || '',
//               active: itemData.active !== undefined ? itemData.active : true,
//               imageUrl: itemData.imageUrl || ''
//             });
//             break;
//           case 'categoryItems':
//             setCategoryItemFormData({
//               categoryId: itemData.categoryId || '',
//               categoryName: itemData.categoryName || '',
//               name: itemData.name || '',
//               price: itemData.price || '',
//               description: itemData.description || '',
//               fullDescription: itemData.fullDescription || '',
//               material: itemData.material || '',
//               dimensions: itemData.dimensions || '',
//               active: itemData.active !== undefined ? itemData.active : true,
//               imageUrl: itemData.imageUrl || ''
//             });
//             break;
//         }
        
//         setImagePreview(itemData.imageUrl);
//       }
//     } catch (error) {
//       console.error(`Error loading ${mode} for edit:`, error);
//       alert(`Failed to load ${mode} for editing. Please try again.`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Fetch products from Firestore
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(productsQuery);
      
//       const productsData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setProducts(productsData);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       alert('Failed to load products. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Fetch categories from Firestore
//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(categoriesQuery);
      
//       const categoriesData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setCategories(categoriesData);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       alert('Failed to load categories. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Fetch category items from Firestore
//   const fetchCategoryItems = async () => {
//     try {
//       setLoading(true);
//       const categoryItemsQuery = query(collection(db, 'categoryItems'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(categoryItemsQuery);
      
//       const categoryItemsData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setCategoryItems(categoryItemsData);
//     } catch (error) {
//       console.error('Error fetching category items:', error);
//       alert('Failed to load category items. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle product form input changes
//   const handleProductInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (name === 'price') {
//       // Ensure price is a valid number
//       const numberValue = value === '' ? '' : parseFloat(value);
//       if (!isNaN(numberValue) || value === '') {
//         setProductFormData({
//           ...productFormData,
//           [name]: value === '' ? '' : numberValue
//         });
//       }
//     } else {
//       setProductFormData({
//         ...productFormData,
//         [name]: type === 'checkbox' ? checked : value
//       });
//     }
//   };
  
//   // Handle category form input changes
//   const handleCategoryInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     setCategoryFormData({
//       ...categoryFormData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };
  
//   // Handle category item form input changes
//   const handleCategoryItemInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (name === 'price') {
//       // Ensure price is a valid number
//       const numberValue = value === '' ? '' : parseFloat(value);
//       if (!isNaN(numberValue) || value === '') {
//         setCategoryItemFormData({
//           ...categoryItemFormData,
//           [name]: value === '' ? '' : numberValue
//         });
//       }
//     } else if (name === 'categoryId') {
//       // Update categoryName when categoryId changes
//       const selectedCategory = categories.find(cat => cat.id === value);
//       setCategoryItemFormData({
//         ...categoryItemFormData,
//         categoryId: value,
//         categoryName: selectedCategory ? selectedCategory.name : ''
//       });
//     } else {
//       setCategoryItemFormData({
//         ...categoryItemFormData,
//         [name]: type === 'checkbox' ? checked : value
//       });
//     }
//   };
  
//   // Handle project usage changes
//   const handleProjectUsageChange = (index, value) => {
//     const updatedUsages = [...productFormData.projectUsages];
//     updatedUsages[index] = value;
//     setProductFormData({
//       ...productFormData,
//       projectUsages: updatedUsages
//     });
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
//       const storageRef = ref(storage, `${activeMode}/${Date.now()}_${imageFile.name}`);
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
//     }
//   };
  
//   // Add new product
//   const addProduct = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (productFormData.name.trim() === '') {
//       alert('Please enter a product name');
//       return;
//     }
    
//     if (productFormData.price === '' || isNaN(productFormData.price)) {
//       alert('Please enter a valid price');
//       return;
//     }
    
//     try {
//       let imageUrl = productFormData.imageUrl;
      
//       if (imageFile) {
//         imageUrl = await uploadImage();
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }
      
//       // Filter out empty project usages
//       const filteredProjectUsages = productFormData.projectUsages.filter(usage => usage.trim() !== '');
      
//       const productData = {
//         ...productFormData,
//         price: parseFloat(productFormData.price),
//         projectUsages: filteredProjectUsages,
//         imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Adding new product with data:", productData);
      
//       await addDoc(collection(db, 'products'), productData);
//       resetProductForm();
//       fetchProducts();
//       alert('Product added successfully!');
//     } catch (error) {
//       console.error('Error adding product:', error);
//       alert('Failed to add product. Please try again.');
//     }
//   };
  
//   // Update existing product
//   const updateProduct = async (e) => {
//     e.preventDefault();
    
//     if (!currentItemId) return;
    
//     // Validate form
//     if (productFormData.name.trim() === '') {
//       alert('Please enter a product name');
//       return;
//     }
    
//     if (productFormData.price === '' || isNaN(productFormData.price)) {
//       alert('Please enter a valid price');
//       return;
//     }
    
//     try {
//       let imageUrl = productFormData.imageUrl;
      
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
      
//       // Filter out empty project usages
//       const filteredProjectUsages = productFormData.projectUsages.filter(usage => usage.trim() !== '');
      
//       const productData = {
//         ...productFormData,
//         price: parseFloat(productFormData.price),
//         projectUsages: filteredProjectUsages,
//         imageUrl,
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Updating product with data:", productData);
      
//       const productRef = doc(db, 'products', currentItemId);
//       await updateDoc(productRef, productData);
      
//       resetProductForm();
//       fetchProducts();
//       alert('Product updated successfully!');
//     } catch (error) {
//       console.error('Error updating product:', error);
//       alert('Failed to update product. Please try again.');
//     }
//   };
  
//   // Add new category
//   const addCategory = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (categoryFormData.name.trim() === '') {
//       alert('Please enter a category name');
//       return;
//     }
    
//     try {
//       let imageUrl = categoryFormData.imageUrl;
      
//       if (imageFile) {
//         imageUrl = await uploadImage();
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }
      
//       const categoryData = {
//         ...categoryFormData,
//         imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Adding new category with data:", categoryData);
      
//       await addDoc(collection(db, 'categories'), categoryData);
//       resetCategoryForm();
//       fetchCategories();
//       alert('Category added successfully!');
//     } catch (error) {
//       console.error('Error adding category:', error);
//       alert('Failed to add category. Please try again.');
//     }
//   };
  
//   // Update existing category
//   const updateCategory = async (e) => {
//     e.preventDefault();
    
//     if (!currentItemId) return;
    
//     // Validate form
//     if (categoryFormData.name.trim() === '') {
//       alert('Please enter a category name');
//       return;
//     }
    
//     try {
//       let imageUrl = categoryFormData.imageUrl;
      
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
      
//       const categoryData = {
//         ...categoryFormData,
//         imageUrl,
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Updating category with data:", categoryData);
      
//       const categoryRef = doc(db, 'categories', currentItemId);
//       await updateDoc(categoryRef, categoryData);
      
//       // Update category name in all associated category items
//       const batch = writeBatch(db);
//       const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', currentItemId));
//       const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
      
//       categoryItemsSnapshot.docs.forEach(doc => {
//         batch.update(doc.ref, { 
//           categoryName: categoryFormData.name,
//           updatedAt: serverTimestamp()
//         });
//       });
      
//       await batch.commit();
      
//       resetCategoryForm();
//       fetchCategories();
//       alert('Category updated successfully!');
//     } catch (error) {
//       console.error('Error updating category:', error);
//       alert('Failed to update category. Please try again.');
//     }
//   };
  
//   // Add new category item
//   const addCategoryItem = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (categoryItemFormData.name.trim() === '') {
//       alert('Please enter an item name');
//       return;
//     }
    
//     if (categoryItemFormData.price === '' || isNaN(categoryItemFormData.price)) {
//       alert('Please enter a valid price');
//       return;
//     }
    
//     if (!categoryItemFormData.categoryId) {
//       alert('Please select a category');
//       return;
//     }
    
//     try {
//       let imageUrl = categoryItemFormData.imageUrl;
      
//       if (imageFile) {
//         imageUrl = await uploadImage();
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }
      
//       const categoryItemData = {
//         ...categoryItemFormData,
//         price: parseFloat(categoryItemFormData.price),
//         imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Adding new category item with data:", categoryItemData);
      
//       await addDoc(collection(db, 'categoryItems'), categoryItemData);
//       resetCategoryItemForm();
//       fetchCategoryItems();
//       alert('Category item added successfully!');
//     } catch (error) {
//       console.error('Error adding category item:', error);
//       alert('Failed to add category item. Please try again.');
//     }
//   };
  
//   // Update existing category item
//   const updateCategoryItem = async (e) => {
//     e.preventDefault();
    
//     if (!currentItemId) return;
    
//     // Validate form
//     if (categoryItemFormData.name.trim() === '') {
//       alert('Please enter an item name');
//       return;
//     }
    
//     if (categoryItemFormData.price === '' || isNaN(categoryItemFormData.price)) {
//       alert('Please enter a valid price');
//       return;
//     }
    
//     if (!categoryItemFormData.categoryId) {
//       alert('Please select a category');
//       return;
//     }
    
//     try {
//       let imageUrl = categoryItemFormData.imageUrl;
      
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
      
//       const categoryItemData = {
//         ...categoryItemFormData,
//         price: parseFloat(categoryItemFormData.price),
//         imageUrl,
//         updatedAt: serverTimestamp()
//       };
      
//       console.log("Updating category item with data:", categoryItemData);
      
//       const categoryItemRef = doc(db, 'categoryItems', currentItemId);
//       await updateDoc(categoryItemRef, categoryItemData);
      
//       resetCategoryItemForm();
//       fetchCategoryItems();
//       alert('Category item updated successfully!');
//     } catch (error) {
//       console.error('Error updating category item:', error);
//       alert('Failed to update category item. Please try again.');
//     }
//   };
  
//   // Delete item
//   const handleDeleteItem = async (itemId, imageUrl, itemType) => {
//     const itemTypeName = 
//       itemType === 'trending' ? 'product' : 
//       itemType === 'categories' ? 'category' : 
//       'category item';
    
//     if (window.confirm(`Are you sure you want to delete this ${itemTypeName}?`)) {
//       try {
//         // If deleting a category, check if it has items
//         if (itemType === 'categories') {
//           const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', itemId));
//           const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
          
//           if (!categoryItemsSnapshot.empty) {
//             if (!window.confirm(`This category has ${categoryItemsSnapshot.size} items. Deleting it will also delete all associated items. Continue?`)) {
//               return;
//             }
            
//             // Delete all associated category items
//             const batch = writeBatch(db);
//             categoryItemsSnapshot.docs.forEach(doc => {
//               batch.delete(doc.ref);
              
//               // Delete category item images
//               const itemImageUrl = doc.data().imageUrl;
//               if (itemImageUrl && itemImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
//                 deleteImage(itemImageUrl);
//               }
//             });
            
//             await batch.commit();
//           }
//         }
        
//         // Delete item document from Firestore
//         const collectionName = 
//           itemType === 'trending' ? 'products' : 
//           itemType === 'categories' ? 'categories' : 
//           'categoryItems';
        
//         await deleteDoc(doc(db, collectionName, itemId));
        
//         // Delete item image from Storage if it's a Firebase Storage URL
//         if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
//           await deleteImage(imageUrl);
//         }
        
//         // Refresh the appropriate list
//         if (itemType === 'trending') {
//           fetchProducts();
//         } else if (itemType === 'categories') {
//           fetchCategories();
//         } else {
//           fetchCategoryItems();
//         }
        
//         alert(`${itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1)} deleted successfully!`);
//       } catch (error) {
//         console.error(`Error deleting ${itemTypeName}:`, error);
//         alert(`Failed to delete ${itemTypeName}. Please try again.`);
//       }
//     }
//   };
  
//   // Toggle item active status
//   const toggleItemStatus = async (itemId, currentStatus, itemType) => {
//     try {
//       const collectionName = 
//         itemType === 'trending' ? 'products' : 
//         itemType === 'categories' ? 'categories' : 
//         'categoryItems';
      
//       const itemRef = doc(db, collectionName, itemId);
//       await updateDoc(itemRef, {
//         active: !currentStatus,
//         updatedAt: serverTimestamp()
//       });
      
//       // Refresh the appropriate list
//       if (itemType === 'trending') {
//         fetchProducts();
//       } else if (itemType === 'categories') {
//         fetchCategories();
//       } else {
//         fetchCategoryItems();
//       }
//     } catch (error) {
//       console.error('Error toggling item status:', error);
//       alert('Failed to update item status. Please try again.');
//     }
//   };
  
//   // Edit item (load data into form)
//   const handleEditItem = (item, itemType) => {
//     setFormMode('edit');
//     setCurrentItemId(item.id);
    
//     if (itemType === 'trending') {
//       // Ensure project usages is an array with 4 elements
//       let projectUsages = Array.isArray(item.projectUsages) ? [...item.projectUsages] : [];
//       while (projectUsages.length < 4) {
//         projectUsages.push('');
//       }
      
//       setProductFormData({
//         name: item.name || '',
//         price: item.price || '',
//         description: item.description || '',
//         fullDescription: item.fullDescription || '',
//         material: item.material || '',
//         dimensions: item.dimensions || '',
//         weight: item.weight || '',
//         warranty: item.warranty || '',
//         projectUsages,
//         isQuick: item.isQuick !== undefined ? item.isQuick : true,
//         active: item.active !== undefined ? item.active : true,
//         imageUrl: item.imageUrl || ''
//       });
//     } else if (itemType === 'categories') {
//       setCategoryFormData({
//         name: item.name || '',
//         description: item.description || '',
//         active: item.active !== undefined ? item.active : true,
//         imageUrl: item.imageUrl || ''
//       });
//     } else {
//       setCategoryItemFormData({
//         categoryId: item.categoryId || '',
//         categoryName: item.categoryName || '',
//         name: item.name || '',
//         price: item.price || '',
//         description: item.description || '',
//         fullDescription: item.fullDescription || '',
//         material: item.material || '',
//         dimensions: item.dimensions || '',
//         active: item.active !== undefined ? item.active : true,
//         imageUrl: item.imageUrl || ''
//       });
//     }
    
//     setImagePreview(item.imageUrl);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
  
//   // Reset product form
//   const resetProductForm = () => {
//     setFormMode('add');
//     setCurrentItemId(null);
//     setImageFile(null);
//     setImagePreview(null);
//     setUploadProgress(0);
//     setProductFormData({
//       name: '',
//       price: '',
//       description: '',
//       fullDescription: '',
//       material: '',
//       dimensions: '',
//       weight: '',
//       warranty: '',
//       projectUsages: ['', '', '', ''],
//       isQuick: true,
//       active: true,
//       imageUrl: ''
//     });
//   };
  
//   // Reset category form
//   const resetCategoryForm = () => {
//     setFormMode('add');
//     setCurrentItemId(null);
//     setImageFile(null);
//     setImagePreview(null);
//     setUploadProgress(0);
//     setCategoryFormData({
//       name: '',
//       description: '',
//       active: true,
//       imageUrl: ''
//     });
//   };
  
//   // Reset category item form
//   const resetCategoryItemForm = () => {
//     setFormMode('add');
//     setCurrentItemId(null);
//     setImageFile(null);
//     setImagePreview(null);
//     setUploadProgress(0);
//     setCategoryItemFormData({
//       categoryId: '',
//       categoryName: '',
//       name: '',
//       price: '',
//       description: '',
//       fullDescription: '',
//       material: '',
//       dimensions: '',
//       active: true,
//       imageUrl: ''
//     });
//   };
  
//   // Reset form based on active mode
//   const resetForm = () => {
//     switch(activeMode) {
//       case 'trending':
//         resetProductForm();
//         break;
//       case 'categories':
//         resetCategoryForm();
//         break;
//       case 'categoryItems':
//         resetCategoryItemForm();
//         break;
//       default:
//         resetProductForm();
//     }
//   };
  
//   // Handle form submission
//   const handleFormSubmit = (e) => {
//     switch(activeMode) {
//       case 'trending':
//         if (formMode === 'add') {
//           addProduct(e);
//         } else {
//           updateProduct(e);
//         }
//         break;
//       case 'categories':
//         if (formMode === 'add') {
//           addCategory(e);
//         } else {
//           updateCategory(e);
//         }
//         break;
//       case 'categoryItems':
//         if (formMode === 'add') {
//           addCategoryItem(e);
//         } else {
//           updateCategoryItem(e);
//         }
//         break;
//       default:
//         addProduct(e);
//     }
//   };
  
//   // Change active management mode
//   const changeMode = (mode) => {
//     resetForm();
//     setActiveMode(mode);
    
//     // Update URL without navigation
//     const url = new URL(window.location);
//     url.searchParams.set('mode', mode);
//     window.history.pushState({}, '', url);
//   };
  
//   // View all items button click handler
//   const handleViewAllItems = () => {
//     navigate('/manage-items');
//   };
  
//   return (
//     <div className="content">
//       <h1 className="page-title">Create Items</h1>
      
//       {/* Navigation Tabs */}
//       <div className="management-tabs">
//         <button 
//           className={`tab-btn ${activeMode === 'trending' ? 'active' : ''}`}
//           onClick={() => changeMode('trending')}
//         >
//           Create Trending Components
//         </button>
//         <button 
//           className={`tab-btn ${activeMode === 'categories' ? 'active' : ''}`}
//           onClick={() => changeMode('categories')}
//         >
//           Create Categories
//         </button>
//         <button 
//           className={`tab-btn ${activeMode === 'categoryItems' ? 'active' : ''}`}
//           onClick={() => changeMode('categoryItems')}
//         >
//           Create Category Items
//         </button>
//       </div>
      
//       {/* Product Form */}
//       {activeMode === 'trending' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Trending Component' : 'Edit Trending Component'}</h2>
          
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Basic Information</h3>
              
//               <div className="form-group">
//                 <label>Product Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={productFormData.name}
//                   onChange={handleProductInputChange}
//                   placeholder="Arduino Uno R3"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Price (₹)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={productFormData.price}
//                   onChange={handleProductInputChange}
//                   placeholder="450"
//                   step="0.01"
//                   min="0"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Short Description</label>
//                 <textarea
//                   name="description"
//                   value={productFormData.description}
//                   onChange={handleProductInputChange}
//                   placeholder="The Arduino Uno is an open-source microcontroller board based on the ATmega328P."
//                   rows="2"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Full Description</label>
//                 <textarea
//                   name="fullDescription"
//                   value={productFormData.fullDescription}
//                   onChange={handleProductInputChange}
//                   placeholder="Detailed product description that will appear in the product details modal..."
//                   rows="4"
//                 />
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Product Image</h3>
              
//               <div className="form-group">
//                 <label>Product Image</label>
//                 <input
//                   type="file"
//                   accept="image/jpeg,image/png,image/webp,image/gif"
//                   onChange={handleImageChange}
//                 />
                
//                 {isUploading && (
//                   <div className="upload-progress">
//                     <div 
//                       className="progress-bar" 
//                       style={{ width: `${uploadProgress}%` }}
//                     ></div>
//                     <span>{uploadProgress}%</span>
//                   </div>
//                 )}
                
//                 {imagePreview && (
//                   <div className="image-preview">
//                     <img src={imagePreview} alt="Product Preview" />
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Specifications</h3>
              
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Material</label>
//                   <input
//                     type="text"
//                     name="material"
//                     value={productFormData.material}
//                     onChange={handleProductInputChange}
//                     placeholder="High-quality composite"
//                   />
//                 </div>
                
//                 <div className="form-group half">
//                   <label>Dimensions</label>
//                   <input
//                     type="text"
//                     name="dimensions"
//                     value={productFormData.dimensions}
//                     onChange={handleProductInputChange}
//                     placeholder="30cm x 20cm x 10cm"
//                   />
//                 </div>
//               </div>
              
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Weight</label>
//                   <input
//                     type="text"
//                     name="weight"
//                     value={productFormData.weight}
//                     onChange={handleProductInputChange}
//                     placeholder="250g"
//                   />
//                 </div>
                
//                 <div className="form-group half">
//                   <label>Warranty</label>
//                   <input
//                     type="text"
//                     name="warranty"
//                     value={productFormData.warranty}
//                     onChange={handleProductInputChange}
//                     placeholder="1 year manufacturer warranty"
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Project Usages</h3>
              
//               {productFormData.projectUsages.map((usage, index) => (
//                 <div className="form-group" key={index}>
//                   <label>Usage {index + 1}</label>
//                   <input
//                     type="text"
//                     value={usage}
//                     onChange={(e) => handleProjectUsageChange(index, e.target.value)}
//                     placeholder={`Project usage example ${index + 1}`}
//                   />
//                 </div>
//               ))}
//             </div>
            
//             <div className="form-section">
//               <h3>Display Options</h3>
              
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input
//                     type="checkbox"
//                     name="isQuick"
//                     id="isQuick"
//                     checked={productFormData.isQuick}
//                     onChange={handleProductInputChange}
//                   />
//                   <label htmlFor="isQuick">Show "Quick" badge</label>
//                 </div>
//               </div>
              
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input
//                     type="checkbox"
//                     name="active"
//                     id="active"
//                     checked={productFormData.active}
//                     onChange={handleProductInputChange}
//                   />
//                   <label htmlFor="active">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
            
//             <div className="form-actions">
//               <button 
//                 type="button" 
//                 className="cancel-btn" 
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
              
//               <button 
//                 type="submit" 
//                 className="submit-btn"
//                 disabled={isUploading}
//               >
//                 {formMode === 'add' ? 'Add Product' : 'Update Product'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* Category Form */}
//       {activeMode === 'categories' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
          
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Basic Information</h3>
              
//               <div className="form-group">
//                 <label>Category Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={categoryFormData.name}
//                   onChange={handleCategoryInputChange}
//                   placeholder="Microcontrollers"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   value={categoryFormData.description}
//                   onChange={handleCategoryInputChange}
//                   placeholder="A collection of microcontroller boards and related components."
//                   rows="3"
//                 />
//               </div>
              
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input
//                     type="checkbox"
//                     name="active"
//                     id="categoryActive"
//                     checked={categoryFormData.active}
//                     onChange={handleCategoryInputChange}
//                   />
//                   <label htmlFor="categoryActive">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Category Image</h3>
              
//               <div className="form-group">
//                 <label>Category Image</label>
//                 <input
//                   type="file"
//                   accept="image/jpeg,image/png,image/webp,image/gif"
//                   onChange={handleImageChange}
//                 />
                
//                 {isUploading && (
//                   <div className="upload-progress">
//                     <div 
//                       className="progress-bar" 
//                       style={{ width: `${uploadProgress}%` }}
//                     ></div>
//                     <span>{uploadProgress}%</span>
//                   </div>
//                 )}
                
//                 {imagePreview && (
//                   <div className="image-preview">
//                     <img src={imagePreview} alt="Category Preview" />
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <div className="form-actions">
//               <button 
//                 type="button" 
//                 className="cancel-btn" 
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
              
//               <button 
//                 type="submit" 
//                 className="submit-btn"
//                 disabled={isUploading}
//               >
//                 {formMode === 'add' ? 'Add Category' : 'Update Category'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* Category Item Form */}
//       {activeMode === 'categoryItems' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Category Item' : 'Edit Category Item'}</h2>
          
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Category Selection</h3>
              
//               <div className="form-group">
//                 <label>Select Category</label>
//                 <select
//                   name="categoryId"
//                   value={categoryItemFormData.categoryId}
//                   onChange={handleCategoryItemInputChange}
//                   required
//                 >
//                   <option value="">-- Select a Category --</option>
//                   {categories.map(category => (
//                     <option key={category.id} value={category.id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Basic Information</h3>
              
//               <div className="form-group">
//                 <label>Item Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={categoryItemFormData.name}
//                   onChange={handleCategoryItemInputChange}
//                   placeholder="Arduino Nano"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Price (₹)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={categoryItemFormData.price}
//                   onChange={handleCategoryItemInputChange}
//                   placeholder="350"
//                   step="0.01"
//                   min="0"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Short Description</label>
//                 <textarea
//                   name="description"
//                   value={categoryItemFormData.description}
//                   onChange={handleCategoryItemInputChange}
//                   placeholder="A compact Arduino board based on the ATmega328P."
//                   rows="2"
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Full Description</label>
//                 <textarea
//                   name="fullDescription"
//                   value={categoryItemFormData.fullDescription}
//                   onChange={handleCategoryItemInputChange}
//                   placeholder="Detailed item description that will appear in the item details modal..."
//                   rows="4"
//                 />
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Item Image</h3>
              
//               <div className="form-group">
//                 <label>Item Image</label>
//                 <input
//                   type="file"
//                   accept="image/jpeg,image/png,image/webp,image/gif"
//                   onChange={handleImageChange}
//                 />
                
//                 {isUploading && (
//                   <div className="upload-progress">
//                     <div 
//                       className="progress-bar" 
//                       style={{ width: `${uploadProgress}%` }}
//                     ></div>
//                     <span>{uploadProgress}%</span>
//                   </div>
//                 )}
                
//                 {imagePreview && (
//                   <div className="image-preview">
//                     <img src={imagePreview} alt="Item Preview" />
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Specifications</h3>
              
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Material</label>
//                   <input
//                     type="text"
//                     name="material"
//                     value={categoryItemFormData.material}
//                     onChange={handleCategoryItemInputChange}
//                     placeholder="FR-4 PCB with components"
//                   />
//                 </div>
                
//                 <div className="form-group half">
//                   <label>Dimensions</label>
//                   <input
//                     type="text"
//                     name="dimensions"
//                     value={categoryItemFormData.dimensions}
//                     onChange={handleCategoryItemInputChange}
//                     placeholder="45mm x 18mm"
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="form-section">
//               <h3>Display Options</h3>
              
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input
//                     type="checkbox"
//                     name="active"
//                     id="itemActive"
//                     checked={categoryItemFormData.active}
//                     onChange={handleCategoryItemInputChange}
//                   />
//                   <label htmlFor="itemActive">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
            
//             <div className="form-actions">
//               <button 
//                 type="button" 
//                 className="cancel-btn" 
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
              
//               <button 
//                 type="submit" 
//                 className="submit-btn"
//                 disabled={isUploading}
//               >
//                 {formMode === 'add' ? 'Add Item' : 'Update Item'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* View All Button */}
//       <div className="view-all-section">
//         <button className="view-all-btn" onClick={handleViewAllItems}>
//           View All Items
//         </button>
//       </div>
      
//       {/* Products List */}
//       {activeMode === 'trending' && (
//         <div className="card table-card">
//           <h2>Recently Added Trending Components</h2>
          
//           {loading ? (
//             <div className="loading">Loading products...</div>
//           ) : (
//             <div className="products-list">
//               {products.length > 0 ? (
//                 products.slice(0, 3).map(product => (
//                   <div className="product-item" key={product.id}>
//                     <div className="product-preview">
//                       {product.imageUrl ? (
//                         <img src={product.imageUrl} alt={product.name} />
//                       ) : (
//                         <div className="no-image">No Image</div>
//                       )}
//                     </div>
                    
//                     <div className="product-details">
//                       <h3>{product.name || 'Untitled Product'}</h3>
//                       <p className="product-price">₹{product.price ? product.price.toFixed(2) : '0.00'}</p>
//                       <p>{product.description || 'No description'}</p>
                      
//                       <div className="status-badge">
//                         <span className={product.active ? 'active' : 'inactive'}>
//                           {product.active ? 'Active' : 'Inactive'}
//                         </span>
//                         {product.isQuick && (
//                           <span className="quick-badge">Quick</span>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="product-actions">
//                       <button 
//                         className={`status-toggle-btn ${product.active ? 'deactivate' : 'activate'}`}
//                         onClick={() => toggleItemStatus(product.id, product.active, 'trending')}
//                       >
//                         {product.active ? 'Deactivate' : 'Activate'}
//                       </button>
                      
//                       <button 
//                         className="edit-btn"
//                         onClick={() => handleEditItem(product, 'trending')}
//                       >
//                         <i className="fas fa-edit"></i> Edit
//                       </button>
                      
//                       <button 
//                         className="delete-btn"
//                         onClick={() => handleDeleteItem(product.id, product.imageUrl, 'trending')}
//                       >
//                         <i className="fas fa-trash"></i> Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-data">No products found. Add your first product above.</div>
//               )}
              
//               {products.length > 3 && (
//                 <div className="view-more">
//                   <button className="view-more-btn" onClick={handleViewAllItems}>
//                     View All Trending Components ({products.length})
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Categories List */}
//       {activeMode === 'categories' && (
//         <div className="card table-card">
//           <h2>Recently Added Categories</h2>
          
//           {loading ? (
//             <div className="loading">Loading categories...</div>
//           ) : (
//             <div className="categories-list">
//               {categories.length > 0 ? (
//                 categories.slice(0, 3).map(category => (
//                   <div className="category-item" key={category.id}>
//                     <div className="category-preview">
//                       {category.imageUrl ? (
//                         <img src={category.imageUrl} alt={category.name} />
//                       ) : (
//                         <div className="no-image">No Image</div>
//                       )}
//                     </div>
                    
//                     <div className="category-details">
//                       <h3>{category.name || 'Untitled Category'}</h3>
//                       <p>{category.description || 'No description'}</p>
                      
//                       <div className="status-badge">
//                         <span className={category.active ? 'active' : 'inactive'}>
//                           {category.active ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="category-actions">
//                       <button 
//                         className={`status-toggle-btn ${category.active ? 'deactivate' : 'activate'}`}
//                         onClick={() => toggleItemStatus(category.id, category.active, 'categories')}
//                       >
//                         {category.active ? 'Deactivate' : 'Activate'}
//                       </button>
                      
//                       <button 
//                         className="edit-btn"
//                         onClick={() => handleEditItem(category, 'categories')}
//                       >
//                         <i className="fas fa-edit"></i> Edit
//                       </button>
                      
//                       <button 
//                         className="delete-btn"
//                         onClick={() => handleDeleteItem(category.id, category.imageUrl, 'categories')}
//                       >
//                         <i className="fas fa-trash"></i> Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-data">No categories found. Add your first category above.</div>
//               )}
              
//               {categories.length > 3 && (
//                 <div className="view-more">
//                   <button className="view-more-btn" onClick={handleViewAllItems}>
//                     View All Categories ({categories.length})
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Category Items List */}
//       {activeMode === 'categoryItems' && (
//         <div className="card table-card">
//           <h2>Recently Added Category Items</h2>
          
//           {loading ? (
//             <div className="loading">Loading category items...</div>
//           ) : (
//             <div className="category-items-list">
//               {categoryItems.length > 0 ? (
//                 categoryItems.slice(0, 3).map(item => (
//                   <div className="category-item-row" key={item.id}>
//                     <div className="item-preview">
//                       {item.imageUrl ? (
//                         <img src={item.imageUrl} alt={item.name} />
//                       ) : (
//                         <div className="no-image">No Image</div>
//                       )}
//                     </div>
                    
//                     <div className="item-details">
//                       <h3>{item.name || 'Untitled Item'}</h3>
//                       <p className="item-category">Category: {item.categoryName || 'Unknown'}</p>
//                       <p className="item-price">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
//                       <p>{item.description || 'No description'}</p>
                      
//                       <div className="status-badge">
//                         <span className={item.active ? 'active' : 'inactive'}>
//                           {item.active ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="item-actions">
//                       <button 
//                         className={`status-toggle-btn ${item.active ? 'deactivate' : 'activate'}`}
//                         onClick={() => toggleItemStatus(item.id, item.active, 'categoryItems')}
//                       >
//                         {item.active ? 'Deactivate' : 'Activate'}
//                       </button>
                      
//                       <button 
//                         className="edit-btn"
//                         onClick={() => handleEditItem(item, 'categoryItems')}
//                       >
//                         <i className="fas fa-edit"></i> Edit
//                       </button>
                      
//                       <button 
//                         className="delete-btn"
//                         onClick={() => handleDeleteItem(item.id, item.imageUrl, 'categoryItems')}
//                       >
//                         <i className="fas fa-trash"></i> Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-data">No category items found. Add your first item above.</div>
//               )}
              
//               {categoryItems.length > 3 && (
//                 <div className="view-more">
//                   <button className="view-more-btn" onClick={handleViewAllItems}>
//                     View All Category Items ({categoryItems.length})
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductManagement;



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
  where,
  writeBatch,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebaseConfig';
import './ProductManagement.css';

const ProductManagement = () => {
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlMode = queryParams.get('mode');
  const editId = queryParams.get('edit');
  
  // Mode state
  const [activeMode, setActiveMode] = useState(urlMode || 'trending'); // 'trending', 'categories', or 'categoryItems'
  
  // Products (Trending Components) state
  const [products, setProducts] = useState([]);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  
  // Category Items state
  const [categoryItems, setCategoryItems] = useState([]);
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentItemId, setCurrentItemId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Product form state
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    description: '',
    fullDescription: '',
    material: '',
    dimensions: '',
    weight: '',
    warranty: '',
    projectUsages: ['', '', '', ''],
    deliverySpeed: 'normal', // Default value: 'normal' (options: 'quick', 'normal', 'late')
    isQuick: true,
    active: true,
    imageUrl: ''
  });
  
  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    active: true,
    imageUrl: ''
  });
  
  // Category Item form state
  const [categoryItemFormData, setCategoryItemFormData] = useState({
    categoryId: '',
    categoryName: '',
    name: '',
    price: '',
    description: '',
    fullDescription: '',
    material: '',
    dimensions: '',
    weight: '',
    warranty: '',
    deliverySpeed: 'normal', // Default value: 'normal' (options: 'quick', 'normal', 'late')
    active: true,
    imageUrl: ''
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // If edit mode is activated via URL params
    if (editId && urlMode) {
      loadItemForEdit(editId, urlMode);
    }
  }, []);
  
  // Fetch data when active mode changes
  useEffect(() => {
    fetchData();
  }, [activeMode]);
  
  // Fetch categories whenever needed for category items form
  useEffect(() => {
    if (activeMode === 'categoryItems') {
      fetchCategories();
    }
  }, [activeMode]);
  
  // Fetch data based on active mode
  const fetchData = async () => {
    switch(activeMode) {
      case 'trending':
        fetchProducts();
        break;
      case 'categories':
        fetchCategories();
        break;
      case 'categoryItems':
        fetchCategoryItems();
        fetchCategories(); // Need categories for the dropdown
        break;
      default:
        fetchProducts();
    }
  };
  
  // Load item for edit
  const loadItemForEdit = async (itemId, mode) => {
    try {
      setLoading(true);
      setFormMode('edit');
      setCurrentItemId(itemId);
      
      let collectionName;
      
      switch(mode) {
        case 'trending':
          collectionName = 'products';
          break;
        case 'categories':
          collectionName = 'categories';
          break;
        case 'categoryItems':
          collectionName = 'categoryItems';
          break;
        default:
          collectionName = 'products';
      }
      
      const itemDoc = await getDoc(doc(db, collectionName, itemId));
      
      if (itemDoc.exists()) {
        const itemData = itemDoc.data();
        
        switch(mode) {
          case 'trending':
            // Ensure project usages is an array with 4 elements
            let projectUsages = Array.isArray(itemData.projectUsages) ? [...itemData.projectUsages] : [];
            while (projectUsages.length < 4) {
              projectUsages.push('');
            }
            
            setProductFormData({
              name: itemData.name || '',
              price: itemData.price || '',
              description: itemData.description || '',
              fullDescription: itemData.fullDescription || '',
              material: itemData.material || '',
              dimensions: itemData.dimensions || '',
              weight: itemData.weight || '',
              warranty: itemData.warranty || '',
              projectUsages,
              deliverySpeed: itemData.deliverySpeed || 'normal',
              isQuick: itemData.isQuick !== undefined ? itemData.isQuick : true,
              active: itemData.active !== undefined ? itemData.active : true,
              imageUrl: itemData.imageUrl || ''
            });
            break;
          case 'categories':
            setCategoryFormData({
              name: itemData.name || '',
              description: itemData.description || '',
              active: itemData.active !== undefined ? itemData.active : true,
              imageUrl: itemData.imageUrl || ''
            });
            break;
          case 'categoryItems':
            setCategoryItemFormData({
              categoryId: itemData.categoryId || '',
              categoryName: itemData.categoryName || '',
              name: itemData.name || '',
              price: itemData.price || '',
              description: itemData.description || '',
              fullDescription: itemData.fullDescription || '',
              material: itemData.material || '',
              dimensions: itemData.dimensions || '',
              weight: itemData.weight || '',
              warranty: itemData.warranty || '',
              deliverySpeed: itemData.deliverySpeed || 'normal',
              active: itemData.active !== undefined ? itemData.active : true,
              imageUrl: itemData.imageUrl || ''
            });
            break;
        }
        
        setImagePreview(itemData.imageUrl);
      }
    } catch (error) {
      console.error(`Error loading ${mode} for edit:`, error);
      alert(`Failed to load ${mode} for editing. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(productsQuery);
      
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
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
  
  // Fetch category items from Firestore
  const fetchCategoryItems = async () => {
    try {
      setLoading(true);
      const categoryItemsQuery = query(collection(db, 'categoryItems'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(categoryItemsQuery);
      
      const categoryItemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategoryItems(categoryItemsData);
    } catch (error) {
      console.error('Error fetching category items:', error);
      alert('Failed to load category items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle product form input changes
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      // Ensure price is a valid number
      const numberValue = value === '' ? '' : parseFloat(value);
      if (!isNaN(numberValue) || value === '') {
        setProductFormData({
          ...productFormData,
          [name]: value === '' ? '' : numberValue
        });
      }
    } else {
      setProductFormData({
        ...productFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Handle category form input changes
  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setCategoryFormData({
      ...categoryFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle category item form input changes
  const handleCategoryItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      // Ensure price is a valid number
      const numberValue = value === '' ? '' : parseFloat(value);
      if (!isNaN(numberValue) || value === '') {
        setCategoryItemFormData({
          ...categoryItemFormData,
          [name]: value === '' ? '' : numberValue
        });
      }
    } else if (name === 'categoryId') {
      // Update categoryName when categoryId changes
      const selectedCategory = categories.find(cat => cat.id === value);
      setCategoryItemFormData({
        ...categoryItemFormData,
        categoryId: value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else {
      setCategoryItemFormData({
        ...categoryItemFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Handle project usage changes
  const handleProjectUsageChange = (index, value) => {
    const updatedUsages = [...productFormData.projectUsages];
    updatedUsages[index] = value;
    setProductFormData({
      ...productFormData,
      projectUsages: updatedUsages
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
      const storageRef = ref(storage, `${activeMode}/${Date.now()}_${imageFile.name}`);
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
  
  // Add new product
  const addProduct = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (productFormData.name.trim() === '') {
      alert('Please enter a product name');
      return;
    }
    
    if (productFormData.price === '' || isNaN(productFormData.price)) {
      alert('Please enter a valid price');
      return;
    }
    
    try {
      let imageUrl = productFormData.imageUrl;
      
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      // Filter out empty project usages
      const filteredProjectUsages = productFormData.projectUsages.filter(usage => usage.trim() !== '');
      
      // Update isQuick based on deliverySpeed
      const isQuick = productFormData.deliverySpeed === 'quick';
      
      const productData = {
        ...productFormData,
        price: parseFloat(productFormData.price),
        projectUsages: filteredProjectUsages,
        isQuick,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Adding new product with data:", productData);
      
      await addDoc(collection(db, 'products'), productData);
      resetProductForm();
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };
  
  // Update existing product
  const updateProduct = async (e) => {
    e.preventDefault();
    
    if (!currentItemId) return;
    
    // Validate form
    if (productFormData.name.trim() === '') {
      alert('Please enter a product name');
      return;
    }
    
    if (productFormData.price === '' || isNaN(productFormData.price)) {
      alert('Please enter a valid price');
      return;
    }
    
    try {
      let imageUrl = productFormData.imageUrl;
      
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
      
      // Filter out empty project usages
      const filteredProjectUsages = productFormData.projectUsages.filter(usage => usage.trim() !== '');
      
      // Update isQuick based on deliverySpeed
      const isQuick = productFormData.deliverySpeed === 'quick';
      
      const productData = {
        ...productFormData,
        price: parseFloat(productFormData.price),
        projectUsages: filteredProjectUsages,
        isQuick,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      console.log("Updating product with data:", productData);
      
      const productRef = doc(db, 'products', currentItemId);
      await updateDoc(productRef, productData);
      
      resetProductForm();
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };
  
  // Add new category
  const addCategory = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (categoryFormData.name.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    try {
      let imageUrl = categoryFormData.imageUrl;
      
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      const categoryData = {
        ...categoryFormData,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Adding new category with data:", categoryData);
      
      await addDoc(collection(db, 'categories'), categoryData);
      resetCategoryForm();
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
    
    if (!currentItemId) return;
    
    // Validate form
    if (categoryFormData.name.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    try {
      let imageUrl = categoryFormData.imageUrl;
      
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
        ...categoryFormData,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      console.log("Updating category with data:", categoryData);
      
      const categoryRef = doc(db, 'categories', currentItemId);
      await updateDoc(categoryRef, categoryData);
      
      // Update category name in all associated category items
      const batch = writeBatch(db);
      const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', currentItemId));
      const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
      
      categoryItemsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          categoryName: categoryFormData.name,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      
      resetCategoryForm();
      fetchCategories();
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };
  
  // Add new category item
  const addCategoryItem = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (categoryItemFormData.name.trim() === '') {
      alert('Please enter an item name');
      return;
    }
    
    if (categoryItemFormData.price === '' || isNaN(categoryItemFormData.price)) {
      alert('Please enter a valid price');
      return;
    }
    
    if (!categoryItemFormData.categoryId) {
      alert('Please select a category');
      return;
    }
    
    try {
      let imageUrl = categoryItemFormData.imageUrl;
      
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      // Set isQuick based on deliverySpeed
      const isQuick = categoryItemFormData.deliverySpeed === 'quick';
      
      const categoryItemData = {
        ...categoryItemFormData,
        price: parseFloat(categoryItemFormData.price),
        isQuick,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Adding new category item with data:", categoryItemData);
      
      await addDoc(collection(db, 'categoryItems'), categoryItemData);
      resetCategoryItemForm();
      fetchCategoryItems();
      alert('Category item added successfully!');
    } catch (error) {
      console.error('Error adding category item:', error);
      alert('Failed to add category item. Please try again.');
    }
  };
  
  // Update existing category item
  const updateCategoryItem = async (e) => {
    e.preventDefault();
    
    if (!currentItemId) return;
    
    // Validate form
    if (categoryItemFormData.name.trim() === '') {
      alert('Please enter an item name');
      return;
    }
    
    if (categoryItemFormData.price === '' || isNaN(categoryItemFormData.price)) {
      alert('Please enter a valid price');
      return;
    }
    
    if (!categoryItemFormData.categoryId) {
      alert('Please select a category');
      return;
    }
    
    try {
      let imageUrl = categoryItemFormData.imageUrl;
      
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
      
      // Set isQuick based on deliverySpeed
      const isQuick = categoryItemFormData.deliverySpeed === 'quick';
      
      const categoryItemData = {
        ...categoryItemFormData,
        price: parseFloat(categoryItemFormData.price),
        isQuick,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      console.log("Updating category item with data:", categoryItemData);
      
      const categoryItemRef = doc(db, 'categoryItems', currentItemId);
      await updateDoc(categoryItemRef, categoryItemData);
      
      resetCategoryItemForm();
      fetchCategoryItems();
      alert('Category item updated successfully!');
    } catch (error) {
      console.error('Error updating category item:', error);
      alert('Failed to update category item. Please try again.');
    }
  };
  
  // Delete item
  const handleDeleteItem = async (itemId, imageUrl, itemType) => {
    const itemTypeName = 
      itemType === 'trending' ? 'product' : 
      itemType === 'categories' ? 'category' : 
      'category item';
    
    if (window.confirm(`Are you sure you want to delete this ${itemTypeName}?`)) {
      try {
        // If deleting a category, check if it has items
        if (itemType === 'categories') {
          const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', itemId));
          const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
          
          if (!categoryItemsSnapshot.empty) {
            if (!window.confirm(`This category has ${categoryItemsSnapshot.size} items. Deleting it will also delete all associated items. Continue?`)) {
              return;
            }
            
            // Delete all associated category items
            const batch = writeBatch(db);
            categoryItemsSnapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
              
              // Delete category item images
              const itemImageUrl = doc.data().imageUrl;
              if (itemImageUrl && itemImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                deleteImage(itemImageUrl);
              }
            });
            
            await batch.commit();
          }
        }
        
        // Delete item document from Firestore
        const collectionName = 
          itemType === 'trending' ? 'products' : 
          itemType === 'categories' ? 'categories' : 
          'categoryItems';
        
        await deleteDoc(doc(db, collectionName, itemId));
        
        // Delete item image from Storage if it's a Firebase Storage URL
        if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          await deleteImage(imageUrl);
        }
        
        // Refresh the appropriate list
        if (itemType === 'trending') {
          fetchProducts();
        } else if (itemType === 'categories') {
          fetchCategories();
        } else {
          fetchCategoryItems();
        }
        
        alert(`${itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1)} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${itemTypeName}:`, error);
        alert(`Failed to delete ${itemTypeName}. Please try again.`);
      }
    }
  };
  
  // Toggle item active status
  const toggleItemStatus = async (itemId, currentStatus, itemType) => {
    try {
      const collectionName = 
        itemType === 'trending' ? 'products' : 
        itemType === 'categories' ? 'categories' : 
        'categoryItems';
      
      const itemRef = doc(db, collectionName, itemId);
      await updateDoc(itemRef, {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      // Refresh the appropriate list
      if (itemType === 'trending') {
        fetchProducts();
      } else if (itemType === 'categories') {
        fetchCategories();
      } else {
        fetchCategoryItems();
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };
  
  // Edit item (load data into form)
  const handleEditItem = (item, itemType) => {
    setFormMode('edit');
    setCurrentItemId(item.id);
    
    if (itemType === 'trending') {
      // Ensure project usages is an array with 4 elements
      let projectUsages = Array.isArray(item.projectUsages) ? [...item.projectUsages] : [];
      while (projectUsages.length < 4) {
        projectUsages.push('');
      }
      
      setProductFormData({
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        fullDescription: item.fullDescription || '',
        material: item.material || '',
        dimensions: item.dimensions || '',
        weight: item.weight || '',
        warranty: item.warranty || '',
        projectUsages,
        deliverySpeed: item.deliverySpeed || 'normal',
        isQuick: item.isQuick !== undefined ? item.isQuick : true,
        active: item.active !== undefined ? item.active : true,
        imageUrl: item.imageUrl || ''
      });
    } else if (itemType === 'categories') {
      setCategoryFormData({
        name: item.name || '',
        description: item.description || '',
        active: item.active !== undefined ? item.active : true,
        imageUrl: item.imageUrl || ''
      });
    } else {
      setCategoryItemFormData({
        categoryId: item.categoryId || '',
        categoryName: item.categoryName || '',
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        fullDescription: item.fullDescription || '',
        material: item.material || '',
        dimensions: item.dimensions || '',
        weight: item.weight || '',
        warranty: item.warranty || '',
        deliverySpeed: item.deliverySpeed || 'normal',
        active: item.active !== undefined ? item.active : true,
        imageUrl: item.imageUrl || ''
      });
    }
    
    setImagePreview(item.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset product form
  const resetProductForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setProductFormData({
      name: '',
      price: '',
      description: '',
      fullDescription: '',
      material: '',
      dimensions: '',
      weight: '',
      warranty: '',
      projectUsages: ['', '', '', ''],
      deliverySpeed: 'normal',
      isQuick: true,
      active: true,
      imageUrl: ''
    });
  };
  
  // Reset category form
  const resetCategoryForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCategoryFormData({
      name: '',
      description: '',
      active: true,
      imageUrl: ''
    });
  };
  
  // Reset category item form
  const resetCategoryItemForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCategoryItemFormData({
      categoryId: '',
      categoryName: '',
      name: '',
      price: '',
      description: '',
      fullDescription: '',
      material: '',
      dimensions: '',
      weight: '',
      warranty: '',
      deliverySpeed: 'normal',
      active: true,
      imageUrl: ''
    });
  };
  
  // Reset form based on active mode
  const resetForm = () => {
    switch(activeMode) {
      case 'trending':
        resetProductForm();
        break;
      case 'categories':
        resetCategoryForm();
        break;
      case 'categoryItems':
        resetCategoryItemForm();
        break;
      default:
        resetProductForm();
    }
  };
  
  // Handle form submission
  const handleFormSubmit = (e) => {
    switch(activeMode) {
      case 'trending':
        if (formMode === 'add') {
          addProduct(e);
        } else {
          updateProduct(e);
        }
        break;
      case 'categories':
        if (formMode === 'add') {
          addCategory(e);
        } else {
          updateCategory(e);
        }
        break;
      case 'categoryItems':
        if (formMode === 'add') {
          addCategoryItem(e);
        } else {
          updateCategoryItem(e);
        }
        break;
      default:
        addProduct(e);
    }
  };
  
  // Change active management mode
  const changeMode = (mode) => {
    resetForm();
    setActiveMode(mode);
    
    // Update URL without navigation
    const url = new URL(window.location);
    url.searchParams.set('mode', mode);
    window.history.pushState({}, '', url);
  };
  
  // View all items button click handler
  const handleViewAllItems = () => {
    navigate('/manage-items');
  };
  
  return (
    <div className="content">
      <h1 className="page-title">Create Items</h1>
      
      {/* Navigation Tabs */}
      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeMode === 'trending' ? 'active' : ''}`}
          onClick={() => changeMode('trending')}
        >
          Create Trending Components
        </button>
        <button 
          className={`tab-btn ${activeMode === 'categories' ? 'active' : ''}`}
          onClick={() => changeMode('categories')}
        >
          Create Categories
        </button>
        <button 
          className={`tab-btn ${activeMode === 'categoryItems' ? 'active' : ''}`}
          onClick={() => changeMode('categoryItems')}
        >
          Create Category Items
        </button>
      </div>
      
      {/* Product Form */}
      {activeMode === 'trending' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Trending Component' : 'Edit Trending Component'}</h2>
          
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productFormData.name}
                  onChange={handleProductInputChange}
                  placeholder="Arduino Uno R3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={productFormData.price}
                  onChange={handleProductInputChange}
                  placeholder="450"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductInputChange}
                  placeholder="The Arduino Uno is an open-source microcontroller board based on the ATmega328P."
                  rows="2"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Full Description</label>
                <textarea
                  name="fullDescription"
                  value={productFormData.fullDescription}
                  onChange={handleProductInputChange}
                  placeholder="Detailed product description that will appear in the product details modal..."
                  rows="4"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Product Image</h3>
              
              <div className="form-group">
                <label>Product Image</label>
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
                    <img src={imagePreview} alt="Product Preview" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Specifications</h3>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={productFormData.material}
                    onChange={handleProductInputChange}
                    placeholder="High-grade PCB"
                  />
                </div>
                
                <div className="form-group half">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={productFormData.dimensions}
                    onChange={handleProductInputChange}
                    placeholder="60mm x 28mm x 13mm"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={productFormData.weight}
                    onChange={handleProductInputChange}
                    placeholder="25g"
                  />
                </div>
                
                <div className="form-group half">
                  <label>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={productFormData.warranty}
                    onChange={handleProductInputChange}
                    placeholder="1 year"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Project Usages</h3>
              
              {productFormData.projectUsages.map((usage, index) => (
                <div className="form-group" key={index}>
                  <label>Usage {index + 1}</label>
                  <input
                    type="text"
                    value={usage}
                    onChange={(e) => handleProjectUsageChange(index, e.target.value)}
                    placeholder={`Project usage example ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="form-section">
              <h3>Display Options</h3>
              
              <div className="form-group">
                <label>Delivery Speed</label>
                <div className="delivery-speed-options">
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="quick"
                      checked={productFormData.deliverySpeed === 'quick'}
                      onChange={handleProductInputChange}
                    />
                    <span className="radio-label">Quick</span>
                  </label>
                  
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="normal"
                      checked={productFormData.deliverySpeed === 'normal'}
                      onChange={handleProductInputChange}
                    />
                    <span className="radio-label">Normal</span>
                  </label>
                  
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="late"
                      checked={productFormData.deliverySpeed === 'late'}
                      onChange={handleProductInputChange}
                    />
                    <span className="radio-label">Late</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={productFormData.active}
                    onChange={handleProductInputChange}
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
                {formMode === 'add' ? 'Add Product' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Category Form */}
      {activeMode === 'categories' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
          
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  placeholder="Microcontrollers"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryInputChange}
                  placeholder="A collection of microcontroller boards and related components."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="active"
                    id="categoryActive"
                    checked={categoryFormData.active}
                    onChange={handleCategoryInputChange}
                  />
                  <label htmlFor="categoryActive">Active (visible on website)</label>
                </div>
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
      )}
      
      {/* Category Item Form */}
      {activeMode === 'categoryItems' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Category Item' : 'Edit Category Item'}</h2>
          
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Category Selection</h3>
              
              <div className="form-group">
                <label>Select Category</label>
                <select
                  name="categoryId"
                  value={categoryItemFormData.categoryId}
                  onChange={handleCategoryItemInputChange}
                  required
                >
                  <option value="">-- Select a Category --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryItemFormData.name}
                  onChange={handleCategoryItemInputChange}
                  placeholder="ESP32 Development Board"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={categoryItemFormData.price}
                  onChange={handleCategoryItemInputChange}
                  placeholder="450"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  name="description"
                  value={categoryItemFormData.description}
                  onChange={handleCategoryItemInputChange}
                  placeholder="ESP32 is a powerful, low-cost microcontroller with integrated Wi-Fi and Bluetooth."
                  rows="2"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Full Description</label>
                <textarea
                  name="fullDescription"
                  value={categoryItemFormData.fullDescription}
                  onChange={handleCategoryItemInputChange}
                  placeholder="Detailed item description that will appear in the item details modal..."
                  rows="4"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Item Image</h3>
              
              <div className="form-group">
                <label>Item Image</label>
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
                    <img src={imagePreview} alt="Item Preview" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Specifications</h3>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={categoryItemFormData.material}
                    onChange={handleCategoryItemInputChange}
                    placeholder="High-grade PCB"
                  />
                </div>
                
                <div className="form-group half">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={categoryItemFormData.dimensions}
                    onChange={handleCategoryItemInputChange}
                    placeholder="60mm x 28mm x 13mm"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={categoryItemFormData.weight}
                    onChange={handleCategoryItemInputChange}
                    placeholder="25g"
                  />
                </div>
                
                <div className="form-group half">
                  <label>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={categoryItemFormData.warranty}
                    onChange={handleCategoryItemInputChange}
                    placeholder="1 year"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Display Options</h3>
              
              <div className="form-group">
                <label>Delivery Speed</label>
                <div className="delivery-speed-options">
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="quick"
                      checked={categoryItemFormData.deliverySpeed === 'quick'}
                      onChange={handleCategoryItemInputChange}
                    />
                    <span className="radio-label">Quick</span>
                  </label>
                  
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="normal"
                      checked={categoryItemFormData.deliverySpeed === 'normal'}
                      onChange={handleCategoryItemInputChange}
                    />
                    <span className="radio-label">Normal</span>
                  </label>
                  
                  <label className="radio-container">
                    <input
                      type="radio"
                      name="deliverySpeed"
                      value="late"
                      checked={categoryItemFormData.deliverySpeed === 'late'}
                      onChange={handleCategoryItemInputChange}
                    />
                    <span className="radio-label">Late</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="active"
                    id="itemActive"
                    checked={categoryItemFormData.active}
                    onChange={handleCategoryItemInputChange}
                  />
                  <label htmlFor="itemActive">Active (visible on website)</label>
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
                {formMode === 'add' ? 'Add Item' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* View All Button */}
      <div className="view-all-section">
        <button className="view-all-btn" onClick={handleViewAllItems}>
          View All Items
        </button>
      </div>
      
      {/* Products List */}
      {activeMode === 'trending' && (
        <div className="card table-card">
          <h2>Recently Added Trending Components</h2>
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-list">
              {products.length > 0 ? (
                products.slice(0, 3).map(product => (
                  <div className="product-item" key={product.id}>
                    <div className="product-preview">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    
                    <div className="product-details">
                      <h3>{product.name || 'Untitled Product'}</h3>
                      <p className="product-price">₹{product.price ? product.price.toFixed(2) : '0.00'}</p>
                      <p>{product.description || 'No description'}</p>
                      
                      <div className="status-badge">
                        <span className={product.active ? 'active' : 'inactive'}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`delivery-badge ${product.deliverySpeed || 'normal'}`}>
                          {product.deliverySpeed ? product.deliverySpeed.charAt(0).toUpperCase() + product.deliverySpeed.slice(1) : 'Normal'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className={`status-toggle-btn ${product.active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleItemStatus(product.id, product.active, 'trending')}
                      >
                        {product.active ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditItem(product, 'trending')}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem(product.id, product.imageUrl, 'trending')}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No products found. Add your first product above.</div>
              )}
              
              {products.length > 3 && (
                <div className="view-more">
                  <button className="view-more-btn" onClick={handleViewAllItems}>
                    View All Trending Components ({products.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Categories List */}
      {activeMode === 'categories' && (
        <div className="card table-card">
          <h2>Recently Added Categories</h2>
          
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : (
            <div className="categories-list">
              {categories.length > 0 ? (
                categories.slice(0, 3).map(category => (
                  <div className="category-item" key={category.id}>
                    <div className="category-preview">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    
                    <div className="category-details">
                      <h3>{category.name || 'Untitled Category'}</h3>
                      <p>{category.description || 'No description'}</p>
                      
                      <div className="status-badge">
                        <span className={category.active ? 'active' : 'inactive'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="category-actions">
                      <button 
                        className={`status-toggle-btn ${category.active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleItemStatus(category.id, category.active, 'categories')}
                      >
                        {category.active ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditItem(category, 'categories')}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem(category.id, category.imageUrl, 'categories')}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No categories found. Add your first category above.</div>
              )}
              
              {categories.length > 3 && (
                <div className="view-more">
                  <button className="view-more-btn" onClick={handleViewAllItems}>
                    View All Categories ({categories.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Category Items List */}
      {activeMode === 'categoryItems' && (
        <div className="card table-card">
          <h2>Recently Added Category Items</h2>
          
          {loading ? (
            <div className="loading">Loading category items...</div>
          ) : (
            <div className="category-items-list">
              {categoryItems.length > 0 ? (
                categoryItems.slice(0, 3).map(item => (
                  <div className="category-item-row" key={item.id}>
                    <div className="item-preview">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h3>{item.name || 'Untitled Item'}</h3>
                      <p className="item-category">Category: {item.categoryName || 'Unknown'}</p>
                      <p className="item-price">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
                      <p>{item.description || 'No description'}</p>
                      
                      <div className="status-badge">
                        <span className={item.active ? 'active' : 'inactive'}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`delivery-badge ${item.deliverySpeed || 'normal'}`}>
                          {item.deliverySpeed ? item.deliverySpeed.charAt(0).toUpperCase() + item.deliverySpeed.slice(1) : 'Normal'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className={`status-toggle-btn ${item.active ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleItemStatus(item.id, item.active, 'categoryItems')}
                      >
                        {item.active ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditItem(item, 'categoryItems')}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteItem(item.id, item.imageUrl, 'categoryItems')}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No category items found. Add your first item above.</div>
              )}
              
              {categoryItems.length > 3 && (
                <div className="view-more">
                  <button className="view-more-btn" onClick={handleViewAllItems}>
                    View All Category Items ({categoryItems.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;