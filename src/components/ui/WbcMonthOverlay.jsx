// src/components/ui/WbcMonthOverlay.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const MONTH_ORDER = [
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

function monthIndex(label) {
  const idx = MONTH_ORDER.indexOf(label);
  return idx === -1 ? -1 : idx;
}

function safeYear(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function YearPicker({ years, value, onChange }) {
  const idx = years.indexOf(value);

  const prev = () => {
    if (idx <= 0) return;
    onChange(years[idx - 1]);
  };

  const next = () => {
    if (idx === -1 || idx >= years.length - 1) return;
    onChange(years[idx + 1]);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={prev}
        disabled={idx <= 0}
        className="rounded-md px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800"
        title="Previous year"
      >
        ‹
      </button>

      <select
        value={value ?? ""}
        onChange={(e) => onChange(safeYear(e.target.value))}
        className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={next}
        disabled={idx === -1 || idx >= years.length - 1}
        className="rounded-md px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800"
        title="Next year"
      >
        ›
      </button>
    </div>
  );
}

function mapRow(row) {
  return {
    id: row.id,
    personId: row.person_id || null,
    name: row.name || "",
    avatar: row.avatar || "",
    discord: row.discord || "",
    x: row.x_handle || row.x || "",
    month: row.month || "",
    year: safeYear(row.year),
    weekLabel: row.week_label || "",
    dateRange: row.date_range || "",
    link: row.link || "",
  };
}

function useWeeksByMonth(entries) {
  return useMemo(() => {
    const map = new Map();

    for (const e of entries) {
      if (!e.month) continue;
      if (!map.has(e.month)) map.set(e.month, []);
      map.get(e.month).push(e);
    }

    for (const [, arr] of map.entries()) {
      arr.sort((a, b) => {
        const aKey = (a.weekLabel || a.dateRange || "").toString();
        const bKey = (b.weekLabel || b.dateRange || "").toString();
        return aKey.localeCompare(bKey);
      });
    }

    return map;
  }, [entries]);
}

function MonthTile({ month, weeks, onOpen }) {
  const preview = weeks.slice(0, 4);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(month)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="
        relative p-5 rounded-2xl text-left overflow-hidden
        bg-gradient-to-br from-red-700 via-red-700/70 to-red-900
        border border-white/10 shadow-[0_10px_40px_rgba(255,0,0,.15)]
      "
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-white/5 mix-blend-soft-light pointer-events-none" />

      <div className="relative z-10">
        <div className="text-sm text-white/85">Weekly Best Content</div>
        <div className="mt-0.5 text-2xl font-bold text-white">{month}</div>

        <div className="mt-4">
          {preview.length === 0 ? (
            <p className="text-xs text-red-100/85">
              No Weekly Best Content winners recorded for this month yet.
            </p>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-wide text-red-100/80 mb-2">
                Weekly winners
              </p>
              <div className="flex flex-wrap gap-2">
                {preview.map((w) => (
                  <div
                    key={w.id}
                    className="inline-flex items-center justify-center rounded-full bg-black/35 px-1.5 py-1"
                  >
                    <img
                      src={w.avatar || "/favicon.ico"}
                      alt={w.name}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm text-white/90">
          <span className="inline-block h-2 w-2 rounded-full bg-white/90 animate-pulse" />
          Tap to choose week and view winner
        </div>
      </div>
    </motion.button>
  );
}

export default function WbcMonthOverlay({ open, onClose }) {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    setLoading(true);
    setLoadError(null);

    fetch("https://backend.minershub.online/api/wbc")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data.map(mapRow) : [];
        setEntries(list);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load WBC entries!", err);
          setLoadError(err.message || "Failed to load Weekly Best Content data!");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const years = useMemo(() => {
    const set = new Set();
    for (const e of entries) {
      if (e.year) set.add(e.year);
    }
    const arr = Array.from(set);
    arr.sort((a, b) => b - a);
    return arr;
  }, [entries]);

  useEffect(() => {
    if (!years.length) return;
    if (selectedYear == null) {
      setSelectedYear(years[0]);
    } else if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const entriesForYear = useMemo(() => {
    if (!selectedYear) return entries;
    return entries.filter((e) => e.year === selectedYear);
  }, [entries, selectedYear]);

  const weeksByMonth = useWeeksByMonth(entriesForYear);

  const months = useMemo(() => {
    const arr = Array.from(weeksByMonth.keys());
    arr.sort((a, b) => monthIndex(b) - monthIndex(a));
    return arr;
  }, [weeksByMonth]);

  const handleMonthOpen = (month) => setSelectedMonth(month);
  const handleWeekClose = () => setSelectedMonth(null);

  const handleWeekClick = (entry) => {
    const params = new URLSearchParams();
    if (entry.month) params.set("month", entry.month);
    if (entry.year) params.set("year", String(entry.year));
    if (entry.weekLabel) params.set("week", entry.weekLabel);
    if (entry.dateRange) params.set("range", entry.dateRange);
    params.set("id", String(entry.id));

    onClose?.();
    navigate(`/wbc?${params.toString()}`);
  };

  const goAll = () => {
    onClose?.();
    navigate("/wbc");
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 2147483647 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative w-[min(95vw,1100px)] max-h-[88vh] overflow-auto rounded-2xl bg-[#0e0505] border border-zinc-800 p-6 pt-7"
        >
          <div className="flex items-center justify-between gap-4 sticky top-0 bg-[#0e0505] pb-4 pt-1">
            <div className="text-xl font-semibold">
              Select Month • <span className="text-red-400">Weekly Best Content</span>
            </div>

            <div className="flex items-center gap-3">
              {years.length > 0 && (
                <YearPicker
                  years={years}
                  value={selectedYear}
                  onChange={(y) => {
                    setSelectedYear(y);
                    setSelectedMonth(null);
                  }}
                />
              )}
              <button
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-xs text-zinc-400 mb-2">Loading winners...</p>
          )}
          {loadError && (
            <p className="text-xs text-red-400 mb-2">{loadError}</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            <motion.button
              type="button"
              onClick={goAll}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="
                relative p-5 rounded-2xl text-left overflow-hidden
                bg-gradient-to-br from-red-700 via-red-700/70 to-red-900
                border border-white/10 shadow-[0_10px_40px_rgba(255,0,0,.15)]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-white/5 mix-blend-soft-light pointer-events-none" />
              <div className="relative z-10">
                <div className="text-sm text-white/85">Weekly Best Content</div>
                <div className="mt-0.5 text-2xl font-bold text-white">
                  View all winners
                </div>
                <div className="mt-4 text-sm text-white/85">
                  • Browse every month and week
                </div>
              </div>
            </motion.button>

            {months.map((m) => (
              <MonthTile
                key={m}
                month={m}
                weeks={weeksByMonth.get(m) || []}
                onOpen={handleMonthOpen}
              />
            ))}
          </div>

          {years.length > 0 && !loading && months.length === 0 && (
            <p className="mt-4 text-sm text-zinc-400">
              No WBC data found for {selectedYear}.
            </p>
          )}
        </motion.div>

        <AnimatePresence>
          {selectedMonth && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 2147483647 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/70"
                onClick={handleWeekClose}
              />
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="relative w-[min(95vw,700px)] max-h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 p-5 pt-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Select winner : {selectedMonth}{" "}
                    {selectedYear ? `(${selectedYear})` : ""}
                  </h2>
                  <button
                    onClick={handleWeekClose}
                    className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(weeksByMonth.get(selectedMonth) || []).map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleWeekClick(entry)}
                      className="glass-tile-watery p-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.avatar || "/favicon.ico"}
                          alt={entry.name}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {entry.weekLabel || entry.dateRange || "Week"}
                          </div>
                          <div className="text-xs text-zinc-300 truncate">
                            {entry.name}
                          </div>
                          {entry.dateRange && (
                            <div className="text-[11px] text-zinc-400">
                              {entry.dateRange}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {(weeksByMonth.get(selectedMonth) || []).length === 0 && (
                  <p className="mt-2 text-sm text-zinc-400">
                    No weekly winners recorded for this month yet.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
