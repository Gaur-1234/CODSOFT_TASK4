import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import API from "../services/api";

function Jobs() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load jobs when page opens
  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        setError("");

        const response = await API.get("/jobs");

        if (isMounted) {
          setJobs(response.data.jobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);

        if (isMounted) {
          setError("Unable to load jobs. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search jobs
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/jobs", {
        params: {
          search: search,
        },
      });

      setJobs(response.data.jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);

      setError("Unable to search jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobs-page">
      <h1>Available Jobs</h1>

      <SearchBar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
      />

      {loading && <p>Loading jobs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p>No jobs found.</p>
      )}

      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
          />
        ))}
      </div>
    </div>
  );
}

export default Jobs;