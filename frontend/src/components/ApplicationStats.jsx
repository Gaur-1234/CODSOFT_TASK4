import { useEffect, useState } from "react";
import API from "../services/api";

function ApplicationStats() {
  const [stats, setStats] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD APPLICATION STATISTICS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const response = await API.get(
          "/applications/stats"
        );

        if (cancelled) return;

        setStats(
          response.data.stats ||
            response.data ||
            {}
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Application statistics error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load application statistics."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // STAT VALUES
  // ==========================================

  const totalApplications =
    stats.totalApplications ??
    stats.total ??
    stats.applications ??
    0;

  const applied =
    stats.applied ?? 0;

  const underReview =
    stats.underReview ??
    stats["Under Review"] ??
    0;

  const shortlisted =
    stats.shortlisted ?? 0;

  const rejected =
    stats.rejected ?? 0;

  const withdrawn =
    stats.withdrawn ?? 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="dashboard-section">

      {/* ====================================
          HEADER
      ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            Application Statistics
          </h2>

          <p>
            Track the progress of your
            job applications.
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
          STATISTICS
      ===================================== */}

      <div className="stats-grid">

        {/* TOTAL */}

        <div className="stat-card">

          <span className="stat-icon">
            📊
          </span>

          <div>

            <span className="stat-label">
              Total Applications
            </span>

            <strong className="stat-value">
              {loading
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
              {loading
                ? "..."
                : applied}
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
              {loading
                ? "..."
                : underReview}
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
              {loading
                ? "..."
                : shortlisted}
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
              {loading
                ? "..."
                : rejected}
            </strong>

          </div>

        </div>

        {/* WITHDRAWN */}

        <div className="stat-card">

          <span className="stat-icon">
            ↩️
          </span>

          <div>

            <span className="stat-label">
              Withdrawn
            </span>

            <strong className="stat-value">
              {loading
                ? "..."
                : withdrawn}
            </strong>

          </div>

        </div>

      </div>

    </section>
  );
}

export default ApplicationStats;