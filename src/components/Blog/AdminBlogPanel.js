// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaImage } from 'react-icons/fa';
// import './AdminBlogPanel.css';

// const AdminBlogPanel = () => {
//     // State for blog settings
//     const [blogSettings, setBlogSettings] = useState({
//         title: 'ZappCart Blog',
//         subtitle: 'Fresh insights, recipes, and meat knowledge',
//         description: 'Discover the latest news, cooking tips, and meat expertise from ZappCart.',
//         headerImage: '',
//         headerImageURL: '',
//         categories: ['Recipes', 'Meat Guide', 'Health & Nutrition', 'Company News']
//     });
    
//     // State for blog posts and editing
//     const [articles, setArticles] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [editingArticle, setEditingArticle] = useState(null);
//     const [isAddingNew, setIsAddingNew] = useState(false);
//     const [uploadedImage, setUploadedImage] = useState(null);
//     const [uploadedImageURL, setUploadedImageURL] = useState('');
//     const [headerImageFile, setHeaderImageFile] = useState(null);
//     const [editingSettings, setEditingSettings] = useState(false);
//     const [newCategory, setNewCategory] = useState('');
//     const [newArticle, setNewArticle] = useState({
//         image: '',
//         imageURL: '',
//         category: '',
//         date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//         title: '',
//         excerpt: ''
//     });

//     // Image options for predefined templates
//     const imageOptions = ['raspberry-pi', 'arduino', 'sensors', 'circuit-board', 'robotics'];
    
//     // References
//     const headerImageInput = useRef(null);
//     const articleImageInput = useRef(null);

//     // Firebase references
//     const db = getFirestore();
//     const storage = getStorage();
//     const articlesCollection = collection(db, 'articles');

//     // Fetch articles and settings from Firestore
//     useEffect(() => {
//         const fetchBlogData = async () => {
//             try {
//                 // First get blog settings
//                 const settingsDoc = await getDoc(doc(db, 'settings', 'blog'));
//                 if (settingsDoc.exists()) {
//                     setBlogSettings({
//                         ...blogSettings,
//                         ...settingsDoc.data()
//                     });
//                 }
                
//                 // Then get articles
//                 const querySnapshot = await getDocs(articlesCollection);
//                 const articlesData = querySnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data()
//                 }));
//                 setArticles(articlesData);
//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching blog data:', error);
//                 setLoading(false);
//             }
//         };

//         fetchBlogData();
//     }, []);

//     // Handle uploading image to Firebase Storage
//     const uploadImageToStorage = async (file, path) => {
//         if (!file) return null;
        
//         try {
//             const fileExtension = file.name.split('.').pop();
//             const fileName = `${path}-${Date.now()}.${fileExtension}`;
//             const storageRef = ref(storage, `blog-images/${fileName}`);
            
//             await uploadBytes(storageRef, file);
//             const downloadURL = await getDownloadURL(storageRef);
            
//             return downloadURL;
//         } catch (error) {
//             console.error('Error uploading image:', error);
//             return null;
//         }
//     };

//     // Handle edit button click
//     const handleEdit = (article) => {
//         setEditingArticle({ ...article });
//         setUploadedImageURL(article.imageURL || '');
//         setIsAddingNew(false);
//         setEditingSettings(false);
//     };

//     // Handle delete button click
//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to delete this article?')) {
//             try {
//                 await deleteDoc(doc(db, 'articles', id));
//                 setArticles(articles.filter(article => article.id !== id));
//             } catch (error) {
//                 console.error('Error deleting article:', error);
//                 alert('Failed to delete article. Please try again.');
//             }
//         }
//     };

//     // Handle save changes for article
//     const handleSave = async () => {
//         try {
//             // If there's a new uploaded image, upload it to Firebase Storage
//             let imageURL = editingArticle.imageURL;
//             if (uploadedImage) {
//                 imageURL = await uploadImageToStorage(uploadedImage, `article-${editingArticle.id}`);
//             }

//             const articleRef = doc(db, 'articles', editingArticle.id);
//             const updatedArticle = { 
//                 ...editingArticle, 
//                 imageURL: imageURL
//             };
            
//             await updateDoc(articleRef, updatedArticle);
            
//             // Update the articles state
//             setArticles(articles.map(article => 
//                 article.id === editingArticle.id ? updatedArticle : article
//             ));
            
//             setEditingArticle(null);
//             setUploadedImage(null);
//             setUploadedImageURL('');
//         } catch (error) {
//             console.error('Error updating article:', error);
//             alert('Failed to update article. Please try again.');
//         }
//     };

//     // Handle adding a new article
//     const handleAddNew = () => {
//         setIsAddingNew(true);
//         setEditingArticle(null);
//         setEditingSettings(false);
//         setUploadedImage(null);
//         setUploadedImageURL('');
//         setNewArticle({
//             image: '',
//             imageURL: '',
//             category: '',
//             date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//             title: '',
//             excerpt: ''
//         });
//     };

