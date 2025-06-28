import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './EditProfile.css';
import { BiPencil } from "react-icons/bi";
import Error from './Error';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [userName, setUserName] = useState(user?.username || '');
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profile_pic_url || '');
  const [editProfilePicUrl, setEditProfilePicUrl] = useState(false);

  if (!user) return <Error message="User not found. Please log in again." />;

  const originalProfile = {
    display_name: user.display_name,
    user_name: user.username,
    profile_pic_url: user.profile_pic_url,
  };

  const isChanged =
    displayName !== originalProfile.display_name ||
    userName !== originalProfile.user_name ||
    profilePicUrl !== originalProfile.profile_pic_url;

  const profilePicOptions = [
    '/assets/defaultPfp.jpg',
    '/assets/darkHappy.jpg',
    '/assets/darkDarkPfp.jpg',
    '/assets/greyPfp.jpg',
    '/assets/sleepyPfp.jpg',
    '/assets/smileyPfp.jpg',
    '/assets/starPfp.jpg',
    '/assets/sunglassesPfp.jpg',
    '/assets/whiteDarkpfp.jpg',
  ].filter((url) => url !== originalProfile.profile_pic_url);

  const handleCancel = () => {
    setDisplayName(originalProfile.display_name);
    setUserName(originalProfile.user_name);
    setProfilePicUrl(originalProfile.profile_pic_url);
    setEditProfilePicUrl(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || !userName) {
      setError("Display name and username cannot be empty.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/edit-profile', {
        user_id: user.user_id,
        display_name: displayName,
        username: userName,
        profile_pic_url: profilePicUrl
      }, { withCredentials: true });

      if (res.data.success) {
        setUser(res.data.user);
        navigate('/home');
      } else {
        setError(res.data.message || "Failed to update.");
      }
    } catch (err) {
      console.error("Edit profile error:", err);
      setError("An error occurred while updating.");
    }
  };

  return (
    <div>
      <Header />
      <div className="editProfileContainer">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="editForm">
          <div className="profilePicContainer">
            <img src={profilePicUrl} alt="Profile" className="profilePicEdit" />
            <BiPencil className="editIcon" onClick={() => setEditProfilePicUrl(!editProfilePicUrl)} />
          </div>

          {editProfilePicUrl && (
            <div className="profilePicMenu">
              {profilePicOptions.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`option ${index}`}
                  className={`profileOption ${profilePicUrl === url ? 'selected' : ''}`}
                  onClick={() => setProfilePicUrl(url)}
                />
              ))}
            </div>
          )}

          <div className="inputGroup">
            <label htmlFor="displayName">Display Name:</label>
            <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div className="inputGroup">
            <label htmlFor="username">Username:</label>
            <input id="username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </div>

          <div className="inputGroup">
            <label htmlFor="email">Email (optional):</label>
            <input id="email" disabled placeholder="(Coming Soon)" />
          </div>

          <div className="inputGroup">
            <label htmlFor="phone">Phone (optional):</label>
            <input id="phone" disabled placeholder="(Coming Soon)" />
          </div>

          <div className="buttonGroup">
            <button type="submit" className="submitButton" disabled={!isChanged}>Save</button>
            <button type="button"  disabled={!isChanged} className="cancelButton" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
      {error && <Error message={error} />}
      <Footer />
    </div>
  );
};
export default EditProfile;