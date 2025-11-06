import { useEffect, useRef, useState } from "react";
import {
  fetchHofEntries,
  createHofEntry,
  updatePlacement,
  deleteHofEntry,
  fetchCreatorProfile,
  updateHofEntry,
} from "../../api/hofApi";

const CATEGORY_ORDER = [
  "Written Content",
  "Art & Visual",
  "Meme Content",
  "Other Creative Content",
];

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
const STORAGE_KEY = "redstone-hof-admin-filters";

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

function getNextCategory(current) {
  const index = CATEGORY_ORDER.indexOf(current);
  if (index === -1) return current;
  if (index === CATEGORY_ORDER.length - 1) return current;
  return CATEGORY_ORDER[index + 1];
}

export default function HofManager() {
  const persisted = loadPersistedFilters();

  const [category, setCategory] = useState(
    persisted?.category || CATEGORY_ORDER[0]
  );
  const [month, setMonth] = useState(
    persisted?.month || MONTHS[new Date().getMonth()]
  );
  const [year, setYear] = useState(persisted?.year || CURRENT_YEAR);

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    discord: "",
    x_handle: "",
    avatar: "",
    link: "",
    placement: "",
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
    savePersistedFilters({ category, month, year });
  }, [category, month, year]);

  useEffect(() => {
    const load = async () => {
      setLoadingEntries(true);
      try {
        const data = await fetchHofEntries({ month, year, category });
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEntries(false);
      }
    };
    load();
  }, [category, month, year]);

  const handleCategoryChange = (e) => {
    const next = e.target.value;
    if (next === category) return;

    const ok = window.confirm(
      `Switch category from "${category}" to "${next}"?\n\nNew winners will be saved under the new category.`
    );
    if (!ok) {
      e.target.value = category;
      return;
    }

    setCategory(next);
    showToast(`Category switched to "${next}" ✅`);
  };

  const handleFilterChange = (field, value) => {
    if (field === "month") setMonth(value);
    if (field === "year") setYear(Number(value));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscordBlur = async () => {
    const discord = formData.discord.trim();
    if (!discord) return;

    try {
      setLoadingProfile(true);
      const profile = await fetchCreatorProfile(discord);
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
      discord: "",
      x_handle: "",
      avatar: "",
      link: "",
      placement: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const name = formData.name.trim();
    const discord = formData.discord.trim();
    const xHandle = formData.x_handle.trim();
    const link = formData.link.trim();

    const errors = [];

    if (!name) {
      errors.push("Winner name is required.");
    }

    if (!discord && !xHandle) {
      errors.push("At least Discord or X handle is required.");
    }

    if (link && !/^https?:\/\//i.test(link)) {
      errors.push("Content link must start with http:// or https://");
    }

    if (errors.length > 0) {
      showToast(errors[0], "error");
      return;
    }


    const currentHasFirst = entries.some(
      (entry) => Number(entry.placement) === 1
    );

    let placement = formData.placement
      ? Number(formData.placement)
      : null;

    if (!editingId) {
   
      if (placement == null) {
        
        if (!currentHasFirst) {
          placement = 1;
        }
      } else if (placement === 1 && currentHasFirst) {
        showToast(
          "Placement 1 is already assigned to another winner in this category.",
          "error!"
        );
        return;
      }
    } else {
      // editing
      const hasFirstOther = entries.some(
        (entry) =>
          Number(entry.placement) === 1 && entry.id !== editingId
      );
      if (placement === 1 && hasFirstOther) {
        showToast(
          "Placement 1 is already assigned to another winner in this category.",
          "error!"
        );
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      name,
      discord,
      x_handle: xHandle,
      avatar: formData.avatar,
      link,
      placement,
      category,
      month,
      year,
    };

    try {
      if (editingId) {
        const updated = await updateHofEntry(editingId, payload);
        setEntries((prev) =>
          prev.map((e) => (e.id === editingId ? updated : e))
        );
        resetForm();
        showToast("Hall of Fame entry updated!");
      } else {
        await createHofEntry(payload);
        const fresh = await fetchHofEntries({ month, year, category });
        setEntries(fresh);

        resetForm();
        if (placement === 1 && !currentHasFirst) {
          showToast(
            "Hall of Fame entry created (auto placement 1 assigned)!"
          );
        } else {
          showToast("Hall of Fame entry created!");
        }


        if (fresh.length >= 3) {
          const next = getNextCategory(category);
          if (next !== category) {
            setCategory(next);
            savePersistedFilters({ category: next, month, year });
            showToast(`Category auto-switched to "${next}"`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        editingId
          ? "Failed to update HoF entry, check console!"
          : "Failed to create HoF entry, check console!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this HoF entry permanently?")) return;
    try {
      await deleteHofEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) {
        resetForm();
      }
      showToast("Hall of Fame entry deleted!");
    } catch (err) {
      console.error(err);
      alert("Delete failed, check console!");
    }
  };

  const handlePlacementChange = async (id, value) => {
    const placement = value === "" ? null : Number(value);

    if (placement === 1) {
      const hasFirstOther = entries.some(
        (entry) => Number(entry.placement) === 1 && entry.id !== id
      );
      if (hasFirstOther) {
        showToast(
          "Placement 1 is already assigned to another winner in this category.",
          "error!"
        );
        
        setEntries((prev) => [...prev]);
        return;
      }
    }

    try {
      const updated = await updatePlacement(id, placement);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      );
      showToast("Placement updated!");
    } catch (err) {
      console.error(err);
      alert("Placement update failed!");
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      name: entry.name || "",
      discord: entry.discord || "",
      x_handle: entry.x_handle || "",
      avatar: entry.avatar || "",
      link: entry.link || "",
      placement: entry.placement ?? "",
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Filters */}
      <div className="rounded-2xl bg-black/50 border border-red-500/40 p-4">
        <h2 className="text-lg font-semibold text-red-100 mb-3">
          HoF Winner Creator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Category
            </label>
            <select
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={category}
              onChange={handleCategoryChange}
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Month
            </label>
            <select
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Year
            </label>
            <select
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
            >
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-black/50 border border-red-500/40 p-4"
      >
        <h3 className="text-sm font-semibold text-red-100 mb-2">
          {editingId
            ? `Edit winner in ${category} (${month} ${year})`
            : `Add winner for ${category} in ${month} ${year}`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Discord username (without @)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.discord}
              onChange={(e) => handleChange("discord", e.target.value)}
              onBlur={handleDiscordBlur}
              placeholder="toneri404"
            />
            {loadingProfile && (
              <p className="text-[11px] text-red-200/70 mt-1">
                Loading saved profile...
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Winner Name
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Display name"
            />
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              X handle (without @)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.x_handle}
              onChange={(e) => handleChange("x_handle", e.target.value)}
              placeholder="toneri404"
            />
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Avatar / PFP URL
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.avatar}
              onChange={(e) => handleChange("avatar", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Content link(https://)
            </label>
            <input
              type="text"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.link}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="https://x.com/..."
            />
          </div>

          <div>
            <label className="block text-xs text-red-100/70 mb-1">
              Placement
            </label>
            <input
              type="number"
              min="1"
              className="w-full bg-black/70 border border-red-500/40 rounded px-2 py-1 text-sm"
              value={formData.placement}
              onChange={(e) => handleChange("placement", e.target.value)}
              placeholder="1 for first, 2, 3..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
              ? "Update winner"
              : "Save winner"}
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

      {/* Existing entries list */}
      <div className="rounded-2xl bg-black/50 border border-red-500/40 p-4">
        <h3 className="text-sm font-semibold text-red-100 mb-3">
          Winners for {category} in {month} {year}
        </h3>

        {loadingEntries ? (
          <p className="text-xs text-red-100/70">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-red-100/60">
            No entries yet for this category.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-red-500/30 px-3 py-2"
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
                    <div className="text-sm font-semibold">
                      {entry.name}
                    </div>
                    <div className="text-[11px] text-red-100/70">
                      {entry.discord}{" "}
                      {entry.x_handle && "• " + entry.x_handle}
                    </div>
                    <div className="text-[11px] text-red-100/50">
                      Placement: {entry.placement ?? "None"}
                    </div>
                    {entry.link && (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-red-300 underline hover:text-red-200"
                      >
                        View content
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-14 bg-black/70 border border-red-500/40 rounded px-1 py-1 text-xs"
                    value={entry.placement ?? ""}
                    onChange={(e) =>
                      handlePlacementChange(entry.id, e.target.value)
                    }
                    placeholder="#"
                  />
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
    </div>
  );
}
