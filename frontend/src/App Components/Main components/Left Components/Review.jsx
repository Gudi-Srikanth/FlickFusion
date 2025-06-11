import React, { useState } from "react";
import "./Review.css";

function Review() {
  const [formData, setFormData] = useState({
    title: "",
    rating: "",
    review: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    // You can add your logic for form submission here
  };

  return (
    <div className="review-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Movie Name:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <label htmlFor="rating">Rating:</label>
        <input
          type="number"
          id="rating"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          min="1"
          max="10"
          required
        />
        <label htmlFor="review">Review:</label>
        <textarea
          id="review"
          name="review"
          rows="5"
          value={formData.review}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Review;
