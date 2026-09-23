import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem("token");

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      setIsLoggedIn(!!token);
      setUser(storedUser);
    };

    updateAuthState();

    window.addEventListener(
      "storage",
      updateAuthState
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateAuthState
      );
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to="/"
          className="logo"
        >
          JobBoard
        </Link>

        {/* Navigation */}
        <div className="nav-links">

          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "nav-link active"
                : "nav-link"
            }
          >
            Home
          </Link>

          <Link
            to="/jobs"
            className={
              location.pathname.startsWith("/jobs")
                ? "nav-link active"
                : "nav-link"
            }
          >
            Jobs
          </Link>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className={
                  location.pathname === "/login"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Candidate */}
              {user?.role === "Candidate" && (
                <Link
                  to="/candidate-dashboard"
                  className={
                    location.pathname ===
                    "/candidate-dashboard"
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  Dashboard
                </Link>
              )}

              {/* Employer */}
              {user?.role === "Employer" && (
                <>
                  <Link
                    to="/employer-dashboard"
                    className={
                      location.pathname ===
                      "/employer-dashboard"
                        ? "nav-link active"
                        : "nav-link"
                    }
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/post-job"
                    className={
                      location.pathname === "/post-job"
                        ? "nav-link active"
                        : "nav-link"
                    }
                  >
                    Post Job
                  </Link>
                </>
              )}

              {/* User */}
              <div className="nav-user">

                <div className="nav-avatar">
                  {user?.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>

                <div className="nav-user-info">
                  <span className="nav-user-name">
                    {user?.name || "User"}
                  </span>

                  <span className="nav-user-role">
                    {user?.role || "Account"}
                  </span>
                </div>

              </div>

              {/* Logout */}
              <button
                type="button"
                className="nav-logout"
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