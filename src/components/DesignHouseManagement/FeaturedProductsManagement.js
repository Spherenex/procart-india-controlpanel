





// import React, { useState, useEffect } from 'react';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../firebase/firebaseConfig';
// import './FeaturedProductsManagement.css';

// export default function FeaturedProductsManagement() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentProduct, setCurrentProduct] = useState(null);
//   const [productForm, setProductForm] = useState({
//     id: '',
//     name: '',
//     category: '',
//     image: '',
//     price: 0,
//     sku: '',
//     description: '',
//     bulletFeatures: [''],
//     detailedFeatures: [{ title: '', description: '' }],
//     specifications: [{ name: '', value: '' }],
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
//   const [activeTab, setActiveTab] = useState('products');
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [categoryForm, setCategoryForm] = useState({ id: '', name: '', slug: '', icon: '', description: '' });

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const productsCollection = collection(db, 'products');
//       const productsSnapshot = await getDocs(productsCollection);
//       const productsList = productsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setProducts(productsList);
//       setLoading(false);
//     } catch (err) {
//       setError('Error loading products: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const categoriesCollection = collection(db, 'categories');
//       const categoriesSnapshot = await getDocs(categoriesCollection);
//       const categoriesList = categoriesSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setCategories(categoriesList);
//     } catch (err) {
//       setError('Error loading categories: ' + err.message);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProductForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handlePriceChange = (e) => {
//     const value = parseFloat(e.target.value) || 0;
//     setProductForm(prev => ({
//       ...prev,
//       price: value
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//     }
//   };

//   const handleBulletFeatureChange = (index, value) => {
//     const updatedFeatures = [...productForm.bulletFeatures];
//     updatedFeatures[index] = value;
//     setProductForm(prev => ({
//       ...prev,
//       bulletFeatures: updatedFeatures
//     }));
//   };

//   const addBulletFeature = () => {
//     setProductForm(prev => ({
//       ...prev,
//       bulletFeatures: [...prev.bulletFeatures, '']
//     }));
//   };

//   const removeBulletFeature = (index) => {
//     const updatedFeatures = [...productForm.bulletFeatures];
//     updatedFeatures.splice(index, 1);
//     setProductForm(prev => ({
//       ...prev,
//       bulletFeatures: updatedFeatures
//     }));
//   };

//   const handleDetailedFeatureChange = (index, field, value) => {
//     const updatedFeatures = [...productForm.detailedFeatures];
//     updatedFeatures[index] = {
//       ...updatedFeatures[index],
//       [field]: value
//     };
//     setProductForm(prev => ({
//       ...prev,
//       detailedFeatures: updatedFeatures
//     }));
//   };

//   const addDetailedFeature = () => {
//     setProductForm(prev => ({
//       ...prev,
//       detailedFeatures: [...prev.detailedFeatures, { title: '', description: '' }]
//     }));
//   };

//   const removeDetailedFeature = (index) => {
//     const updatedFeatures = [...productForm.detailedFeatures];
//     updatedFeatures.splice(index, 1);
//     setProductForm(prev => ({
//       ...prev,
//       detailedFeatures: updatedFeatures
//     }));
//   };

//   const handleSpecificationChange = (index, field, value) => {
//     const updatedSpecs = [...productForm.specifications];
//     updatedSpecs[index] = {
//       ...updatedSpecs[index],
//       [field]: value
//     };
//     setProductForm(prev => ({
//       ...prev,
//       specifications: updatedSpecs
//     }));
//   };

//   const addSpecification = () => {
//     setProductForm(prev => ({
//       ...prev,
//       specifications: [...prev.specifications, { name: '', value: '' }]
//     }));
//   };

//   const removeSpecification = (index) => {
//     const updatedSpecs = [...productForm.specifications];
//     updatedSpecs.splice(index, 1);
//     setProductForm(prev => ({
//       ...prev,
//       specifications: updatedSpecs
//     }));
//   };

//   const handleCreateProduct = () => {
//     setProductForm({
//       id: '',
//       name: '',
//       category: categories.length > 0 ? categories[0].id : '',
//       image: '',
//       price: 0,
//       sku: generateSKU(),
//       description: '',
//       bulletFeatures: [''],
//       detailedFeatures: [{ title: '', description: '' }],
//       specifications: [{ name: '', value: '' }],
//     });
//     setImageFile(null);
//     setImagePreview('');
//     setCurrentProduct(null);
//     setIsFormVisible(true);
//   };

