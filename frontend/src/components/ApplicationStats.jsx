import { useEffect, useState } from "react";
import API from "../services/api";

function ApplicationStats() {
  const [stats, setStats] =
    useState({
      totalApplications: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      rejected: 0,
      withdrawn: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

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
          withdrawn: 0,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load application statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentional API data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const statItems = [
    [
      "📋",
      "Total",
      stats.totalApplications,
    ],
    [
      "📨",
      "Applied",
      stats.applied,
    ],
    [
      "🔎",
      "Under Review",
      stats.underReview,
    ],
    [
      "⭐",
      "Shortlisted",
      stats.shortlisted,
    ],
    [
      "❌",
      "Rejected",
      stats.rejected,
    ],
    [
      "↩️",
      "Withdrawn",
      stats.withdrawn,
    ],
  ];

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>
            Application Statistics
          </h2>

          <p>
            Overview of your application
            activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchStats}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="stats-grid">

        {statItems.map(
          ([icon, label, value]) => (
            <div
              className="stat-card"
              key={label}
            >
              <span className="stat-icon">
                {icon}
              </span>

              <div>
                <span className="stat-label">
                  {label}
                </span>

                <strong className="stat-value">
                  {loading
                    ? "..."
                    : value ?? 0}
                </strong>
              </div>
            </div>
          )
        )}

      </div>

    </section>
  );
}

export default ApplicationStats;