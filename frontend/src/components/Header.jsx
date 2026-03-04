import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../App.jsx";

export default function Header() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
          🎟 Coupon Marketplace
        </div>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Shop
          </NavLink>

          {admin ? (
            <>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Dashboard
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/login")}>
              Admin
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}