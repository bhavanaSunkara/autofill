import React, { useState, useEffect, useCallback } from 'react';
import data from '../dummy.json';
import LRUCache from '../utils/LRUCache';

const cache = new LRUCache(10);

const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <strong key={index} className="text-primary">{part}</strong>
    ) : (
      part
    )
  );
};

const AutoComplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const filterData = useCallback((input) => {
    if (!input) return [];
    const cacheKey = input.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Normalize query: remove spaces and make lowercase
    const normalizedQuery = input.replace(/\s/g, '').toLowerCase();

    const filtered = data.filter((item) => {
      // Normalize item name: remove spaces and make lowercase
      const normalizedName = item.name.replace(/\s/g, '').toLowerCase();
      return normalizedName.includes(normalizedQuery);
    });

    cache.set(cacheKey, filtered);
    return filtered;
  }, []);


  useEffect(() => {
    const handler = setTimeout(() => {
      setResults(filterData(query));
    }, 300);
    return () => clearTimeout(handler);
  }, [query, filterData]);

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setResults([]);
  };

  return (
     <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="search-container"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          maxWidth: '90vw',
          zIndex: 1000,
        }}
      >
        <h2 className="text-center text-primary mb-4 fw-bold">SearchPro</h2>
        <div className="position-relative">
          <label htmlFor="search-input" className="visually-hidden">Search topics</label>
          <i
            className="bi bi-search position-absolute"
            style={{
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
              color: '#6c757d',
            }}
          ></i>
          <input
            id="search-input"
            type="text"
            className="form-control form-control-lg ps-5 pe-5"
            placeholder="Start typing e.g. react"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby="search-results"
            style={{ paddingLeft: '40px' }} 
          />
          
          {query && (
            <button
              className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-3 border-0"
              style={{ zIndex: 5 }}
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <ul
          className="list-group shadow-sm mt-3"
          id="search-results"
          role="listbox"
          aria-live="polite"
          style={{
            maxHeight: '300px',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {query && results.length === 0 && (
            <li className="list-group-item text-muted text-center">No results found</li>
          )}
          {results.map((item) => (
            <li
              key={item.id}
              className="list-group-item list-group-item-action"
              role="option"
              onClick={() => handleSuggestionClick(item.name)}
              style={{ cursor: 'pointer' }}
            >
                <i
                className="bi bi-search me-2"
                style={{ fontSize: '1rem', color: '#6c757d' }}
              ></i>
              {highlightMatch(item.name, query)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AutoComplete;