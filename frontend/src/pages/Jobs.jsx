import { useEffect, useState } from "react";

import API from "../services/api";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/jobs");

        const jobsData = Array.isArray(response.data)
          ? response.data
          : response.data.jobs || [];

        if (isMounted) {
          setJobs(jobsData);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load jobs. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.jobType?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Find Jobs</h1>

          <p>
            Search and explore job opportunities available
            on JobBoard.
          </p>
        </div>
      </div>

      <section className="page-section">
        <SearchBar onSearch={handleSearch} />
      </section>

      <section className="page-section">

        <div className="page-header">
          <div>
            <h2>
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Available Jobs"}
            </h2>

            {!loading && !error && (
              <p>
                {filteredJobs.length} job
                {filteredJobs.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading jobs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="dashboard-primary-button"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredJobs.length === 0 && (
            <div className="empty-state">
              <h3>No jobs found</h3>

              <p>
                {searchQuery
                  ? "Try a different search term."
                  : "There are currently no jobs available."}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredJobs.length > 0 && (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                />
              ))}
            </div>
          )}

      </section>

    </div>
  );
}

export default Jobs;