import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/user/${id}`, { withCredentials: true })
      .then(res => {
        setProfile(res.data);
        setDisplayName(res.data.display_name);
        setProfilePicUrl(res.data.profile_pic_url);
      })
      .catch(err => console.error('Failed to load profile', err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/user/${id}`, {
      display_name: displayName,
      profile_pic_url: profilePicUrl
    }, { withCredentials: true })
      .then(() => alert('Profile updated'))
      .catch(err => console.error('Update failed', err));
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Display Name:
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <br />
        <label>
          Profile Pic URL:
          <input value={profilePicUrl} onChange={(e) => setProfilePicUrl(e.target.value)} />
        </label>
        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditProfile;