//   const handleEditProduct = async (productId) => {
//     try {
//       setLoading(true);
//       const productDoc = doc(db, 'products', productId);
//       const productSnapshot = await getDoc(productDoc);
//       if (productSnapshot.exists()) {
//         const productData = productSnapshot.data();
//         setProductForm({
//           id: productSnapshot.id,
//           name: productData.name || '',
//           category: productData.category || '',
//           image: productData.image || '',
//           price: productData.price || 0,
//           sku: productData.sku || '',
//           description: productData.description || '',
//           bulletFeatures: productData.bulletFeatures && productData.bulletFeatures.length > 0
//             ? productData.bulletFeatures
//             : [''],
//           detailedFeatures: productData.detailedFeatures && productData.detailedFeatures.length > 0
//             ? productData.detailedFeatures
//             : [{ title: '', description: '' }],
//           specifications: productData.specifications && productData.specifications.length > 0
//             ? productData.specifications
//             : [{ name: '', value: '' }],
//         });
//         setImagePreview(productData.image || '');
//         setCurrentProduct(productSnapshot.id);
//         setIsFormVisible(true);
//       } else {
//         setError('Product not found');
//       }
//       setLoading(false);
//     } catch (err) {
//       setError('Error loading product: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       let imageUrl = productForm.image;
//       if (imageFile) {
//         const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
//         await uploadBytes(storageRef, imageFile);
//         imageUrl = await getDownloadURL(storageRef);
//       }
//       const productData = {
//         name: productForm.name,
//         category: productForm.category,
//         image: imageUrl,
//         price: parseFloat(productForm.price),
//         sku: productForm.sku,
//         description: productForm.description,
//         bulletFeatures: productForm.bulletFeatures.filter(feature => feature.trim() !== ''),
//         detailedFeatures: productForm.detailedFeatures.filter(
//           feature => feature.title.trim() !== '' || feature.description.trim() !== ''
//         ),
//         specifications: productForm.specifications.filter(
//           spec => spec.name.trim() !== '' || spec.value.trim() !== ''
//         ),
//       };
//       if (currentProduct) {
//         const productDoc = doc(db, 'products', currentProduct);
//         await updateDoc(productDoc, productData);
//         setProducts(prev =>
//           prev.map(product =>
//             product.id === currentProduct ? { id: currentProduct, ...productData } : product
//           )
//         );
//       } else {
//         const docRef = await addDoc(collection(db, 'products'), productData);
//         setProducts(prev => [...prev, { id: docRef.id, ...productData }]);
//       }
//       setIsFormVisible(false);
//       setCurrentProduct(null);
//       setImageFile(null);
//       setImagePreview('');
//       setLoading(false);
//       alert(currentProduct ? 'Product updated successfully!' : 'Product created successfully!');
//     } catch (err) {
//       setError('Error saving product: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const confirmDeleteProduct = (productId) => {
//     setCurrentProduct(productId);
//     setIsDeleteModalVisible(true);
//   };

//   const handleDeleteProduct = async () => {
//     try {
//       if (!currentProduct) return;
//       setLoading(true);
//       await deleteDoc(doc(db, 'products', currentProduct));
//       setProducts(prev => prev.filter(product => product.id !== currentProduct));
//       setIsDeleteModalVisible(false);
//       setCurrentProduct(null);
//       setLoading(false);
//       alert('Product deleted successfully!');
//     } catch (err) {
//       setError('Error deleting product: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const generateSKU = () => {
//     const prefix = 'PRD';
//     const timestamp = Date.now().toString().slice(-7);
//     return `${prefix}${timestamp}`;
//   };

//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.sku.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleCategoryChange = (e) => {
//     const { name, value } = e.target;
//     setCategoryForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (name === 'name') {
//       const slug = value
//         .toLowerCase()
//         .replace(/[^\w\s-]/g, '')
//         .replace(/[\s_-]+/g, '-')
//         .replace(/^-+|-+$/g, '');
//       setCategoryForm(prev => ({
//         ...prev,
//         slug
//       }));
//     }
//   };

//   const handleCategorySubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       const categoryData = {
//         name: categoryForm.name,
//         slug: categoryForm.slug,
//         icon: categoryForm.icon || '📦',
//         description: categoryForm.description || 'Category description',
//       };
//       if (categoryForm.id) {
//         await updateDoc(doc(db, 'categories', categoryForm.id), categoryData);
//         setCategories(prev =>
//           prev.map(category =>
//             category.id === categoryForm.id ? { id: categoryForm.id, ...categoryData } : category
//           )
//         );
//       } else {
//         const docRef = await addDoc(collection(db, 'categories'), categoryData);
//         setCategories(prev => [...prev, { id: docRef.id, ...categoryData }]);
//       }
//       setCategoryForm({ id: '', name: '', slug: '', icon: '', description: '' });
//       setLoading(false);
//       alert(categoryForm.id ? 'Category updated successfully!' : 'Category created successfully!');
//     } catch (err) {
//       setError('Error saving category: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const handleEditCategory = (category) => {
//     setCategoryForm({
//       id: category.id,
//       name: category.name,
//       slug: category.slug,
//       icon: category.icon || '',
//       description: category.description || '',
//     });
//   };

