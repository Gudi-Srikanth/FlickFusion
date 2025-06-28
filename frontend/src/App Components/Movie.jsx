import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from './AuthContext';
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import Error from "./Error";
import "./Movie.css";

const Movie = () => {
  const { movieId } = useParams();
  const { user, setUser } = useAuth();
const [movie, setMovie] = useState(null);
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState("");

useEffect(() => {
  // Fetch movie info and reviews
  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/movie/${movieId}`, { withCredentials: true });
      setMovie(res.data);
    } catch (err) {
      console.error("Failed to fetch movie:", err);
    }

    try {
      const reviewsRes = await axios.get(`http://localhost:5000/movie/${movieId}/reviews`);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  fetchData();
}, [movieId]);

if (!user) return <Error message="User not found. Please log in again." />;

  const handleReviewSubmit = async () => {
    if (!newReview.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/movie/${movieId}/reviews`, {
        content: newReview,
        // Optionally add user_id or auth token
      }, { withCredentials: true });

      if (res.data.success) {
        setReviews([res.data.review, ...reviews]);
        setNewReview("");
      }
    } catch (err) {
      console.error("Review submission failed:", err);
    }
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="movie-page">
      <Header />
      <div className="movie-container">
        <div className="movie-header">
          <h1>{movie.title}</h1>
        </div>
        <div className="movie-details">
          <img src={movie.poster_url || "/assets/moviePoster.jpg"} alt="Poster" className="movie-poster" />
          <div className="movie-info">
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Genre:</strong> {movie.genres?.join(", ")}</p>
            <p><strong>Description:</strong> {movie.description}</p>
            <p><strong>Adult:</strong> {movie.adult ? "Yes" : "No"}</p>
            <p><strong>Average Rating:</strong> {movie.avg_rating?.toFixed(1) || "N/A"}</p>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews</h2>
          <div className="add-review">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review here..."
            />
            <button onClick={handleReviewSubmit}>Post</button>
          </div>

          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this movie!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review">
                <img
                  src={review.user?.profile_pic_url || "/assets/defaultPfp.jpg"}
                  alt="user"
                  className="review-pfp"
                  onClick={() => window.location.href = `/user/${review.user_id}`}
                />
                <div className="review-content">
                  <p className="review-author" onClick={() => window.location.href = `/user/${review.user_id}`}>
                    {review.user?.display_name || "Anonymous"}
                  </p>
                  <p>{review.content}</p>
                  <button className="like-button">👍 {review.likes || 0}</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Movie;