//     // Handle saving a new article
//     const handleSaveNew = async () => {
//         try {
//             // Upload image if there's one selected
//             let imageURL = '';
//             if (uploadedImage) {
//                 imageURL = await uploadImageToStorage(uploadedImage, 'article-new');
//             }

//             // Add the article to Firestore
//             const articleToSave = { 
//                 ...newArticle, 
//                 imageURL: imageURL,
//                 createdAt: new Date()
//             };
            
//             const docRef = await addDoc(articlesCollection, articleToSave);
            
//             // Update local state
//             setArticles([...articles, { ...articleToSave, id: docRef.id }]);
            
//             // Reset form
//             setIsAddingNew(false);
//             setUploadedImage(null);
//             setUploadedImageURL('');
//             setNewArticle({
//                 image: '',
//                 imageURL: '',
//                 category: '',
//                 date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//                 title: '',
//                 excerpt: ''
//             });
//         } catch (error) {
//             console.error('Error adding article:', error);
//             alert('Failed to add article. Please try again.');
//         }
//     };

//     // Handle form input changes for editing article
//     const handleEditChange = (e) => {
//         const { name, value } = e.target;
//         setEditingArticle({ ...editingArticle, [name]: value });
//     };

//     // Handle form input changes for new article
//     const handleNewArticleChange = (e) => {
//         const { name, value } = e.target;
//         setNewArticle({ ...newArticle, [name]: value });
//     };

//     // Handle file upload for article images
//     const handleFileUpload = (e, isEdit) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];
//             setUploadedImage(file);
            
//             // Create a preview URL
//             const objectUrl = URL.createObjectURL(file);
//             setUploadedImageURL(objectUrl);
            
//             // Update state based on whether we're editing or creating new
//             if (isEdit) {
//                 setEditingArticle({
//                     ...editingArticle,
//                     image: file.name.toLowerCase().includes('raspberry') ? 'raspberry-pi' :
//                            file.name.toLowerCase().includes('arduino') ? 'arduino' :
//                            file.name.toLowerCase().includes('sensor') ? 'sensors' :
//                            file.name.toLowerCase().includes('circuit') ? 'circuit-board' :
//                            file.name.toLowerCase().includes('robot') ? 'robotics' : 
//                            'raspberry-pi'
//                 });
//             } else {
//                 setNewArticle({
//                     ...newArticle,
//                     image: file.name.toLowerCase().includes('raspberry') ? 'raspberry-pi' :
//                            file.name.toLowerCase().includes('arduino') ? 'arduino' :
//                            file.name.toLowerCase().includes('sensor') ? 'sensors' :
//                            file.name.toLowerCase().includes('circuit') ? 'circuit-board' :
//                            file.name.toLowerCase().includes('robot') ? 'robotics' : 
//                            'raspberry-pi'
//                 });
//             }
//         }
//     };

//     // Handle editing blog settings
//     const handleEditSettings = () => {
//         setEditingSettings(true);
//         setIsAddingNew(false);
//         setEditingArticle(null);
//     };

//     // Handle settings form changes
//     const handleSettingsChange = (e) => {
//         const { name, value } = e.target;
//         setBlogSettings({ ...blogSettings, [name]: value });
//     };

//     // Handle header image upload
//     const handleHeaderImageUpload = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];
//             setHeaderImageFile(file);
            
//             // Create a preview URL
//             const objectUrl = URL.createObjectURL(file);
//             setBlogSettings({
//                 ...blogSettings,
//                 headerImageURL: objectUrl
//             });
//         }
//     };

//     // Add new category to the list
//     const handleAddCategory = () => {
//         if (newCategory && !blogSettings.categories.includes(newCategory)) {
//             setBlogSettings({
//                 ...blogSettings,
//                 categories: [...blogSettings.categories, newCategory]
//             });
//             setNewCategory('');
//         }
//     };

//     // Remove category from the list
//     const handleRemoveCategory = (categoryToRemove) => {
//         setBlogSettings({
//             ...blogSettings,
//             categories: blogSettings.categories.filter(category => category !== categoryToRemove)
//         });
//     };

//     // Handle saving blog settings
//     const handleSaveSettings = async () => {
//         try {
//             let headerImageURL = blogSettings.headerImage;
            
//             // Upload header image if there's a new one
//             if (headerImageFile) {
//                 headerImageURL = await uploadImageToStorage(headerImageFile, 'header');
//             }
            
//             const settingsToSave = {
//                 ...blogSettings,
//                 headerImage: headerImageURL
//             };
            
//             // Save settings to Firestore
//             await setDoc(doc(db, 'settings', 'blog'), settingsToSave);
            
