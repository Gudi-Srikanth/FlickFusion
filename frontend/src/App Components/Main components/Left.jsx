import React from "react";
import './Left.css';
import { Link } from 'react-router-dom';
import LanguageIcon from '@mui/icons-material/Language';
import MovieIcon from '@mui/icons-material/Movie';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function Left(){
    return (
        <nav className="left-navigation">
            <ul>
                <li><LocalMoviesIcon />  Genre</li>
                <li><AccessTimeIcon />  Year</li>
                <li><TimelineIcon />  Rating</li>
                <li>< LanguageIcon /> Language</li>
                <li><MovieIcon />  IMDb Top 250 Movies</li>
                <li><AttachMoneyIcon />  Top Box Office</li>
                <li ><Link id="post" to='/review'>Review</Link></li>
            </ul>
        </nav>
    );
}

export default Left;

