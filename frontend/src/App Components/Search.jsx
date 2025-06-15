import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Search.css';
import { BiSearchAlt2 } from "react-icons/bi";

const Search = ({ onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideSearch = location.pathname === "/login" || location.pathname === "/signup";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") return;

    if (onSearch) {
      onSearch(trimmedQuery.toLowerCase());
    }

    navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    setSearchQuery("");
  };

  return (
    <>
      {!hideSearch && (
        <div className="searchContainer">
          <input
            type="text"
            className="searchInput"
            placeholder="Search Movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button type="button" className="searchBtn" onClick={handleSearch}>
            <BiSearchAlt2 />
          </button>
        </div>
      )}
    </>
  );
};

export default Search;
