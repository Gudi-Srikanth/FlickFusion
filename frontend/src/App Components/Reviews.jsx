import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddReview from './AddReview';
import './Reviews.css';

const Reviews = ({ movieId }) => {
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
  const checkUserReview = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/movie/${movieId}/user-review`, {
        withCredentials: true
      });
      const data = res.data;

      setHasReviewed(data.hasReviewed);
      setUserReview(data.review);
    } catch (err) {
      console.error("Check user review error:", err);
      setError("Failed to check user review");
    }
  };

const fetchReviews = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/movie/${movieId}/reviews`, {
      withCredentials: true
    });
    const data = res.data;

    setReviews(data.reviews);
  } catch (err) {
    console.error("Review fetch error:", err.response || err);
    setError("Failed to fetch reviews");
  }
};

    checkUserReview();
    fetchReviews();
  }, [movieId]);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reviews-section">
      <h2>Reviews</h2>

      {hasReviewed && userReview ? (
        <div className="review">
          <img
            src={userReview.profile_pic_url || "/assets/defaultPfp.jpg"}
            alt="user"
            className="review-pfp"
          />
          <div className="review-content">
            <p
              className="review-author"
              onClick={() => window.location.href = `/user/${userReview.user_id}`}
            >
              {userReview.display_name || "Anonymous"}
            </p>
            <p>{userReview.review_text}</p>
            <button className="like-button">👍 {userReview.likes || 0}</button>
          </div>
        </div>
      ) : (
        <AddReview movieId={movieId} />
      )}

      {reviews.map((review) => (
        <div key={review.review_id} className="review">
          <img
            src={review.profile_pic_url || "/assets/defaultPfp.jpg"}
            alt="user"
            className="review-pfp"
            onClick={() => window.location.href = `/user/${review.user_id}`}
          />
          <div className="review-content">
            <p
              className="review-author"
              onClick={() => window.location.href = `/user/${review.user_id}`}
            >
              {review.display_name || "Anonymous"}
            </p>
            <p>{review.review_text}</p>
            <button className="like-button">👍 {review.likes || 0}</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