//             // Update state
//             setBlogSettings(settingsToSave);
//             setEditingSettings(false);
//             setHeaderImageFile(null);
            
//             alert('Blog settings saved successfully!');
//         } catch (error) {
//             console.error('Error saving blog settings:', error);
//             alert('Failed to save blog settings. Please try again.');
//         }
//     };

//     return (
//         <div className="admin-blog-container">
//             <div className="admin-header">
//                 <div className="back-to-home-wrapper">
//                     <Link to="/" className="back-to-home-link">
//                         <svg
//                             className="back-arrow"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth="2"
//                                 d="M15 19l-7-7 7-7"
//                             />
//                         </svg>
//                         Back to Dashboard
//                     </Link>
//                 </div>
//                 <h1>ZappCart Blog Admin Panel</h1>
//                 <p className="admin-description">
//                     Manage your blog content, customize settings, create new articles, edit existing ones, or delete outdated content.
//                 </p>
//             </div>

//             <div className="admin-controls">
//                 <button 
//                     className="settings-button"
//                     onClick={handleEditSettings}
//                 >
//                     <FaCog className="button-icon" />
//                     Blog Settings
//                 </button>
//                 <button 
//                     className="add-new-button"
//                     onClick={handleAddNew}
//                 >
//                     <FaPlus className="button-icon" />
//                     Add New Article
//                 </button>
//             </div>

