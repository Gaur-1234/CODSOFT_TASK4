import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="logo">
          JobBoard
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/jobs">Jobs</Link>

          {!isLoggedIn ? (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              {user?.role === "Candidate" && (
                <Link to="/candidate-dashboard">
                  Dashboard
                </Link>
              )}

              {user?.role === "Employer" && (
                <>
                  <Link to="/employer-dashboard">
                    Dashboard
                  </Link>

                  <Link to="/post-job">
                    Post Job
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;