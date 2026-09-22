function SearchBar({ search, setSearch, onSearch }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search jobs, companies, skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button type="button" onClick={onSearch}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;