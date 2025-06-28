import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handlePfpClick = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    navigate(`/edit-profile/${user.user_id}`);
  };

  useEffect(() => {
    if (user && showMenu) {
      axios
        .get(`http://localhost:5000/follow-stats/${user.user_id}`, { withCredentials: true })
        .then((res) => setStats(res.data))
        .catch((err) => console.error("Follow stats fetch error:", err));
    }
  }, [showMenu, user]);

  return (
    <div className="profile">
      {user && (
        <div className="profilePicContainer" onClick={handlePfpClick}>
          <img src={user.profile_pic_url} alt="Profile" className="profilePic" />
          {showMenu && (
            <div className="profileMenu" ref={menuRef}>
              <p>Hello, {user.display_name}</p>
              <p>Followers: {stats.followers}</p>
              <p>Following: {stats.following}</p>
              <button onClick={handleEditProfile}>Edit Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
