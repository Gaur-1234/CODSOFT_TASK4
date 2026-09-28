import { useState } from "react";
import API from "../services/api";

function ApplicantSearch() {
  const [query, setQuery] =
    useState("");

  const [jobId, setJobId] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let response;

      if (status) {
        response = await API.get(
          "/applications/filter",
          {
            params: {
              status,
              ...(jobId
                ? { jobId }
                : {}),
            },
          }
        );
      } else {
        response = await API.get(
          "/applications/search",
          {
            params: {
              ...(query
                ? { query }
                : {}),
              ...(jobId
                ? { jobId }
                : {}),
            },
          }
        );
      }

      setResults(
        response.data.applications ||
          response.data.results ||
          []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to search applicants."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setJobId("");
    setStatus("");
    setResults([]);
    setError("");
  };

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>
            Applicant Search
          </h2>

          <p>
            Search and filter candidates
            across your jobs.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="profile-form"
      >

        <div className="profile-form-grid">

          <div className="form-group">
            <label htmlFor="applicantQuery">
              Search
            </label>

            <input
              id="applicantQuery"
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              placeholder="Name, email, phone or skill"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobId">
              Job ID
            </label>

            <input
              id="jobId"
              value={jobId}
              onChange={(e) =>
                setJobId(
                  e.target.value
                )
              }
              placeholder="Optional Job ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >
              <option value="">
                All Statuses
              </option>

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

              <option value="Withdrawn">
                Withdrawn
              </option>
            </select>
          </div>

        </div>

        <div className="application-actions">

          <button
            type="submit"
            className="dashboard-primary-button"
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Search Applicants"}
          </button>

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={clearSearch}
            disabled={loading}
          >
            Clear
          </button>

        </div>

      </form>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        results.length === 0 &&
        !error && (
          <div className="dashboard-empty">
            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No results
            </h3>

            <p>
              Search for candidates using
              the filters above.
            </p>
          </div>
        )}

      {results.length > 0 && (
        <div className="applications-list">

          {results.map(
            (application) => (
              <article
                className="application-card"
                key={application._id}
              >

                <div className="application-card-top">

                  <div>
                    <span className="application-label">
                      Candidate
                    </span>

                    <h3>
                      {application.candidate
                        ?.name ||
                        "Candidate"}
                    </h3>
                  </div>

                  <span className="status-badge">
                    {application.status ||
                      "Applied"}
                  </span>

                </div>

                <div className="application-details">

                  <div className="detail-item">
                    <span className="detail-label">
                      Email
                    </span>

                    <span className="detail-value">
                      {application.candidate
                        ?.email ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      Phone
                    </span>

                    <span className="detail-value">
                      {application.candidate
                        ?.phone ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      Job
                    </span>

                    <span className="detail-value">
                      {application.job
                        ?.title ||
                        "N/A"}
                    </span>
                  </div>

                </div>

              </article>
            )
          )}

        </div>
      )}

    </section>
  );
}

export default ApplicantSearch;