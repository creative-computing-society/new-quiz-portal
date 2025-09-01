import React, { useState } from 'react';
import '../Style/AdminNavbar.css';

const AdminNavbar = () => {
  const [isTestDropdownOpen, setIsTestDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          Creative Computing Society
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href="/final-questions" className="nav-link">
            Final Questions
          </a>
          <a href="/solutions" className="nav-link">
            Solutions
          </a>
          
          {/* Tests Dropdown */}
          <div className="dropdown">
            <button 
              onClick={() => setIsTestDropdownOpen(!isTestDropdownOpen)}
              className="dropdown-button"
            >
              Tests
              <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isTestDropdownOpen && (
              <div className="dropdown-menu">
                <a href="/tests" className="dropdown-item">
                  Test
                </a>
                <a href="/results" className="dropdown-item">
                  Results
                </a>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => {
              // Handle logout functionality here
            }}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
