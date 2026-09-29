import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import JobCard from "../components/JobCard";

function Home() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
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

  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="page-container">

      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Find Your Next Opportunity</h1>

          <p>
            Discover jobs, connect with employers, and take
            the next step in your career.
          </p>

          <div className="page-actions">
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="dashboard-primary-button"
            >
              Browse Jobs
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="dashboard-secondary-button"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">

        <div className="page-header">
          <div>
            <h2>Latest Job Opportunities</h2>
            <p>
              Explore the latest opportunities available on
              JobBoard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="dashboard-secondary-button"
          >
            View All Jobs
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading jobs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && featuredJobs.length === 0 && (
          <div className="empty-state">
            <h3>No jobs available</h3>
            <p>
              There are currently no job openings available.
            </p>
          </div>
        )}

        {!loading && !error && featuredJobs.length > 0 && (
          <div className="jobs-grid">
            {featuredJobs.map((job) => (
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

export default Home;