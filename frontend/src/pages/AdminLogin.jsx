import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client.js";
import { useAuth } from "../App.jsx";
import Alert from "../components/Alert.jsx";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  if (admin) { navigate("/admin"); return null; }

  const handleSubmit = async () => {
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎟 Admin Login</h1>
        <p className="subtitle">Sign in to manage the coupon marketplace</p>

        {error && <Alert type="error">{error}</Alert>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />&nbsp;Signing in...</> : "Sign In"}
        </button>
      </div>
    </div>
  );
}
