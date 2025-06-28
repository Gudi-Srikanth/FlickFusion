import React, { useState } from 'react';
import './AddReview.css';

const AddReview = ({ movieId, setReviews }) => {
  const [newReview, setNewReview] = useState("");

  const handleSubmit = async () => {
    if (!newReview.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:5000/movie/${movieId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReview }),
      });

      const data = await res.json();

      if (data.success) {
        setReviews(prev => [data.review, ...prev]);
        setNewReview("");
      }
    } catch (err) {
      console.error("Review submission failed:", err);
    }
  };

  return (
    <div className="add-review">
      <h3>Leave a Review</h3>
      <div className="review">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review here..."
        />
      </div>
      <div className="rating">
        <label for="rating">Rate this:</label>
        <input type="range" id="rating" name="rating" min="1" max="10" value="5" />
      </div>
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
};

export default AddReview;
