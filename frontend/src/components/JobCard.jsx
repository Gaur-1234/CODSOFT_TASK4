import { Link } from "react-router-dom";

function JobCard({ job }) {
  if (!job) {
    return null;
  }

  return (
    <article className="job-card">

      {/* ====================================
          JOB INFORMATION
      ===================================== */}

      <div className="job-card-content">

        <h3>
          {job.title || "Untitled Job"}
        </h3>

        <p className="job-company">
          {job.company ||
            "Company not specified"}
        </p>

        <p className="job-location">
          📍{" "}
          {job.location ||
            "Location not specified"}
        </p>

        {/* JOB TYPE */}

        {job.jobType && (
          <p className="job-type">
            <strong>
              Job Type:
            </strong>{" "}
            {job.jobType}
          </p>
        )}

        {/* SALARY */}

        {job.salary && (
          <p className="job-salary">
            <strong>
              Salary:
            </strong>{" "}
            {job.salary}
          </p>
        )}

        {/* STATUS */}

        {job.status && (
          <span
            className={`status-badge status-${job.status
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {job.status}
          </span>
        )}

      </div>

      {/* ====================================
          ACTION
      ===================================== */}

      <div className="job-card-actions">

        <Link
          to={`/jobs/${job._id}`}
          className="dashboard-primary-button"
        >
          View Details
        </Link>

      </div>

    </article>
  );
}

export default JobCard;