import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CandidateDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [actionLoading, setActionLoading] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/applications/my-applications"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (error) {
      console.error(
        "Error fetching applications:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const response = await API.get(
        "/applications/stats"
      );

      setStats(
        response.data.stats || {
          totalApplications: 0,
          applied: 0,
          underReview: 0,
          shortlisted: 0,
          rejected: 0,
        }
      );
    } catch (error) {
      console.error(
        "Error fetching application stats:",
        error
      );

      setStatsError(
        error.response?.data?.message ||
          "Unable to load application statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const handleWithdraw = async (
    applicationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(applicationId);

      await API.patch(
        `/applications/${applicationId}/withdraw`
      );

      await Promise.all([
        fetchApplications(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error(
        "Withdraw application error:",
        error
      );

      window.alert(
        error.response?.data?.message ||
          "Unable to withdraw application."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleViewApplication = async (
    applicationId
  ) => {
    try {
      const response = await API.get(
        `/applications/${applicationId}`
      );

      const application =
        response.data.application;

      if (application?.job?._id) {
        navigate(
          `/jobs/${application.job._id}`
        );
      }
    } catch (error) {
      console.error(
        "Application details error:",
        error
      );

      window.alert(
        error.response?.data?.message ||
          "Unable to load application details."
      );
    }
  };

useEffect(() => {
  const loadDashboard = async () => {
    await Promise.all([
      fetchApplications(),
      fetchStats(),
    ]);
  };

  loadDashboard();
}, []);

  return (
    <main className="dashboard-page">

      {/* Dashboard Heading */}
      <div className="dashboard-heading">

        <div>
          <span className="dashboard-eyebrow">
            Candidate Portal
          </span>

          <h1>Candidate Dashboard</h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.name || "Candidate"}
            </strong>{" "}
            👋
          </p>
        </div>

        <div className="dashboard-heading-actions">

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() =>
              navigate("/candidate-profile")
            }
          >
            My Profile
          </button>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => navigate("/jobs")}
          >
            Browse Jobs
          </button>

        </div>

      </div>

      {/* Statistics */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Application Overview</h2>

            <p>
              Keep track of your job application
              progress.
            </p>
          </div>
        </div>

        {statsError && (
          <div className="dashboard-error">
            <p>{statsError}</p>
          </div>
        )}

        <div className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">
              📋
            </span>

            <div>
              <span className="stat-label">
                Total Applications
              </span>

              <strong className="stat-value">
                {statsLoading
                  ? "..."
                  : stats.totalApplications}
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
                {statsLoading
                  ? "..."
                  : stats.applied}
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
                {statsLoading
                  ? "..."
                  : stats.underReview}
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
                {statsLoading
                  ? "..."
                  : stats.shortlisted}
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
                {statsLoading
                  ? "..."
                  : stats.rejected}
              </strong>
            </div>
          </div>

        </div>

      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>

            <p>
              Manage your profile and discover
              opportunities.
            </p>
          </div>
        </div>

        <div className="quick-actions-grid">

          <button
            type="button"
            className="quick-action-card"
            onClick={() =>
              navigate("/candidate-profile")
            }
          >
            <span className="quick-action-icon">
              👤
            </span>

            <span className="quick-action-title">
              Edit Profile
            </span>

            <span className="quick-action-text">
              Update your professional information.
            </span>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => navigate("/jobs")}
          >
            <span className="quick-action-icon">
              🔎
            </span>

            <span className="quick-action-title">
              Find Jobs
            </span>

            <span className="quick-action-text">
              Explore new opportunities.
            </span>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() =>
              navigate("/change-password")
            }
          >
            <span className="quick-action-icon">
              🔐
            </span>

            <span className="quick-action-title">
              Change Password
            </span>

            <span className="quick-action-text">
              Keep your account secure.
            </span>
          </button>

        </div>

      </section>

      {/* Applications */}
      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>My Applications</h2>

            <p>
              Track the jobs you have applied for.
            </p>
          </div>

          <span className="application-count">
            {applications.length}{" "}
            {applications.length === 1
              ? "Application"
              : "Applications"}
          </span>

        </div>

        {/* Loading */}
        {loading && (
          <div className="dashboard-state">
            <div className="loading-spinner"></div>

            <p>
              Loading your applications...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="dashboard-error">

            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                fetchApplications();
                fetchStats();
              }}
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          applications.length === 0 && (
            <div className="dashboard-empty">

              <div className="empty-icon">
                💼
              </div>

              <h3>
                No applications yet
              </h3>

              <p>
                Find a job that matches your skills
                and start your application.
              </p>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => navigate("/jobs")}
              >
                Explore Jobs
              </button>

            </div>
          )}

        {/* Applications */}
        {!loading &&
          !error &&
          applications.length > 0 && (
            <div className="applications-list">

              {applications.map(
                (application) => {

                  const status =
                    application.status ||
                    "Applied";

                  const canWithdraw =
                    status === "Applied" ||
                    status === "Under Review";

                  return (
                    <article
                      className="application-card"
                      key={application._id}
                    >

                      <div className="application-card-top">

                        <div>
                          <span className="application-label">
                            Application
                          </span>

                          <h3>
                            {application.job
                              ?.title ||
                              "Job Title"}
                          </h3>
                        </div>

                        <span
                          className={`status-badge status-${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>

                      </div>

                      <div className="application-details">

                        <div className="detail-item">
                          <span className="detail-label">
                            Company
                          </span>

                          <span className="detail-value">
                            {application.job
                              ?.company || "N/A"}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            Location
                          </span>

                          <span className="detail-value">
                            {application.job
                              ?.location || "N/A"}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            Job Type
                          </span>

                          <span className="detail-value">
                            {application.job
                              ?.jobType || "N/A"}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            Applied On
                          </span>

                          <span className="detail-value">
                            {application.createdAt
                              ? new Date(
                                  application.createdAt
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

                      {/* Resume */}
                      {application.resumeFileName && (
                        <div className="resume-info">

                          <span>📄</span>

                          <div>
                            <span className="detail-label">
                              Resume
                            </span>

                            <span className="detail-value">
                              {
                                application.resumeFileName
                              }
                            </span>
                          </div>

                        </div>
                      )}

                      <div className="application-actions">

                        {application.job?._id && (
                          <button
                            type="button"
                            className="dashboard-primary-button"
                            onClick={() =>
                              navigate(
                                `/jobs/${application.job._id}`
                              )
                            }
                          >
                            View Job
                          </button>
                        )}

                        <button
                          type="button"
                          className="dashboard-secondary-button"
                          onClick={() =>
                            handleViewApplication(
                              application._id
                            )
                          }
                        >
                          View Application
                        </button>

                        {canWithdraw && (
                          <button
                            type="button"
                            className="dashboard-danger-button"
                            disabled={
                              actionLoading ===
                              application._id
                            }
                            onClick={() =>
                              handleWithdraw(
                                application._id
                              )
                            }
                          >
                            {actionLoading ===
                            application._id
                              ? "Withdrawing..."
                              : "Withdraw"}
                          </button>
                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

    </main>
  );
}

export default CandidateDashboard;