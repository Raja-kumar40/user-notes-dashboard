
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span className="brand-icon">N</span>
        <span>NoteSpace</span>
      </Link>

      <nav className="navbar-links">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
      </nav>

      <div className="navbar-right">
        {user && (
          <span className="navbar-user">
            {user.name || user.email || "My Account"}
          </span>
        )}

        <button
          type="button"
          className="btn-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
