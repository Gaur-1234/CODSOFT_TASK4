import { useEffect, useState } from "react";

import API from "../services/api";

function JobStats({ jobId = "" }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] =
    useState(jobId);

  const [stats, setStats] = useState({});

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [loadingStats, setLoadingStats] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD EMPLOYER JOBS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        const response = await API.get(
          "/jobs/my-jobs"
        );

        if (cancelled) return;

        const jobList =
          response.data.jobs || [];

        setJobs(jobList);

        // Select provided job first.
        // Otherwise select the first available job.
        if (!jobId && jobList.length > 0) {
          setSelectedJobId(
            jobList[0]._id
          );
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Job list error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load jobs."
        );
      } finally {
        if (!cancelled) {
          setLoadingJobs(false);
        }
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // ==========================================
  // LOAD SELECTED JOB STATS
  // ==========================================

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      try {
        setError("");
        setLoadingStats(true);

        const response = await API.get(
          `/jobs/${selectedJobId}/stats`
        );

        if (cancelled) return;

        setStats(
          response.data.stats || {}
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Job statistics error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load job statistics."
        );
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  const totalApplications =
    stats.totalApplications ??
    stats.applications ??
    0;

  // ==========================================
  // LOADING JOBS
  // ==========================================

  if (loadingJobs) {
    return (
      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Job Statistics
            </h2>

            <p>
              Loading your job statistics...
            </p>

          </div>

        </div>

        <div className="dashboard-card">

          <p>
            Loading jobs...
          </p>

        </div>

      </section>
    );
  }

  return (
    <section className="dashboard-section">

      {/* ====================================
          HEADER
      ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            Job Statistics
          </h2>

          <p>
            Review application activity
            for your jobs.
          </p>

        </div>

      </div>

      {/* ====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="dashboard-error">

          <p>
            {error}
          </p>

        </div>
      )}

      {/* ====================================
          NO JOBS
      ===================================== */}

      {jobs.length === 0 && !error && (
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

      {/* ====================================
          JOB SELECTOR
      ===================================== */}

      {jobs.length > 0 && (
        <div className="dashboard-card">

          <div className="form-group">

            <label htmlFor="jobStatsSelect">
              Select Job
            </label>

            <select
              id="jobStatsSelect"
              value={selectedJobId}
              onChange={(event) => {
                setSelectedJobId(
                  event.target.value
                );
              }}
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

        </div>
      )}

      {/* ====================================
          STATISTICS
      ===================================== */}

      {jobs.length > 0 && (
        <div className="stats-grid">

          {/* APPLICATIONS */}

          <div className="stat-card">

            <span className="stat-icon">
              👥
            </span>

            <div>

              <span className="stat-label">
                Applications
              </span>

              <strong className="stat-value">
                {loadingStats
                  ? "..."
                  : totalApplications}
              </strong>

            </div>

          </div>

          {/* APPLIED */}

          <div className="stat-card">

            <span className="stat-icon">
              📨
            </span>

            <div>

              <span className="stat-label">
                Applied
              </span>

              <strong className="stat-value">
                {loadingStats
                  ? "..."
                  : stats.applied ?? 0}
              </strong>

            </div>

          </div>

          {/* UNDER REVIEW */}

          <div className="stat-card">

            <span className="stat-icon">
              🔎
            </span>

            <div>

              <span className="stat-label">
                Under Review
              </span>

              <strong className="stat-value">
                {loadingStats
                  ? "..."
                  : stats.underReview ?? 0}
              </strong>

            </div>

          </div>

          {/* SHORTLISTED */}

          <div className="stat-card">

            <span className="stat-icon">
              ⭐
            </span>

            <div>

              <span className="stat-label">
                Shortlisted
              </span>

              <strong className="stat-value">
                {loadingStats
                  ? "..."
                  : stats.shortlisted ?? 0}
              </strong>

            </div>

          </div>

          {/* REJECTED */}

          <div className="stat-card">

            <span className="stat-icon">
              ❌
            </span>

            <div>

              <span className="stat-label">
                Rejected
              </span>

              <strong className="stat-value">
                {loadingStats
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