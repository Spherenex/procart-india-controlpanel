import React, { useState } from 'react';
import AdminBlogPanel from '../Blog/AdminBlogPanel'; // Correct import path
import './ManageFooter.css';
import AdminNewsroomPanel from '../Newsroom/AdminNewsroomPanel'; // Correct import path
import AdminFaqPanel from '../Faq/AdminFaqPanel'; // Correct import path

// Main component - properly exported
const ManageFooter = () => {
  const [activeSection, setActiveSection] = useState(null);

  // Handler for button clicks
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Placeholder components for Newsroom and FAQ
  const NewsroomContent = () => (
    <div className="placeholder-content">
      <h2>Newsroom Management</h2>
      <p>This section is under development. Here you will be able to create and manage newsroom content.</p>
    </div>
  );

  const FaqContent = () => (
    <div className="placeholder-content">
      <h2>FAQ Management</h2>
      <p>This section is under development. Here you will be able to create and manage FAQ content.</p>
    </div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'blog':
        return <AdminBlogPanel />;
      case 'newsroom':
        return <AdminNewsroomPanel />;
      case 'faq':
        return <AdminFaqPanel />;
      default:
        return (
          <div className="footer-welcome">
            <h2>Footer Content Management</h2>
            <p>Select an option above to manage different sections of your website footer.</p>
            <div className="footer-options-info">
              <div className="footer-option-card">
                <h3>Blog</h3>
                <p>Create and manage blog posts that appear in your website footer.</p>
                <button 
                  className="option-btn blog-btn"
                  onClick={() => handleSectionChange('blog')}
                >
                  Manage Blog
                </button>
              </div>
              <div className="footer-option-card">
                <h3>Newsroom</h3>
                <p>Manage press releases and news items for your company.</p>
                <button 
                  className="option-btn newsroom-btn"
                  onClick={() => handleSectionChange('newsroom')}
                >
                  Manage Newsroom
                </button>
              </div>
              <div className="footer-option-card">
                <h3>Contact & FAQ</h3>
                <p>Create and organize frequently asked questions to help your customers.</p>
                <button 
                  className="option-btn faq-btn"
                  onClick={() => handleSectionChange('faq')}
                >
                  Manage Contact & FAQ
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="manage-footer-container">
      <div className="footer-navigation">
        <h1>Footer Management</h1>
        <div className="footer-tabs">
          <button 
            className={`footer-tab ${activeSection === 'blog' ? 'active' : ''}`}
            onClick={() => handleSectionChange('blog')}
          >
            Create Blog
          </button>
          <button 
            className={`footer-tab ${activeSection === 'newsroom' ? 'active' : ''}`}
            onClick={() => handleSectionChange('newsroom')}
          >
            Create Newsroom
          </button>
          <button 
            className={`footer-tab ${activeSection === 'faq' ? 'active' : ''}`}
            onClick={() => handleSectionChange('faq')}
          >
            Create Contact & FAQ
          </button>
          <button 
            className="footer-tab back-tab"
            onClick={() => setActiveSection(null)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="footer-content">
        {renderContent()}
      </div>
    </div>
  );
};

// Make sure we're exporting properly
export default ManageFooter;