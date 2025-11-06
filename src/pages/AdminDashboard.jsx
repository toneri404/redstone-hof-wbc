import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HofManager from "../components/admin/HofManager.jsx";
import WbcManager from "../components/admin/WbcManager.jsx";

const API_BASE = "https://redstone-hub-api.onrender.com";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
    
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Failed to verify session");
          return;
        }

        const data = await res.json();
        setAdmin(data.admin || null);
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-sm text-zinc-300">Checking admin session…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="max-w-md p-6 rounded-2xl bg-zinc-900 border border-red-700/60 space-y-3">
          <h1 className="text-lg font-semibold text-red-300">
            Admin access error
          </h1>
          <p className="text-sm text-red-200">{error}</p>
          <button
            onClick={() => navigate("/admin/login")}
            className="rs-btn mt-2"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Logged in as{" "}
              <span className="font-medium text-zinc-200">
                {admin?.username}
              </span>{" "}
              ({admin?.role})
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-500/70 bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-600/20"
          >
            Log out
          </button>
        </header>

        <main className="space-y-8">
         <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <HofManager admin={admin} />
         </section>

          <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
           <WbcManager admin={admin} />
          </section>
        </main>

      </div>
    </div>
  );
}
