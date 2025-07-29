import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaImage, FaStar } from 'react-icons/fa';
import './AdminNewsroomPanel.css';

const AdminNewsroomPanel = () => {
    // State for newsroom settings
    const [newsroomSettings, setNewsroomSettings] = useState({
        title: 'ProCart Newsroom',
        tagline: 'Stay updated with the latest from ProCart',
        description: 'Official news, product announcements, and updates from India\'s leading electronics components provider.',
        featuredStory: {
            title: 'ProCart Launches Next-Day Delivery for All Major Cities',
            date: 'June 16, 2025',
            excerpt: 'Starting today, customers in all major Indian cities can enjoy next-day delivery on thousands of electronics components, making ProCart the fastest electronics supplier in the country.',
        },
        mediaContact: {
            email: 'press@procart.in',
            phone: '+91 9988776655',
            info: 'For media inquiries, please contact our press team. We aim to respond within 24 hours.'
        },
        categories: [
            { id: 'press', label: 'Press Releases' },
            { id: 'product', label: 'Product Launches' },
            { id: 'events', label: 'Events' },
            { id: 'industry', label: 'Industry Updates' }
        ]
    });
    
    // State for news items and editing
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNewsItem, setEditingNewsItem] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImageURL, setUploadedImageURL] = useState('');
    const [editingSettings, setEditingSettings] = useState(false);
    const [newCategory, setNewCategory] = useState({ id: '', label: '' });
    const [featuredStoryId, setFeaturedStoryId] = useState(null);
    const [newNewsItem, setNewNewsItem] = useState({
        category: '',
        title: '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        excerpt: '',
        image: ''
    });

    // Image options for predefined templates
    const imageOptions = ['expansion', 'arduino', 'expo', 'iot', 'education', 'kit'];
    
    // References
    const newsItemImageInput = useRef(null);

    // Firebase references
    const db = getFirestore();
    const storage = getStorage();
    const newsCollection = collection(db, 'news');

    // Fetch news items and settings from Firestore
    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                // First get newsroom settings
                const settingsDoc = await getDoc(doc(db, 'settings', 'newsroom'));
                if (settingsDoc.exists()) {
                    setNewsroomSettings({
                        ...newsroomSettings,
                        ...settingsDoc.data()
                    });
                    
                    // Get featured story ID if exists
                    if (settingsDoc.data().featuredStoryId) {
                        setFeaturedStoryId(settingsDoc.data().featuredStoryId);
                    }
                }
                
                // Then get news items
                const querySnapshot = await getDocs(newsCollection);
                const newsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNewsItems(newsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching news data:', error);
                setLoading(false);
            }
        };

        fetchNewsData();
    }, []);

    // Handle uploading image to Firebase Storage
    const uploadImageToStorage = async (file, path) => {
        if (!file) return null;
        
        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${path}-${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `newsroom-images/${fileName}`);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Handle edit button click
    const handleEdit = (newsItem) => {
        setEditingNewsItem({ ...newsItem });
        setUploadedImageURL(newsItem.imageURL || '');
        setIsAddingNew(false);
        setEditingSettings(false);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            try {
                await deleteDoc(doc(db, 'news', id));
                setNewsItems(newsItems.filter(item => item.id !== id));
                
                // If this was the featured story, reset it
                if (id === featuredStoryId) {
                    const updatedSettings = {
                        ...newsroomSettings,
                        featuredStoryId: null
                    };
                    await setDoc(doc(db, 'settings', 'newsroom'), updatedSettings);
                    setFeaturedStoryId(null);
                }
            } catch (error) {
                console.error('Error deleting news item:', error);
                alert('Failed to delete news item. Please try again.');
            }
        }
    };

    // Handle save changes for news item
    const handleSave = async () => {
        try {
            // If there's a new uploaded image, upload it to Firebase Storage
            let imageURL = editingNewsItem.imageURL;
            if (uploadedImage) {
                imageURL = await uploadImageToStorage(uploadedImage, `news-${editingNewsItem.id}`);
            }

            const newsItemRef = doc(db, 'news', editingNewsItem.id);
            const updatedNewsItem = { 
                ...editingNewsItem, 
                imageURL: imageURL
            };
            
            await updateDoc(newsItemRef, updatedNewsItem);
            
            // Update the news items state
            setNewsItems(newsItems.map(item => 
                item.id === editingNewsItem.id ? updatedNewsItem : item
            ));
            
            setEditingNewsItem(null);
            setUploadedImage(null);
            setUploadedImageURL('');
        } catch (error) {
            console.error('Error updating news item:', error);
            alert('Failed to update news item. Please try again.');
        }
    };

    // Handle adding a new news item
    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingNewsItem(null);
        setEditingSettings(false);
        setUploadedImage(null);
        setUploadedImageURL('');
        setNewNewsItem({
            category: '',
            title: '',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            excerpt: '',
            image: ''
        });
    };

    // Handle saving a new news item
    const handleSaveNew = async () => {
        try {
            // Upload image if there's one selected
            let imageURL = '';
            if (uploadedImage) {
                imageURL = await uploadImageToStorage(uploadedImage, 'news-new');
            }

            // Add the news item to Firestore
            const newsItemToSave = { 
                ...newNewsItem, 
                imageURL: imageURL,
                createdAt: new Date()
            };
            
            const docRef = await addDoc(newsCollection, newsItemToSave);
            
            // Update local state
            const newItem = { ...newsItemToSave, id: docRef.id };
            setNewsItems([...newsItems, newItem]);
            
            // Reset form
            setIsAddingNew(false);
            setUploadedImage(null);
            setUploadedImageURL('');
            setNewNewsItem({
                category: '',
                title: '',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                excerpt: '',
                image: ''
            });
        } catch (error) {
            console.error('Error adding news item:', error);
            alert('Failed to add news item. Please try again.');
        }
    };

    // Handle form input changes for editing news item
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingNewsItem({ ...editingNewsItem, [name]: value });
    };

    // Handle form input changes for new news item
    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewNewsItem({ ...newNewsItem, [name]: value });
    };

    // Handle file upload for news item images
    const handleFileUpload = (e, isEdit) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            
            // Create a preview URL
            const objectUrl = URL.createObjectURL(file);
            setUploadedImageURL(objectUrl);
            
            // Update state based on whether we're editing or creating new
            if (isEdit) {
                setEditingNewsItem({
                    ...editingNewsItem,
                    image: determineImageType(file.name)
                });
            } else {
                setNewNewsItem({
                    ...newNewsItem,
                    image: determineImageType(file.name)
                });
            }
        }
    };

    // Helper function to determine image type based on filename
    const determineImageType = (filename) => {
        filename = filename.toLowerCase();
        if (filename.includes('expansion')) return 'expansion';
        if (filename.includes('arduino')) return 'arduino';
        if (filename.includes('expo')) return 'expo';
        if (filename.includes('iot')) return 'iot';
        if (filename.includes('education')) return 'education';
        if (filename.includes('kit')) return 'kit';
        return 'expansion'; // Default
    };

    // Handle editing newsroom settings
    const handleEditSettings = () => {
        setEditingSettings(true);
        setIsAddingNew(false);
        setEditingNewsItem(null);
    };

    // Handle settings form changes
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setNewsroomSettings({ 
            ...newsroomSettings, 
            [name]: value 
        });
    };

    // Handle featured story changes
    const handleFeaturedStoryChange = (e) => {
        const { name, value } = e.target;
        setNewsroomSettings({ 
            ...newsroomSettings, 
            featuredStory: {
                ...newsroomSettings.featuredStory,
                [name]: value
            }
        });
    };

    // Handle media contact changes
    const handleMediaContactChange = (e) => {
        const { name, value } = e.target;
        setNewsroomSettings({ 
            ...newsroomSettings, 
            mediaContact: {
                ...newsroomSettings.mediaContact,
                [name]: value
            }
        });
    };

    // Handle new category ID change
    const handleCategoryIdChange = (e) => {
        setNewCategory({
            ...newCategory,
            id: e.target.value
        });
    };

    // Handle new category label change
    const handleCategoryLabelChange = (e) => {
        setNewCategory({
            ...newCategory,
            label: e.target.value
        });
    };

    // Add new category to the list
    const handleAddCategory = () => {
        if (newCategory.id && newCategory.label && 
            !newsroomSettings.categories.some(cat => cat.id === newCategory.id)) {
            setNewsroomSettings({
                ...newsroomSettings,
                categories: [...newsroomSettings.categories, { ...newCategory }]
            });
            setNewCategory({ id: '', label: '' });
        }
    };

    // Remove category from the list
    const handleRemoveCategory = (categoryId) => {
        setNewsroomSettings({
            ...newsroomSettings,
            categories: newsroomSettings.categories.filter(category => category.id !== categoryId)
        });
    };

    // Set as featured story
    const handleSetFeatured = async (newsItem) => {
        try {
            const updatedSettings = {
                ...newsroomSettings,
                featuredStoryId: newsItem.id,
                featuredStory: {
                    title: newsItem.title,
                    date: newsItem.date,
                    excerpt: newsItem.excerpt
                }
            };
            
            // Save settings to Firestore
            await setDoc(doc(db, 'settings', 'newsroom'), updatedSettings);
            
            // Update state
            setNewsroomSettings(updatedSettings);
            setFeaturedStoryId(newsItem.id);
            
            alert('Featured story updated successfully!');
        } catch (error) {
            console.error('Error updating featured story:', error);
            alert('Failed to update featured story. Please try again.');
        }
    };

    // Handle saving newsroom settings
    const handleSaveSettings = async () => {
        try {
            // Save settings to Firestore
            await setDoc(doc(db, 'settings', 'newsroom'), {
                ...newsroomSettings,
                featuredStoryId: featuredStoryId
            });
            
            // Update state
            setEditingSettings(false);
            
            alert('Newsroom settings saved successfully!');
        } catch (error) {
            console.error('Error saving newsroom settings:', error);
            alert('Failed to save newsroom settings. Please try again.');
        }
    };

    return (
        <div className="admin-newsroom-container">
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
                <h1 style={{color:'white', textAlign:'center', right:'300px', position:'relative'}}>ProCart Newsroom Admin Panel</h1>
                
            </div>

            <div className="admin-controls">
                <button 
                    className="settings-button"
                    onClick={handleEditSettings}
                >
                    <FaCog className="button-icon" />
                    Newsroom Settings
                </button>
                <button 
                    className="add-new-button"
                    onClick={handleAddNew}
                >
                    <FaPlus className="button-icon" />
                    Add News Item
                </button>
            </div>

            {editingSettings && (
                <div className="edit-form-container settings-form">
                    <h2>Newsroom Settings</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">Newsroom Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newsroomSettings.title}
                                onChange={handleSettingsChange}
                                placeholder="Enter newsroom title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tagline">Tagline:</label>
                            <input
                                type="text"
                                id="tagline"
                                name="tagline"
                                value={newsroomSettings.tagline}
                                onChange={handleSettingsChange}
                                placeholder="Enter newsroom tagline"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newsroomSettings.description}
                                onChange={handleSettingsChange}
                                placeholder="Enter newsroom description"
                                rows="3"
                            ></textarea>
                        </div>

                        <h3>Featured Story</h3>
                        <div className="form-group">
                            <label htmlFor="featuredTitle">Featured Story Title:</label>
                            <input
                                type="text"
                                id="featuredTitle"
                                name="title"
                                value={newsroomSettings.featuredStory.title}
                                onChange={handleFeaturedStoryChange}
                                placeholder="Enter featured story title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="featuredDate">Featured Story Date:</label>
                            <input
                                type="text"
                                id="featuredDate"
                                name="date"
                                value={newsroomSettings.featuredStory.date}
                                onChange={handleFeaturedStoryChange}
                                placeholder="Enter featured story date"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="featuredExcerpt">Featured Story Excerpt:</label>
                            <textarea
                                id="featuredExcerpt"
                                name="excerpt"
                                value={newsroomSettings.featuredStory.excerpt}
                                onChange={handleFeaturedStoryChange}
                                placeholder="Enter featured story excerpt"
                                rows="3"
                            ></textarea>
                        </div>

                        <h3>Media Contact</h3>
                        <div className="form-group">
                            <label htmlFor="mediaEmail">Email:</label>
                            <input
                                type="email"
                                id="mediaEmail"
                                name="email"
                                value={newsroomSettings.mediaContact.email}
                                onChange={handleMediaContactChange}
                                placeholder="Enter media contact email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mediaPhone">Phone:</label>
                            <input
                                type="text"
                                id="mediaPhone"
                                name="phone"
                                value={newsroomSettings.mediaContact.phone}
                                onChange={handleMediaContactChange}
                                placeholder="Enter media contact phone"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mediaInfo">Information:</label>
                            <textarea
                                id="mediaInfo"
                                name="info"
                                value={newsroomSettings.mediaContact.info}
                                onChange={handleMediaContactChange}
                                placeholder="Enter media contact information"
                                rows="3"
                            ></textarea>
                        </div>

                        <h3>Categories</h3>
                        <div className="form-group">
                            <label>Current Categories:</label>
                            <div className="categories-manager">
                                <div className="categories-list">
                                    {newsroomSettings.categories.map((category, index) => (
                                        <div key={index} className="category-item">
                                            <span>{category.label} ({category.id})</span>
                                            <button 
                                                type="button"
                                                className="remove-category-btn"
                                                onClick={() => handleRemoveCategory(category.id)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="add-category-form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={newCategory.id}
                                            onChange={handleCategoryIdChange}
                                            placeholder="Category ID"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={newCategory.label}
                                            onChange={handleCategoryLabelChange}
                                            placeholder="Category Label"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="add-category-btn"
                                        onClick={handleAddCategory}
                                        disabled={!newCategory.id || !newCategory.label}
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
                    <h2>Create New News Item</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newNewsItem.title}
                                onChange={handleNewItemChange}
                                placeholder="Enter news title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <select
                                id="category"
                                name="category"
                                value={newNewsItem.category}
                                onChange={handleNewItemChange}
                            >
                                <option value="">Select a category</option>
                                {newsroomSettings.categories.map((cat, index) => (
                                    <option key={index} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Date:</label>
                            <input
                                type="text"
                                id="date"
                                name="date"
                                value={newNewsItem.date}
                                onChange={handleNewItemChange}
                                placeholder="Enter news date (Month DD, YYYY)"
                            />
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
                                    ) : newNewsItem.image ? (
                                        <div className={`preview-image ${newNewsItem.image}`}></div>
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
                                    value={newNewsItem.image}
                                    onChange={handleNewItemChange}
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
                                            ref={newsItemImageInput}
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
                                value={newNewsItem.excerpt}
                                onChange={handleNewItemChange}
                                placeholder="Enter news excerpt"
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSaveNew}
                                disabled={!newNewsItem.title || !newNewsItem.category || (!newNewsItem.image && !uploadedImage) || !newNewsItem.excerpt}
                            >
                                <FaSave className="button-icon" />
                                Save News Item
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

            {editingNewsItem && (
                <div className="edit-form-container">
                    <h2>Edit News Item</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="edit-title">Title:</label>
                            <input
                                type="text"
                                id="edit-title"
                                name="title"
                                value={editingNewsItem.title}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-category">Category:</label>
                            <select
                                id="edit-category"
                                name="category"
                                value={editingNewsItem.category}
                                onChange={handleEditChange}
                            >
                                <option value="">Select a category</option>
                                {newsroomSettings.categories.map((cat, index) => (
                                    <option key={index} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-date">Date:</label>
                            <input
                                type="text"
                                id="edit-date"
                                name="date"
                                value={editingNewsItem.date}
                                onChange={handleEditChange}
                            />
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
                                    ) : editingNewsItem.imageURL ? (
                                        <img 
                                            src={editingNewsItem.imageURL} 
                                            alt="News" 
                                            className="uploaded-image-preview" 
                                        />
                                    ) : editingNewsItem.image ? (
                                        <div className={`preview-image ${editingNewsItem.image}`}></div>
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
                                    value={editingNewsItem.image}
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
                                value={editingNewsItem.excerpt}
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
                                    setEditingNewsItem(null);
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

            <div className="news-items-management">
                <h2>Manage News Items</h2>
                {loading ? (
                    <div className="loading">Loading news items...</div>
                ) : newsItems.length === 0 ? (
                    <div className="no-news-items">No news items found. Add your first news item!</div>
                ) : (
                    <div className="news-items-grid">
                        {newsItems.map((newsItem) => (
                            <div className={`news-card ${newsItem.id === featuredStoryId ? 'featured-card' : ''}`} key={newsItem.id}>
                                <div className="news-image">
                                    {newsItem.imageURL ? (
                                        <img src={newsItem.imageURL} alt={newsItem.title} />
                                    ) : newsItem.image ? (
                                        <div className={`preview-image ${newsItem.image}`}></div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <FaImage className="placeholder-icon" />
                                        </div>
                                    )}
                                </div>
                                <div className="news-content">
                                    <div className="news-category">
                                        <span>
                                            {newsroomSettings.categories.find(c => c.id === newsItem.category)?.label || newsItem.category}
                                        </span>
                                    </div>
                                    <div className="news-date">
                                        {newsItem.date}
                                    </div>
                                    <h3 className="news-title">{newsItem.title}</h3>
                                    <p className="news-excerpt">
                                        {newsItem.excerpt}
                                    </p>
                                    <div className="news-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(newsItem)}
                                        >
                                            <FaEdit className="button-icon" />
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(newsItem.id)}
                                        >
                                            <FaTrash className="button-icon" />
                                            Delete
                                        </button>
                                        <button
                                            className={`featured-button ${newsItem.id === featuredStoryId ? 'is-featured' : ''}`}
                                            onClick={() => handleSetFeatured(newsItem)}
                                            disabled={newsItem.id === featuredStoryId}
                                        >
                                            <FaStar className="button-icon" />
                                            {newsItem.id === featuredStoryId ? 'Featured' : 'Set as Featured'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-newsroom-footer">
                <p>© {new Date().getFullYear()} ProCart</p>
                <Link to="/newsroom" className="view-newsroom-link" target="_blank">View Newsroom</Link>
            </div>
        </div>
    );
};

export default AdminNewsroomPanel;