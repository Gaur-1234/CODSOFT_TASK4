import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import JobCard from "../components/JobCard";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setError("");

        const response = await API.get("/jobs");

        // Show latest 3 jobs as featured jobs
        setJobs(response.data.jobs.slice(0, 3));
      } catch (error) {
        console.error(
          "Error fetching featured jobs:",
          error
        );

        setError("Unable to load featured jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Find Your Dream Job</h1>

        <p>
          Discover opportunities, connect with employers,
          and take the next step in your career.
        </p>

        <Link to="/jobs" className="hero-button">
          Explore Jobs
        </Link>
      </section>

      <section className="featured-section">
        <h2>Featured Jobs</h2>

        <p>
          Explore the latest opportunities from companies
          looking for talented candidates.
        </p>

        {loading && <p>Loading featured jobs...</p>}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          jobs.length === 0 && (
            <p>No featured jobs available.</p>
          )}

        {!loading &&
          !error &&
          jobs.length > 0 && (
            <div className="jobs-list">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                />
              ))}
            </div>
          )}

        <Link to="/jobs">
          View All Jobs
        </Link>
      </section>
    </div>
  );
}

export default Home;