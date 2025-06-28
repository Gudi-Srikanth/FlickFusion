import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import Error from "./Error";
import MovieDetails from "./MovieDetails";
import Reviews from "./Reviews";
import Rating from "./Rating";
import "./Movie.css";

const Movie = () => {
  const { movieId } = useParams();
  const { user, authChecked } = useAuth();

  if (!authChecked) return <div>Loading authentication...</div>;

  if (!user) return <Error message="Please log in to view this page." />;

  return (
    <div className="movie-page">
      <Header />
      <div className="movie-container">
        <MovieDetails movieId={movieId} />
        <Rating movieId={movieId} />
        <Reviews movieId={movieId} />
      </div>
      <Footer />
    </div>
  );
};

export default Movie;
