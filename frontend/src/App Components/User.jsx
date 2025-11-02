import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';
import Footer from './Footer';
import './User.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const User = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviews, setReviews] = useState([]);

  const isOwnProfile = currentUser && currentUser.user_id === parseInt(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const requests = [
          axios.get(`${API_BASE_URL}/user/${userId}`),
          axios.get(`${API_BASE_URL}/user/${userId}/followers-count`),
          axios.get(`${API_BASE_URL}/user/${userId}/following-count`),
          axios.get(`${API_BASE_URL}/user/${userId}/reviews`)
        ];

        if (!isOwnProfile) {
          requests.push(
            axios.get(`${API_BASE_URL}/user/${userId}/is-following`, { withCredentials: true })
          );
        }

        const [userRes, followersRes, followingRes, reviewsRes, statusRes] = await Promise.all(requests);

        setUser(userRes.data.user);
        setFollowersCount(followersRes.data.count);
        setFollowingCount(followingRes.data.count);
        setReviews(reviewsRes.data.reviews);
        if (!isOwnProfile && statusRes) {
          setIsFollowing(statusRes.data.isFollowing);
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };

    fetchUserData();
  }, [userId, isOwnProfile]);

  const handleFollow = async () => {
    try {
      await axios.post(`${API_BASE_URL}/user/${userId}/follow`, {}, { withCredentials: true });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  return (
    <>
      <Header />
      <div className="user-container">
        {user && (
          <div className="user-profile">
            <img src={user.profile_pic_url || "/assets/defaultPfp.jpg"} alt="pfp" className="user-pfp" />
            <h2>{user.display_name || "Anonymous"}</h2>
            <div className="follow-stats">
              <span>{followersCount} Followers</span>
              <span>{followingCount} Following</span>
            </div>
            {!isOwnProfile && (
              !isFollowing ? (
                <button className="follow-btn" onClick={handleFollow}>Follow</button>
              ) : (
                <button className="followed-btn">Following</button>
              )
            )}
          </div>
        )}

        <div className="user-reviews">
          <h3>Recent Reviews</h3>
          {reviews.map((r) => (
            <div key={r.review_id} className="review-card">
              <p>{r.review_text}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default User;