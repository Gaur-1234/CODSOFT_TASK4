import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        setLoading(false);
        return;
      }

      const response = await API.get(
        "/jobs/my-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        return;
      }

      const response = await API.get(
        `/applications/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplicants((previous) => ({
        ...previous,
        [jobId]:
          response.data.applications || [],
      }));

      setSelectedJob(jobId);
    } catch (error) {
      console.error(
        "Error fetching applicants:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load applicants."
      );
    }
  };

  const updateStatus = async (
    applicationId,
    status,
    jobId
  ) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        return;
      }

      await API.patch(
        `/applications/${applicationId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchApplicants(jobId);
    } catch (error) {
      console.error(
        "Error updating application status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update application status."
      );
    }
  };

  useEffect(() => {
    // Intentional API data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyJobs();
  }, []);

  return (
    <main className="dashboard-page">

      {/* Dashboard Heading */}
      <div className="dashboard-heading">

        <div>
          <span className="dashboard-eyebrow">
            Employer Portal
          </span>

          <h1>Employer Dashboard</h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.name || "Employer"}
            </strong>{" "}
            👋
          </p>
        </div>

        <button
          type="button"
          className="dashboard-primary-button"
          onClick={() => navigate("/post-job")}
        >
          + Post a Job
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="dashboard-error">
          <strong>Something went wrong</strong>
          <p>{error}</p>
        </div>
      )}

      {/* Jobs */}
      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>My Job Listings</h2>

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

        {/* Loading */}
        {loading && (
          <div className="dashboard-state">
            <div className="loading-spinner"></div>
            <p>Loading your jobs...</p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          jobs.length === 0 && (
            <div className="dashboard-empty">

              <div className="empty-icon">
                💼
              </div>

              <h3>No job listings yet</h3>

              <p>
                Create your first job listing
                and start receiving applications.
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

        {/* Job List */}
        {!loading &&
          jobs.length > 0 && (
            <div className="employer-jobs-list">

              {jobs.map((job) => (
                <article
                  className="employer-job-card"
                  key={job._id}
                >

                  <div className="employer-job-header">

                    <div>
                      <span className="application-label">
                        Job Listing
                      </span>

                      <h3>{job.title}</h3>
                    </div>

                    <span className="job-type-badge">
                      {job.jobType}
                    </span>

                  </div>

                  <div className="application-details">

                    <div className="detail-item">
                      <span className="detail-label">
                        Company
                      </span>

                      <span className="detail-value">
                        {job.company}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Location
                      </span>

                      <span className="detail-value">
                        {job.location}
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

                  <div className="employer-job-actions">

                    <button
                      type="button"
                      className="dashboard-primary-button"
                      onClick={() =>
                        fetchApplicants(job._id)
                      }
                    >
                      View Applicants
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

                  </div>

                  {/* Applicants */}
                  {selectedJob === job._id &&
                    applicants[job._id] && (
                      <div className="applicants-panel">

                        <div className="section-heading">
                          <div>
                            <h3>Applicants</h3>

                            <p>
                              Review candidates
                              for this position.
                            </p>
                          </div>

                          <span className="application-count">
                            {
                              applicants[job._id]
                                .length
                            }{" "}
                            Applicants
                          </span>
                        </div>

                        {applicants[job._id]
                          .length === 0 ? (
                          <div className="applicants-empty">
                            No applicants yet.
                          </div>
                        ) : (
                          applicants[job._id].map(
                            (application) => (
                              <div
                                className="applicant-card"
                                key={
                                  application._id
                                }
                              >

                                <div>
                                  <h4>
                                    {
                                      application
                                        .candidate
                                        ?.name
                                    }
                                  </h4>

                                  <p>
                                    {
                                      application
                                        .candidate
                                        ?.email
                                    }
                                  </p>
                                </div>

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
                                    {
                                      application.status
                                    }
                                  </span>

                                  <select
                                    value={
                                      application.status
                                    }
                                    onChange={(e) =>
                                      updateStatus(
                                        application._id,
                                        e.target
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

                                {application.resume && (
                                  <p className="applicant-resume">
                                    📄{" "}
                                    {
                                      application.resume
                                    }
                                  </p>
                                )}

                              </div>
                            )
                          )
                        )}

                      </div>
                    )}

                </article>
              ))}

            </div>
          )}

      </section>

    </main>
  );
}

export default EmployerDashboard;