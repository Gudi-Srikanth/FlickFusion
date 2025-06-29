import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";

const Home = () => {
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [latestRes, popularRes, topRatedRes] = await Promise.all([
            axios.get("http://localhost:5000/latest-releases"),
            axios.get("http://localhost:5000/popular-movies"),
            axios.get("http://localhost:5000/top-rated"),
        ]);
        setLatest(latestRes.data.slice(0, 7));
        setPopular(popularRes.data.slice(0, 7));
        setTopRated(topRatedRes.data.slice(0, 7));
      } catch (err) {
        console.error(err);
        setError("Could not load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const renderSection = (title, movies) => (
    <div className="home-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-grid">
        {(loading ? Array(7).fill({}) : movies).map((movie, idx) => (
          <div
            className="movie-card"
            key={movie.id || movie.movie_id || idx}
            onClick={() => !loading && handleClick(movie.id || movie.movie_id)}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={250}
                className="movie-skeleton"
              />
            ) : (
              <div className="poster-container">
                <img
                  className="poster-img"
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.jpg'}
                  alt={movie.title}
                  onError={(e) =>
                    (e.target.src = "/assets/movie-placeholder.jpg")
                  }
                />
                <div className="movie-overlay">
                  <h3 className="movie-title">{movie.title}</h3>
                  {movie.avg_rating && (
                    <span className="rating-badge">⭐ {movie.avg_rating}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="home-container">
      {error ? <div className="error-message">{error}</div> : null}
      {renderSection("Latest Releases", latest)}
      {renderSection("Most Popular", popular)}
      {renderSection("Top Rated", topRated)}
    </div>
  );
};

export default Home;