//             {editingSettings && (
//                 <div className="edit-form-container settings-form">
//                     <h2>Blog Settings</h2>
//                     <div className="edit-form">
//                         <div className="form-group">
//                             <label htmlFor="title">Blog Title:</label>
//                             <input
//                                 type="text"
//                                 id="title"
//                                 name="title"
//                                 value={blogSettings.title}
//                                 onChange={handleSettingsChange}
//                                 placeholder="Enter blog title"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="subtitle">Subtitle:</label>
//                             <input
//                                 type="text"
//                                 id="subtitle"
//                                 name="subtitle"
//                                 value={blogSettings.subtitle}
//                                 onChange={handleSettingsChange}
//                                 placeholder="Enter blog subtitle"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="description">Description:</label>
//                             <textarea
//                                 id="description"
//                                 name="description"
//                                 value={blogSettings.description}
//                                 onChange={handleSettingsChange}
//                                 placeholder="Enter blog description"
//                                 rows="3"
//                             ></textarea>
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="headerImage">Header Banner Image:</label>
//                             <div className="image-upload-container">
//                                 <div className="header-image-preview">
//                                     {blogSettings.headerImageURL ? (
//                                         <img 
//                                             src={blogSettings.headerImageURL} 
//                                             alt="Header Banner Preview" 
//                                             className="header-image-preview-img" 
//                                         />
//                                     ) : blogSettings.headerImage ? (
//                                         <img 
//                                             src={blogSettings.headerImage} 
//                                             alt="Header Banner" 
//                                             className="header-image-preview-img" 
//                                         />
//                                     ) : (
//                                         <div className="header-image-placeholder">
//                                             <FaImage className="placeholder-icon" />
//                                             <span>No header image selected</span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="upload-buttons">
//                                     <label className="upload-button">
//                                         <input 
//                                             type="file"
//                                             ref={headerImageInput}
//                                             accept="image/*" 
//                                             onChange={handleHeaderImageUpload}
//                                         />
//                                         Upload Header Image
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="form-group">
//                             <label>Categories:</label>
//                             <div className="categories-manager">
//                                 <div className="categories-list">
//                                     {blogSettings.categories.map((category, index) => (
//                                         <div key={index} className="category-item">
//                                             <span>{category}</span>
//                                             <button 
//                                                 type="button"
//                                                 className="remove-category-btn"
//                                                 onClick={() => handleRemoveCategory(category)}
//                                             >
//                                                 <FaTimes />
//                                             </button>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div className="add-category-form">
//                                     <input
//                                         type="text"
//                                         value={newCategory}
//                                         onChange={(e) => setNewCategory(e.target.value)}
//                                         placeholder="New category name"
//                                     />
//                                     <button 
//                                         type="button" 
//                                         className="add-category-btn"
//                                         onClick={handleAddCategory}
//                                         disabled={!newCategory}
//                                     >
//                                         <FaPlus />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="form-actions">
//                             <button
//                                 className="save-button"
//                                 onClick={handleSaveSettings}
//                             >
//                                 <FaSave className="button-icon" />
//                                 Save Settings
//                             </button>
//                             <button
//                                 className="cancel-button"
//                                 onClick={() => setEditingSettings(false)}
//                             >
//                                 <FaTimes className="button-icon" />
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {isAddingNew && (
//                 <div className="edit-form-container">
//                     <h2>Create New Article</h2>
//                     <div className="edit-form">
//                         <div className="form-group">
//                             <label htmlFor="title">Title:</label>
//                             <input
//                                 type="text"
//                                 id="title"
//                                 name="title"
//                                 value={newArticle.title}
//                                 onChange={handleNewArticleChange}
//                                 placeholder="Enter article title"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="category">Category:</label>
//                             <select
//                                 id="category"
//                                 name="category"
//                                 value={newArticle.category}
//                                 onChange={handleNewArticleChange}
//                             >
//                                 <option value="">Select a category</option>
//                                 {blogSettings.categories.map((cat, index) => (
//                                     <option key={index} value={cat}>{cat}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="image">Featured Image:</label>
//                             <div className="image-upload-container">
//                                 <div className="image-preview">
//                                     {uploadedImageURL ? (
//                                         <img 
//                                             src={uploadedImageURL} 
//                                             alt="Preview" 
//                                             className="uploaded-image-preview" 
//                                         />
//                                     ) : newArticle.image ? (
//                                         <div className={`preview-image ${newArticle.image}`}></div>
//                                     ) : (
//                                         <div className="image-placeholder">
//                                             <FaImage className="placeholder-icon" />
//                                             <span>No image selected</span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <select
//                                     id="image"
//                                     name="image"
//                                     value={newArticle.image}
//                                     onChange={handleNewArticleChange}
//                                     className="image-select"
//                                 >
//                                     <option value="">Select a template image</option>
//                                     {imageOptions.map((img, index) => (
//                                         <option key={index} value={img}>{img.replace('-', ' ')}</option>
//                                     ))}
//                                 </select>
//                                 <div className="upload-buttons">
//                                     <label className="upload-button">
//                                         <input 
//                                             type="file"
//                                             ref={articleImageInput}
//                                             accept="image/*" 
//                                             onChange={(e) => handleFileUpload(e, false)}
//                                         />
//                                         Upload Custom Image
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="excerpt">Excerpt:</label>
//                             <textarea
//                                 id="excerpt"
//                                 name="excerpt"
//                                 value={newArticle.excerpt}
//                                 onChange={handleNewArticleChange}
//                                 placeholder="Enter article excerpt"
//                                 rows="4"
//                             ></textarea>
//                         </div>
//                         <div className="form-actions">
//                             <button
//                                 className="save-button"
//                                 onClick={handleSaveNew}
//                                 disabled={!newArticle.title || !newArticle.category || (!newArticle.image && !uploadedImage) || !newArticle.excerpt}
//                             >
//                                 <FaSave className="button-icon" />
//                                 Save Article
//                             </button>
//                             <button
//                                 className="cancel-button"
//                                 onClick={() => {
//                                     setIsAddingNew(false);
//                                     setUploadedImage(null);
//                                     setUploadedImageURL('');
//                                 }}
//                             >
//                                 <FaTimes className="button-icon" />
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {editingArticle && (
//                 <div className="edit-form-container">
//                     <h2>Edit Article</h2>
//                     <div className="edit-form">
//                         <div className="form-group">
//                             <label htmlFor="edit-title">Title:</label>
//                             <input
//                                 type="text"
//                                 id="edit-title"
//                                 name="title"
//                                 value={editingArticle.title}
//                                 onChange={handleEditChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="edit-category">Category:</label>
//                             <select
//                                 id="edit-category"
//                                 name="category"
//                                 value={editingArticle.category}
//                                 onChange={handleEditChange}
//                             >
//                                 <option value="">Select a category</option>
//                                 {blogSettings.categories.map((cat, index) => (
//                                     <option key={index} value={cat}>{cat}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="edit-image">Featured Image:</label>
//                             <div className="image-upload-container">
//                                 <div className="image-preview">
//                                     {uploadedImageURL ? (
//                                         <img 
//                                             src={uploadedImageURL} 
//                                             alt="Preview" 
//                                             className="uploaded-image-preview" 
//                                         />
//                                     ) : editingArticle.imageURL ? (
//                                         <img 
//                                             src={editingArticle.imageURL} 
//                                             alt="Article" 
//                                             className="uploaded-image-preview" 
//                                         />
//                                     ) : editingArticle.image ? (
//                                         <div className={`preview-image ${editingArticle.image}`}></div>
//                                     ) : (
//                                         <div className="image-placeholder">
//                                             <FaImage className="placeholder-icon" />
//                                             <span>No image selected</span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <select
//                                     id="edit-image"
//                                     name="image"
//                                     value={editingArticle.image}
//                                     onChange={handleEditChange}
//                                     className="image-select"
//                                 >
//                                     <option value="">Select a template image</option>
//                                     {imageOptions.map((img, index) => (
//                                         <option key={index} value={img}>{img.replace('-', ' ')}</option>
//                                     ))}
//                                 </select>
//                                 <div className="upload-buttons">
//                                     <label className="upload-button">
//                                         <input 
//                                             type="file" 
//                                             accept="image/*" 
//                                             onChange={(e) => handleFileUpload(e, true)}
//                                         />
//                                         Upload Custom Image
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="edit-excerpt">Excerpt:</label>
//                             <textarea
//                                 id="edit-excerpt"
//                                 name="excerpt"
//                                 value={editingArticle.excerpt}
//                                 onChange={handleEditChange}
//                                 rows="4"
//                             ></textarea>
//                         </div>
//                         <div className="form-actions">
//                             <button
//                                 className="save-button"
//                                 onClick={handleSave}
//                             >
//                                 <FaSave className="button-icon" />
//                                 Save Changes
//                             </button>
//                             <button
//                                 className="cancel-button"
//                                 onClick={() => {
//                                     setEditingArticle(null);
//                                     setUploadedImage(null);
//                                     setUploadedImageURL('');
//                                 }}
//                             >
//                                 <FaTimes className="button-icon" />
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="articles-management">
//                 <h2>Manage Articles</h2>
//                 {loading ? (
//                     <div className="loading">Loading articles...</div>
//                 ) : articles.length === 0 ? (
//                     <div className="no-articles">No articles found. Add your first article!</div>
//                 ) : (
//                     <div className="articles-grid">
//                         {articles.map((article) => (
//                             <div className="article-card" key={article.id}>
//                                 <div className="article-image">
//                                     {article.imageURL ? (
//                                         <img src={article.imageURL} alt={article.title} />
//                                     ) : article.image ? (
//                                         <div className={`preview-image ${article.image}`}></div>
//                                     ) : (
//                                         <div className="image-placeholder">
//                                             <FaImage className="placeholder-icon" />
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="article-content">
//                                     <div className="article-category">
//                                         <span>{article.category}</span>
//                                     </div>
//                                     <div className="article-date">
//                                         {article.date}
//                                     </div>
//                                     <h3 className="article-title">{article.title}</h3>
//                                     <p className="article-excerpt">
//                                         {article.excerpt}
//                                     </p>
//                                     <div className="article-actions">
//                                         <button
//                                             className="edit-button"
//                                             onClick={() => handleEdit(article)}
//                                         >
//                                             <FaEdit className="button-icon" />
//                                             Edit
//                                         </button>
//                                         <button
//                                             className="delete-button"
//                                             onClick={() => handleDelete(article.id)}
//                                         >
//                                             <FaTrash className="button-icon" />
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             <div className="admin-blog-footer">
//                 <p>© {new Date().getFullYear()} ZappCart | TAZATA BUTCHERS PRIVATE LIMITED</p>
//                 <Link to="/blog" className="view-blog-link" target="_blank">View Blog</Link>
//             </div>
//         </div>
//     );
// };

// export default AdminBlogPanel;


import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import './AdminBlogPanel.css';

const AdminBlogPanel = () => {
    // State for blog settings
    const [blogSettings, setBlogSettings] = useState({
        title: 'ZappCart Blog',
        subtitle: 'Fresh insights, recipes, and meat knowledge',
        description: 'Discover the latest news, cooking tips, and meat expertise from ZappCart.',
        headerImage: '',
        headerImageURL: '',
        categories: ['Recipes', 'Meat Guide', 'Health & Nutrition', 'Company News']
    });
    
    // State for blog posts and editing
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingArticle, setEditingArticle] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImageURL, setUploadedImageURL] = useState('');
    const [headerImageFile, setHeaderImageFile] = useState(null);
    const [editingSettings, setEditingSettings] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newArticle, setNewArticle] = useState({
        image: '',
        imageURL: '',
        category: '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        title: '',
        excerpt: ''
    });

    // Image options for predefined templates
    const imageOptions = ['raspberry-pi', 'arduino', 'sensors', 'circuit-board', 'robotics'];
    
    // References
    const headerImageInput = useRef(null);
    const articleImageInput = useRef(null);

    // Firebase references
    const db = getFirestore();
    const storage = getStorage();
    const articlesCollection = collection(db, 'articles');

    // Fetch articles and settings from Firestore
    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                // First get blog settings
                const settingsDoc = await getDoc(doc(db, 'settings', 'blog'));
                if (settingsDoc.exists()) {
                    setBlogSettings({
                        ...blogSettings,
                        ...settingsDoc.data()
                    });
                }
                
                // Then get articles
                const querySnapshot = await getDocs(articlesCollection);
                const articlesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setArticles(articlesData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog data:', error);
                setLoading(false);
            }
        };

        fetchBlogData();
    }, []);

    // Handle uploading image to Firebase Storage
    const uploadImageToStorage = async (file, path) => {
        if (!file) return null;
        
        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${path}-${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `blog-images/${fileName}`);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Handle edit button click
    const handleEdit = (article) => {
        setEditingArticle({ ...article });
        setUploadedImageURL(article.imageURL || '');
        setIsAddingNew(false);
        setEditingSettings(false);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteDoc(doc(db, 'articles', id));
                setArticles(articles.filter(article => article.id !== id));
            } catch (error) {
                console.error('Error deleting article:', error);
                alert('Failed to delete article. Please try again.');
            }
        }
    };

    // Handle save changes for article
    const handleSave = async () => {
        try {
            // If there's a new uploaded image, upload it to Firebase Storage
            let imageURL = editingArticle.imageURL;
            if (uploadedImage) {
                imageURL = await uploadImageToStorage(uploadedImage, `article-${editingArticle.id}`);
            }

            const articleRef = doc(db, 'articles', editingArticle.id);
            const updatedArticle = { 
                ...editingArticle, 
                imageURL: imageURL
            };
            
            await updateDoc(articleRef, updatedArticle);
            
            // Update the articles state
            setArticles(articles.map(article => 
                article.id === editingArticle.id ? updatedArticle : article
            ));
            
            setEditingArticle(null);
            setUploadedImage(null);
            setUploadedImageURL('');
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Failed to update article. Please try again.');
        }
    };

    // Handle adding a new article
    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingArticle(null);
        setEditingSettings(false);
        setUploadedImage(null);
        setUploadedImageURL('');
        setNewArticle({
            image: '',
            imageURL: '',
            category: '',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            title: '',
            excerpt: ''
        });
    };

    // Handle saving a new article
    const handleSaveNew = async () => {
        try {
            // Upload image if there's one selected
            let imageURL = '';
            if (uploadedImage) {
                imageURL = await uploadImageToStorage(uploadedImage, 'article-new');
            }

            // Add the article to Firestore
            const articleToSave = { 
                ...newArticle, 
                imageURL: imageURL,
                createdAt: new Date()
            };
            
            const docRef = await addDoc(articlesCollection, articleToSave);
            
            // Update local state
            setArticles([...articles, { ...articleToSave, id: docRef.id }]);
            
            // Reset form
            setIsAddingNew(false);
            setUploadedImage(null);
            setUploadedImageURL('');
            setNewArticle({
                image: '',
                imageURL: '',
                category: '',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                title: '',
                excerpt: ''
            });
        } catch (error) {
            console.error('Error adding article:', error);
            alert('Failed to add article. Please try again.');
        }
    };

    // Handle form input changes for editing article
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingArticle({ ...editingArticle, [name]: value });
    };

    // Handle form input changes for new article
    const handleNewArticleChange = (e) => {
        const { name, value } = e.target;
        setNewArticle({ ...newArticle, [name]: value });
    };

    // Handle file upload for article images
    const handleFileUpload = (e, isEdit) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            
            // Create a preview URL
            const objectUrl = URL.createObjectURL(file);
            setUploadedImageURL(objectUrl);
            
            // Update state based on whether we're editing or creating new
            if (isEdit) {
                setEditingArticle({
                    ...editingArticle,
                    image: file.name.toLowerCase().includes('raspberry') ? 'raspberry-pi' :
                           file.name.toLowerCase().includes('arduino') ? 'arduino' :
                           file.name.toLowerCase().includes('sensor') ? 'sensors' :
                           file.name.toLowerCase().includes('circuit') ? 'circuit-board' :
                           file.name.toLowerCase().includes('robot') ? 'robotics' : 
                           'raspberry-pi'
                });
            } else {
                setNewArticle({
                    ...newArticle,
                    image: file.name.toLowerCase().includes('raspberry') ? 'raspberry-pi' :
                           file.name.toLowerCase().includes('arduino') ? 'arduino' :
                           file.name.toLowerCase().includes('sensor') ? 'sensors' :
                           file.name.toLowerCase().includes('circuit') ? 'circuit-board' :
                           file.name.toLowerCase().includes('robot') ? 'robotics' : 
                           'raspberry-pi'
                });
            }
        }
    };

    // Handle editing blog settings
    const handleEditSettings = () => {
        setEditingSettings(true);
        setIsAddingNew(false);
        setEditingArticle(null);
    };

    // Handle settings form changes
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setBlogSettings({ ...blogSettings, [name]: value });
    };

    // Handle header image upload
    const handleHeaderImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setHeaderImageFile(file);
            
            // Create a preview URL
            const objectUrl = URL.createObjectURL(file);
            setBlogSettings({
                ...blogSettings,
                headerImageURL: objectUrl
            });
        }
    };

    // Add new category to the list
    const handleAddCategory = () => {
        if (newCategory && !blogSettings.categories.includes(newCategory)) {
            setBlogSettings({
                ...blogSettings,
                categories: [...blogSettings.categories, newCategory]
            });
            setNewCategory('');
        }
    };

    // Remove category from the list
    const handleRemoveCategory = (categoryToRemove) => {
        setBlogSettings({
            ...blogSettings,
            categories: blogSettings.categories.filter(category => category !== categoryToRemove)
        });
    };

    // Handle saving blog settings
    const handleSaveSettings = async () => {
        try {
            let headerImageURL = blogSettings.headerImage;
            
            // Upload header image if there's a new one
            if (headerImageFile) {
                headerImageURL = await uploadImageToStorage(headerImageFile, 'header');
            }
            
            const settingsToSave = {
                ...blogSettings,
                headerImage: headerImageURL
            };
            
            // Save settings to Firestore
            await setDoc(doc(db, 'settings', 'blog'), settingsToSave);
            
            // Update state
            setBlogSettings(settingsToSave);
            setEditingSettings(false);
            setHeaderImageFile(null);
            
            alert('Blog settings saved successfully!');
        } catch (error) {
            console.error('Error saving blog settings:', error);
            alert('Failed to save blog settings. Please try again.');
        }
    };

    return (
        <div className="admin-blog-container">
            <div className="admin-header">
                <div className="back-to-home-wrapper">
                    <Link to="/" className="back-to-home-link">
                        <svg
                            className="back-arrow"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
                <h1 style={{color:'white', textAlign:'center', right:'300px', position:'relative'}}>ProCart Blog Admin Panel</h1>
                
            </div>

            <div className="admin-controls">
                <button 
                    className="settings-button"
                    onClick={handleEditSettings}
                >
                    <FaCog className="button-icon" />
                    Blog Settings
                </button>
                <button 
                    className="add-new-button"
                    onClick={handleAddNew}
                >
                    <FaPlus className="button-icon" />
                    Add New Article
                </button>
            </div>

            {editingSettings && (
                <div className="edit-form-container settings-form">
                    <h2>Blog Settings</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">Blog Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={blogSettings.title}
                                onChange={handleSettingsChange}
                                placeholder="Enter blog title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subtitle">Subtitle:</label>
                            <input
                                type="text"
                                id="subtitle"
                                name="subtitle"
                                value={blogSettings.subtitle}
                                onChange={handleSettingsChange}
                                placeholder="Enter blog subtitle"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={blogSettings.description}
                                onChange={handleSettingsChange}
                                placeholder="Enter blog description"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="headerImage">Header Banner Image:</label>
                            <div className="image-upload-container">
                                <div className="header-image-preview">
                                    {blogSettings.headerImageURL ? (
                                        <img 
                                            src={blogSettings.headerImageURL} 
                                            alt="Header Banner Preview" 
                                            className="header-image-preview-img" 
                                        />
                                    ) : blogSettings.headerImage ? (
                                        <img 
                                            src={blogSettings.headerImage} 
                                            alt="Header Banner" 
                                            className="header-image-preview-img" 
                                        />
                                    ) : (
                                        <div className="header-image-placeholder">
                                            <FaImage className="placeholder-icon" />
                                            <span>No header image selected</span>
                                        </div>
                                    )}
                                </div>
                                <div className="upload-buttons">
                                    <label className="upload-button">
                                        <input 
                                            type="file"
                                            ref={headerImageInput}
                                            accept="image/*" 
                                            onChange={handleHeaderImageUpload}
                                        />
                                        Upload Header Image
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Categories:</label>
                            <div className="categories-manager">
                                <div className="categories-list">
                                    {blogSettings.categories.map((category, index) => (
                                        <div key={index} className="category-item">
                                            <span>{category}</span>
                                            <button 
                                                type="button"
                                                className="remove-category-btn"
                                                onClick={() => handleRemoveCategory(category)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="add-category-form">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="New category name"
                                    />
                                    <button 
                                        type="button" 
                                        className="add-category-btn"
                                        onClick={handleAddCategory}
                                        disabled={!newCategory}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSaveSettings}
                            >
                                <FaSave className="button-icon" />
                                Save Settings
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setEditingSettings(false)}
                            >
                                <FaTimes className="button-icon" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingNew && (
                <div className="edit-form-container">
                    <h2>Create New Article</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newArticle.title}
                                onChange={handleNewArticleChange}
                                placeholder="Enter article title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <select
                                id="category"
                                name="category"
                                value={newArticle.category}
                                onChange={handleNewArticleChange}
                            >
                                <option value="">Select a category</option>
                                {blogSettings.categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="image">Featured Image:</label>
                            <div className="image-upload-container">
                                <div className="image-preview">
                                    {uploadedImageURL ? (
                                        <img 
                                            src={uploadedImageURL} 
                                            alt="Preview" 
                                            className="uploaded-image-preview" 
                                        />
                                    ) : newArticle.image ? (
                                        <div className={`preview-image ${newArticle.image}`}></div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <FaImage className="placeholder-icon" />
                                            <span>No image selected</span>
                                        </div>
                                    )}
                                </div>
                                <select
                                    id="image"
                                    name="image"
                                    value={newArticle.image}
                                    onChange={handleNewArticleChange}
                                    className="image-select"
                                >
                                    <option value="">Select a template image</option>
                                    {imageOptions.map((img, index) => (
                                        <option key={index} value={img}>{img.replace('-', ' ')}</option>
                                    ))}
                                </select>
                                <div className="upload-buttons">
                                    <label className="upload-button">
                                        <input 
                                            type="file"
                                            ref={articleImageInput}
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload(e, false)}
                                        />
                                        Upload Custom Image
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="excerpt">Excerpt:</label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                value={newArticle.excerpt}
                                onChange={handleNewArticleChange}
                                placeholder="Enter article excerpt"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSaveNew}
                                disabled={!newArticle.title || !newArticle.category || (!newArticle.image && !uploadedImage) || !newArticle.excerpt}
                            >
                                <FaSave className="button-icon" />
                                Save Article
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setIsAddingNew(false);
                                    setUploadedImage(null);
                                    setUploadedImageURL('');
                                }}
                            >
                                <FaTimes className="button-icon" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingArticle && (
                <div className="edit-form-container">
                    <h2>Edit Article</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="edit-title">Title:</label>
                            <input
                                type="text"
                                id="edit-title"
                                name="title"
                                value={editingArticle.title}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-category">Category:</label>
                            <select
                                id="edit-category"
                                name="category"
                                value={editingArticle.category}
                                onChange={handleEditChange}
                            >
                                <option value="">Select a category</option>
                                {blogSettings.categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-image">Featured Image:</label>
                            <div className="image-upload-container">
                                <div className="image-preview">
                                    {uploadedImageURL ? (
                                        <img 
                                            src={uploadedImageURL} 
                                            alt="Preview" 
                                            className="uploaded-image-preview" 
                                        />
                                    ) : editingArticle.imageURL ? (
                                        <img 
                                            src={editingArticle.imageURL} 
                                            alt="Article" 
                                            className="uploaded-image-preview" 
                                        />
                                    ) : editingArticle.image ? (
                                        <div className={`preview-image ${editingArticle.image}`}></div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <FaImage className="placeholder-icon" />
                                            <span>No image selected</span>
                                        </div>
                                    )}
                                </div>
                                <select
                                    id="edit-image"
                                    name="image"
                                    value={editingArticle.image}
                                    onChange={handleEditChange}
                                    className="image-select"
                                >
                                    <option value="">Select a template image</option>
                                    {imageOptions.map((img, index) => (
                                        <option key={index} value={img}>{img.replace('-', ' ')}</option>
                                    ))}
                                </select>
                                <div className="upload-buttons">
                                    <label className="upload-button">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload(e, true)}
                                        />
                                        Upload Custom Image
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-excerpt">Excerpt:</label>
                            <textarea
                                id="edit-excerpt"
                                name="excerpt"
                                value={editingArticle.excerpt}
                                onChange={handleEditChange}
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSave}
                            >
                                <FaSave className="button-icon" />
                                Save Changes
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setEditingArticle(null);
                                    setUploadedImage(null);
                                    setUploadedImageURL('');
                                }}
                            >
                                <FaTimes className="button-icon" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="articles-management">
                <h2>Manage Articles</h2>
                {loading ? (
                    <div className="loading">Loading articles...</div>
                ) : articles.length === 0 ? (
                    <div className="no-articles">No articles found. Add your first article!</div>
                ) : (
                    <div className="articles-grid">
                        {articles.map((article) => (
                            <div className="article-card" key={article.id}>
                                <div className="article-image">
                                    {article.imageURL ? (
                                        <img src={article.imageURL} alt={article.title} />
                                    ) : article.image ? (
                                        <div className={`preview-image ${article.image}`}></div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <FaImage className="placeholder-icon" />
                                        </div>
                                    )}
                                </div>
                                <div className="article-content">
                                    <div className="article-category">
                                        <span>{article.category}</span>
                                    </div>
                                    <div className="article-date">
                                        {article.date}
                                    </div>
                                    <h3 className="article-title">{article.title}</h3>
                                    <p className="article-excerpt">
                                        {article.excerpt}
                                    </p>
                                    <div className="article-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(article)}
                                        >
                                            <FaEdit className="button-icon" />
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(article.id)}
                                        >
                                            <FaTrash className="button-icon" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-blog-footer">
                <p>© {new Date().getFullYear()} ProCart</p>
                <Link to="/blog" className="view-blog-link" target="_blank">View Blog</Link>
            </div>
        </div>
    );
};

export default AdminBlogPanel;