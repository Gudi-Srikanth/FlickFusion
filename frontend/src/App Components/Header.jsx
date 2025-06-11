import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import SearchIcon from '@mui/icons-material/Search';

function Header() {
    return (
        <header>
        <div className="header">
            <h1 className="title"><img className="logo" src="/logo.jpg" alt="logo"></img>  FlickFusion</h1>
            <Link className="a" to="/">HOME</Link>
            <Link className="a" to="/signin">SIGN IN</Link>
            <Link className="a" to="/signup">SIGN UP</Link>
            <div className="search-bar">
                <input type="text" placeholder='Find Movies'/>
                <SearchIcon style={{ marginLeft: '5px', color: 'white' }} />
            </div>
        </div>
        </header>
    );
}

export default Header;
