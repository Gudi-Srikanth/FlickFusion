import React, { useState } from 'react';
import axios from 'axios';
import './AddReview.css';

const AddReview = ({ movieId, onReviewSubmit }) => {
  const [newReview, setNewReview] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!newReview.trim()) return;

  setLoading(true);
  try {
    const response = await axios.post(
      `http://localhost:5000/movie/${movieId}/reviews`,
      { content: newReview },
      { withCredentials: true }
    );

    if (response.data.success) {
      onReviewSubmit(response.data.review);
      setNewReview("");
    } else {
      alert(response.data.error || "Failed to post review");
    }
  } catch (error) {
    console.error("Error posting review:", error);
    alert(error.response?.data?.error || "An error occurred while posting the review");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="add-review">
      <h3>Leave a Review</h3>
      <textarea
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
        placeholder="Write your review here..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default AddReview;
