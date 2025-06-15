import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';
import Header from './Header';
import Footer from './Footer';
import Error from './Error';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

       const response = await axios.get("http://localhost:5000/search", {
       params: { query },
      withCredentials: true,  
      });
      console.log("Frontend Axios response:", response.data);
      setResults(response.data || []);

      }catch (err) {
        console.error("Frontend Axios error:", err);
        if (err.response) {
        console.error("Backend response error:", err.response.status, err.response.data);
        }
        setError('Failed to fetch results.');
        }finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const renderContent = () => {
    if (!query) {
      return <Error message="Please enter a search query." />;
    }
    if (loading) {
      return <Error message="Loading..." />;
    }
    if (error) {
      return <Error message={error} />;
    }
    if (results.length === 0) {
      return <Error message={`No results found for "${query}"`} />;
    }

    return (
      <>
        <h2 className="searchTitle">Top 5 Results for "{query}"</h2>
        <div className="resultsGrid">
          {results.map((movie) => (
            <div key={movie.id} className="resultCard">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/placeholder.jpg'}
                alt={movie.title}
                className="poster"
                loading="lazy"
              />
              <div className="movieInfo">
                <h3 className="movieTitle">{movie.title}</h3>
                <p className="movieRating">⭐ {movie.vote_average || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="searchResultsContainer">
      <Header />
      {renderContent()}
      <Footer />
    </div>
  );
};

export default SearchResults;
