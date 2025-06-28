import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MovieDetails.css';

const MovieDetails = ({ movieId }) => {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/movie/${movieId}`, {
          withCredentials: true, // use withCredentials instead of credentials
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.data || !res.data.success || !res.data.movie) {
          throw new Error(res.data?.error || "Failed to fetch movie details");
        }

        setMovie(res.data.movie);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      }
    };

    fetchMovie();
  }, [movieId]);

  if (error) return <div className="error-message">{error}</div>;
  if (!movie) return <div>Loading movie...</div>;

  const backgroundImage = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '/assets/FlickFusionBG.jpg';

  return (
    <div
      className="movie-details"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="overlay">
        <div className="movie-content">
          <h1 className="movie-title">{movie.title || "Untitled Movie"}</h1>
          <div className="meta-info">
            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            {movie.vote_average !== undefined && (
              <span> • Rating: {movie.vote_average.toFixed(1)}</span>
            )}
            {movie.adult && <span> • 18+</span>}
          </div>
          <p className="movie-overview">{movie.overview || "No overview available."}</p>

          {movie.genres?.length > 0 && (
            <div className="genre-tags">
              {movie.genres.map((genre, idx) => (
                <span key={idx} className="genre-badge">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
