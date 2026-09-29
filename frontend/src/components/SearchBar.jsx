import { useState } from "react";

function SearchBar({
  onSearch,
  initialValue = "",
}) {
  const [searchTerm, setSearchTerm] =
    useState(initialValue);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm("");

    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form
      className="search-bar"
      onSubmit={handleSubmit}
    >

      {/* SEARCH INPUT */}

      <div className="search-input-wrapper">

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search jobs by title, company or keyword..."
          aria-label="Search jobs"
        />

      </div>

      {/* ACTIONS */}

      <div className="search-actions">

        <button
          type="submit"
          className="dashboard-primary-button"
        >
          Search
        </button>

        {searchTerm && (
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={handleClear}
          >
            Clear
          </button>
        )}

      </div>

    </form>
  );
}

export default SearchBar;