//   const handleDeleteCategory = async (categoryId) => {
//     if (!window.confirm('Are you sure you want to delete this category? This will NOT delete associated products.')) {
//       return;
//     }
//     try {
//       setLoading(true);
//       await deleteDoc(doc(db, 'categories', categoryId));
//       setCategories(prev => prev.filter(category => category.id !== categoryId));
//       setLoading(false);
//     } catch (err) {
//       setError('Error deleting category: ' + err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       <header className="admin-header">
//         <h1>Product Management Dashboard</h1>
//       </header>
//       <div className="admin-navigation">
//         <button
//           className={`nav-button ${activeTab === 'products' ? 'active' : ''}`}
//           onClick={() => setActiveTab('products')}
//           type="button"
//           aria-label="View Products"
//         >
//           Products
//         </button>
//         <button
//           className={`nav-button ${activeTab === 'categories' ? 'active' : ''}`}
//           onClick={() => setActiveTab('categories')}
//           type="button"
//           aria-label="View Categories"
//         >
//           Categories
//         </button>
//       </div>
//       {error && (
//         <div className="error-message">
//           {error}
//           <button
//             onClick={() => setError(null)}
//             type="button"
//             aria-label="Dismiss error message"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}
//       {activeTab === 'products' && (
//         <div className="products-section">
//           <div className="section-header">
//             <h2>Manage Products</h2>
//             <button
//               className="add-button"
//               onClick={handleCreateProduct}
//               type="button"
//               aria-label="Add new product"
//             >
//               Add New Product
//             </button>
//           </div>
//           <div className="filter-section">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Search by name or SKU..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 aria-label="Search products"
//               />
//             </div>
//             <div className="category-filter">
//               <select
//                 value={filterCategory}
//                 onChange={(e) => setFilterCategory(e.target.value)}
//                 aria-label="Filter by category"
//               >
//                 <option value="all">All Categories</option>
//                 {categories.map(category => (
//                   <option key={category.id} value={category.id}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           {loading ? (
//             <div className="loading">Loading products...</div>
//           ) : (
//             <div className="products-table-wrapper">
//               <table className="products-table">
//                 <thead>
//                   <tr>
//                     <th>Image</th>
//                     <th>Name</th>
//                     <th>SKU</th>
//                     <th>Category</th>
//                     <th>Price (₹)</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredProducts.length > 0 ? (
//                     filteredProducts.map(product => (
//                       <tr key={product.id}>
//                         <td>
//                           <div className="product-image-thumbnail">
//                             <img src={product.image} alt={product.name} />
//                           </div>
//                         </td>
//                         <td>{product.name}</td>
//                         <td>{product.sku}</td>
//                         <td>
//                           {categories.find(cat => cat.id === product.category)?.name || 'Uncategorized'}
//                         </td>
//                         <td>{product.price.toFixed(2)}</td>
//                         <td className="action-buttons">
//                           <button
//                             className="edit-button"
//                             onClick={() => handleEditProduct(product.id)}
//                             type="button"
//                             aria-label={`Edit product ${product.name}`}
//                           >
//                             Edit
//                           </button>
//                           <button
//                             className="delete-button"
//                             onClick={() => confirmDeleteProduct(product.id)}
//                             type="button"
//                             aria-label={`Delete product ${product.name}`}
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="no-results">
//                         No products found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//           {isFormVisible && (
//             <div className="modal-overlay">
//               <div className="product-form-modal">
//                 <div className="modal-header">
//                   <h3>{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
//                   <button
//                     className="close-button"
//                     onClick={() => setIsFormVisible(false)}
//                     type="button"
//                     aria-label="Close product form"
//                   >
//                     ×
//                   </button>
//                 </div>
//                 <form className="product-form" onSubmit={handleSubmit}>
//                   <div className="form-tabs">
//                     <button type="button" className="form-tab active" aria-label="Basic Info tab">
//                       Basic Info
//                     </button>
//                     <button type="button" className="form-tab" aria-label="Description & Features tab">
//                       Description & Features
//                     </button>
//                     <button type="button" className="form-tab" aria-label="Specifications tab">
//                       Specifications
//                     </button>
//                   </div>
//                   <div className="form-section">
//                     <div className="form-group">
//                       <label htmlFor="name">Product Name</label>
//                       <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={productForm.name}
//                         onChange={handleInputChange}
//                         required
//                         aria-label="Product name"
//                       />
//                     </div>
//                     <div className="form-row">
//                       <div className="form-group">
//                         <label htmlFor="sku">SKU</label>
//                         <input
//                           type="text"
//                           id="sku"
//                           name="sku"
//                           value={productForm.sku} // Fixed: Changed ProductForm to productForm
//                           onChange={handleInputChange}
//                           required
//                           aria-label="Product SKU"
//                         />
//                       </div>
//                       <div className="form-group">
//                         <label htmlFor="price">Price (₹)</label>
//                         <input
//                           type="number"
//                           id="price"
//                           name="price"
//                           min="0"
//                           step="0.01"
//                           value={productForm.price}
//                           onChange={handlePriceChange}
//                           required
//                           aria-label="Product price"
//                         />
//                       </div>
//                     </div>
//                     <div className="form-group">
//                       <label htmlFor="category">Category</label>
//                       <select
//                         id="category"
//                         name="category"
//                         value={productForm.category}
//                         onChange={handleInputChange}
//                         required
//                         aria-label="Product category"
//                       >
//                         <option value="">Select a category</option>
//                         {categories.map(category => (
//                           <option key={category.id} value={category.id}>
//                             {category.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="form-group">
//                       <label htmlFor="image">Product Image</label>
//                       <input
//                         type="file"
//                         id="image"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         required={!currentProduct}
//                         aria-label="Upload product image"
//                       />
//                       <div className="image-preview">
//                         {imagePreview && <img src={imagePreview} alt="Product preview" />}
//                       </div>
//                     </div>
//                     <div className="form-group">
//                       <label htmlFor="description">Product Description</label>
//                       <textarea
//                         id="description"
//                         name="description"
//                         value={productForm.description}
//                         onChange={handleInputChange}
//                         rows="4"
//                         aria-label="Product description"
//                       ></textarea>
//                     </div>
//                     <div className="form-group">
//                       <label>Bullet Features</label>
//                       {productForm.bulletFeatures.map((feature, index) => (
//                         <div key={index} className="bullet-feature-input">
//                           <input
//                             type="text"
//                             value={feature}
//                             onChange={(e) => handleBulletFeatureChange(index, e.target.value)}
//                             placeholder="Enter feature point"
//                             aria-label={`Bullet feature ${index + 1}`}
//                           />
//                           <button
//                             type="button"
//                             className="remove-button"
//                             onClick={() => removeBulletFeature(index)}
//                             disabled={productForm.bulletFeatures.length <= 1}
//                             aria-label={`Remove bullet feature ${index + 1}`}
//                           >
//                             -
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         className="add-button"
//                         onClick={addBulletFeature}
//                         aria-label="Add bullet feature"
//                       >
//                         Add Feature Point
//                       </button>
//                     </div>
//                     <div className="form-group">
//                       <label>Detailed Features</label>
//                       {productForm.detailedFeatures.map((feature, index) => (
//                         <div key={index} className="detailed-feature-input">
//                           <input
//                             type="text"
//                             value={feature.title}
//                             onChange={(e) => handleDetailedFeatureChange(index, 'title', e.target.value)}
//                             placeholder="Feature title"
//                             aria-label={`Detailed feature title ${index + 1}`}
//                           />
//                           <textarea
//                             value={feature.description}
//                             onChange={(e) => handleDetailedFeatureChange(index, 'description', e.target.value)}
//                             placeholder="Feature description"
//                             rows="3"
//                             aria-label={`Detailed feature description ${index + 1}`}
//                           ></textarea>
//                           <button
//                             type="button"
//                             className="remove-button"
//                             onClick={() => removeDetailedFeature(index)}
//                             disabled={productForm.detailedFeatures.length <= 1}
//                             aria-label={`Remove detailed feature ${index + 1}`}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         className="add-button"
//                         onClick={addDetailedFeature}
//                         aria-label="Add detailed feature"
//                       >
//                         Add Detailed Feature
//                       </button>
//                     </div>
//                     <div className="form-group">
//                       <label>Specifications</label>
//                       <div className="specifications-table">
//                         <div className="spec-header">
//                           <div>Parameter</div>
//                           <div>Specification</div>
//                           <div>Action</div>
//                         </div>
//                         {productForm.specifications.map((spec, index) => (
//                           <div key={index} className="spec-row">
//                             <div>
//                               <input
//                                 type="text"
//                                 value={spec.name}
//                                 onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
//                                 placeholder="Parameter name"
//                                 aria-label={`Specification parameter ${index + 1}`}
//                               />
//                             </div>
//                             <div>
//                               <input
//                                 type="text"
//                                 value={spec.value}
//                                 onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
//                                 placeholder="Specification value"
//                                 aria-label={`Specification value ${index + 1}`}
//                               />
//                             </div>
//                             <div>
//                               <button
//                                 type="button"
//                                 className="remove-button"
//                                 onClick={() => removeSpecification(index)}
//                                 disabled={productForm.specifications.length <= 1}
//                                 aria-label={`Remove specification ${index + 1}`}
//                               >
//                                 -
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                       <button
//                         type="button"
//                         className="add-button"
//                         onClick={addSpecification}
//                         aria-label="Add specification"
//                       >
//                         Add Specification
//                       </button>
//                     </div>
//                     <div className="form-actions">
//                       <button
//                         type="button"
//                         className="cancel-button"
//                         onClick={() => setIsFormVisible(false)}
//                         aria-label="Cancel product form"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="save-button"
//                         disabled={loading}
//                         aria-label={currentProduct ? 'Update product' : 'Add product'}
//                       >
//                         {loading ? 'Saving...' : (currentProduct ? 'Update Product' : 'Add Product')}
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//           {isDeleteModalVisible && (
//             <div className="modal-overlay">
//               <div className="delete-confirmation-modal">
//                 <h3>Confirm Deletion</h3>
//                 <p>Are you sure you want to delete this product? This action cannot be undone.</p>
//                 <div className="modal-actions">
//                   <button
//                     className="cancel-button"
//                     onClick={() => setIsDeleteModalVisible(false)}
//                     disabled={loading}
//                     type="button"
//                     aria-label="Cancel deletion"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="delete-button"
//                     onClick={handleDeleteProduct}
//                     disabled={loading}
//                     type="button"
//                     aria-label="Confirm delete product"
//                   >
//                     {loading ? 'Deleting...' : 'Delete Product'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//       {activeTab === 'categories' && (
//         <div className="categories-section">
//           <div className="section-header">
//             <h2>Manage Categories</h2>
//           </div>
//           <div className="categories-container">
//             <div className="category-form-container">
//               <h3>{categoryForm.id ? 'Edit Category' : 'Add New Category'}</h3>
//               <form className="category-form" onSubmit={handleCategorySubmit}>
//                 <div className="form-group">
//                   <label htmlFor="categoryName">Category Name</label>
//                   <input
//                     type="text"
//                     id="categoryName"
//                     name="name"
//                     value={categoryForm.name}
//                     onChange={handleCategoryChange}
//                     required
//                     aria-label="Category name"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="categorySlug">Category Slug</label>
//                   <input
//                     type="text"
//                     id="categorySlug"
//                     name="slug"
//                     value={categoryForm.slug}
//                     onChange={handleCategoryChange}
//                     required
//                     aria-label="Category slug"
//                   />
//                   <small>Use lowercase letters, numbers, and hyphens only.</small>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="categoryIcon">Category Icon (Emoji)</label>
//                   <input
//                     type="text"
//                     id="categoryIcon"
//                     name="icon"
//                     value={categoryForm.icon}
//                     onChange={handleCategoryChange}
//                     placeholder="e.g., 📦"
//                     aria-label="Category icon"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="categoryDescription">Category Description</label>
//                   <textarea
//                     id="categoryDescription"
//                     name="description"
//                     value={categoryForm.description}
//                     onChange={handleCategoryChange}
//                     rows="3"
//                     aria-label="Category description"
//                   ></textarea>
//                 </div>
//                 <div className="form-actions">
//                   {categoryForm.id && (
//                     <button
//                       type="button"
//                       className="cancel-button"
//                       onClick={() => setCategoryForm({ id: '', name: '', slug: '', icon: '', description: '' })}
//                       aria-label="Cancel category edit"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                   <button
//                     type="submit"
//                     className="save-button"
//                     disabled={loading}
//                     aria-label={categoryForm.id ? 'Update category' : 'Add category'}
//                   >
//                     {loading ? 'Saving...' : (categoryForm.id ? 'Update Category' : 'Add Category')}
//                   </button>
//                 </div>
//               </form>
//             </div>
//             <div className="categories-list-container">
//               <h3>Existing Categories</h3>
//               {loading ? (
//                 <div className="loading">Loading categories...</div>
//               ) : (
//                 <div className="categories-list">
//                   {categories.length > 0 ? (
//                     <table className="categories-table">
//                       <thead>
//                         <tr>
//                           <th>Name</th>
//                           <th>Slug</th>
//                           <th>Icon</th>
//                           <th>Description</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {categories.map(category => (
//                           <tr key={category.id}>
//                             <td>{category.name}</td>
//                             <td>{category.slug}</td>
//                             <td>{category.icon || '📦'}</td>
//                             <td>{category.description || 'No description'}</td>
//                             <td className="action-buttons">
//                               <button
//                                 className="edit-button"
//                                 onClick={() => handleEditCategory(category)}
//                                 type="button"
//                                 aria-label={`Edit category ${category.name}`}
//                               >
//                                 Edit
//                               </button>
//                               <button
//                                 className="delete-button"
//                                 onClick={() => handleDeleteCategory(category.id)}
//                                 type="button"
//                                 aria-label={`Delete category ${category.name}`}
//                               >
//                                 Delete
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="no-results">No categories found.</div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import './FeaturedProductsManagement.css';

