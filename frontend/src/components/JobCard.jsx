import { Link } from "react-router-dom";

function JobCard({ job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>

      <p>
        <strong>Company:</strong>{" "}
        {job.company}
      </p>

      <p>
        <strong>Location:</strong>{" "}
        {job.location}
      </p>

      <p>
        <strong>Job Type:</strong>{" "}
        {job.jobType}
      </p>

      <p>
        <strong>Salary:</strong>{" "}
        {job.salary || "Not specified"}
      </p>

      <Link to={`/jobs/${job._id}`}>
        View Details
      </Link>
    </div>
  );
}

export default JobCard;