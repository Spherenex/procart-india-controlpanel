






// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
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
// import SpecificationComponent from './SpecificationComponent';
// import { db, storage } from '../../firebase/firebaseConfig';
// import './ProductManagement.css';

// const ProductManagement = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const urlMode = queryParams.get('mode');
//   const editId = queryParams.get('edit');

//   const [activeMode, setActiveMode] = useState(urlMode || 'trending');
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [categoryItems, setCategoryItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formMode, setFormMode] = useState('add');
//   const [currentItemId, setCurrentItemId] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);

//   const [productFormData, setProductFormData] = useState({
//     name: '',
//     price: '',
//     description: '',
//     fullDescription: '',
//     microcontroller: '',
//     operatingVoltage: '',
//     inputVoltageRecommended: '',
//     inputVoltageLimits: '',
//     digitalIOPins: '',
//     analogInputPins: '',
//     pwmChannels: '',
//     clockSpeed: '',
//     flashMemory: '',
//     sram: '',
//     eeprom: '',
//     usbInterface: '',
//     communicationInterfaces: '',
//     dimensions: '',
//     weight: '',
//     operatingTemperature: '',
//     powerConsumption: '',
//     ledIndicators: '',
//     material: '',
//     warranty: '',
//     projectUsages: ['', '', '', ''],
//     deliverySpeed: 'normal',
//     isQuick: true,
//     active: true,
//     imageUrl: ''
//   });

//   const [categoryFormData, setCategoryFormData] = useState({
//     name: '',
//     description: '',
//     active: true,
//     imageUrl: ''
//   });

//   const [categoryItemFormData, setCategoryItemFormData] = useState({
//     categoryId: '',
//     categoryName: '',
//     name: '',
//     price: '',
//     description: '',
//     fullDescription: '',
//     microcontroller: '',
//     operatingVoltage: '',
//     inputVoltageRecommended: '',
//     inputVoltageLimits: '',
//     digitalIOPins: '',
//     analogInputPins: '',
//     pwmChannels: '',
//     clockSpeed: '',
//     flashMemory: '',
//     sram: '',
//     eeprom: '',
//     usbInterface: '',
//     communicationInterfaces: '',
//     dimensions: '',
//     weight: '',
//     operatingTemperature: '',
//     powerConsumption: '',
//     ledIndicators: '',
//     material: '',
//     warranty: '',
//     deliverySpeed: 'normal',
//     active: true,
//     imageUrl: ''
//   });

//   useEffect(() => {
//     fetchData();
//     if (editId && urlMode) {
//       loadItemForEdit(editId, urlMode);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [activeMode]);

//   useEffect(() => {
//     if (activeMode === 'categoryItems') {
//       fetchCategories();
//     }
//   }, [activeMode]);

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
//         fetchCategories();
//         break;
//       default:
//         fetchProducts();
//     }
//   };

//   const loadItemForEdit = async (itemId, mode) => {
//     try {
//       setLoading(true);
//       setFormMode('edit');
//       setCurrentItemId(itemId);

//       let collectionName;
//       switch(mode) {
//         case 'trending': collectionName = 'products'; break;
//         case 'categories': collectionName = 'categories'; break;
//         case 'categoryItems': collectionName = 'categoryItems'; break;
//         default: collectionName = 'products';
//       }

//       const itemDoc = await getDoc(doc(db, collectionName, itemId));
//       if (itemDoc.exists()) {
//         const itemData = itemDoc.data();
//         switch(mode) {
//           case 'trending':
//             let projectUsages = Array.isArray(itemData.projectUsages) ? [...itemData.projectUsages] : [];
//             while (projectUsages.length < 4) projectUsages.push('');
//             setProductFormData({
//               ...itemData,
//               projectUsages,
//               price: itemData.price || ''
//             });
//             break;
//           case 'categories':
//             setCategoryFormData(itemData);
//             break;
//           case 'categoryItems':
//             setCategoryItemFormData({
//               ...itemData,
//               price: itemData.price || ''
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

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(productsQuery);
//       setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       alert('Failed to load products. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(categoriesQuery);
//       setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       alert('Failed to load categories. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategoryItems = async () => {
//     try {
//       setLoading(true);
//       const categoryItemsQuery = query(collection(db, 'categoryItems'), orderBy('createdAt', 'desc'));
//       const querySnapshot = await getDocs(categoryItemsQuery);
//       setCategoryItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     } catch (error) {
//       console.error('Error fetching category items:', error);
//       alert('Failed to load category items. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProductInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setProductFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : (name === 'price' && value !== '' ? parseFloat(value) : value)
//     }));
//   };

//   const handleCategoryInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCategoryFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleCategoryItemInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCategoryItemFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : (name === 'price' && value !== '' ? parseFloat(value) : value),
//       ...(name === 'categoryId' && {
//         categoryName: categories.find(cat => cat.id === value)?.name || ''
//       })
//     }));
//   };