export default function FeaturedProductsManagement() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [designCategories, setDesignCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    category: '',
    image: '',
    price: 0,
    sku: '',
    description: '',
    bulletFeatures: [''],
    detailedFeatures: [{ title: '', description: '' }],
    specifications: [{ name: '', value: '' }],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', slug: '', icon: '', description: '' });

  // Collection references
  const PRODUCTS_COLLECTION = 'featuredProducts';
  const CATEGORIES_COLLECTION = 'designCategories';

  useEffect(() => {
    fetchFeaturedProducts();
    fetchDesignCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(db, PRODUCTS_COLLECTION);
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || '',
        sku: doc.data().sku || '',
        price: doc.data().price || 0,
      }));
      setFeaturedProducts(productsList);
      setLoading(false);
    } catch (err) {
      setError('Error loading featured products: ' + err.message);
      setLoading(false);
    }
  };

  const fetchDesignCategories = async () => {
    try {
      const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDesignCategories(categoriesList);
    } catch (err) {
      setError('Error loading design categories: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setProductForm(prev => ({
      ...prev,
      price: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleBulletFeatureChange = (index, value) => {
    const updatedFeatures = [...productForm.bulletFeatures];
    updatedFeatures[index] = value;
    setProductForm(prev => ({
      ...prev,
      bulletFeatures: updatedFeatures
    }));
  };

  const addBulletFeature = () => {
    setProductForm(prev => ({
      ...prev,
      bulletFeatures: [...prev.bulletFeatures, '']
    }));
  };

  const removeBulletFeature = (index) => {
    const updatedFeatures = [...productForm.bulletFeatures];
    updatedFeatures.splice(index, 1);
    setProductForm(prev => ({
      ...prev,
      bulletFeatures: updatedFeatures
    }));
  };

  const handleDetailedFeatureChange = (index, field, value) => {
    const updatedFeatures = [...productForm.detailedFeatures];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    setProductForm(prev => ({
      ...prev,
      detailedFeatures: updatedFeatures
    }));
  };

  const addDetailedFeature = () => {
    setProductForm(prev => ({
      ...prev,
      detailedFeatures: [...prev.detailedFeatures, { title: '', description: '' }]
    }));
  };

  const removeDetailedFeature = (index) => {
    const updatedFeatures = [...productForm.detailedFeatures];
    updatedFeatures.splice(index, 1);
    setProductForm(prev => ({
      ...prev,
      detailedFeatures: updatedFeatures
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...productForm.specifications];
    updatedSpecs[index] = {
      ...updatedSpecs[index],
      [field]: value
    };
    setProductForm(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));
  };

  const addSpecification = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...productForm.specifications];
    updatedSpecs.splice(index, 1);
    setProductForm(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));
  };

  const handleCreateProduct = () => {
    setProductForm({
      id: '',
      name: '',
      category: designCategories.length > 0 ? designCategories[0].id : '',
      image: '',
      price: 0,
      sku: generateSKU(),
      description: '',
      bulletFeatures: [''],
      detailedFeatures: [{ title: '', description: '' }],
      specifications: [{ name: '', value: '' }],
    });
    setImageFile(null);
    setImagePreview('');
    setCurrentProduct(null);
    setIsFormVisible(true);
  };

  const handleEditProduct = async (productId) => {
    try {
      setLoading(true);
      const productDoc = doc(db, PRODUCTS_COLLECTION, productId);
      const productSnapshot = await getDoc(productDoc);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        setProductForm({
          id: productSnapshot.id,
          name: productData.name || '',
          category: productData.category || '',
          image: productData.image || '',
          price: productData.price || 0,
          sku: productData.sku || '',
          description: productData.description || '',
          bulletFeatures: productData.bulletFeatures && productData.bulletFeatures.length > 0
            ? productData.bulletFeatures
            : [''],
          detailedFeatures: productData.detailedFeatures && productData.detailedFeatures.length > 0
            ? productData.detailedFeatures
            : [{ title: '', description: '' }],
          specifications: productData.specifications && productData.specifications.length > 0
            ? productData.specifications
            : [{ name: '', value: '' }],
        });
        setImagePreview(productData.image || '');
        setCurrentProduct(productSnapshot.id);
        setIsFormVisible(true);
      } else {
        setError('Featured product not found');
      }
      setLoading(false);
    } catch (err) {
      setError('Error loading featured product: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let imageUrl = productForm.image;
      if (imageFile) {
        const storageRef = ref(storage, `featured-product-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      const productData = {
        name: productForm.name,
        category: productForm.category,
        image: imageUrl,
        price: parseFloat(productForm.price) || 0,
        sku: productForm.sku,
        description: productForm.description,
        bulletFeatures: productForm.bulletFeatures.filter(feature => feature.trim() !== ''),
        detailedFeatures: productForm.detailedFeatures.filter(
          feature => feature.title.trim() !== '' || feature.description.trim() !== ''
        ),
        specifications: productForm.specifications.filter(
          spec => spec.name.trim() !== '' || spec.value.trim() !== ''
        ),
      };
      if (currentProduct) {
        const productDoc = doc(db, PRODUCTS_COLLECTION, currentProduct);
        await updateDoc(productDoc, productData);
        setFeaturedProducts(prev =>
          prev.map(product =>
            product.id === currentProduct ? { id: currentProduct, ...productData } : product
          )
        );
      } else {
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
        setFeaturedProducts(prev => [...prev, { id: docRef.id, ...productData }]);
      }
      setIsFormVisible(false);
      setCurrentProduct(null);
      setImageFile(null);
      setImagePreview('');
      setLoading(false);
      alert(currentProduct ? 'Featured product updated successfully!' : 'Featured product created successfully!');
    } catch (err) {
      setError('Error saving featured product: ' + err.message);
      setLoading(false);
    }
  };

  const confirmDeleteProduct = (productId) => {
    setCurrentProduct(productId);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteProduct = async () => {
    try {
      if (!currentProduct) return;
      setLoading(true);
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, currentProduct));
      setFeaturedProducts(prev => prev.filter(product => product.id !== currentProduct));
      setIsDeleteModalVisible(false);
      setCurrentProduct(null);
      setLoading(false);
      alert('Featured product deleted successfully!');
    } catch (err) {
      setError('Error deleting featured product: ' + err.message);
      setLoading(false);
    }
  };

  const generateSKU = () => {
    const prefix = 'FPROD';
    const timestamp = Date.now().toString().slice(-7);
    return `${prefix}${timestamp}`;
  };

  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCategoryForm(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const categoryData = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        icon: categoryForm.icon || '🎨',
        description: categoryForm.description || 'Category description',
      };
      if (categoryForm.id) {
        await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryForm.id), categoryData);
        setDesignCategories(prev =>
          prev.map(category =>
            category.id === categoryForm.id ? { id: categoryForm.id, ...categoryData } : category
          )
        );
      } else {
        const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);
        setDesignCategories(prev => [...prev, { id: docRef.id, ...categoryData }]);
      }
      setCategoryForm({ id: '', name: '', slug: '', icon: '', description: '' });
      setLoading(false);
      alert(categoryForm.id ? 'Design Category updated successfully!' : 'Design Category created successfully!');
    } catch (err) {
      setError('Error saving design category: ' + err.message);
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this design category? This will NOT delete associated featured products.')) {
      return;
    }
    try {
      setLoading(true);
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
      setDesignCategories(prev => prev.filter(category => category.id !== categoryId));
      setLoading(false);
    } catch (err) {
      setError('Error deleting design category: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Featured Products Management</h1>
      </header>
      <div className="admin-navigation">
        <button
          className={`nav-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
          type="button"
          aria-label="View Featured Products"
        >
          Featured Products
        </button>
        <button
          className={`nav-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          type="button"
          aria-label="View Design Categories"
        >
          Design Categories
        </button>
      </div>
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => setError(null)}
            type="button"
            aria-label="Dismiss error message"
          >
            Dismiss
          </button>
        </div>
      )}
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <h2>Manage Featured Products</h2>
            <button
              className="add-button"
              onClick={handleCreateProduct}
              type="button"
              aria-label="Add new featured product"
            >
              Add New Featured Product
            </button>
          </div>
          <div className="filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search featured products"
              />
            </div>
            <div className="category-filter">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {designCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="loading">Loading featured products...</div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-image-thumbnail">
                            <img src={product.image} alt={product.name} />
                          </div>
                        </td>
                        <td>{product.name}</td>
                        <td>{product.sku}</td>
                        <td>
                          {designCategories.find(cat => cat.id === product.category)?.name || 'Uncategorized'}
                        </td>
                        <td>{(product.price || 0).toFixed(2)}</td>
                        <td className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEditProduct(product.id)}
                            type="button"
                            aria-label={`Edit featured product ${product.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => confirmDeleteProduct(product.id)}
                            type="button"
                            aria-label={`Delete featured product ${product.name}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No featured products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {isFormVisible && (
            <div className="modal-overlay">
              <div className="product-form-modal">
                <div className="modal-header">
                  <h3>{currentProduct ? 'Edit Featured Product' : 'Add New Featured Product'}</h3>
                  <button
                    className="close-button"
                    onClick={() => setIsFormVisible(false)}
                    type="button"
                    aria-label="Close featured product form"
                  >
                    ×
                  </button>
                </div>
                <form className="product-form" onSubmit={handleSubmit}>
                  <div className="form-tabs">
                    <button type="button" className="form-tab active" aria-label="Basic Info tab">
                      Basic Info
                    </button>
                    <button type="button" className="form-tab" aria-label="Description & Features tab">
                      Description & Features
                    </button>
                    <button type="button" className="form-tab" aria-label="Specifications tab">
                      Specifications
                    </button>
                  </div>
                  <div className="form-section">
                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={productForm.name}
                        onChange={handleInputChange}
                        required
                        aria-label="Product name"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sku">SKU</label>
                        <input
                          type="text"
                          id="sku"
                          name="sku"
                          value={productForm.sku}
                          onChange={handleInputChange}
                          required
                          aria-label="Product SKU"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="price">Price (₹)</label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={handlePriceChange}
                          required
                          aria-label="Product price"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Product Category</label>
                      <select
                        id="category"
                        name="category"
                        value={productForm.category}
                        onChange={handleInputChange}
                        required
                        aria-label="Product category"
                      >
                        <option value="">Select a category</option>
                        {designCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="image">Product Image</label>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!currentProduct}
                        aria-label="Upload product image"
                      />
                      <div className="image-preview">
                        {imagePreview && <img src={imagePreview} alt="Product preview" />}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Product Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={productForm.description}
                        onChange={handleInputChange}
                        rows="4"
                        aria-label="Product description"
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Bullet Features</label>
                      {productForm.bulletFeatures.map((feature, index) => (
                        <div key={index} className="bullet-feature-input">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleBulletFeatureChange(index, e.target.value)}
                            placeholder="Enter feature point"
                            aria-label={`Bullet feature ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() => removeBulletFeature(index)}
                            disabled={productForm.bulletFeatures.length <= 1}
                            aria-label={`Remove bullet feature ${index + 1}`}
                          >
                            -
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-button"
                        onClick={addBulletFeature}
                        aria-label="Add bullet feature"
                      >
                        Add Feature Point
                      </button>
                    </div>
                    <div className="form-group">
                      <label>Detailed Features</label>
                      {productForm.detailedFeatures.map((feature, index) => (
                        <div key={index} className="detailed-feature-input">
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => handleDetailedFeatureChange(index, 'title', e.target.value)}
                            placeholder="Feature title"
                            aria-label={`Detailed feature title ${index + 1}`}
                          />
                          <textarea
                            value={feature.description}
                            onChange={(e) => handleDetailedFeatureChange(index, 'description', e.target.value)}
                            placeholder="Feature description"
                            rows="3"
                            aria-label={`Detailed feature description ${index + 1}`}
                          ></textarea>
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() => removeDetailedFeature(index)}
                            disabled={productForm.detailedFeatures.length <= 1}
                            aria-label={`Remove detailed feature ${index + 1}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-button"
                        onClick={addDetailedFeature}
                        aria-label="Add detailed feature"
                      >
                        Add Detailed Feature
                      </button>
                    </div>
                    <div className="form-group">
                      <label>Specifications</label>
                      <div className="specifications-table">
                        <div className="spec-header">
                          <div>Parameter</div>
                          <div>Specification</div>
                          <div>Action</div>
                        </div>
                        {productForm.specifications.map((spec, index) => (
                          <div key={index} className="spec-row">
                            <div>
                              <input
                                type="text"
                                value={spec.name}
                                onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                                placeholder="Parameter name"
                                aria-label={`Specification parameter ${index + 1}`}
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                placeholder="Specification value"
                                aria-label={`Specification value ${index + 1}`}
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                className="remove-button"
                                onClick={() => removeSpecification(index)}
                                disabled={productForm.specifications.length <= 1}
                                aria-label={`Remove specification ${index + 1}`}
                              >
                                -
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="add-button"
                        onClick={addSpecification}
                        aria-label="Add specification"
                      >
                        Add Specification
                      </button>
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setIsFormVisible(false)}
                        aria-label="Cancel product form"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="save-button"
                        disabled={loading}
                        aria-label={currentProduct ? 'Update product' : 'Add product'}
                      >
                        {loading ? 'Saving...' : (currentProduct ? 'Update Product' : 'Add Product')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isDeleteModalVisible && (
            <div className="modal-overlay">
              <div className="delete-confirmation-modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this featured product? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setIsDeleteModalVisible(false)}
                    disabled={loading}
                    type="button"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    className="delete-button"
                    onClick={handleDeleteProduct}
                    disabled={loading}
                    type="button"
                    aria-label="Confirm delete product"
                  >
                    {loading ? 'Deleting...' : 'Delete Product'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'categories' && (
        <div className="categories-section">
          <div className="section-header">
            <h2>Manage Design Categories</h2>
          </div>
          <div className="categories-container">
            <div className="category-form-container">
              <h3>{categoryForm.id ? 'Edit Design Category' : 'Add New Design Category'}</h3>
              <form className="category-form" onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label htmlFor="categoryName">Category Name</label>
                  <input
                    type="text"
                    id="categoryName"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    required
                    aria-label="Category name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categorySlug">Category Slug</label>
                  <input
                    type="text"
                    id="categorySlug"
                    name="slug"
                    value={categoryForm.slug}
                    onChange={handleCategoryChange}
                    required
                    aria-label="Category slug"
                  />
                  <small>Use lowercase letters, numbers, and hyphens only.</small>
                </div>
                <div className="form-group">
                  <label htmlFor="categoryIcon">Category Icon (Emoji)</label>
                  <input
                    type="text"
                    id="categoryIcon"
                    name="icon"
                    value={categoryForm.icon}
                    onChange={handleCategoryChange}
                    placeholder="e.g., 🎨"
                    aria-label="Category icon"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryDescription">Category Description</label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    rows="3"
                    aria-label="Category description"
                  ></textarea>
                </div>
                <div className="form-actions">
                  {categoryForm.id && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setCategoryForm({ id: '', name: '', slug: '', icon: '', description: '' })}
                      aria-label="Cancel category edit"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                    aria-label={categoryForm.id ? 'Update category' : 'Add category'}
                  >
                    {loading ? 'Saving...' : (categoryForm.id ? 'Update Category' : 'Add Category')}
                  </button>
                </div>
              </form>
            </div>
            <div className="categories-list-container">
              <h3>Existing Design Categories</h3>
              {loading ? (
                <div className="loading">Loading categories...</div>
              ) : (
                <div className="categories-list">
                  {designCategories.length > 0 ? (
                    <table className="categories-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Icon</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designCategories.map(category => (
                          <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>{category.slug}</td>
                            <td>{category.icon || '🎨'}</td>
                            <td>{category.description || 'No description'}</td>
                            <td className="action-buttons">
                              <button
                                className="edit-button"
                                onClick={() => handleEditCategory(category)}
                                type="button"
                                aria-label={`Edit category ${category.name}`}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteCategory(category.id)}
                                type="button"
                                aria-label={`Delete category ${category.name}`}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-results">No design categories found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}