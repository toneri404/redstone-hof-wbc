import { useEffect, useRef, useState } from "react";
import {
  fetchWbcEntries,
  createWbcEntry,
  deleteWbcEntry,
  fetchWbcCreatorProfile,
  updateWbcEntry,
} from "../../api/wbcApi";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const STORAGE_KEY = "redstone-wbc-admin-filters";

function loadPersistedFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersistedFilters(filters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export default function WbcManager() {
  const persisted = loadPersistedFilters();

  const [month, setMonth] = useState(
    persisted?.month || MONTHS[new Date().getMonth()]
  );
  const [year, setYear] = useState(persisted?.year || CURRENT_YEAR);

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    date_range: "",
    link: "",
    discord: "",
    x_handle: "",
    avatar: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingId, setEditingId] = useState(null);

  //toast + timers
  const [toast, setToast] = useState(null);
  const toastFadeRef = useRef(null);
  const toastRemoveRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastFadeRef.current) clearTimeout(toastFadeRef.current);
    if (toastRemoveRef.current) clearTimeout(toastRemoveRef.current);

    setToast({ message, type, fading: false });

    toastFadeRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, fading: true } : prev));
    }, 4000);

    toastRemoveRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  useEffect(() => {
    savePersistedFilters({ month, year });
  }, [month, year]);

  useEffect(() => {
    const load = async () => {
      setLoadingEntries(true);
      try {
        const data = await fetchWbcEntries({ month, year });
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEntries(false);
      }
    };
    load();
  }, [month, year]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscordBlur = async () => {
    const discord = formData.discord.trim();
    if (!discord) return;
    try {
      setLoadingProfile(true);
      const profile = await fetchWbcCreatorProfile(discord);
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || profile.name || "",
          avatar: prev.avatar || profile.avatar || "",
          x_handle: prev.x_handle || profile.x_handle || "",
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date_range: "",
      link: "",
      discord: "",
      x_handle: "",
      avatar: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const dateRange = formData.date_range.trim();
    const link = formData.link.trim();
    const discord = formData.discord.trim();
    const xHandle = formData.x_handle.trim();

    const errors = [];

    if (!name) errors.push("Winner name is required.");
    if (!dateRange) errors.push("Date range is required.");
    if (!discord && !xHandle)
      errors.push("At least Discord or X handle is required.");
    if (link && !/^https?:\/\//i.test(link)) {
      errors.push("Content link must start with http:// or https://");
    }

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      month,
      year,
      date_range: dateRange,
      link,
      discord,
      x_handle: xHandle,
      avatar: formData.avatar,
    };

    try {
      if (editingId) {
        const updated = await updateWbcEntry(editingId, payload);
        setEntries((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e))
        );
        resetForm();
        showToast("Weekly Best Content entry updated!");
      } else {
        await createWbcEntry(payload);
        const fresh = await fetchWbcEntries({ month, year });
        setEntries(fresh);
        resetForm();
        showToast("Weekly Best Content entry created!");
      }
    } catch (err) {
      console.error(err);
      alert(
        editingId
          ? "Failed to update WBC entry, check console"
          : "Failed to create WBC entry, check console"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Weekly Best Content entry?")) return;
    try {
      await deleteWbcEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) {
        resetForm();
      }
      showToast("Weekly Best Content entry deleted!");
    } catch (err) {
      console.error(err);
      alert("Delete failed, check console");
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      name: entry.name || "",
      date_range: entry.date_range || "",
      link: entry.link || "",
      discord: entry.discord || "",
      x_handle: entry.x_handle || "",
      avatar: entry.avatar || "",
    });
  };

  return (
    <section className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={[
            "fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow-lg transition-opacity duration-1000",
            toast.type === "error"
              ? "bg-red-600 border border-red-400 text-red-50"
              : "bg-emerald-600 border border-emerald-400 text-emerald-50",
            toast.fading ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {toast.message}
        </div>
      )}

      <h2 className="text-lg font-semibold text-red-100">
        Weekly Best Content Manager
      </h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#111] border border-red-500/30 p-4 space-y-4"
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Winner name
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="Display name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Month
            </label>
            <select
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Year
            </label>
            <input
              type="number"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="2025"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Date range (e.g. Oct 1 – Oct 7)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="Oct 1 – Oct 7"
              value={formData.date_range}
              onChange={(e) => handleChange("date_range", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Content link (https://)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="https://x.com/..."
              value={formData.link}
              onChange={(e) => handleChange("link", e.target.value)}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Discord username (without @)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="toneri404"
              value={formData.discord}
              onChange={(e) => handleChange("discord", e.target.value)}
              onBlur={handleDiscordBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              X handle (without @)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="toneri404"
              value={formData.x_handle}
              onChange={(e) => handleChange("x_handle", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Avatar / PFP image URL (https://)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
              placeholder="https://pbs.twimg.com/..."
              value={formData.avatar}
              onChange={(e) => handleChange("avatar", e.target.value)}
            />
          </div>
        </div>

        {loadingProfile && (
          <p className="text-[11px] text-red-200/70">
            Loading saved profile from Discord handle...
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
              ? "Update WBC entry"
              : "Add WBC entry"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs px-3 py-1.5 rounded-xl border border-zinc-600 text-zinc-200 hover:bg-zinc-800"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl bg-[#111] border border-red-500/30 p-4">
        {loadingEntries ? (
          <p className="text-xs text-neutral-300">
            Loading Weekly Best Content entries...
          </p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-neutral-400">
            No Weekly Best Content entries yet.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-black/40 border border-neutral-700 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  {entry.avatar && (
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-neutral-50">
                      {entry.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {entry.month} {entry.year} • {entry.date_range}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {entry.discord}
                      {entry.x_handle && " • @" + entry.x_handle}
                    </div>
                    {entry.link && (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-red-300 underline"
                      >
                        View content
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="text-[11px] px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-[11px] px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
