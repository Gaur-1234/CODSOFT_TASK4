import { useEffect, useState } from "react";
import API from "../services/api";

function JobStats({ jobId = "" }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] =
    useState(jobId);

  const [stats, setStats] = useState({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError("");

        const response = await API.get(
          "/jobs/my-jobs"
        );

        const jobList =
          response.data.jobs || [];

        setJobs(jobList);

        if (
          !selectedJobId &&
          jobList.length > 0
        ) {
          setSelectedJobId(
            jobList[0]._id
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load jobs."
        );
      }
    };

    loadJobs();
  }, [selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/jobs/${selectedJobId}/stats`
        );

        setStats(
          response.data.stats || {}
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load job statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedJobId]);

  const totalApplications =
    stats.totalApplications ??
    stats.applications ??
    0;

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>Job Statistics</h2>

          <p>
            Review application activity
            for your jobs.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="form-group">

          <label htmlFor="jobStatsSelect">
            Select Job
          </label>

          <select
            id="jobStatsSelect"
            value={selectedJobId}
            onChange={(e) =>
              setSelectedJobId(
                e.target.value
              )
            }
          >
            {jobs.map((job) => (
              <option
                key={job._id}
                value={job._id}
              >
                {job.title}
              </option>
            ))}
          </select>

        </div>
      )}

      {jobs.length === 0 &&
        !error && (
          <div className="dashboard-empty">

            <div className="empty-icon">
              📊
            </div>

            <h3>
              No jobs available
            </h3>

            <p>
              Post a job to start seeing
              statistics.
            </p>

          </div>
        )}

      {jobs.length > 0 && (
        <div className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">
              👥
            </span>

            <div>
              <span className="stat-label">
                Applications
              </span>

              <strong className="stat-value">
                {loading
                  ? "..."
                  : totalApplications}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              📨
            </span>

            <div>
              <span className="stat-label">
                Applied
              </span>

              <strong className="stat-value">
                {loading
                  ? "..."
                  : stats.applied ?? 0}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              🔎
            </span>

            <div>
              <span className="stat-label">
                Under Review
              </span>

              <strong className="stat-value">
                {loading
                  ? "..."
                  : stats.underReview ??
                    0}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ⭐
            </span>

            <div>
              <span className="stat-label">
                Shortlisted
              </span>

              <strong className="stat-value">
                {loading
                  ? "..."
                  : stats.shortlisted ??
                    0}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ❌
            </span>

            <div>
              <span className="stat-label">
                Rejected
              </span>

              <strong className="stat-value">
                {loading
                  ? "..."
                  : stats.rejected ?? 0}
              </strong>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}

export default JobStats;