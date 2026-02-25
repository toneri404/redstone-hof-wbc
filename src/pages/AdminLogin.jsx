import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://backend.minershub.online";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          navigate("/redstoney-room", { replace: true });
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
      } else {
        if (data.token) {
          localStorage.setItem("admin_token", data.token);
        }
        navigate("/redstoney-room");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-300">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-5 shadow-2xl"
      >
        <h1 className="text-xl font-semibold text-white text-center">
          Admin Login
        </h1>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-700/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="space-y-1">
          <label className="text-sm text-zinc-300">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700/60 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm text-zinc-300">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700/60 text-white placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
            required
          />
        </div>

        {/* Remember */}
        <label className="flex items-center gap-2 text-xs text-zinc-300 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-red-500 focus:ring-red-500"
          />
          Remember me for 30 days
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium
                     transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}