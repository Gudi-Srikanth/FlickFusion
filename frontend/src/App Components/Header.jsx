import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  const handlePfpClick = () => {
    if (user) {
      // open dropdown/modal in future
      console.log('Open profile menu');
    }
  };

  return (
    <header className="topHeader">

      <div className="header-left">
        <img className="logo" src="/logo.jpg" alt="logo" />
        <h1 className="title">FlickFusion</h1>
      </div>

      <div className="searchContainer">
        <input type="text" className="searchInput" placeholder="Search Movies..." onChange/>
       <div className="searchResults"> </div>
      </div>

      {user && (
        <div className="profilePicContainer" onClick={handlePfpClick}>
          <img
            src={'/defaultPfp.jpg'} 
            alt="Profile"
            className="profilePic"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
