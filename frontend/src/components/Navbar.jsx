import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("accessToken"))
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const updateAuthState = () => {
      const accessToken =
        localStorage.getItem("accessToken");

      const savedUser =
        localStorage.getItem("user");

      let currentUser = null;

      if (savedUser) {
        try {
          currentUser = JSON.parse(savedUser);
        } catch {
          currentUser = null;
        }
      }

      setIsLoggedIn(
        Boolean(accessToken && currentUser)
      );

      setUser(currentUser);
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
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    navigate("/");
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "nav-link active"
      : "nav-link";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo">
          JobBoard
        </Link>

        {/* Navigation */}
        <div className="nav-links">

          {/* Home */}
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

          {/* Jobs */}
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

          {/* Not Logged In */}
          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className={getLinkClass("/login")}
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
          )}

          {/* Logged In */}
          {isLoggedIn && (
            <>
              {/* Candidate */}
              {user?.role === "Candidate" && (
                <>
                  <Link
                    to="/candidate-dashboard"
                    className={getLinkClass(
                      "/candidate-dashboard"
                    )}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/candidate-profile"
                    className={getLinkClass(
                      "/candidate-profile"
                    )}
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* Employer */}
              {user?.role === "Employer" && (
                <>
                  <Link
                    to="/employer-dashboard"
                    className={getLinkClass(
                      "/employer-dashboard"
                    )}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/post-job"
                    className={getLinkClass(
                      "/post-job"
                    )}
                  >
                    Post Job
                  </Link>

                  <Link
                    to="/employer-profile"
                    className={getLinkClass(
                      "/employer-profile"
                    )}
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* User Info */}
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