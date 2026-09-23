import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CandidateDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to view your applications."
        );
        setLoading(false);
        return;
      }

      const response = await API.get(
        "/applications/my-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  useEffect(() => {
    // Intentional API data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
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

        <button
          type="button"
          className="dashboard-primary-button"
          onClick={() => navigate("/jobs")}
        >
          Browse Jobs
        </button>

      </div>

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
            <p>Loading your applications...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="dashboard-error">
            <strong>Something went wrong</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchApplications}
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

              <h3>No applications yet</h3>

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

              {applications.map((application) => (
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
                        {application.job?.title ||
                          "Job Title"}
                      </h3>
                    </div>

                    <span
                      className={`status-badge status-${(
                        application.status ||
                        "Applied"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {application.status ||
                        "Applied"}
                    </span>

                  </div>

                  <div className="application-details">

                    <div className="detail-item">
                      <span className="detail-label">
                        Company
                      </span>

                      <span className="detail-value">
                        {application.job?.company ||
                          "N/A"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Location
                      </span>

                      <span className="detail-value">
                        {application.job?.location ||
                          "N/A"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        Job Type
                      </span>

                      <span className="detail-value">
                        {application.job?.jobType ||
                          "N/A"}
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

                  {application.resume && (
                    <div className="resume-info">
                      <span>📄</span>

                      <div>
                        <span className="detail-label">
                          Resume
                        </span>

                        <span className="detail-value">
                          {application.resume}
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

                  </div>

                </article>
              ))}

            </div>
          )}

      </section>

    </main>
  );
}

export default CandidateDashboard;