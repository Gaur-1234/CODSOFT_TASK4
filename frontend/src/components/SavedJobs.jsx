import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SAVED JOBS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadSavedJobs = async () => {
      try {
        const response = await API.get(
          "/jobs/saved"
        );

        if (cancelled) return;

        setSavedJobs(
          response.data.jobs ||
            response.data.savedJobs ||
            response.data ||
            []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Saved jobs error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load saved jobs."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSavedJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // REMOVE SAVED JOB
  // ==========================================

  const handleRemove = async (jobId) => {
    try {
      setRemovingId(jobId);
      setError("");

      await API.delete(
        `/jobs/${jobId}/save`
      );

      setSavedJobs((previousJobs) =>
        previousJobs.filter(
          (job) => job._id !== jobId
        )
      );
    } catch (err) {
      console.error(
        "Remove saved job error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to remove saved job."
      );
    } finally {
      setRemovingId("");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>
              Saved Jobs
            </h2>

            <p>
              Jobs you saved for later.
            </p>

          </div>

        </div>

        <div className="dashboard-card">

          <p>
            Loading saved jobs...
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
            Saved Jobs
          </h2>

          <p>
            Jobs you saved for later.
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
          EMPTY STATE
      ===================================== */}

      {savedJobs.length === 0 && !error && (
        <div className="dashboard-empty">

          <div className="empty-icon">
            🔖
          </div>

          <h3>
            No saved jobs
          </h3>

          <p>
            Save interesting jobs and
            come back to them later.
          </p>

          <Link
            to="/jobs"
            className="dashboard-primary-button"
          >
            Browse Jobs
          </Link>

        </div>
      )}

      {/* ====================================
          SAVED JOB LIST
      ===================================== */}

      {savedJobs.length > 0 && (
        <div className="application-list">

          {savedJobs.map((job) => (
            <article
              key={job._id}
              className="application-card"
            >

              {/* JOB DETAILS */}

              <div>

                <h3>
                  {job.title ||
                    "Untitled Job"}
                </h3>

                <p>
                  <strong>
                    Company:
                  </strong>{" "}
                  {job.company ||
                    "Not specified"}
                </p>

                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {job.location ||
                    "Not specified"}
                </p>

                {job.jobType && (
                  <p>
                    <strong>
                      Job Type:
                    </strong>{" "}
                    {job.jobType}
                  </p>
                )}

                {job.salary && (
                  <p>
                    <strong>
                      Salary:
                    </strong>{" "}
                    {job.salary}
                  </p>
                )}

              </div>

              {/* ACTIONS */}

              <div className="dashboard-actions">

                <Link
                  to={`/jobs/${job._id}`}
                  className="dashboard-primary-button"
                >
                  View Job
                </Link>

                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() =>
                    handleRemove(job._id)
                  }
                  disabled={
                    removingId === job._id
                  }
                >
                  {removingId === job._id
                    ? "Removing..."
                    : "Remove Saved"}
                </button>

              </div>

            </article>
          ))}

        </div>
      )}

    </section>
  );
}

export default SavedJobs;