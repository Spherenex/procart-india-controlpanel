import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import './AdminFaqPanel.css';

const AdminFaqPanel = () => {
    // State for FAQ settings
    const [faqSettings, setFaqSettings] = useState({
        title: 'How Can We Help You?',
        subtitle: 'Find answers to frequently asked questions or reach out to our support team',
        supportContacts: {
            phone: {
                number: '+91 8722237574',
                hours: '7 AM - 9 PM, All days'
            },
            email: {
                address: 'official.procart@gmail.com',
                response: 'Response within 24 hours'
            },
            whatsapp: {
                number: '+91 8722237574',
                note: 'Quick support via WhatsApp'
            }
        }
    });
    
    // State for FAQ categories and questions
    const [faqCategories, setFaqCategories] = useState([
        { id: 'ordering', label: 'Ordering' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'product', label: 'Product Issues' },
        { id: 'payment', label: 'Payment & Refunds' },
        { id: 'account', label: 'Account' }
    ]);
    
    const [faqItems, setFaqItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingSettings, setEditingSettings] = useState(false);
    const [newCategory, setNewCategory] = useState({ id: '', label: '' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [newFaqItem, setNewFaqItem] = useState({
        category: '',
        question: '',
        answer: ''
    });

    // Firebase references
    const db = getFirestore();
    const faqCollection = collection(db, 'faq');

    // Fetch FAQ data and settings from Firestore
    useEffect(() => {
        const fetchFaqData = async () => {
            try {
                // First get FAQ settings
                const settingsDoc = await getDoc(doc(db, 'settings', 'faq'));
                if (settingsDoc.exists()) {
                    setFaqSettings({
                        ...faqSettings,
                        ...settingsDoc.data()
                    });
                }
                
                // Get FAQ categories
                const categoriesDoc = await getDoc(doc(db, 'settings', 'faqCategories'));
                if (categoriesDoc.exists() && categoriesDoc.data().categories) {
                    setFaqCategories(categoriesDoc.data().categories);
                }
                
                // Then get FAQ items
                const querySnapshot = await getDocs(faqCollection);
                const faqData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFaqItems(faqData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching FAQ data:', error);
                setLoading(false);
            }
        };

        fetchFaqData();
    }, []);

    // Handle edit button click
    const handleEdit = (item) => {
        setEditingItem({ ...item });
        setIsAddingNew(false);
        setEditingSettings(false);
        setEditingCategory(null);
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ item?')) {
            try {
                await deleteDoc(doc(db, 'faq', id));
                setFaqItems(faqItems.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting FAQ item:', error);
                alert('Failed to delete FAQ item. Please try again.');
            }
        }
    };

    // Handle save changes for FAQ item
    const handleSave = async () => {
        try {
            const faqRef = doc(db, 'faq', editingItem.id);
            await updateDoc(faqRef, editingItem);
            
            // Update the FAQ items state
            setFaqItems(faqItems.map(item => 
                item.id === editingItem.id ? editingItem : item
            ));
            
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating FAQ item:', error);
            alert('Failed to update FAQ item. Please try again.');
        }
    };

    // Handle adding a new FAQ item
    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingItem(null);
        setEditingSettings(false);
        setEditingCategory(null);
        setNewFaqItem({
            category: '',
            question: '',
            answer: ''
        });
    };

    // Handle saving a new FAQ item
    const handleSaveNew = async () => {
        try {
            // Add the FAQ item to Firestore
            const docRef = await addDoc(faqCollection, newFaqItem);
            
            // Update local state
            setFaqItems([...faqItems, { ...newFaqItem, id: docRef.id }]);
            
            // Reset form
            setIsAddingNew(false);
            setNewFaqItem({
                category: '',
                question: '',
                answer: ''
            });
        } catch (error) {
            console.error('Error adding FAQ item:', error);
            alert('Failed to add FAQ item. Please try again.');
        }
    };

    // Handle form input changes for editing FAQ item
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingItem({ ...editingItem, [name]: value });
    };

    // Handle form input changes for new FAQ item
    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewFaqItem({ ...newFaqItem, [name]: value });
    };

    // Handle editing FAQ settings
    const handleEditSettings = () => {
        setEditingSettings(true);
        setIsAddingNew(false);
        setEditingItem(null);
        setEditingCategory(null);
    };

    // Handle settings form changes
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setFaqSettings({ 
            ...faqSettings, 
            [name]: value 
        });
    };

    // Handle support contact changes
    const handleContactChange = (contactType, field, value) => {
        setFaqSettings({
            ...faqSettings,
            supportContacts: {
                ...faqSettings.supportContacts,
                [contactType]: {
                    ...faqSettings.supportContacts[contactType],
                    [field]: value
                }
            }
        });
    };

    // Handle category ID change
    const handleCategoryIdChange = (e) => {
        setNewCategory({
            ...newCategory,
            id: e.target.value.toLowerCase().replace(/\s+/g, '_')
        });
    };

    // Handle category label change
    const handleCategoryLabelChange = (e) => {
        setNewCategory({
            ...newCategory,
            label: e.target.value
        });
    };

    // Add new category to the list
    const handleAddCategory = () => {
        if (newCategory.id && newCategory.label && 
            !faqCategories.some(cat => cat.id === newCategory.id)) {
            const updatedCategories = [...faqCategories, { ...newCategory }];
            setFaqCategories(updatedCategories);
            saveCategoriestoFirestore(updatedCategories);
            setNewCategory({ id: '', label: '' });
        }
    };

    // Remove category from the list
    const handleRemoveCategory = (categoryId) => {
        // Check if there are FAQ items using this category
        const hasItems = faqItems.some(item => item.category === categoryId);
        
        if (hasItems) {
            alert('Cannot delete this category because there are FAQ items using it. Please reassign or delete those items first.');
            return;
        }
        
        const updatedCategories = faqCategories.filter(category => category.id !== categoryId);
        setFaqCategories(updatedCategories);
        saveCategoriestoFirestore(updatedCategories);
    };

    // Edit category
    const handleEditCategory = (category) => {
        setEditingCategory({ ...category });
        setIsAddingNew(false);
        setEditingItem(null);
        setEditingSettings(false);
    };

    // Handle category edit changes
    const handleEditCategoryChange = (e, field) => {
        const value = e.target.value;
        if (field === 'id') {
            setEditingCategory({
                ...editingCategory,
                id: value.toLowerCase().replace(/\s+/g, '_')
            });
        } else {
            setEditingCategory({
                ...editingCategory,
                [field]: value
            });
        }
    };

    // Save edited category
    const handleSaveCategory = () => {
        const oldId = faqCategories.find(cat => cat.id === editingCategory.id)?.id;
        
        // Update categories
        const updatedCategories = faqCategories.map(cat => 
            cat.id === oldId ? editingCategory : cat
        );
        
        setFaqCategories(updatedCategories);
        saveCategoriestoFirestore(updatedCategories);
        
        // If ID changed, we need to update all FAQ items using this category
        if (oldId !== editingCategory.id) {
            updateFaqItemCategories(oldId, editingCategory.id);
        }
        
        setEditingCategory(null);
    };

    // Update FAQ items when category ID changes
    const updateFaqItemCategories = async (oldId, newId) => {
        try {
            // Update local state
            const updatedItems = faqItems.map(item => {
                if (item.category === oldId) {
                    return { ...item, category: newId };
                }
                return item;
            });
            
            setFaqItems(updatedItems);
            
            // Update in Firestore
            const promises = updatedItems
                .filter(item => item.category === newId)
                .map(item => updateDoc(doc(db, 'faq', item.id), { category: newId }));
            
            await Promise.all(promises);
            
        } catch (error) {
            console.error('Error updating FAQ items categories:', error);
            alert('Failed to update some FAQ items. Please refresh and try again.');
        }
    };

    // Save categories to Firestore
    const saveCategoriestoFirestore = async (categories) => {
        try {
            await setDoc(doc(db, 'settings', 'faqCategories'), { 
                categories: categories 
            });
        } catch (error) {
            console.error('Error saving categories:', error);
            alert('Failed to save categories. Please try again.');
        }
    };

    // Handle saving FAQ settings
    const handleSaveSettings = async () => {
        try {
            // Save settings to Firestore
            await setDoc(doc(db, 'settings', 'faq'), faqSettings);
            
            // Update state
            setEditingSettings(false);
            
            alert('FAQ settings saved successfully!');
        } catch (error) {
            console.error('Error saving FAQ settings:', error);
            alert('Failed to save FAQ settings. Please try again.');
        }
    };

    return (
        <div className="admin-faq-container">
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
                <h1 style={{color:'white', textAlign:'center', right:'300px', position:'relative'}}>ProCart FAQ Admin Panel</h1>
                
            </div>

            <div className="admin-controls">
                <button 
                    className="settings-button"
                    onClick={handleEditSettings}
                >
                    <FaCog className="button-icon" />
                    Contact & FAQ Settings
                </button>
                <button 
                    className="add-new-button"
                    onClick={handleAddNew}
                >
                    <FaPlus className="button-icon" />
                    Add FAQ Item
                </button>
            </div>

            {editingSettings && (
                <div className="edit-form-container settings-form">
                    <h2>FAQ Settings</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="title">Page Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={faqSettings.title}
                                onChange={handleSettingsChange}
                                placeholder="Enter page title"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subtitle">Subtitle:</label>
                            <input
                                type="text"
                                id="subtitle"
                                name="subtitle"
                                value={faqSettings.subtitle}
                                onChange={handleSettingsChange}
                                placeholder="Enter page subtitle"
                            />
                        </div>

                        <h3>Support Contact Information</h3>
                        
                        <div className="contact-section">
                            <div className="contact-icon">
                                <FaPhone />
                            </div>
                            <div className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number:</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        value={faqSettings.supportContacts.phone.number}
                                        onChange={(e) => handleContactChange('phone', 'number', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phoneHours">Hours:</label>
                                    <input
                                        type="text"
                                        id="phoneHours"
                                        value={faqSettings.supportContacts.phone.hours}
                                        onChange={(e) => handleContactChange('phone', 'hours', e.target.value)}
                                        placeholder="Enter working hours"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="contact-section">
                            <div className="contact-icon">
                                <FaEnvelope />
                            </div>
                            <div className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="emailAddress">Email Address:</label>
                                    <input
                                        type="email"
                                        id="emailAddress"
                                        value={faqSettings.supportContacts.email.address}
                                        onChange={(e) => handleContactChange('email', 'address', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailResponse">Response Time:</label>
                                    <input
                                        type="text"
                                        id="emailResponse"
                                        value={faqSettings.supportContacts.email.response}
                                        onChange={(e) => handleContactChange('email', 'response', e.target.value)}
                                        placeholder="Enter response time"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="contact-section">
                            <div className="contact-icon">
                                <FaWhatsapp />
                            </div>
                            <div className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="whatsappNumber">WhatsApp Number:</label>
                                    <input
                                        type="text"
                                        id="whatsappNumber"
                                        value={faqSettings.supportContacts.whatsapp.number}
                                        onChange={(e) => handleContactChange('whatsapp', 'number', e.target.value)}
                                        placeholder="Enter WhatsApp number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="whatsappNote">Note:</label>
                                    <input
                                        type="text"
                                        id="whatsappNote"
                                        value={faqSettings.supportContacts.whatsapp.note}
                                        onChange={(e) => handleContactChange('whatsapp', 'note', e.target.value)}
                                        placeholder="Enter note about WhatsApp support"
                                    />
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

            <div className="categories-management">
                <h2>Manage FAQ Categories</h2>
                <div className="categories-list-admin">
                    {faqCategories.map((category, index) => (
                        <div key={index} className="category-admin-item">
                            <div className="category-info">
                                <span className="category-label">{category.label}</span>
                                <span className="category-id">({category.id})</span>
                            </div>
                            <div className="category-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => handleEditCategory(category)}
                                >
                                    <FaEdit className="button-icon" />
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleRemoveCategory(category.id)}
                                >
                                    <FaTrash className="button-icon" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {editingCategory ? (
                        <div className="edit-category-form">
                            <h3>Edit Category</h3>
                            <div className="form-group">
                                <label htmlFor="editCategoryId">Category ID:</label>
                                <input
                                    type="text"
                                    id="editCategoryId"
                                    value={editingCategory.id}
                                    onChange={(e) => handleEditCategoryChange(e, 'id')}
                                    placeholder="Category ID (lowercase, no spaces)"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editCategoryLabel">Category Label:</label>
                                <input
                                    type="text"
                                    id="editCategoryLabel"
                                    value={editingCategory.label}
                                    onChange={(e) => handleEditCategoryChange(e, 'label')}
                                    placeholder="Category Label (displayed to users)"
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    className="save-button"
                                    onClick={handleSaveCategory}
                                >
                                    <FaSave className="button-icon" />
                                    Save Category
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => setEditingCategory(null)}
                                >
                                    <FaTimes className="button-icon" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="add-category-container">
                            <h3>Add New Category</h3>
                            <div className="add-category-form">
                                <div className="form-group">
                                    <label htmlFor="categoryId">Category ID:</label>
                                    <input
                                        type="text"
                                        id="categoryId"
                                        value={newCategory.id}
                                        onChange={handleCategoryIdChange}
                                        placeholder="Category ID (lowercase, no spaces)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="categoryLabel">Category Label:</label>
                                    <input
                                        type="text"
                                        id="categoryLabel"
                                        value={newCategory.label}
                                        onChange={handleCategoryLabelChange}
                                        placeholder="Category Label (displayed to users)"
                                    />
                                </div>
                                <button 
                                    className="add-category-btn"
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.id || !newCategory.label}
                                >
                                    <FaPlus className="button-icon" />
                                    Add Category
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isAddingNew && (
                <div className="edit-form-container">
                    <h2>Add New FAQ Item</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <select
                                id="category"
                                name="category"
                                value={newFaqItem.category}
                                onChange={handleNewItemChange}
                                required
                            >
                                <option value="">Select a category</option>
                                {faqCategories.map((cat, index) => (
                                    <option key={index} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="question">Question:</label>
                            <input
                                type="text"
                                id="question"
                                name="question"
                                value={newFaqItem.question}
                                onChange={handleNewItemChange}
                                placeholder="Enter the question"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="answer">Answer:</label>
                            <textarea
                                id="answer"
                                name="answer"
                                value={newFaqItem.answer}
                                onChange={handleNewItemChange}
                                placeholder="Enter the answer"
                                rows="5"
                                required
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button
                                className="save-button"
                                onClick={handleSaveNew}
                                disabled={!newFaqItem.category || !newFaqItem.question || !newFaqItem.answer}
                            >
                                <FaSave className="button-icon" />
                                Save FAQ Item
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setIsAddingNew(false)}
                            >
                                <FaTimes className="button-icon" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingItem && (
                <div className="edit-form-container">
                    <h2>Edit Contact & FAQ Item</h2>
                    <div className="edit-form">
                        <div className="form-group">
                            <label htmlFor="edit-category">Category:</label>
                            <select
                                id="edit-category"
                                name="category"
                                value={editingItem.category}
                                onChange={handleEditChange}
                            >
                                <option value="">Select a category</option>
                                {faqCategories.map((cat, index) => (
                                    <option key={index} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                                type="text"
                                id="edit-question"
                                name="question"
                                value={editingItem.question}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-answer">Answer:</label>
                            <textarea
                                id="edit-answer"
                                name="answer"
                                value={editingItem.answer}
                                onChange={handleEditChange}
                                rows="5"
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
                                onClick={() => setEditingItem(null)}
                            >
                                <FaTimes className="button-icon" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="faq-items-management">
                <h2>Manage FAQ Items</h2>
                {loading ? (
                    <div className="loading">Loading FAQ items...</div>
                ) : faqItems.length === 0 ? (
                    <div className="no-faq-items">No FAQ items found. Add your first FAQ item!</div>
                ) : (
                    <div className="faq-items-list">
                        {faqCategories.map((category) => {
                            const categoryItems = faqItems.filter(item => item.category === category.id);
                            if (categoryItems.length === 0) return null;
                            
                            return (
                                <div key={category.id} className="faq-category-section">
                                    <h3 className="category-heading">{category.label}</h3>
                                    {categoryItems.map((item) => (
                                        <div className="faq-item-card" key={item.id}>
                                            <div className="faq-item-content">
                                                <h4 className="faq-item-question">{item.question}</h4>
                                                <p className="faq-item-answer">{item.answer}</p>
                                            </div>
                                            <div className="faq-item-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FaEdit className="button-icon" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <FaTrash className="button-icon" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="admin-faq-footer">
                <p>© {new Date().getFullYear()} ProCart</p>
                <Link to="/faq" className="view-faq-link" target="_blank">View Contact & FAQ Page</Link>
            </div>
        </div>
    );
};

export default AdminFaqPanel;