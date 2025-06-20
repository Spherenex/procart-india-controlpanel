import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/firebaseConfig';
import './ManageItems.css';

const ManageItems = () => {
  // Mode state
  const [activeMode, setActiveMode] = useState('trending'); // 'trending', 'categories', or 'categoryItems'
  
  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const navigate = useNavigate();
  
  // Fetch data on component mount and when active mode changes
  useEffect(() => {
    fetchData();
  }, [activeMode]);
  
  // Fetch filtered category items when selected category changes
  useEffect(() => {
    if (activeMode === 'categoryItems' && selectedCategory) {
      fetchCategoryItems();
    }
  }, [selectedCategory]);
  
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
        fetchCategories(); // Need categories for the filter dropdown
        fetchCategoryItems();
        break;
      default:
        fetchProducts();
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
      
      let categoryItemsQuery;
      
      if (selectedCategory === 'all') {
        categoryItemsQuery = query(collection(db, 'categoryItems'), orderBy('createdAt', 'desc'));
      } else {
        categoryItemsQuery = query(
          collection(db, 'categoryItems'), 
          where('categoryId', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }
      
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
      fetchData();
      
      // Show success message
      alert(`Item ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling item status:', error);
      alert('Failed to update item status. Please try again.');
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
  
  // Delete item
  const deleteItem = async (itemId, imageUrl, itemType) => {
    const itemTypeName = 
      itemType === 'trending' ? 'product' : 
      itemType === 'categories' ? 'category' : 
      'category item';
    
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
      fetchData();
      
      // Show success message
      alert(`${itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1)} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${itemTypeName}:`, error);
      alert(`Failed to delete ${itemTypeName}. Please try again.`);
    } finally {
      setConfirmDelete(null); // Reset confirm delete state
    }
  };
  
  // Navigate to edit item
  const navigateToEdit = (itemId, itemType) => {
    navigate(`/create-items?edit=${itemId}&mode=${itemType}`);
  };
  
  // Change active management mode
  const changeMode = (mode) => {
    setActiveMode(mode);
    setSelectedCategory('all');
  };
  
  return (
    <div className="content">
      <h1 className="page-title">Manage Items</h1>
      
      {/* Navigation Tabs */}
      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeMode === 'trending' ? 'active' : ''}`}
          onClick={() => changeMode('trending')}
        >
          Trending Components
        </button>
        <button 
          className={`tab-btn ${activeMode === 'categories' ? 'active' : ''}`}
          onClick={() => changeMode('categories')}
        >
          Categories
        </button>
        <button 
          className={`tab-btn ${activeMode === 'categoryItems' ? 'active' : ''}`}
          onClick={() => changeMode('categoryItems')}
        >
          Category Items
        </button>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <Link 
          to={`/create-items?mode=${activeMode}`} 
          className="add-new-btn"
        >
          <i className="fas fa-plus"></i> Add New {activeMode === 'trending' ? 'Trending Component' : activeMode === 'categories' ? 'Category' : 'Category Item'}
        </Link>
        
        {/* Category Filter (only for category items) */}
        {activeMode === 'categoryItems' && (
          <div className="category-filter">
            <label>Filter by Category:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Products List */}
      {activeMode === 'trending' && (
        <div className="card table-card">
          <h2>Trending Components</h2>
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map(product => (
                      <tr key={product.id} className={!product.active ? 'inactive-row' : ''}>
                        <td className="item-image">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </td>
                        <td>{product.name || 'Untitled'}</td>
                        <td>₹{product.price ? product.price.toFixed(2) : '0.00'}</td>
                        <td className="description-cell">{product.description || 'No description'}</td>
                        <td>
                          <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                          {product.isQuick && (
                            <span className="quick-badge">Quick</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn view-btn"
                            title="View Details"
                            onClick={() => alert(`View details for ${product.name}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-btn edit-btn"
                            title="Edit"
                            onClick={() => navigateToEdit(product.id, 'trending')}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`action-btn ${product.active ? 'deactivate-btn' : 'activate-btn'}`}
                            title={product.active ? 'Deactivate' : 'Activate'}
                            onClick={() => toggleItemStatus(product.id, product.active, 'trending')}
                          >
                            <i className={`fas ${product.active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => setConfirmDelete({ id: product.id, type: 'trending', imageUrl: product.imageUrl, name: product.name })}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No trending components found. <Link to="/create-items?mode=trending">Add your first component</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Categories List */}
      {activeMode === 'categories' && (
        <div className="card table-card">
          <h2>Categories</h2>
          
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Items Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map(category => {
                      const itemsCount = categoryItems.filter(item => item.categoryId === category.id).length;
                      
                      return (
                        <tr key={category.id} className={!category.active ? 'inactive-row' : ''}>
                          <td className="item-image">
                            {category.imageUrl ? (
                              <img src={category.imageUrl} alt={category.name} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                          </td>
                          <td>{category.name || 'Untitled'}</td>
                          <td className="description-cell">{category.description || 'No description'}</td>
                          <td>{itemsCount}</td>
                          <td>
                            <span className={`status-badge ${category.active ? 'active' : 'inactive'}`}>
                              {category.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn view-items-btn"
                              title="View Items"
                              onClick={() => {
                                setActiveMode('categoryItems');
                                setSelectedCategory(category.id);
                              }}
                            >
                              <i className="fas fa-list"></i>
                            </button>
                            <button
                              className="action-btn edit-btn"
                              title="Edit"
                              onClick={() => navigateToEdit(category.id, 'categories')}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`action-btn ${category.active ? 'deactivate-btn' : 'activate-btn'}`}
                              title={category.active ? 'Deactivate' : 'Activate'}
                              onClick={() => toggleItemStatus(category.id, category.active, 'categories')}
                            >
                              <i className={`fas ${category.active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => setConfirmDelete({ id: category.id, type: 'categories', imageUrl: category.imageUrl, name: category.name, itemsCount })}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No categories found. <Link to="/create-items?mode=categories">Add your first category</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Category Items List */}
      {activeMode === 'categoryItems' && (
        <div className="card table-card">
          <h2>
            Category Items
            {selectedCategory !== 'all' && (
              <span className="selected-category">
                {` in ${categories.find(c => c.id === selectedCategory)?.name || 'Selected Category'}`}
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="loading">Loading category items...</div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryItems.length > 0 ? (
                    categoryItems.map(item => (
                      <tr key={item.id} className={!item.active ? 'inactive-row' : ''}>
                        <td className="item-image">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </td>
                        <td>{item.name || 'Untitled'}</td>
                        <td>{item.categoryName || 'Unknown'}</td>
                        <td>₹{item.price ? item.price.toFixed(2) : '0.00'}</td>
                        <td className="description-cell">{item.description || 'No description'}</td>
                        <td>
                          <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn view-btn"
                            title="View Details"
                            onClick={() => alert(`View details for ${item.name}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-btn edit-btn"
                            title="Edit"
                            onClick={() => navigateToEdit(item.id, 'categoryItems')}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`action-btn ${item.active ? 'deactivate-btn' : 'activate-btn'}`}
                            title={item.active ? 'Deactivate' : 'Activate'}
                            onClick={() => toggleItemStatus(item.id, item.active, 'categoryItems')}
                          >
                            <i className={`fas ${item.active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => setConfirmDelete({ id: item.id, type: 'categoryItems', imageUrl: item.imageUrl, name: item.name })}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        {selectedCategory === 'all' ? (
                          <>No category items found. <Link to="/create-items?mode=categoryItems">Add your first item</Link></>
                        ) : (
                          <>No items found in this category. <Link to={`/create-items?mode=categoryItems&categoryId=${selectedCategory}`}>Add an item to this category</Link></>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete {confirmDelete.name || 'this item'}?
              {confirmDelete.type === 'categories' && confirmDelete.itemsCount > 0 && (
                <strong className="warning"> This will also delete {confirmDelete.itemsCount} associated items!</strong>
              )}
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={() => deleteItem(confirmDelete.id, confirmDelete.imageUrl, confirmDelete.type)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;