//   const handleProjectUsageChange = (index, value) => {
//     setProductFormData(prev => ({
//       ...prev,
//       projectUsages: prev.projectUsages.map((usage, i) => i === index ? value : usage)
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const uploadImage = async () => {
//     if (!imageFile) return null;
//     setIsUploading(true);
//     setUploadProgress(0);
//     try {
//       const storageRef = ref(storage, `${activeMode}/${Date.now()}_${imageFile.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, imageFile);
//       return new Promise((resolve) => {
//         uploadTask.on('state_changed', (snapshot) => {
//           setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
//         }, (error) => {
//           console.error('Error uploading image:', error);
//           setIsUploading(false);
//         }, async () => {
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           setIsUploading(false);
//           resolve(downloadURL);
//         });
//       });
//     } catch (error) {
//       console.error('Error in upload process:', error);
//       setIsUploading(false);
//       return null;
//     }
//   };

//   const deleteImage = async (imageUrl) => {
//     if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
//       try {
//         await deleteObject(ref(storage, imageUrl));
//       } catch (error) {
//         console.error('Error deleting image:', error);
//       }
//     }
//   };

//   const addProduct = async (e) => {
//     e.preventDefault();
//     if (!productFormData.name.trim() || isNaN(productFormData.price)) return alert('Please enter valid product details');
//     try {
//       let imageUrl = await uploadImage();
//       const productData = {
//         ...productFormData,
//         price: parseFloat(productFormData.price),
//         projectUsages: productFormData.projectUsages.filter(usage => usage.trim() !== ''),
//         isQuick: productFormData.deliverySpeed === 'quick',
//         imageUrl: imageUrl || productFormData.imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
//       await addDoc(collection(db, 'products'), productData);
//       resetProductForm();
//       fetchProducts();
//       alert('Product added successfully!');
//     } catch (error) {
//       console.error('Error adding product:', error);
//       alert('Failed to add product. Please try again.');
//     }
//   };

//   const updateProduct = async (e) => {
//     e.preventDefault();
//     if (!currentItemId || !productFormData.name.trim() || isNaN(productFormData.price)) return alert('Please enter valid product details');
//     try {
//       let imageUrl = productFormData.imageUrl;
//       if (imageFile) {
//         await deleteImage(imageUrl);
//         imageUrl = await uploadImage();
//       }
//       const productData = {
//         ...productFormData,
//         price: parseFloat(productFormData.price),
//         projectUsages: productFormData.projectUsages.filter(usage => usage.trim() !== ''),
//         isQuick: productFormData.deliverySpeed === 'quick',
//         imageUrl: imageUrl || productFormData.imageUrl,
//         updatedAt: serverTimestamp()
//       };
//       await updateDoc(doc(db, 'products', currentItemId), productData);
//       resetProductForm();
//       fetchProducts();
//       alert('Product updated successfully!');
//     } catch (error) {
//       console.error('Error updating product:', error);
//       alert('Failed to update product. Please try again.');
//     }
//   };

//   const addCategory = async (e) => {
//     e.preventDefault();
//     if (!categoryFormData.name.trim()) return alert('Please enter a category name');
//     try {
//       let imageUrl = await uploadImage();
//       const categoryData = {
//         ...categoryFormData,
//         imageUrl: imageUrl || categoryFormData.imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
//       await addDoc(collection(db, 'categories'), categoryData);
//       resetCategoryForm();
//       fetchCategories();
//       alert('Category added successfully!');
//     } catch (error) {
//       console.error('Error adding category:', error);
//       alert('Failed to add category. Please try again.');
//     }
//   };

//   const updateCategory = async (e) => {
//     e.preventDefault();
//     if (!currentItemId || !categoryFormData.name.trim()) return alert('Please enter a category name');
//     try {
//       let imageUrl = categoryFormData.imageUrl;
//       if (imageFile) {
//         await deleteImage(imageUrl);
//         imageUrl = await uploadImage();
//       }
//       const categoryData = {
//         ...categoryFormData,
//         imageUrl: imageUrl || categoryFormData.imageUrl,
//         updatedAt: serverTimestamp()
//       };
//       const categoryRef = doc(db, 'categories', currentItemId);
//       await updateDoc(categoryRef, categoryData);
//       const batch = writeBatch(db);
//       const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', currentItemId));
//       const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
//       categoryItemsSnapshot.docs.forEach(doc => batch.update(doc.ref, { categoryName: categoryFormData.name, updatedAt: serverTimestamp() }));
//       await batch.commit();
//       resetCategoryForm();
//       fetchCategories();
//       alert('Category updated successfully!');
//     } catch (error) {
//       console.error('Error updating category:', error);
//       alert('Failed to update category. Please try again.');
//     }
//   };

//   const addCategoryItem = async (e) => {
//     e.preventDefault();
//     if (!categoryItemFormData.name.trim() || isNaN(categoryItemFormData.price) || !categoryItemFormData.categoryId) return alert('Please enter valid item details');
//     try {
//       let imageUrl = await uploadImage();
//       const categoryItemData = {
//         ...categoryItemFormData,
//         price: parseFloat(categoryItemFormData.price),
//         isQuick: categoryItemFormData.deliverySpeed === 'quick',
//         imageUrl: imageUrl || categoryItemFormData.imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp()
//       };
//       await addDoc(collection(db, 'categoryItems'), categoryItemData);
//       resetCategoryItemForm();
//       fetchCategoryItems();
//       alert('Category item added successfully!');
//     } catch (error) {
//       console.error('Error adding category item:', error);
//       alert('Failed to add category item. Please try again.');
//     }
//   };

//   const updateCategoryItem = async (e) => {
//     e.preventDefault();
//     if (!currentItemId || !categoryItemFormData.name.trim() || isNaN(categoryItemFormData.price) || !categoryItemFormData.categoryId) return alert('Please enter valid item details');
//     try {
//       let imageUrl = categoryItemFormData.imageUrl;
//       if (imageFile) {
//         await deleteImage(imageUrl);
//         imageUrl = await uploadImage();
//       }
//       const categoryItemData = {
//         ...categoryItemFormData,
//         price: parseFloat(categoryItemFormData.price),
//         isQuick: categoryItemFormData.deliverySpeed === 'quick',
//         imageUrl: imageUrl || categoryItemFormData.imageUrl,
//         updatedAt: serverTimestamp()
//       };
//       await updateDoc(doc(db, 'categoryItems', currentItemId), categoryItemData);
//       resetCategoryItemForm();
//       fetchCategoryItems();
//       alert('Category item updated successfully!');
//     } catch (error) {
//       console.error('Error updating category item:', error);
//       alert('Failed to update category item. Please try again.');
//     }
//   };

//   const handleDeleteItem = async (itemId, imageUrl, itemType) => {
//     if (window.confirm(`Are you sure you want to delete this ${itemType === 'trending' ? 'product' : itemType === 'categories' ? 'category' : 'category item'}?`)) {
//       try {
//         if (itemType === 'categories') {
//           const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', itemId));
//           const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
//           if (!categoryItemsSnapshot.empty) {
//             if (!window.confirm(`This category has ${categoryItemsSnapshot.size} items. Deleting it will also delete all associated items. Continue?`)) return;
//             const batch = writeBatch(db);
//             categoryItemsSnapshot.docs.forEach(doc => {
//               batch.delete(doc.ref);
//               deleteImage(doc.data().imageUrl);
//             });
//             await batch.commit();
//           }
//         }
//         await deleteDoc(doc(db, itemType === 'trending' ? 'products' : itemType === 'categories' ? 'categories' : 'categoryItems', itemId));
//         await deleteImage(imageUrl);
//         if (itemType === 'trending') fetchProducts();
//         else if (itemType === 'categories') fetchCategories();
//         else fetchCategoryItems();
//         alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
//       } catch (error) {
//         console.error(`Error deleting ${itemType}:`, error);
//         alert(`Failed to delete ${itemType}. Please try again.`);
//       }
//     }
//   };

//   const toggleItemStatus = async (itemId, currentStatus, itemType) => {
//     try {
//       await updateDoc(doc(db, itemType === 'trending' ? 'products' : itemType === 'categories' ? 'categories' : 'categoryItems', itemId), {
//         active: !currentStatus,
//         updatedAt: serverTimestamp()
//       });
//       if (itemType === 'trending') fetchProducts();
//       else if (itemType === 'categories') fetchCategories();
//       else fetchCategoryItems();
//     } catch (error) {
//       console.error('Error toggling item status:', error);
//       alert('Failed to update item status. Please try again.');
//     }
//   };

//   const handleEditItem = (item, itemType) => {
//     setFormMode('edit');
//     setCurrentItemId(item.id);
//     if (itemType === 'trending') {
//       let projectUsages = Array.isArray(item.projectUsages) ? [...item.projectUsages] : [];
//       while (projectUsages.length < 4) projectUsages.push('');
//       setProductFormData({ ...item, projectUsages });
//     } else if (itemType === 'categories') {
//       setCategoryFormData(item);
//     } else {
//       setCategoryItemFormData(item);
//     }
//     setImagePreview(item.imageUrl);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

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
//       microcontroller: '',
//       operatingVoltage: '',
//       inputVoltageRecommended: '',
//       inputVoltageLimits: '',
//       digitalIOPins: '',
//       analogInputPins: '',
//       pwmChannels: '',
//       clockSpeed: '',
//       flashMemory: '',
//       sram: '',
//       eeprom: '',
//       usbInterface: '',
//       communicationInterfaces: '',
//       dimensions: '',
//       weight: '',
//       operatingTemperature: '',
//       powerConsumption: '',
//       ledIndicators: '',
//       material: '',
//       warranty: '',
//       projectUsages: ['', '', '', ''],
//       deliverySpeed: 'normal',
//       isQuick: true,
//       active: true,
//       imageUrl: ''
//     });
//   };

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
//       microcontroller: '',
//       operatingVoltage: '',
//       inputVoltageRecommended: '',
//       inputVoltageLimits: '',
//       digitalIOPins: '',
//       analogInputPins: '',
//       pwmChannels: '',
//       clockSpeed: '',
//       flashMemory: '',
//       sram: '',
//       eeprom: '',
//       usbInterface: '',
//       communicationInterfaces: '',
//       dimensions: '',
//       weight: '',
//       operatingTemperature: '',
//       powerConsumption: '',
//       ledIndicators: '',
//       material: '',
//       warranty: '',
//       deliverySpeed: 'normal',
//       active: true,
//       imageUrl: ''
//     });
//   };

//   const resetForm = () => {
//     switch(activeMode) {
//       case 'trending': resetProductForm(); break;
//       case 'categories': resetCategoryForm(); break;
//       case 'categoryItems': resetCategoryItemForm(); break;
//       default: resetProductForm();
//     }
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     switch(activeMode) {
//       case 'trending': formMode === 'add' ? addProduct(e) : updateProduct(e); break;
//       case 'categories': formMode === 'add' ? addCategory(e) : updateCategory(e); break;
//       case 'categoryItems': formMode === 'add' ? addCategoryItem(e) : updateCategoryItem(e); break;
//       default: addProduct(e);
//     }
//   };

//   const changeMode = (mode) => {
//     resetForm();
//     setActiveMode(mode);
//     const url = new URL(window.location);
//     url.searchParams.set('mode', mode);
//     window.history.pushState({}, '', url);
//   };

//   const handleViewAllItems = () => navigate('/manage-items');

//   return (
//     <div className="content">
//       <h1 className="page-title">Create Items</h1>
//       <div className="management-tabs">
//         <button className={`tab-btn ${activeMode === 'trending' ? 'active' : ''}`} onClick={() => changeMode('trending')}>
//           Create Trending Components
//         </button>
//         <button className={`tab-btn ${activeMode === 'categories' ? 'active' : ''}`} onClick={() => changeMode('categories')}>
//           Create Categories
//         </button>
//         <button className={`tab-btn ${activeMode === 'categoryItems' ? 'active' : ''}`} onClick={() => changeMode('categoryItems')}>
//           Create Category Items
//         </button>
//       </div>

//       {activeMode === 'trending' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Trending Component' : 'Edit Trending Component'}</h2>
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Basic Information</h3>
//               <div className="form-group">
//                 <label>Product Name</label>
//                 <input type="text" name="name" value={productFormData.name} onChange={handleProductInputChange} placeholder="Arduino Uno R3" required />
//               </div>
//               <div className="form-group">
//                 <label>Price (₹)</label>
//                 <input type="number" name="price" value={productFormData.price} onChange={handleProductInputChange} placeholder="450" step="0.01" min="0" required />
//               </div>
//               <div className="form-group">
//                 <label>Short Description</label>
//                 <textarea name="description" value={productFormData.description} onChange={handleProductInputChange} placeholder="The Arduino Uno is an open-source microcontroller board..." rows="2" required />
//               </div>
//               <div className="form-group">
//                 <label>Full Description</label>
//                 <textarea name="fullDescription" value={productFormData.fullDescription} onChange={handleProductInputChange} placeholder="Detailed product description..." rows="4" />
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Specifications</h3>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Microcontroller</label>
//                   <input type="text" name="microcontroller" value={productFormData.microcontroller} onChange={handleProductInputChange} placeholder="ATmega328P" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Operating Voltage</label>
//                   <input type="text" name="operatingVoltage" value={productFormData.operatingVoltage} onChange={handleProductInputChange} placeholder="5V" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Input Voltage (Recommended)</label>
//                   <input type="text" name="inputVoltageRecommended" value={productFormData.inputVoltageRecommended} onChange={handleProductInputChange} placeholder="7-12V" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Input Voltage (Limits)</label>
//                   <input type="text" name="inputVoltageLimits" value={productFormData.inputVoltageLimits} onChange={handleProductInputChange} placeholder="6-20V" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Digital I/O Pins</label>
//                   <input type="text" name="digitalIOPins" value={productFormData.digitalIOPins} onChange={handleProductInputChange} placeholder="14 (6 PWM)" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Analog Input Pins</label>
//                   <input type="text" name="analogInputPins" value={productFormData.analogInputPins} onChange={handleProductInputChange} placeholder="8 (A0 to A7)" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>PWM Channels</label>
//                   <input type="text" name="pwmChannels" value={productFormData.pwmChannels} onChange={handleProductInputChange} placeholder="6" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Clock Speed</label>
//                   <input type="text" name="clockSpeed" value={productFormData.clockSpeed} onChange={handleProductInputChange} placeholder="16 MHz" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Flash Memory</label>
//                   <input type="text" name="flashMemory" value={productFormData.flashMemory} onChange={handleProductInputChange} placeholder="32 KB" />
//                 </div>
//                 <div className="form-group half">
//                   <label>SRAM</label>
//                   <input type="text" name="sram" value={productFormData.sram} onChange={handleProductInputChange} placeholder="2 KB" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>EEPROM</label>
//                   <input type="text" name="eeprom" value={productFormData.eeprom} onChange={handleProductInputChange} placeholder="1 KB" />
//                 </div>
//                 <div className="form-group half">
//                   <label>USB Interface</label>
//                   <input type="text" name="usbInterface" value={productFormData.usbInterface} onChange={handleProductInputChange} placeholder="Mini USB" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Communication Interfaces</label>
//                   <input type="text" name="communicationInterfaces" value={productFormData.communicationInterfaces} onChange={handleProductInputChange} placeholder="UART, SPI, I2C" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Dimensions</label>
//                   <input type="text" name="dimensions" value={productFormData.dimensions} onChange={handleProductInputChange} placeholder="45mm x 18mm" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Weight</label>
//                   <input type="text" name="weight" value={productFormData.weight} onChange={handleProductInputChange} placeholder="7 grams" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Operating Temperature</label>
//                   <input type="text" name="operatingTemperature" value={productFormData.operatingTemperature} onChange={handleProductInputChange} placeholder="-40°C to 85°C" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Power Consumption</label>
//                   <input type="text" name="powerConsumption" value={productFormData.powerConsumption} onChange={handleProductInputChange} placeholder="Low power with sleep modes" />
//                 </div>
//                 <div className="form-group half">
//                   <label>LED Indicators</label>
//                   <input type="text" name="ledIndicators" value={productFormData.ledIndicators} onChange={handleProductInputChange} placeholder="Power LED, TX/RX LEDs" />
//                 </div>
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Product Image</h3>
//               <div className="form-group">
//                 <label>Product Image</label>
//                 <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
//                 {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
//                 {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Product Preview" /></div>}
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Project Usages</h3>
//               {productFormData.projectUsages.map((usage, index) => (
//                 <div className="form-group" key={index}>
//                   <label>Usage {index + 1}</label>
//                   <input type="text" value={usage} onChange={(e) => handleProjectUsageChange(index, e.target.value)} placeholder={`Project usage example ${index + 1}`} />
//                 </div>
//               ))}
//             </div>
//             <div className="form-section">
//               <h3>Display Options</h3>
//               <div className="form-group">
//                 <label>Delivery Speed</label>
//                 <div className="delivery-speed-options">
//                   {['quick', 'normal', 'late'].map(speed => (
//                     <label className="radio-container" key={speed}>
//                       <input type="radio" name="deliverySpeed" value={speed} checked={productFormData.deliverySpeed === speed} onChange={handleProductInputChange} />
//                       <span className="radio-label">{speed.charAt(0).toUpperCase() + speed.slice(1)}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input type="checkbox" name="active" id="active" checked={productFormData.active} onChange={handleProductInputChange} />
//                   <label htmlFor="active">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
//             <div className="form-actions">
//               <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
//               <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Product' : 'Update Product'}</button>
//             </div>
//           </form>
//           {formMode === 'edit' && <SpecificationComponent itemData={productFormData} itemType="trending" />}
//         </div>
//       )}

//       {activeMode === 'categories' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Basic Information</h3>
//               <div className="form-group">
//                 <label>Category Name</label>
//                 <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryInputChange} placeholder="Microcontrollers" required />
//               </div>
//               <div className="form-group">
//                 <label>Description</label>
//                 <textarea name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} placeholder="A collection of microcontroller boards..." rows="3" />
//               </div>
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input type="checkbox" name="active" id="categoryActive" checked={categoryFormData.active} onChange={handleCategoryInputChange} />
//                   <label htmlFor="categoryActive">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Category Image</h3>
//               <div className="form-group">
//                 <label>Category Image</label>
//                 <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
//                 {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
//                 {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Category Preview" /></div>}
//               </div>
//             </div>
//             <div className="form-actions">
//               <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
//               <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Category' : 'Update Category'}</button>
//             </div>
//           </form>
//         </div>
//       )}

//       {activeMode === 'categoryItems' && (
//         <div className="card form-card">
//           <h2>{formMode === 'add' ? 'Add New Category Item' : 'Edit Category Item'}</h2>
//           <form onSubmit={handleFormSubmit}>
//             <div className="form-section">
//               <h3>Category Selection</h3>
//               <div className="form-group">
//                 <label>Select Category</label>
//                 <select name="categoryId" value={categoryItemFormData.categoryId} onChange={handleCategoryItemInputChange} required>
//                   <option value="">-- Select a Category --</option>
//                   {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Basic Information</h3>
//               <div className="form-group">
//                 <label>Item Name</label>
//                 <input type="text" name="name" value={categoryItemFormData.name} onChange={handleCategoryItemInputChange} placeholder="ESP32 Development Board" required />
//               </div>
//               <div className="form-group">
//                 <label>Price (₹)</label>
//                 <input type="number" name="price" value={categoryItemFormData.price} onChange={handleCategoryItemInputChange} placeholder="450" step="0.01" min="0" required />
//               </div>
//               <div className="form-group">
//                 <label>Short Description</label>
//                 <textarea name="description" value={categoryItemFormData.description} onChange={handleCategoryItemInputChange} placeholder="ESP32 is a powerful, low-cost microcontroller..." rows="2" required />
//               </div>
//               <div className="form-group">
//                 <label>Full Description</label>
//                 <textarea name="fullDescription" value={categoryItemFormData.fullDescription} onChange={handleCategoryItemInputChange} placeholder="Detailed item description..." rows="4" />
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Item Image</h3>
//               <div className="form-group">
//                 <label>Item Image</label>
//                 <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
//                 {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
//                 {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Item Preview" /></div>}
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Specifications</h3>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Microcontroller</label>
//                   <input type="text" name="microcontroller" value={categoryItemFormData.microcontroller} onChange={handleCategoryItemInputChange} placeholder="ESP32" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Operating Voltage</label>
//                   <input type="text" name="operatingVoltage" value={categoryItemFormData.operatingVoltage} onChange={handleCategoryItemInputChange} placeholder="3.3V" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Input Voltage (Recommended)</label>
//                   <input type="text" name="inputVoltageRecommended" value={categoryItemFormData.inputVoltageRecommended} onChange={handleCategoryItemInputChange} placeholder="7-12V" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Input Voltage (Limits)</label>
//                   <input type="text" name="inputVoltageLimits" value={categoryItemFormData.inputVoltageLimits} onChange={handleCategoryItemInputChange} placeholder="5-20V" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Digital I/O Pins</label>
//                   <input type="text" name="digitalIOPins" value={categoryItemFormData.digitalIOPins} onChange={handleCategoryItemInputChange} placeholder="34" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Analog Input Pins</label>
//                   <input type="text" name="analogInputPins" value={categoryItemFormData.analogInputPins} onChange={handleCategoryItemInputChange} placeholder="18" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>PWM Channels</label>
//                   <input type="text" name="pwmChannels" value={categoryItemFormData.pwmChannels} onChange={handleCategoryItemInputChange} placeholder="16" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Clock Speed</label>
//                   <input type="text" name="clockSpeed" value={categoryItemFormData.clockSpeed} onChange={handleCategoryItemInputChange} placeholder="240 MHz" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Flash Memory</label>
//                   <input type="text" name="flashMemory" value={categoryItemFormData.flashMemory} onChange={handleCategoryItemInputChange} placeholder="4 MB" />
//                 </div>
//                 <div className="form-group half">
//                   <label>SRAM</label>
//                   <input type="text" name="sram" value={categoryItemFormData.sram} onChange={handleCategoryItemInputChange} placeholder="520 KB" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>EEPROM</label>
//                   <input type="text" name="eeprom" value={categoryItemFormData.eeprom} onChange={handleCategoryItemInputChange} placeholder="No dedicated EEPROM" />
//                 </div>
//                 <div className="form-group half">
//                   <label>USB Interface</label>
//                   <input type="text" name="usbInterface" value={categoryItemFormData.usbInterface} onChange={handleCategoryItemInputChange} placeholder="USB-C" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Communication Interfaces</label>
//                   <input type="text" name="communicationInterfaces" value={categoryItemFormData.communicationInterfaces} onChange={handleCategoryItemInputChange} placeholder="Wi-Fi, Bluetooth, UART, SPI, I2C" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Dimensions</label>
//                   <input type="text" name="dimensions" value={categoryItemFormData.dimensions} onChange={handleCategoryItemInputChange} placeholder="60mm x 28mm x 13mm" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Weight</label>
//                   <input type="text" name="weight" value={categoryItemFormData.weight} onChange={handleCategoryItemInputChange} placeholder="25g" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Operating Temperature</label>
//                   <input type="text" name="operatingTemperature" value={categoryItemFormData.operatingTemperature} onChange={handleCategoryItemInputChange} placeholder="-40°C to 85°C" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Power Consumption</label>
//                   <input type="text" name="powerConsumption" value={categoryItemFormData.powerConsumption} onChange={handleCategoryItemInputChange} placeholder="Variable, sleep modes available" />
//                 </div>
//                 <div className="form-group half">
//                   <label>LED Indicators</label>
//                   <input type="text" name="ledIndicators" value={categoryItemFormData.ledIndicators} onChange={handleCategoryItemInputChange} placeholder="Power LED, Status LED" />
//                 </div>
//               </div>
//               <div className="form-row">
//                 <div className="form-group half">
//                   <label>Material</label>
//                   <input type="text" name="material" value={categoryItemFormData.material} onChange={handleCategoryItemInputChange} placeholder="High-grade PCB" />
//                 </div>
//                 <div className="form-group half">
//                   <label>Warranty</label>
//                   <input type="text" name="warranty" value={categoryItemFormData.warranty} onChange={handleCategoryItemInputChange} placeholder="1 year" />
//                 </div>
//               </div>
//             </div>
//             <div className="form-section">
//               <h3>Display Options</h3>
//               <div className="form-group">
//                 <label>Delivery Speed</label>
//                 <div className="delivery-speed-options">
//                   {['quick', 'normal', 'late'].map(speed => (
//                     <label className="radio-container" key={speed}>
//                       <input type="radio" name="deliverySpeed" value={speed} checked={categoryItemFormData.deliverySpeed === speed} onChange={handleCategoryItemInputChange} />
//                       <span className="radio-label">{speed.charAt(0).toUpperCase() + speed.slice(1)}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div className="form-group">
//                 <div className="checkbox-container">
//                   <input type="checkbox" name="active" id="itemActive" checked={categoryItemFormData.active} onChange={handleCategoryItemInputChange} />
//                   <label htmlFor="itemActive">Active (visible on website)</label>
//                 </div>
//               </div>
//             </div>
//             <div className="form-actions">
//               <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
//               <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Item' : 'Update Item'}</button>
//             </div>
//           </form>
//           {formMode === 'edit' && <SpecificationComponent itemData={categoryItemFormData} itemType="categoryItems" />}
//         </div>
//       )}

//       <div className="view-all-section">
//         <button className="view-all-btn" onClick={handleViewAllItems}>View All Items</button>
//       </div>

//       {activeMode === 'trending' && (
//         <div className="card table-card">
//           <h2>Recently Added Trending Components</h2>
//           {loading ? <div className="loading">Loading products...</div> : (
//             <div className="products-list">
//               {products.slice(0, 3).map(product => (
//                 <div className="product-item" key={product.id}>
//                   <div className="product-preview">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="no-image">No Image</div>}</div>
//                   <div className="product-details">
//                     <h3>{product.name || 'Untitled Product'}</h3>
//                     <p className="product-price">₹{product.price ? product.price.toFixed(2) : '0.00'}</p>
//                     <p>{product.description || 'No description'}</p>
//                     <div className="status-badge">
//                       <span className={product.active ? 'active' : 'inactive'}>{product.active ? 'Active' : 'Inactive'}</span>
//                       <span className={`delivery-badge ${product.deliverySpeed || 'normal'}`}>
//                         {product.deliverySpeed ? product.deliverySpeed.charAt(0).toUpperCase() + product.deliverySpeed.slice(1) : 'Normal'}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="product-actions">
//                     <button className={`status-toggle-btn ${product.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(product.id, product.active, 'trending')}>
//                       {product.active ? 'Deactivate' : 'Activate'}
//                     </button>
//                     <button className="edit-btn" onClick={() => handleEditItem(product, 'trending')}><i className="fas fa-edit"></i> Edit</button>
//                     <button className="delete-btn" onClick={() => handleDeleteItem(product.id, product.imageUrl, 'trending')}><i className="fas fa-trash"></i> Delete</button>
//                   </div>
//                 </div>
//               ))}
//               {products.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Trending Components ({products.length})</button></div>}
//             </div>
//           )}
//         </div>
//       )}

//       {activeMode === 'categories' && (
//         <div className="card table-card">
//           <h2>Recently Added Categories</h2>
//           {loading ? <div className="loading">Loading categories...</div> : (
//             <div className="categories-list">
//               {categories.slice(0, 3).map(category => (
//                 <div className="category-item" key={category.id}>
//                   <div className="category-preview">{category.imageUrl ? <img src={category.imageUrl} alt={category.name} /> : <div className="no-image">No Image</div>}</div>
//                   <div className="category-details">
//                     <h3>{category.name || 'Untitled Category'}</h3>
//                     <p>{category.description || 'No description'}</p>
//                     <div className="status-badge"><span className={category.active ? 'active' : 'inactive'}>{category.active ? 'Active' : 'Inactive'}</span></div>
//                   </div>
//                   <div className="category-actions">
//                     <button className={`status-toggle-btn ${category.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(category.id, category.active, 'categories')}>
//                       {category.active ? 'Deactivate' : 'Activate'}
//                     </button>
//                     <button className="edit-btn" onClick={() => handleEditItem(category, 'categories')}><i className="fas fa-edit"></i> Edit</button>
//                     <button className="delete-btn" onClick={() => handleDeleteItem(category.id, category.imageUrl, 'categories')}><i className="fas fa-trash"></i> Delete</button>
//                   </div>
//                 </div>
//               ))}
//               {categories.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Categories ({categories.length})</button></div>}
//             </div>
//           )}
//         </div>
//       )}

//       {activeMode === 'categoryItems' && (
//         <div className="card table-card">
//           <h2>Recently Added Category Items</h2>
//           {loading ? <div className="loading">Loading category items...</div> : (
//             <div className="category-items-list">
//               {categoryItems.slice(0, 3).map(item => (
//                 <div className="category-item-row" key={item.id}>
//                   <div className="item-preview">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="no-image">No Image</div>}</div>
//                   <div className="item-details">
//                     <h3>{item.name || 'Untitled Item'}</h3>
//                     <p className="item-category">Category: {item.categoryName || 'Unknown'}</p>
//                     <p className="item-price">₹{item.price ? item.price.toFixed(2) : '0.00'}</p>
//                     <p>{item.description || 'No description'}</p>
//                     <div className="status-badge">
//                       <span className={item.active ? 'active' : 'inactive'}>{item.active ? 'Active' : 'Inactive'}</span>
//                       <span className={`delivery-badge ${item.deliverySpeed || 'normal'}`}>
//                         {item.deliverySpeed ? item.deliverySpeed.charAt(0).toUpperCase() + item.deliverySpeed.slice(1) : 'Normal'}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="item-actions">
//                     <button className={`status-toggle-btn ${item.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(item.id, item.active, 'categoryItems')}>
//                       {item.active ? 'Deactivate' : 'Activate'}
//                     </button>
//                     <button className="edit-btn" onClick={() => handleEditItem(item, 'categoryItems')}><i className="fas fa-edit"></i> Edit</button>
//                     <button className="delete-btn" onClick={() => handleDeleteItem(item.id, item.imageUrl, 'categoryItems')}><i className="fas fa-trash"></i> Delete</button>
//                   </div>
//                 </div>
//               ))}
//               {categoryItems.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Category Items ({categoryItems.length})</button></div>}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductManagement;




import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import SpecificationComponent from './SpecificationComponent';
import { db, storage } from '../../firebase/firebaseConfig';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlMode = queryParams.get('mode');
  const editId = queryParams.get('edit');

  const [activeMode, setActiveMode] = useState(urlMode || 'trending');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState('add');
  const [currentItemId, setCurrentItemId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Custom specifications
  const [customSpecifications, setCustomSpecifications] = useState([]);
  
  // Package points
  const [packagePoints, setPackagePoints] = useState([]);

  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    description: '',
    fullDescription: '',
    microcontroller: '',
    operatingVoltage: '',
    inputVoltageRecommended: '',
    inputVoltageLimits: '',
    digitalIOPins: '',
    analogInputPins: '',
    pwmChannels: '',
    clockSpeed: '',
    flashMemory: '',
    sram: '',
    eeprom: '',
    usbInterface: '',
    communicationInterfaces: '',
    dimensions: '',
    weight: '',
    operatingTemperature: '',
    powerConsumption: '',
    ledIndicators: '',
    material: '',
    warranty: '',
    projectUsages: ['', '', '', ''],
    deliverySpeed: 'normal',
    isQuick: true,
    active: true,
    imageUrl: '',
    customSpecifications: [],
    packagePoints: []
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    active: true,
    imageUrl: '',
    customSpecifications: [],
    packagePoints: []
  });

  const [categoryItemFormData, setCategoryItemFormData] = useState({
    categoryId: '',
    categoryName: '',
    name: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    description: '',
    fullDescription: '',
    microcontroller: '',
    operatingVoltage: '',
    inputVoltageRecommended: '',
    inputVoltageLimits: '',
    digitalIOPins: '',
    analogInputPins: '',
    pwmChannels: '',
    clockSpeed: '',
    flashMemory: '',
    sram: '',
    eeprom: '',
    usbInterface: '',
    communicationInterfaces: '',
    dimensions: '',
    weight: '',
    operatingTemperature: '',
    powerConsumption: '',
    ledIndicators: '',
    material: '',
    warranty: '',
    deliverySpeed: 'normal',
    active: true,
    imageUrl: '',
    customSpecifications: [],
    packagePoints: []
  });

  useEffect(() => {
    fetchData();
    if (editId && urlMode) {
      loadItemForEdit(editId, urlMode);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === 'categoryItems') {
      fetchCategories();
    }
  }, [activeMode]);

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
        fetchCategories();
        break;
      default:
        fetchProducts();
    }
  };

  const loadItemForEdit = async (itemId, mode) => {
    try {
      setLoading(true);
      setFormMode('edit');
      setCurrentItemId(itemId);

      let collectionName;
      switch(mode) {
        case 'trending': collectionName = 'products'; break;
        case 'categories': collectionName = 'categories'; break;
        case 'categoryItems': collectionName = 'categoryItems'; break;
        default: collectionName = 'products';
      }

      const itemDoc = await getDoc(doc(db, collectionName, itemId));
      if (itemDoc.exists()) {
        const itemData = itemDoc.data();
        switch(mode) {
          case 'trending':
            let projectUsages = Array.isArray(itemData.projectUsages) ? [...itemData.projectUsages] : [];
            while (projectUsages.length < 4) projectUsages.push('');
            setProductFormData({
              ...itemData,
              projectUsages,
              price: itemData.price || ''
            });
            setCustomSpecifications(itemData.customSpecifications || []);
            setPackagePoints(itemData.packagePoints || []);
            break;
          case 'categories':
            setCategoryFormData(itemData);
            setCustomSpecifications(itemData.customSpecifications || []);
            setPackagePoints(itemData.packagePoints || []);
            break;
          case 'categoryItems':
            setCategoryItemFormData({
              ...itemData,
              price: itemData.price || ''
            });
            setCustomSpecifications(itemData.customSpecifications || []);
            setPackagePoints(itemData.packagePoints || []);
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(productsQuery);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(categoriesQuery);
      setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryItems = async () => {
    try {
      setLoading(true);
      const categoryItemsQuery = query(collection(db, 'categoryItems'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(categoryItemsQuery);
      setCategoryItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching category items:', error);
      alert('Failed to load category items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom specifications
  const addCustomSpecification = () => {
    setCustomSpecifications([...customSpecifications, { title: '', value: '' }]);
  };

  const removeCustomSpecification = (index) => {
    const updatedSpecs = [...customSpecifications];
    updatedSpecs.splice(index, 1);
    setCustomSpecifications(updatedSpecs);
  };

  const handleCustomSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...customSpecifications];
    updatedSpecs[index][field] = value;
    setCustomSpecifications(updatedSpecs);
  };

  // Handle package points
  const addPackagePoint = () => {
    setPackagePoints([...packagePoints, '']);
  };

  const removePackagePoint = (index) => {
    const updatedPoints = [...packagePoints];
    updatedPoints.splice(index, 1);
    setPackagePoints(updatedPoints);
  };

  const handlePackagePointChange = (index, value) => {
    const updatedPoints = [...packagePoints];
    updatedPoints[index] = value;
    setPackagePoints(updatedPoints);
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setProductFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (
          (name === 'price' || name === 'originalPrice' || name === 'discountPercentage') && value !== '' 
            ? parseFloat(value) 
            : value
        )
      };
      
      // Auto-calculate price based on original price and discount percentage
      if (name === 'originalPrice' || name === 'discountPercentage') {
        const originalPrice = name === 'originalPrice' 
          ? parseFloat(value) || 0 
          : prev.originalPrice || 0;
        
        const discount = name === 'discountPercentage' 
          ? parseFloat(value) || 0 
          : prev.discountPercentage || 0;
        
        if (originalPrice > 0) {
          updatedData.price = (originalPrice - (originalPrice * discount / 100)).toFixed(2);
        }
      }
      
      return updatedData;
    });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setCategoryItemFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (
          (name === 'price' || name === 'originalPrice' || name === 'discountPercentage') && value !== '' 
            ? parseFloat(value) 
            : value
        ),
        ...(name === 'categoryId' && {
          categoryName: categories.find(cat => cat.id === value)?.name || ''
        })
      };
      
      // Auto-calculate price based on original price and discount percentage
      if (name === 'originalPrice' || name === 'discountPercentage') {
        const originalPrice = name === 'originalPrice' 
          ? parseFloat(value) || 0 
          : prev.originalPrice || 0;
        
        const discount = name === 'discountPercentage' 
          ? parseFloat(value) || 0 
          : prev.discountPercentage || 0;
        
        if (originalPrice > 0) {
          updatedData.price = (originalPrice - (originalPrice * discount / 100)).toFixed(2);
        }
      }
      
      return updatedData;
    });
  };

  const handleProjectUsageChange = (index, value) => {
    setProductFormData(prev => ({
      ...prev,
      projectUsages: prev.projectUsages.map((usage, i) => i === index ? value : usage)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `${activeMode}/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      return new Promise((resolve) => {
        uploadTask.on('state_changed', (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }, (error) => {
          console.error('Error uploading image:', error);
          setIsUploading(false);
        }, async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          resolve(downloadURL);
        });
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      setIsUploading(false);
      return null;
    }
  };

  const deleteImage = async (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
      try {
        await deleteObject(ref(storage, imageUrl));
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!productFormData.name.trim() || isNaN(productFormData.price)) return alert('Please enter valid product details');
    try {
      let imageUrl = await uploadImage();
      const productData = {
        ...productFormData,
        price: parseFloat(productFormData.price),
        originalPrice: parseFloat(productFormData.originalPrice) || parseFloat(productFormData.price),
        discountPercentage: parseFloat(productFormData.discountPercentage) || 0,
        projectUsages: productFormData.projectUsages.filter(usage => usage.trim() !== ''),
        isQuick: productFormData.deliverySpeed === 'quick',
        imageUrl: imageUrl || productFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'products'), productData);
      resetProductForm();
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!currentItemId || !productFormData.name.trim() || isNaN(productFormData.price)) return alert('Please enter valid product details');
    try {
      let imageUrl = productFormData.imageUrl;
      if (imageFile) {
        await deleteImage(imageUrl);
        imageUrl = await uploadImage();
      }
      const productData = {
        ...productFormData,
        price: parseFloat(productFormData.price),
        originalPrice: parseFloat(productFormData.originalPrice) || parseFloat(productFormData.price),
        discountPercentage: parseFloat(productFormData.discountPercentage) || 0,
        projectUsages: productFormData.projectUsages.filter(usage => usage.trim() !== ''),
        isQuick: productFormData.deliverySpeed === 'quick',
        imageUrl: imageUrl || productFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'products', currentItemId), productData);
      resetProductForm();
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return alert('Please enter a category name');
    try {
      let imageUrl = await uploadImage();
      const categoryData = {
        ...categoryFormData,
        imageUrl: imageUrl || categoryFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'categories'), categoryData);
      resetCategoryForm();
      fetchCategories();
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!currentItemId || !categoryFormData.name.trim()) return alert('Please enter a category name');
    try {
      let imageUrl = categoryFormData.imageUrl;
      if (imageFile) {
        await deleteImage(imageUrl);
        imageUrl = await uploadImage();
      }
      const categoryData = {
        ...categoryFormData,
        imageUrl: imageUrl || categoryFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        updatedAt: serverTimestamp()
      };
      const categoryRef = doc(db, 'categories', currentItemId);
      await updateDoc(categoryRef, categoryData);
      const batch = writeBatch(db);
      const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', currentItemId));
      const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
      categoryItemsSnapshot.docs.forEach(doc => batch.update(doc.ref, { categoryName: categoryFormData.name, updatedAt: serverTimestamp() }));
      await batch.commit();
      resetCategoryForm();
      fetchCategories();
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const addCategoryItem = async (e) => {
    e.preventDefault();
    if (!categoryItemFormData.name.trim() || isNaN(categoryItemFormData.price) || !categoryItemFormData.categoryId) return alert('Please enter valid item details');
    try {
      let imageUrl = await uploadImage();
      const categoryItemData = {
        ...categoryItemFormData,
        price: parseFloat(categoryItemFormData.price),
        originalPrice: parseFloat(categoryItemFormData.originalPrice) || parseFloat(categoryItemFormData.price),
        discountPercentage: parseFloat(categoryItemFormData.discountPercentage) || 0,
        isQuick: categoryItemFormData.deliverySpeed === 'quick',
        imageUrl: imageUrl || categoryItemFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'categoryItems'), categoryItemData);
      resetCategoryItemForm();
      fetchCategoryItems();
      alert('Category item added successfully!');
    } catch (error) {
      console.error('Error adding category item:', error);
      alert('Failed to add category item. Please try again.');
    }
  };

  const updateCategoryItem = async (e) => {
    e.preventDefault();
    if (!currentItemId || !categoryItemFormData.name.trim() || isNaN(categoryItemFormData.price) || !categoryItemFormData.categoryId) return alert('Please enter valid item details');
    try {
      let imageUrl = categoryItemFormData.imageUrl;
      if (imageFile) {
        await deleteImage(imageUrl);
        imageUrl = await uploadImage();
      }
      const categoryItemData = {
        ...categoryItemFormData,
        price: parseFloat(categoryItemFormData.price),
        originalPrice: parseFloat(categoryItemFormData.originalPrice) || parseFloat(categoryItemFormData.price),
        discountPercentage: parseFloat(categoryItemFormData.discountPercentage) || 0,
        isQuick: categoryItemFormData.deliverySpeed === 'quick',
        imageUrl: imageUrl || categoryItemFormData.imageUrl,
        customSpecifications: customSpecifications.filter(spec => spec.title.trim() !== '' && spec.value.trim() !== ''),
        packagePoints: packagePoints.filter(point => point.trim() !== ''),
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'categoryItems', currentItemId), categoryItemData);
      resetCategoryItemForm();
      fetchCategoryItems();
      alert('Category item updated successfully!');
    } catch (error) {
      console.error('Error updating category item:', error);
      alert('Failed to update category item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId, imageUrl, itemType) => {
    if (window.confirm(`Are you sure you want to delete this ${itemType === 'trending' ? 'product' : itemType === 'categories' ? 'category' : 'category item'}?`)) {
      try {
        if (itemType === 'categories') {
          const categoryItemsQuery = query(collection(db, 'categoryItems'), where('categoryId', '==', itemId));
          const categoryItemsSnapshot = await getDocs(categoryItemsQuery);
          if (!categoryItemsSnapshot.empty) {
            if (!window.confirm(`This category has ${categoryItemsSnapshot.size} items. Deleting it will also delete all associated items. Continue?`)) return;
            const batch = writeBatch(db);
            categoryItemsSnapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
              deleteImage(doc.data().imageUrl);
            });
            await batch.commit();
          }
        }
        await deleteDoc(doc(db, itemType === 'trending' ? 'products' : itemType === 'categories' ? 'categories' : 'categoryItems', itemId));
        await deleteImage(imageUrl);
        if (itemType === 'trending') fetchProducts();
        else if (itemType === 'categories') fetchCategories();
        else fetchCategoryItems();
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
        alert(`Failed to delete ${itemType}. Please try again.`);
      }
    }
  };

  const toggleItemStatus = async (itemId, currentStatus, itemType) => {
    try {
      await updateDoc(doc(db, itemType === 'trending' ? 'products' : itemType === 'categories' ? 'categories' : 'categoryItems', itemId), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      if (itemType === 'trending') fetchProducts();
      else if (itemType === 'categories') fetchCategories();
      else fetchCategoryItems();
    } catch (error) {
      console.error('Error toggling item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };

  const handleEditItem = (item, itemType) => {
    setFormMode('edit');
    setCurrentItemId(item.id);
    if (itemType === 'trending') {
      let projectUsages = Array.isArray(item.projectUsages) ? [...item.projectUsages] : [];
      while (projectUsages.length < 4) projectUsages.push('');
      setProductFormData({ ...item, projectUsages });
    } else if (itemType === 'categories') {
      setCategoryFormData(item);
    } else {
      setCategoryItemFormData(item);
    }
    setCustomSpecifications(item.customSpecifications || []);
    setPackagePoints(item.packagePoints || []);
    setImagePreview(item.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetProductForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCustomSpecifications([]);
    setPackagePoints([]);
    setProductFormData({
      name: '',
      price: '',
      originalPrice: '',
      discountPercentage: 0,
      description: '',
      fullDescription: '',
      microcontroller: '',
      operatingVoltage: '',
      inputVoltageRecommended: '',
      inputVoltageLimits: '',
      digitalIOPins: '',
      analogInputPins: '',
      pwmChannels: '',
      clockSpeed: '',
      flashMemory: '',
      sram: '',
      eeprom: '',
      usbInterface: '',
      communicationInterfaces: '',
      dimensions: '',
      weight: '',
      operatingTemperature: '',
      powerConsumption: '',
      ledIndicators: '',
      material: '',
      warranty: '',
      projectUsages: ['', '', '', ''],
      deliverySpeed: 'normal',
      isQuick: true,
      active: true,
      imageUrl: ''
    });
  };

  const resetCategoryForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCustomSpecifications([]);
    setPackagePoints([]);
    setCategoryFormData({
      name: '',
      description: '',
      active: true,
      imageUrl: ''
    });
  };

  const resetCategoryItemForm = () => {
    setFormMode('add');
    setCurrentItemId(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setCustomSpecifications([]);
    setPackagePoints([]);
    setCategoryItemFormData({
      categoryId: '',
      categoryName: '',
      name: '',
      price: '',
      originalPrice: '',
      discountPercentage: 0,
      description: '',
      fullDescription: '',
      microcontroller: '',
      operatingVoltage: '',
      inputVoltageRecommended: '',
      inputVoltageLimits: '',
      digitalIOPins: '',
      analogInputPins: '',
      pwmChannels: '',
      clockSpeed: '',
      flashMemory: '',
      sram: '',
      eeprom: '',
      usbInterface: '',
      communicationInterfaces: '',
      dimensions: '',
      weight: '',
      operatingTemperature: '',
      powerConsumption: '',
      ledIndicators: '',
      material: '',
      warranty: '',
      deliverySpeed: 'normal',
      active: true,
      imageUrl: ''
    });
  };

  const resetForm = () => {
    switch(activeMode) {
      case 'trending': resetProductForm(); break;
      case 'categories': resetCategoryForm(); break;
      case 'categoryItems': resetCategoryItemForm(); break;
      default: resetProductForm();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    switch(activeMode) {
      case 'trending': formMode === 'add' ? addProduct(e) : updateProduct(e); break;
      case 'categories': formMode === 'add' ? addCategory(e) : updateCategory(e); break;
      case 'categoryItems': formMode === 'add' ? addCategoryItem(e) : updateCategoryItem(e); break;
      default: addProduct(e);
    }
  };

  const changeMode = (mode) => {
    resetForm();
    setActiveMode(mode);
    const url = new URL(window.location);
    url.searchParams.set('mode', mode);
    window.history.pushState({}, '', url);
  };

  const handleViewAllItems = () => navigate('/manage-items');

  // Custom Specifications UI
  const renderCustomSpecificationsUI = () => (
    <div className="form-section">
      <div className="section-header">
        <h3>Custom Specifications</h3>
        <button type="button" className="add-btn" onClick={addCustomSpecification}>
          <i className="fas fa-plus"></i> Add Specification
        </button>
      </div>
      {customSpecifications.map((spec, index) => (
        <div className="custom-specification-row" key={index}>
          <div className="form-row">
            <div className="form-group half">
              <input 
                type="text" 
                placeholder="Specification Title" 
                value={spec.title} 
                onChange={(e) => handleCustomSpecificationChange(index, 'title', e.target.value)}
              />
            </div>
            <div className="form-group half">
              <input 
                type="text" 
                placeholder="Specification Value" 
                value={spec.value} 
                onChange={(e) => handleCustomSpecificationChange(index, 'value', e.target.value)}
              />
            </div>
            <button 
              type="button" 
              className="remove-btn" 
              onClick={() => removeCustomSpecification(index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
      {customSpecifications.length === 0 && (
        <p className="no-items-text">No custom specifications added yet</p>
      )}
    </div>
  );

  // Package Points UI
  const renderPackagePointsUI = () => (
    <div className="form-section">
      <div className="section-header">
        <h3>Package Contents</h3>
        <button type="button" className="add-btn" onClick={addPackagePoint}>
          <i className="fas fa-plus"></i> Add Package Item
        </button>
      </div>
      {packagePoints.map((point, index) => (
        <div className="package-point-row" key={index}>
          <div className="form-row">
            <div className="form-group bullet-input">
              <i className="fas fa-circle bullet-icon"></i>
              <input 
                type="text" 
                placeholder="Package item description" 
                value={point} 
                onChange={(e) => handlePackagePointChange(index, e.target.value)}
              />
            </div>
            <button 
              type="button" 
              className="remove-btn" 
              onClick={() => removePackagePoint(index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
      {packagePoints.length === 0 && (
        <p className="no-items-text">No package items added yet</p>
      )}
    </div>
  );

  return (
    <div className="content">
      <h1 className="page-title">Create Items</h1>
      <div className="management-tabs">
        <button className={`tab-btn ${activeMode === 'trending' ? 'active' : ''}`} onClick={() => changeMode('trending')}>
          Create Trending Components
        </button>
        <button className={`tab-btn ${activeMode === 'categories' ? 'active' : ''}`} onClick={() => changeMode('categories')}>
          Create Categories
        </button>
        <button className={`tab-btn ${activeMode === 'categoryItems' ? 'active' : ''}`} onClick={() => changeMode('categoryItems')}>
          Create Category Items
        </button>
      </div>

      {activeMode === 'trending' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Trending Component' : 'Edit Trending Component'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={productFormData.name} onChange={handleProductInputChange} placeholder="Arduino Uno R3" required />
              </div>
              <div className="form-group">
                <label>Original Price (₹)</label>
                <input 
                  type="number" 
                  name="originalPrice" 
                  value={productFormData.originalPrice} 
                  onChange={handleProductInputChange} 
                  placeholder="500" 
                  step="0.01" 
                  min="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage (%)</label>
                <input 
                  type="number" 
                  name="discountPercentage" 
                  value={productFormData.discountPercentage} 
                  onChange={handleProductInputChange} 
                  placeholder="10" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={productFormData.price} 
                  onChange={handleProductInputChange} 
                  placeholder="450" 
                  step="0.01" 
                  min="0" 
                  required 
                  readOnly={productFormData.originalPrice && productFormData.discountPercentage > 0}
                  className={productFormData.originalPrice && productFormData.discountPercentage > 0 ? "calculated-price" : ""}
                />
                {productFormData.originalPrice && productFormData.discountPercentage > 0 && (
                  <small className="price-info">Calculated based on original price and discount</small>
                )}
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <textarea name="description" value={productFormData.description} onChange={handleProductInputChange} placeholder="The Arduino Uno is an open-source microcontroller board..." rows="2" required />
              </div>
              <div className="form-group">
                <label>Full Description</label>
                <textarea name="fullDescription" value={productFormData.fullDescription} onChange={handleProductInputChange} placeholder="Detailed product description..." rows="4" />
              </div>
            </div>
            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label>Microcontroller</label>
                  <input type="text" name="microcontroller" value={productFormData.microcontroller} onChange={handleProductInputChange} placeholder="ATmega328P" />
                </div>
                <div className="form-group half">
                  <label>Operating Voltage</label>
                  <input type="text" name="operatingVoltage" value={productFormData.operatingVoltage} onChange={handleProductInputChange} placeholder="5V" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Input Voltage (Recommended)</label>
                  <input type="text" name="inputVoltageRecommended" value={productFormData.inputVoltageRecommended} onChange={handleProductInputChange} placeholder="7-12V" />
                </div>
                <div className="form-group half">
                  <label>Input Voltage (Limits)</label>
                  <input type="text" name="inputVoltageLimits" value={productFormData.inputVoltageLimits} onChange={handleProductInputChange} placeholder="6-20V" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Digital I/O Pins</label>
                  <input type="text" name="digitalIOPins" value={productFormData.digitalIOPins} onChange={handleProductInputChange} placeholder="14 (6 PWM)" />
                </div>
                <div className="form-group half">
                  <label>Analog Input Pins</label>
                  <input type="text" name="analogInputPins" value={productFormData.analogInputPins} onChange={handleProductInputChange} placeholder="8 (A0 to A7)" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>PWM Channels</label>
                  <input type="text" name="pwmChannels" value={productFormData.pwmChannels} onChange={handleProductInputChange} placeholder="6" />
                </div>
                <div className="form-group half">
                  <label>Clock Speed</label>
                  <input type="text" name="clockSpeed" value={productFormData.clockSpeed} onChange={handleProductInputChange} placeholder="16 MHz" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Flash Memory</label>
                  <input type="text" name="flashMemory" value={productFormData.flashMemory} onChange={handleProductInputChange} placeholder="32 KB" />
                </div>
                <div className="form-group half">
                  <label>SRAM</label>
                  <input type="text" name="sram" value={productFormData.sram} onChange={handleProductInputChange} placeholder="2 KB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>EEPROM</label>
                  <input type="text" name="eeprom" value={productFormData.eeprom} onChange={handleProductInputChange} placeholder="1 KB" />
                </div>
                <div className="form-group half">
                  <label>USB Interface</label>
                  <input type="text" name="usbInterface" value={productFormData.usbInterface} onChange={handleProductInputChange} placeholder="Mini USB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Communication Interfaces</label>
                  <input type="text" name="communicationInterfaces" value={productFormData.communicationInterfaces} onChange={handleProductInputChange} placeholder="UART, SPI, I2C" />
                </div>
                <div className="form-group half">
                  <label>Dimensions</label>
                  <input type="text" name="dimensions" value={productFormData.dimensions} onChange={handleProductInputChange} placeholder="45mm x 18mm" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Weight</label>
                  <input type="text" name="weight" value={productFormData.weight} onChange={handleProductInputChange} placeholder="7 grams" />
                </div>
                <div className="form-group half">
                  <label>Operating Temperature</label>
                  <input type="text" name="operatingTemperature" value={productFormData.operatingTemperature} onChange={handleProductInputChange} placeholder="-40°C to 85°C" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Power Consumption</label>
                  <input type="text" name="powerConsumption" value={productFormData.powerConsumption} onChange={handleProductInputChange} placeholder="Low power with sleep modes" />
                </div>
                <div className="form-group half">
                  <label>LED Indicators</label>
                  <input type="text" name="ledIndicators" value={productFormData.ledIndicators} onChange={handleProductInputChange} placeholder="Power LED, TX/RX LEDs" />
                </div>
              </div>
            </div>

            {/* Custom Specifications */}
            {renderCustomSpecificationsUI()}

            {/* Package Points */}
            {renderPackagePointsUI()}

            <div className="form-section">
              <h3>Product Image</h3>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
                {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
                {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Product Preview" /></div>}
              </div>
            </div>
            <div className="form-section">
              <h3>Project Usages</h3>
              {productFormData.projectUsages.map((usage, index) => (
                <div className="form-group" key={index}>
                  <label>Usage {index + 1}</label>
                  <input type="text" value={usage} onChange={(e) => handleProjectUsageChange(index, e.target.value)} placeholder={`Project usage example ${index + 1}`} />
                </div>
              ))}
            </div>
            <div className="form-section">
              <h3>Display Options</h3>
              <div className="form-group">
                <label>Delivery Speed</label>
                <div className="delivery-speed-options">
                  {['quick', 'normal', 'late'].map(speed => (
                    <label className="radio-container" key={speed}>
                      <input type="radio" name="deliverySpeed" value={speed} checked={productFormData.deliverySpeed === speed} onChange={handleProductInputChange} />
                      <span className="radio-label">{speed.charAt(0).toUpperCase() + speed.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <div className="checkbox-container">
                  <input type="checkbox" name="active" id="active" checked={productFormData.active} onChange={handleProductInputChange} />
                  <label htmlFor="active">Active (visible on website)</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Product' : 'Update Product'}</button>
            </div>
          </form>
          {formMode === 'edit' && <SpecificationComponent itemData={{
            ...productFormData, 
            customSpecifications, 
            packagePoints
          }} itemType="trending" />}
        </div>
      )}

      {activeMode === 'categories' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryInputChange} placeholder="Microcontrollers" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} placeholder="A collection of microcontroller boards..." rows="3" />
              </div>
              <div className="form-group">
                <div className="checkbox-container">
                  <input type="checkbox" name="active" id="categoryActive" checked={categoryFormData.active} onChange={handleCategoryInputChange} />
                  <label htmlFor="categoryActive">Active (visible on website)</label>
                </div>
              </div>
            </div>

            {/* Custom Specifications */}
            {renderCustomSpecificationsUI()}

            {/* Package Points */}
            {renderPackagePointsUI()}

            <div className="form-section">
              <h3>Category Image</h3>
              <div className="form-group">
                <label>Category Image</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
                {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
                {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Category Preview" /></div>}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Category' : 'Update Category'}</button>
            </div>
          </form>
          {formMode === 'edit' && <SpecificationComponent itemData={{
            ...categoryFormData, 
            customSpecifications, 
            packagePoints
          }} itemType="categories" />}
        </div>
      )}

      {activeMode === 'categoryItems' && (
        <div className="card form-card">
          <h2>{formMode === 'add' ? 'Add New Category Item' : 'Edit Category Item'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-section">
              <h3>Category Selection</h3>
              <div className="form-group">
                <label>Select Category</label>
                <select name="categoryId" value={categoryItemFormData.categoryId} onChange={handleCategoryItemInputChange} required>
                  <option value="">-- Select a Category --</option>
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" name="name" value={categoryItemFormData.name} onChange={handleCategoryItemInputChange} placeholder="ESP32 Development Board" required />
              </div>
              <div className="form-group">
                <label>Original Price (₹)</label>
                <input 
                  type="number" 
                  name="originalPrice" 
                  value={categoryItemFormData.originalPrice} 
                  onChange={handleCategoryItemInputChange} 
                  placeholder="500" 
                  step="0.01" 
                  min="0" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage (%)</label>
                <input 
                  type="number" 
                  name="discountPercentage" 
                  value={categoryItemFormData.discountPercentage} 
                  onChange={handleCategoryItemInputChange} 
                  placeholder="10" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={categoryItemFormData.price} 
                  onChange={handleCategoryItemInputChange} 
                  placeholder="450" 
                  step="0.01" 
                  min="0" 
                  required 
                  readOnly={categoryItemFormData.originalPrice && categoryItemFormData.discountPercentage > 0}
                  className={categoryItemFormData.originalPrice && categoryItemFormData.discountPercentage > 0 ? "calculated-price" : ""}
                />
                {categoryItemFormData.originalPrice && categoryItemFormData.discountPercentage > 0 && (
                  <small className="price-info">Calculated based on original price and discount</small>
                )}
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <textarea name="description" value={categoryItemFormData.description} onChange={handleCategoryItemInputChange} placeholder="ESP32 is a powerful, low-cost microcontroller..." rows="2" required />
              </div>
              <div className="form-group">
                <label>Full Description</label>
                <textarea name="fullDescription" value={categoryItemFormData.fullDescription} onChange={handleCategoryItemInputChange} placeholder="Detailed item description..." rows="4" />
              </div>
            </div>
            <div className="form-section">
              <h3>Item Image</h3>
              <div className="form-group">
                <label>Item Image</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
                {isUploading && <div className="upload-progress"><div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div><span>{uploadProgress}%</span></div>}
                {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Item Preview" /></div>}
              </div>
            </div>
            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label>Microcontroller</label>
                  <input type="text" name="microcontroller" value={categoryItemFormData.microcontroller} onChange={handleCategoryItemInputChange} placeholder="ESP32" />
                </div>
                <div className="form-group half">
                  <label>Operating Voltage</label>
                  <input type="text" name="operatingVoltage" value={categoryItemFormData.operatingVoltage} onChange={handleCategoryItemInputChange} placeholder="3.3V" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Input Voltage (Recommended)</label>
                  <input type="text" name="inputVoltageRecommended" value={categoryItemFormData.inputVoltageRecommended} onChange={handleCategoryItemInputChange} placeholder="7-12V" />
                </div>
                <div className="form-group half">
                  <label>Input Voltage (Limits)</label>
                  <input type="text" name="inputVoltageLimits" value={categoryItemFormData.inputVoltageLimits} onChange={handleCategoryItemInputChange} placeholder="5-20V" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Digital I/O Pins</label>
                  <input type="text" name="digitalIOPins" value={categoryItemFormData.digitalIOPins} onChange={handleCategoryItemInputChange} placeholder="34" />
                </div>
                <div className="form-group half">
                  <label>Analog Input Pins</label>
                  <input type="text" name="analogInputPins" value={categoryItemFormData.analogInputPins} onChange={handleCategoryItemInputChange} placeholder="18" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>PWM Channels</label>
                  <input type="text" name="pwmChannels" value={categoryItemFormData.pwmChannels} onChange={handleCategoryItemInputChange} placeholder="16" />
                </div>
                <div className="form-group half">
                  <label>Clock Speed</label>
                  <input type="text" name="clockSpeed" value={categoryItemFormData.clockSpeed} onChange={handleCategoryItemInputChange} placeholder="240 MHz" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Flash Memory</label>
                  <input type="text" name="flashMemory" value={categoryItemFormData.flashMemory} onChange={handleCategoryItemInputChange} placeholder="4 MB" />
                </div>
                <div className="form-group half">
                  <label>SRAM</label>
                  <input type="text" name="sram" value={categoryItemFormData.sram} onChange={handleCategoryItemInputChange} placeholder="520 KB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>EEPROM</label>
                  <input type="text" name="eeprom" value={categoryItemFormData.eeprom} onChange={handleCategoryItemInputChange} placeholder="No dedicated EEPROM" />
                </div>
                <div className="form-group half">
                  <label>USB Interface</label>
                  <input type="text" name="usbInterface" value={categoryItemFormData.usbInterface} onChange={handleCategoryItemInputChange} placeholder="USB-C" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Communication Interfaces</label>
                  <input type="text" name="communicationInterfaces" value={categoryItemFormData.communicationInterfaces} onChange={handleCategoryItemInputChange} placeholder="Wi-Fi, Bluetooth, UART, SPI, I2C" />
                </div>
                <div className="form-group half">
                  <label>Dimensions</label>
                  <input type="text" name="dimensions" value={categoryItemFormData.dimensions} onChange={handleCategoryItemInputChange} placeholder="60mm x 28mm x 13mm" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Weight</label>
                  <input type="text" name="weight" value={categoryItemFormData.weight} onChange={handleCategoryItemInputChange} placeholder="25g" />
                </div>
                <div className="form-group half">
                  <label>Operating Temperature</label>
                  <input type="text" name="operatingTemperature" value={categoryItemFormData.operatingTemperature} onChange={handleCategoryItemInputChange} placeholder="-40°C to 85°C" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Power Consumption</label>
                  <input type="text" name="powerConsumption" value={categoryItemFormData.powerConsumption} onChange={handleCategoryItemInputChange} placeholder="Variable, sleep modes available" />
                </div>
                <div className="form-group half">
                  <label>LED Indicators</label>
                  <input type="text" name="ledIndicators" value={categoryItemFormData.ledIndicators} onChange={handleCategoryItemInputChange} placeholder="Power LED, Status LED" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Material</label>
                  <input type="text" name="material" value={categoryItemFormData.material} onChange={handleCategoryItemInputChange} placeholder="High-grade PCB" />
                </div>
                <div className="form-group half">
                  <label>Warranty</label>
                  <input type="text" name="warranty" value={categoryItemFormData.warranty} onChange={handleCategoryItemInputChange} placeholder="1 year" />
                </div>
              </div>
            </div>

            {/* Custom Specifications */}
            {renderCustomSpecificationsUI()}

            {/* Package Points */}
            {renderPackagePointsUI()}

            <div className="form-section">
              <h3>Display Options</h3>
              <div className="form-group">
                <label>Delivery Speed</label>
                <div className="delivery-speed-options">
                  {['quick', 'normal', 'late'].map(speed => (
                    <label className="radio-container" key={speed}>
                      <input type="radio" name="deliverySpeed" value={speed} checked={categoryItemFormData.deliverySpeed === speed} onChange={handleCategoryItemInputChange} />
                      <span className="radio-label">{speed.charAt(0).toUpperCase() + speed.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <div className="checkbox-container">
                  <input type="checkbox" name="active" id="itemActive" checked={categoryItemFormData.active} onChange={handleCategoryItemInputChange} />
                  <label htmlFor="itemActive">Active (visible on website)</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isUploading}>{formMode === 'add' ? 'Add Item' : 'Update Item'}</button>
            </div>
          </form>
          {formMode === 'edit' && <SpecificationComponent itemData={{
            ...categoryItemFormData, 
            customSpecifications, 
            packagePoints
          }} itemType="categoryItems" />}
        </div>
      )}

      <div className="view-all-section">
        <button className="view-all-btn" onClick={handleViewAllItems}>View All Items</button>
      </div>

      {activeMode === 'trending' && (
        <div className="card table-card">
          <h2>Recently Added Trending Components</h2>
          {loading ? <div className="loading">Loading products...</div> : (
            <div className="products-list">
              {products.slice(0, 3).map(product => (
                <div className="product-item" key={product.id}>
                  <div className="product-preview">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="no-image">No Image</div>}</div>
                  <div className="product-details">
                    <h3>{product.name || 'Untitled Product'}</h3>
                    <p className="product-price">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <>
                          <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                          <span className="discount-badge">-{product.discountPercentage}%</span>
                        </>
                      ) : null}
                      <span className="selling-price">₹{product.price ? product.price.toFixed(2) : '0.00'}</span>
                    </p>
                    <p>{product.description || 'No description'}</p>
                    <div className="status-badge">
                      <span className={product.active ? 'active' : 'inactive'}>{product.active ? 'Active' : 'Inactive'}</span>
                      <span className={`delivery-badge ${product.deliverySpeed || 'normal'}`}>
                        {product.deliverySpeed ? product.deliverySpeed.charAt(0).toUpperCase() + product.deliverySpeed.slice(1) : 'Normal'}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className={`status-toggle-btn ${product.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(product.id, product.active, 'trending')}>
                      {product.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="edit-btn" onClick={() => handleEditItem(product, 'trending')}><i className="fas fa-edit"></i> Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteItem(product.id, product.imageUrl, 'trending')}><i className="fas fa-trash"></i> Delete</button>
                  </div>
                </div>
              ))}
              {products.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Trending Components ({products.length})</button></div>}
            </div>
          )}
        </div>
      )}

      {activeMode === 'categories' && (
        <div className="card table-card">
          <h2>Recently Added Categories</h2>
          {loading ? <div className="loading">Loading categories...</div> : (
            <div className="categories-list">
              {categories.slice(0, 3).map(category => (
                <div className="category-item" key={category.id}>
                  <div className="category-preview">{category.imageUrl ? <img src={category.imageUrl} alt={category.name} /> : <div className="no-image">No Image</div>}</div>
                  <div className="category-details">
                    <h3>{category.name || 'Untitled Category'}</h3>
                    <p>{category.description || 'No description'}</p>
                    <div className="status-badge"><span className={category.active ? 'active' : 'inactive'}>{category.active ? 'Active' : 'Inactive'}</span></div>
                  </div>
                  <div className="category-actions">
                    <button className={`status-toggle-btn ${category.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(category.id, category.active, 'categories')}>
                      {category.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="edit-btn" onClick={() => handleEditItem(category, 'categories')}><i className="fas fa-edit"></i> Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteItem(category.id, category.imageUrl, 'categories')}><i className="fas fa-trash"></i> Delete</button>
                  </div>
                </div>
              ))}
              {categories.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Categories ({categories.length})</button></div>}
            </div>
          )}
        </div>
      )}

      {activeMode === 'categoryItems' && (
        <div className="card table-card">
          <h2>Recently Added Category Items</h2>
          {loading ? <div className="loading">Loading category items...</div> : (
            <div className="category-items-list">
              {categoryItems.slice(0, 3).map(item => (
                <div className="category-item-row" key={item.id}>
                  <div className="item-preview">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="no-image">No Image</div>}</div>
                  <div className="item-details">
                    <h3>{item.name || 'Untitled Item'}</h3>
                    <p className="item-category">Category: {item.categoryName || 'Unknown'}</p>
                    <p className="item-price">
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <>
                          <span className="original-price">₹{item.originalPrice.toFixed(2)}</span>
                          <span className="discount-badge">-{item.discountPercentage}%</span>
                        </>
                      ) : null}
                      <span className="selling-price">₹{item.price ? item.price.toFixed(2) : '0.00'}</span>
                    </p>
                    <p>{item.description || 'No description'}</p>
                    <div className="status-badge">
                      <span className={item.active ? 'active' : 'inactive'}>{item.active ? 'Active' : 'Inactive'}</span>
                      <span className={`delivery-badge ${item.deliverySpeed || 'normal'}`}>
                        {item.deliverySpeed ? item.deliverySpeed.charAt(0).toUpperCase() + item.deliverySpeed.slice(1) : 'Normal'}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className={`status-toggle-btn ${item.active ? 'deactivate' : 'activate'}`} onClick={() => toggleItemStatus(item.id, item.active, 'categoryItems')}>
                      {item.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="edit-btn" onClick={() => handleEditItem(item, 'categoryItems')}><i className="fas fa-edit"></i> Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteItem(item.id, item.imageUrl, 'categoryItems')}><i className="fas fa-trash"></i> Delete</button>
                  </div>
                </div>
              ))}
              {categoryItems.length > 3 && <div className="view-more"><button className="view-more-btn" onClick={handleViewAllItems}>View All Category Items ({categoryItems.length})</button></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;