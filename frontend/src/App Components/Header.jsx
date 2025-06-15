import React from 'react';
import './Header.css';
import Search from './Search';
import Profile from './Profile';

const Header = () => {

  return (
    <header className="topHeader">

      <div className="header-left">
        <img className="logo" src="/logo.jpg" alt="logo" />
        <h1 className="title">FlickFusion</h1>
      </div>

     <div className="header-center">
      <Search />
     </div>
     <div className="header-right">
        <Profile />
      </div>
    </header>
  );
};

export default Header;
