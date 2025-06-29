import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AddReview from './AddReview';
import './Reviews.css';

const Reviews = ({ movieId }) => {
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, allRes] = await Promise.all([
        axios.get(`http://localhost:5000/movie/${movieId}/user-review`, { withCredentials: true }),
        axios.get(`http://localhost:5000/movie/${movieId}/reviews`, { withCredentials: true })
      ]);
      setHasReviewed(userRes.data.hasReviewed);
      setUserReview(userRes.data.review);
      setReviews(allRes.data.reviews);
    } catch (err) {
      console.error("Review fetch error:", err.response || err);
      setError("Failed to fetch reviews");
    }
  }, [movieId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewReview = (newReview) => {
    setUserReview(newReview);
    setHasReviewed(true);
  };

  const ReviewCard = ({ review }) => {
    const [likes, setLikes] = useState(review.likes || 0);
    const [liked, setLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [likeError, setLikeError] = useState(null);

    useEffect(() => {
      const fetchLikeStatus = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/review/${review.review_id}/likes`,
            { withCredentials: true }
          );
          if (res.data.success) {
            setLikes(res.data.count);
            setLiked(res.data.likedByCurrentUser);
          }
        } catch (err) {
          console.error("Failed to fetch like status:", err);
        }
      };
      fetchLikeStatus();
    }, [review.review_id]);

    const handleLikeToggle = async () => {
      if (isLikeLoading) return;
      
      const newLikedState = !liked;
      // Optimistic update
      setLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      setIsLikeLoading(true);
      setLikeError(null);

      try {
        const res = await axios.post(
          `http://localhost:5000/review/${review.review_id}/like`,
          { liked: newLikedState },
          { withCredentials: true }
        );
        
        if (!res.data.success) {
          // Revert if failed
          setLiked(!newLikedState);
          setLikes(prev => newLikedState ? prev - 1 : prev + 1);
          setLikeError("Failed to update like");
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
        // Revert on error
        setLiked(!newLikedState);
        setLikes(prev => newLikedState ? prev - 1 : prev + 1);
        setLikeError(err.response?.data?.error || "Failed to update like");
      } finally {
        setIsLikeLoading(false);
      }
    };

    return (
      <div className="review">
        <img
          src={review.profile_pic_url || "/assets/defaultPfp.jpg"}
          alt="user"
          className="review-pfp"
          onClick={() => window.location.href = `/user/${review.user_id}`}
        />
        <div className="review-main">
          <div className="review-content">
            <p
              className="review-author"
              onClick={() => window.location.href = `/user/${review.user_id}`}
            >
              {review.display_name || "Anonymous"}
            </p>
            <p className="review-text">{review.review_text}</p>
            {likeError && <div className="like-error">{likeError}</div>}
          </div>
          <button
            className={`like-button ${liked ? "liked" : ""}`}
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
          >
            {isLikeLoading ? '...' : '👍'} {likes}
          </button>
        </div>
      </div>
    );
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reviews-section">
      <h2 className="section-title">Reviews</h2>
      {!hasReviewed ? (
        <AddReview
          movieId={movieId}
          onReviewSubmit={handleNewReview}
        />
      ) : (
        userReview && <ReviewCard review={userReview} />
      )}
      {reviews.map((review) => (
        <ReviewCard key={review.review_id} review={review} />
      ))}
    </div>
  );
};

export default Reviews;