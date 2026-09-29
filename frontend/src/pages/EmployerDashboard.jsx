import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

const MEDIA_BASE_URL =
  "https://job-board-backend-hd1e.onrender.com";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [jobStats, setJobStats] = useState({});

  const [employerStats, setEmployerStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [applicantLoading, setApplicantLoading] =
    useState("");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error(
      "Unable to parse stored user:",
      error
    );
  }

  // ==========================================
  // FETCH JOB STATS
  // ==========================================

  const fetchJobStats = useCallback(
    async (jobId) => {
      try {
        const response = await API.get(
          `/jobs/${jobId}/stats`
        );

        setJobStats((previous) => ({
          ...previous,
          [jobId]:
            response.data.stats || {},
        }));
      } catch (err) {
        console.error(
          "Error fetching job stats:",
          err
        );
      }
    },
    []
  );

  // ==========================================
  // FETCH EMPLOYER JOBS
  // ==========================================

  const fetchMyJobs = useCallback(async () => {
    try {
      setError("");

      const response = await API.get(
        "/jobs/my-jobs"
      );

      const jobList =
        response.data.jobs || [];

      setJobs(jobList);

      await Promise.all(
        jobList.map((job) =>
          fetchJobStats(job._id)
        )
      );
    } catch (err) {
      console.error(
        "Error fetching jobs:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchJobStats]);

  // ==========================================
  // FETCH EMPLOYER STATS
  // ==========================================

  const fetchEmployerStats =
    useCallback(async () => {
      try {
        setStatsError("");

        const response = await API.get(
          "/employer/stats"
        );

        setEmployerStats(
          response.data.stats || {
            totalJobs: 0,
            openJobs: 0,
            closedJobs: 0,
            totalApplications: 0,
          }
        );
      } catch (err) {
        console.error(
          "Error fetching employer stats:",
          err
        );

        setStatsError(
          err.response?.data?.message ||
            "Unable to load employer statistics."
        );
      } finally {
        setStatsLoading(false);
      }
    }, []);

  // ==========================================
  // UPDATE JOB STATUS
  // ==========================================

  const updateJobStatus = async (
    jobId,
    status
  ) => {
    try {
      setError("");

      await API.patch(
        `/jobs/${jobId}/status`,
        {
          status,
        }
      );

      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                status,
              }
            : job
        )
      );

      await fetchEmployerStats();
    } catch (err) {
      console.error(
        "Job status update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update job status."
      );
    }
  };

  // ==========================================
  // FETCH APPLICANTS
  // ==========================================

  const fetchApplicants = async (jobId) => {
    try {
      setApplicantLoading(jobId);
      setError("");

      const response = await API.get(
        `/applications/job/${jobId}`
      );

      setApplicants((previous) => ({
        ...previous,
        [jobId]:
          response.data.applications || [],
      }));

      setSelectedJob(jobId);
    } catch (err) {
      console.error(
        "Error fetching applicants:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load applicants."
      );
    } finally {
      setApplicantLoading("");
    }
  };

  // ==========================================
  // UPDATE APPLICATION STATUS
  // ==========================================

  const updateStatus = async (
    applicationId,
    status,
    jobId
  ) => {
    try {
      setError("");

      await API.patch(
        `/applications/${applicationId}/status`,
        {
          status,
        }
      );

      await Promise.all([
        fetchApplicants(jobId),
        fetchEmployerStats(),
        fetchJobStats(jobId),
      ]);
    } catch (err) {
      console.error(
        "Error updating application status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    }
  };

  // ==========================================
  // DOWNLOAD RESUME
  // ==========================================

  const downloadResume = async (
    applicationId,
    fileName
  ) => {
    try {
      setError("");

      const response = await API.get(
        `/applications/${applicationId}/resume`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers[
              "content-type"
            ] ||
            "application/octet-stream",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        fileName || "resume";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Resume download error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to download resume."
      );
    }
  };

  // ==========================================
  // CLOSE APPLICANTS
  // ==========================================

  const closeApplicants = () => {
    setSelectedJob(null);
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        await Promise.all([
          fetchMyJobs(),
          fetchEmployerStats(),
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Dashboard loading error:",
            err
          );
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [
    fetchMyJobs,
    fetchEmployerStats,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">

          <div className="dashboard-header">

            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Loading Dashboard...
            </h1>

            <p>
              Please wait while we load
              your employer dashboard.
            </p>

          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* ====================================
            HEADER
        ===================================== */}

        <section className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Employer Dashboard
            </h1>

            <p>
              Welcome back,{" "}
              <strong>
                {user?.name || "Employer"}
              </strong>{" "}
              👋
            </p>

          </div>

          <div className="dashboard-actions">

            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={() =>
                navigate(
                  "/employer-profile"
                )
              }
            >
              Company Profile
            </button>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate("/post-job")
              }
            >
              + Post a Job
            </button>

          </div>

        </section>

        {/* ====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="dashboard-error">

            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                setStatsLoading(true);

                Promise.all([
                  fetchMyJobs(),
                  fetchEmployerStats(),
                ]);
              }}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================
            EMPLOYER OVERVIEW
        ===================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Employer Overview
              </h2>

              <p>
                Monitor your jobs and
                candidate activity.
              </p>

            </div>

          </div>

          {statsError && (
            <div className="dashboard-error">
              <p>{statsError}</p>
            </div>
          )}

          <div className="stats-grid">

            {/* TOTAL JOBS */}

            <div className="stat-card">

              <span className="stat-icon">
                💼
              </span>

              <div>

                <span className="stat-label">
                  Total Jobs
                </span>

                <strong className="stat-value">
                  {statsLoading
                    ? "..."
                    : employerStats.totalJobs}
                </strong>

              </div>

            </div>

            {/* OPEN JOBS */}

            <div className="stat-card">

              <span className="stat-icon">
                🟢
              </span>

              <div>

                <span className="stat-label">
                  Open Jobs
                </span>

                <strong className="stat-value">
                  {statsLoading
                    ? "..."
                    : employerStats.openJobs}
                </strong>

              </div>

            </div>

            {/* CLOSED JOBS */}

            <div className="stat-card">

              <span className="stat-icon">
                🔒
              </span>

              <div>

                <span className="stat-label">
                  Closed Jobs
                </span>

                <strong className="stat-value">
                  {statsLoading
                    ? "..."
                    : employerStats.closedJobs}
                </strong>

              </div>

            </div>

            {/* APPLICATIONS */}

            <div className="stat-card">

              <span className="stat-icon">
                👥
              </span>

              <div>

                <span className="stat-label">
                  Total Applications
                </span>

                <strong className="stat-value">
                  {statsLoading
                    ? "..."
                    : employerStats.totalApplications}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            JOB LISTINGS
        ===================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                My Job Listings
              </h2>

              <p>
                Manage your posted jobs and
                applications.
              </p>

            </div>

            <span className="application-count">
              {jobs.length}{" "}
              {jobs.length === 1
                ? "Job"
                : "Jobs"}
            </span>

          </div>

          {/* EMPTY */}

          {!error &&
            jobs.length === 0 && (
              <div className="dashboard-empty">

                <div className="empty-icon">
                  💼
                </div>

                <h3>
                  No job listings yet
                </h3>

                <p>
                  Create your first job
                  listing and start
                  receiving applications.
                </p>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate("/post-job")
                  }
                >
                  + Post Your First Job
                </button>

              </div>
            )}

          {/* JOB LIST */}

          {jobs.length > 0 && (
            <div className="employer-jobs-list">

              {jobs.map((job) => {

                const stats =
                  jobStats[job._id] || {};

                const companyLogo =
                  job.employer?.companyLogo;

                return (
                  <article
                    className="employer-job-card"
                    key={job._id}
                  >

                    {/* ==================================
                        JOB HEADER
                    =================================== */}

                    <div className="employer-job-header">

                      <div className="job-title-with-logo">

                        <div className="job-company-logo-wrapper">

                          {companyLogo ? (
                            <img
                              src={`${MEDIA_BASE_URL}/api/media/${companyLogo}`}
                              alt={
                                job.employer
                                  ?.companyName ||
                                job.company ||
                                "Company"
                              }
                              className="job-company-logo"
                            />
                          ) : (
                            <div className="job-company-logo-placeholder">
                              {(
                                job.company ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                        </div>

                        <div>

                          <span className="application-label">
                            Job Listing
                          </span>

                          <h3>
                            {job.title}
                          </h3>

                        </div>

                      </div>

                      <div className="job-header-badges">

                        <span className="job-type-badge">
                          {job.jobType}
                        </span>

                        <span
                          className={`status-badge status-${(
                            job.status ||
                            "Open"
                          ).toLowerCase()}`}
                        >
                          {job.status ||
                            "Open"}
                        </span>

                      </div>

                    </div>

                    {/* ==================================
                        JOB DETAILS
                    =================================== */}

                    <div className="application-details">

                      <div className="detail-item">

                        <span className="detail-label">
                          Company
                        </span>

                        <span className="detail-value">
                          {job.company ||
                            "Not specified"}
                        </span>

                      </div>

                      <div className="detail-item">

                        <span className="detail-label">
                          Location
                        </span>

                        <span className="detail-value">
                          {job.location ||
                            "Not specified"}
                        </span>

                      </div>

                      <div className="detail-item">

                        <span className="detail-label">
                          Salary
                        </span>

                        <span className="detail-value">
                          {job.salary ||
                            "Not specified"}
                        </span>

                      </div>

                      <div className="detail-item">

                        <span className="detail-label">
                          Posted
                        </span>

                        <span className="detail-value">

                          {job.createdAt
                            ? new Date(
                                job.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}

                        </span>

                      </div>

                    </div>

                    {/* ==================================
                        JOB STATS
                    =================================== */}

                    <div className="job-mini-stats">

                      <div>

                        <span>
                          Applications
                        </span>

                        <strong>
                          {stats.totalApplications ??
                            stats.applications ??
                            0}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Under Review
                        </span>

                        <strong>
                          {stats.underReview ??
                            0}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Shortlisted
                        </span>

                        <strong>
                          {stats.shortlisted ??
                            0}
                        </strong>

                      </div>

                    </div>

                    {/* ==================================
                        ACTIONS
                    =================================== */}

                    <div className="employer-job-actions">

                      <button
                        type="button"
                        className="dashboard-primary-button"
                        disabled={
                          applicantLoading ===
                          job._id
                        }
                        onClick={() =>
                          fetchApplicants(
                            job._id
                          )
                        }
                      >
                        {applicantLoading ===
                        job._id
                          ? "Loading..."
                          : "View Applicants"}
                      </button>

                      <button
                        type="button"
                        className="dashboard-secondary-button"
                        onClick={() =>
                          navigate(
                            `/jobs/${job._id}`
                          )
                        }
                      >
                        View Job
                      </button>

                      {/* CLOSE / REOPEN */}

                      {job.status ===
                      "Closed" ? (
                        <button
                          type="button"
                          className="job-reopen-button"
                          onClick={() =>
                            updateJobStatus(
                              job._id,
                              "Open"
                            )
                          }
                        >
                          Reopen Job
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="job-close-button"
                          onClick={() =>
                            updateJobStatus(
                              job._id,
                              "Closed"
                            )
                          }
                        >
                          Close Job
                        </button>
                      )}

                    </div>

                    {/* ==================================
                        APPLICANTS
                    =================================== */}

                    {selectedJob ===
                      job._id &&
                      applicants[
                        job._id
                      ] && (
                        <div className="applicants-panel">

                          <div className="section-heading">

                            <div>

                              <h3>
                                Applicants
                              </h3>

                              <p>
                                Review candidates
                                for this position.
                              </p>

                            </div>

                            <div className="applicant-panel-actions">

                              <span className="application-count">
                                {
                                  applicants[
                                    job._id
                                  ].length
                                }{" "}
                                Applicants
                              </span>

                              <button
                                type="button"
                                className="dashboard-secondary-button"
                                onClick={
                                  closeApplicants
                                }
                              >
                                Close
                              </button>

                            </div>

                          </div>

                          {/* NO APPLICANTS */}

                          {applicants[
                            job._id
                          ].length === 0 ? (
                            <div className="applicants-empty">
                              No applicants yet.
                            </div>
                          ) : (
                            applicants[
                              job._id
                            ].map(
                              (application) => (

                                <div
                                  className="applicant-card"
                                  key={
                                    application._id
                                  }
                                >

                                  {/* CANDIDATE */}

                                  <div>

                                    <h4>
                                      {application
                                        .candidate
                                        ?.name ||
                                        "Candidate"}
                                    </h4>

                                    <p>
                                      {application
                                        .candidate
                                        ?.email ||
                                        "Email unavailable"}
                                    </p>

                                    {application
                                      .candidate
                                      ?.phone && (
                                      <p>
                                        {
                                          application
                                            .candidate
                                            .phone
                                        }
                                      </p>
                                    )}

                                  </div>

                                  {/* STATUS */}

                                  <div className="applicant-controls">

                                    <span
                                      className={`status-badge status-${(
                                        application.status ||
                                        "Applied"
                                      )
                                        .toLowerCase()
                                        .replace(
                                          /\s+/g,
                                          "-"
                                        )}`}
                                    >
                                      {application.status ||
                                        "Applied"}
                                    </span>

                                    <select
                                      value={
                                        application.status ||
                                        "Applied"
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateStatus(
                                          application._id,
                                          event.target
                                            .value,
                                          job._id
                                        )
                                      }
                                    >

                                      <option value="Applied">
                                        Applied
                                      </option>

                                      <option value="Under Review">
                                        Under Review
                                      </option>

                                      <option value="Shortlisted">
                                        Shortlisted
                                      </option>

                                      <option value="Rejected">
                                        Rejected
                                      </option>

                                    </select>

                                  </div>

                                  {/* RESUME */}

                                  {application.resume && (
                                    <div className="applicant-resume">

                                      <div className="resume-file">

                                        <span className="resume-icon">
                                          📄
                                        </span>

                                        <div>

                                          <span className="detail-label">
                                            Resume
                                          </span>

                                          <span className="detail-value">
                                            {application
                                              .resumeFileName ||
                                              "Resume"}
                                          </span>

                                        </div>

                                      </div>

                                      <button
                                        type="button"
                                        className="resume-download-button"
                                        onClick={() =>
                                          downloadResume(
                                            application._id,
                                            application.resumeFileName ||
                                              "resume"
                                          )
                                        }
                                      >
                                        ↓ Download Resume
                                      </button>

                                    </div>
                                  )}

                                </div>

                              )
                            )
                          )}

                        </div>
                      )}

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default EmployerDashboard;