import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rating.css';

const Rating = ({ movieId, setRating }) => {
  const [userRating, setUserRating] = useState(0);
  const [textAboveRating, setTextAboveRating] = useState("🎬 Just watched it? Drop your rating — 1 for trash, 10 for masterpiece!");

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/movie/${movieId}/rating`, {
          withCredentials: true,
        });

        if (response.data?.rating !== undefined) {
          setUserRating(response.data.rating);
          setTextAboveRating(`You rated this movie: ${response.data.rating} ⭐️`);
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    fetchUserRating();
  }, [movieId]);

  const handleRatingChange = async (newRating) => {
    if (newRating === userRating) return;

    setUserRating(newRating);
    setTextAboveRating(`You rated this movie: ${newRating} ⭐️`);

    try {
      const response = await axios.post(
        `http://localhost:5000/movie/${movieId}/rating`,
        { rating: newRating },
        { withCredentials: true }
      );

      if (response.data?.newAverageRating !== undefined && setRating) {
        setRating(response.data.newAverageRating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="chart-scale">
      <p className="rating-text">{textAboveRating}</p>
      <div className="rating-buttons">
        {[...Array(10)].map((_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              onClick={() => handleRatingChange(value)}
              className={`rating-button ${userRating === value ? 'selected' : ''}`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Rating;
