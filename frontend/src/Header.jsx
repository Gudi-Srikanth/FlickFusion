import React from 'react';
import './Header.css';
import SearchIcon from '@mui/icons-material/Search';

function Header() {
    return (
        <header>
        <div className="header">
            <h1 className="title">FlickFusion</h1>
            <div className="search-bar">
                <h3>Find Movies</h3>
                <input type="text" placeholder="Search movies..." />
                <SearchIcon style={{ marginLeft: '5px', color: 'white' }} />
            </div>
            <div className="profile-pic">
                <img src="/pfp.png" alt="Profile" />
            </div>
        </div>
        </header>
    );
}

export default Header;
