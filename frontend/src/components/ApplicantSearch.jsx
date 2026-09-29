import { useState } from "react";
import API from "../services/api";

function ApplicantSearch() {
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // SEARCH / FILTER APPLICANTS
  // ==========================================

  const handleSearch = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      let response;

      // If any filter is selected, use filter API
      if (jobId || status) {
        const params = new URLSearchParams();

        if (jobId) {
          params.append("jobId", jobId);
        }

        if (status) {
          params.append("status", status);
        }

        if (query.trim()) {
          params.append("query", query.trim());
        }

        response = await API.get(
          `/applications/filter?${params.toString()}`
        );
      } else {
        // Otherwise use search API
        response = await API.get(
          `/applications/search?query=${encodeURIComponent(
            query.trim()
          )}`
        );
      }

      setResults(
        response.data.applications ||
          response.data.results ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(
        "Applicant search error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to search applicants."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClear = () => {
    setQuery("");
    setJobId("");
    setStatus("");
    setResults([]);
    setError("");
  };

  return (
    <section className="dashboard-section">

      {/* ====================================
          HEADER
      ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            Applicant Search
          </h2>

          <p>
            Search and filter applicants
            across your job applications.
          </p>

        </div>

      </div>

      {/* ====================================
          SEARCH FORM
      ===================================== */}

      <form
        className="dashboard-card"
        onSubmit={handleSearch}
      >

        {/* SEARCH */}

        <div className="form-group">

          <label htmlFor="applicantSearch">
            Search Applicant
          </label>

          <input
            id="applicantSearch"
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by name or email"
          />

        </div>

        {/* JOB ID */}

        <div className="form-group">

          <label htmlFor="applicantJobId">
            Job ID
          </label>

          <input
            id="applicantJobId"
            type="text"
            value={jobId}
            onChange={(event) =>
              setJobId(event.target.value)
            }
            placeholder="Enter job ID"
          />

        </div>

        {/* STATUS */}

        <div className="form-group">

          <label htmlFor="applicantStatus">
            Application Status
          </label>

          <select
            id="applicantStatus"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
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

        {/* ACTIONS */}

        <div className="dashboard-actions">

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
            onClick={handleClear}
          >
            Clear
          </button>

        </div>

      </form>

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
          RESULTS
      ===================================== */}

      {!loading &&
        results.length === 0 &&
        !error && (
          <div className="dashboard-empty">

            <div className="empty-icon">
              👤
            </div>

            <h3>
              No applicants found
            </h3>

            <p>
              Try changing your search
              criteria or filters.
            </p>

          </div>
        )}

      {results.length > 0 && (
        <div className="application-list">

          {results.map((application) => {

            const candidate =
              application.candidate || {};

            const job =
              application.job || {};

            const candidateName =
              candidate.name ||
              application.candidateName ||
              "Candidate";

            const candidateEmail =
              candidate.email ||
              application.candidateEmail ||
              "No email available";

            const candidatePhone =
              candidate.phone ||
              application.phone ||
              "No phone available";

            const applicationStatus =
              application.status ||
              "Applied";

            return (
              <article
                key={
                  application._id ||
                  `${candidateEmail}-${job._id}`
                }
                className="application-card"
              >

                {/* APPLICANT INFO */}

                <div>

                  <h3>
                    {candidateName}
                  </h3>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {candidateEmail}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {candidatePhone}
                  </p>

                  {job.title && (
                    <p>
                      <strong>
                        Job:
                      </strong>{" "}
                      {job.title}
                    </p>
                  )}

                </div>

                {/* STATUS */}

                <div>

                  <span
                    className={`status-badge status-${applicationStatus
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {applicationStatus}
                  </span>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </section>
  );
}

export default ApplicantSearch;