import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";
import ApplicationStats from "../components/ApplicationStats";
import SavedJobs from "../components/SavedJobs";

function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      try {
        const response = await API.get(
          "/applications/my-applications"
        );

        if (cancelled) return;

        setApplications(
          response.data?.applications ||
            response.data ||
            []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Candidate applications error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your applications."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-badge status-applied";

      case "Under Review":
        return "status-badge status-review";

      case "Shortlisted":
        return "status-badge status-shortlisted";

      case "Rejected":
        return "status-badge status-rejected";

      case "Withdrawn":
        return "status-badge status-withdrawn";

      default:
        return "status-badge";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">

          <div className="dashboard-header">

            <span className="dashboard-eyebrow">
              Candidate Dashboard
            </span>

            <h1>
              Loading Dashboard...
            </h1>

            <p>
              Please wait while we load your
              application data.
            </p>

          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">

          <div className="dashboard-header">

            <span className="dashboard-eyebrow">
              Candidate Dashboard
            </span>

            <h1>
              Unable to Load Dashboard
            </h1>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* HEADER */}

        <section className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              Candidate Dashboard
            </span>

            <h1>
              Welcome Back 👋
            </h1>

            <p>
              Track your applications, manage
              saved jobs and keep your profile
              up to date.
            </p>

          </div>

          <div className="dashboard-actions">

            <Link
              to="/jobs"
              className="dashboard-primary-button"
            >
              Browse Jobs
            </Link>

            <Link
              to="/candidate-profile"
              className="dashboard-secondary-button"
            >
              My Profile
            </Link>

          </div>

        </section>

        {/* APPLICATION STATISTICS */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Application Overview
              </h2>

              <p>
                See the current status of your
                job applications.
              </p>

            </div>

          </div>

          <div className="dashboard-card">

            <ApplicationStats />

          </div>

        </section>

        {/* MY APPLICATIONS */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                My Applications
              </h2>

              <p>
                Review the jobs you have applied
                for and their current status.
              </p>

            </div>

          </div>

          {applications.length === 0 ? (
            <div className="dashboard-card empty-state">

              <h3>
                No Applications Yet
              </h3>

              <p>
                You haven't applied for any jobs
                yet. Explore available opportunities
                and submit your first application.
              </p>

              <Link
                to="/jobs"
                className="dashboard-primary-button"
              >
                Browse Jobs
              </Link>

            </div>
          ) : (
            <div className="applications-list">

              {applications.map((application) => {

                const job =
                  application.job || {};

                const company =
                  job.company ||
                  job.employer?.companyName ||
                  "Company";

                return (
                  <article
                    className="application-card"
                    key={
                      application._id ||
                      application.id
                    }
                  >

                    <div className="application-card-content">

                      <div>

                        <h3>
                          {job.title ||
                            "Job Position"}
                        </h3>

                        <p className="application-company">
                          {company}
                        </p>

                        {job.location && (
                          <p>
                            📍 {job.location}
                          </p>
                        )}

                        {job.jobType && (
                          <p>
                            💼 {job.jobType}
                          </p>
                        )}

                      </div>

                      <span
                        className={getStatusClass(
                          application.status
                        )}
                      >
                        {application.status ||
                          "Applied"}
                      </span>

                    </div>

                    <div className="application-card-footer">

                      <div>

                        {application.createdAt && (
                          <small>
                            Applied on{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </small>
                        )}

                      </div>

                      {job._id && (
                        <Link
                          to={`/jobs/${job._id}`}
                          className="dashboard-secondary-button"
                        >
                          View Job
                        </Link>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* SAVED JOBS */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Saved Jobs
              </h2>

              <p>
                Quickly access opportunities
                you've saved for later.
              </p>

            </div>

            <Link
              to="/jobs"
              className="dashboard-secondary-button"
            >
              Find Jobs
            </Link>

          </div>

          <div className="dashboard-card">

            <SavedJobs />

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your candidate account
                from one place.
              </p>

            </div>

          </div>

          <div className="dashboard-grid">

            <Link
              to="/jobs"
              className="dashboard-action-card"
            >
              <h3>
                Browse Jobs
              </h3>

              <p>
                Search and explore available
                job opportunities.
              </p>
            </Link>

            <Link
              to="/candidate-profile"
              className="dashboard-action-card"
            >
              <h3>
                Update Profile
              </h3>

              <p>
                Keep your professional information
                updated.
              </p>
            </Link>

            <Link
              to="/change-password"
              className="dashboard-action-card"
            >
              <h3>
                Change Password
              </h3>

              <p>
                Update your account password
                and security settings.
              </p>
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}

export default CandidateDashboard;