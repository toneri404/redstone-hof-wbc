import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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

const personKeyOf = (entry) =>
  (entry.personId || entry.name || "").trim().toLowerCase();


function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M20 4.5a17.2 17.2 0 00-4.3-1.3l-.2.5a15 15 0 00-7 0l-.2-.5A17.2 17.2 0 003 4.5C1.5 7 1 9.4 1 11.8 1 17 4.3 19 7.2 19.5l.5-.8c-1.6-.5-2.9-1.6-3.5-3 .7.6 1.6 1 2.6 1.2 1.8.3 3.5.3 5.3 0 1-.2 1.9-.6 2.7-1.2-.6 1.4-1.9 2.6-3.5 3l.5.8C19.7 19 23 17 23 11.8 23 9.4 22.5 7 21 4.5zM9.5 13.5c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm5 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M18.3 2H21l-6.4 7.3L22 22h-6.9l-5.4-7-6 7H3l6.9-8L2 2h7l4.9 6.3L18.3 2z" />
    </svg>
  );
}


function useEntriesByMonth(entries) {
  return useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      if (!e.month) continue;
      if (!map.has(e.month)) map.set(e.month, []);
      map.get(e.month).push(e);
    }
    for (const [, arr] of map.entries()) {
      arr.sort((a, b) => (a.weekLabel || "").localeCompare(b.weekLabel || ""));
    }
    return map;
  }, [entries]);
}

function monthIndex(label) {
  const idx = MONTH_ORDER.indexOf(label);
  return idx === -1 ? -1 : idx;
}

export default function Wbc() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entriesByMonth = useEntriesByMonth(entries);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [showWeekDialog, setShowWeekDialog] = useState(false);

  const [searchParams] = useSearchParams();

  //load from backend
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4000/api/wbc");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mapped = data.map((row) => ({
          id: row.id,
          personId: row.person_id || null,
          name: row.name || "",
          avatar: row.avatar || "",
          discord: row.discord || "",
          x: row.x_handle || row.x || "",
          month: row.month || "",
          weekLabel: row.week_label || "",
          dateRange: row.date_range || "",
          link: row.link || "",
        }));

        if (!cancelled) setEntries(mapped);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load WBC data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    if (!entries.length) return;

    const idParam = searchParams.get("id");
    const monthParam = searchParams.get("month");
    const weekParam =
      searchParams.get("week") || searchParams.get("range") || "";

    let match = null;

    if (idParam) {
      match = entries.find((e) => String(e.id) === String(idParam));
    }

    if (!match && monthParam && weekParam) {
      match = entries.find(
        (e) =>
          e.month === monthParam &&
          (e.weekLabel === weekParam || e.dateRange === weekParam)
      );
    }

    if (match) {
      setActiveEntry(match);
      setSelectedMonth(match.month);
      setShowWeekDialog(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [entries, searchParams]);

  const months = useMemo(() => {
    const set = new Set();
    for (const e of entries) {
      if (e.month) set.add(e.month);
    }
    const arr = Array.from(set);
    arr.sort((a, b) => monthIndex(b) - monthIndex(a));
    return arr;
  }, [entries]);

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setShowWeekDialog(true);
  };

  const handleWeekClick = (entry) => {
    setActiveEntry(entry);
    setSelectedMonth(entry.month);
    setShowWeekDialog(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangeSelection = () => {
    setActiveEntry(null);
    setSelectedMonth(null);
  };

  const totalWinsForActive = useMemo(() => {
    if (!activeEntry) return 0;
    const key = personKeyOf(activeEntry);
    return entries.filter((e) => personKeyOf(e) === key).length;
  }, [activeEntry, entries]);

  return (
    <div className="min-h-screen bg-[#0e0505] text-white">
      <div
        aria-hidden
        className="h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Weekly Best <span className="text-red-400">Content</span>
        </h1>
        {activeEntry ? (
          <div className="mt-2 text-zinc-300 text-sm md:text-base">
            {activeEntry.month} • {activeEntry.weekLabel || "Week"}
          </div>
        ) : (
          <div className="mt-2 text-zinc-300 text-sm md:text-base">
            Select a month, then pick a week to view the winner.
          </div>
        )}

        {loading && (
          <p className="mt-4 text-sm text-zinc-400">
            Loading Weekly Best Content…
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-400">Error: {error}</p>
        )}

        {/*month grid*/}
        {!activeEntry && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">
              Select Month • Weekly Best Content
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {months.map((month) => {
                const monthEntries = entriesByMonth.get(month) || [];
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthClick(month)}
                    className="glass-tile-watery p-4 text-left"
                  >
                    <h3 className="text-lg font-semibold mb-2">{month}</h3>
                    {monthEntries.length === 0 ? (
                      <p className="text-xs text-zinc-400">
                        No Weekly Best Content winners recorded for this month
                        yet.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-zinc-400 mb-2">
                          Winners in this month:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {monthEntries.map((e) => (
                            <div
                              key={e.id}
                              className="inline-flex items-center gap-2 rounded-full bg-black/40 px-2 py-1"
                            >
                              <img
                                src={e.avatar || "/favicon.ico"}
                                alt={e.name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <span className="text-xs text-zinc-100">
                                {e.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <p className="mt-3 text-[11px] text-zinc-400">
                      Tap to select week and view WBC winner.
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* final WBC winner view */}
        {activeEntry && (
          <section className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-100">
                Weekly Best Content winner
              </h2>
              <button
                type="button"
                onClick={handleChangeSelection}
                className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
              >
                Change month and week
              </button>
            </div>

            <div className="glass-tile-watery relative p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <img
                  src={activeEntry.avatar || "/favicon.ico"}
                  alt={activeEntry.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-white truncate">
                      {activeEntry.name}
                    </div>
                    {totalWinsForActive > 0 && (
                      <span className="rounded-full bg-green-600/20 px-2 py-[2px] text-[11px] text-green-400">
                        {totalWinsForActive} WBC win
                        {totalWinsForActive > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                    {activeEntry.discord && (
                      <span className="inline-flex items-center gap-1">
                        <DiscordIcon />
                        <span className="truncate">
                          @{activeEntry.discord}
                        </span>
                      </span>
                    )}
                    {activeEntry.x && (
                      <span className="inline-flex items-center gap-1">
                        <XIcon />
                        <span className="truncate">@{activeEntry.x}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-zinc-300">
                    <span className="text-zinc-400">Month:</span>{" "}
                    {activeEntry.month}{" "}
                    <span className="text-zinc-500 mx-1">•</span>
                    <span className="text-zinc-400">Week:</span>{" "}
                    {activeEntry.weekLabel ||
                      activeEntry.dateRange ||
                      "Week"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-zinc-300">
                  This entry was selected as Weekly Best Content for{" "}
                  {activeEntry.weekLabel ||
                    activeEntry.dateRange ||
                    "this week"}{" "}
                  in {activeEntry.month}.
                </p>

                {activeEntry.link && (
                  <a
                    href={activeEntry.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-100/10 hover:bg-zinc-100/20 border border-zinc-700 px-3 py-2 text-sm text-white transition-colors"
                  >
                    View content <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* week picker popup */}
      {selectedMonth && showWeekDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowWeekDialog(false)}
          />
          <div className="relative w-[min(95vw,650px)] rounded-2xl bg-zinc-950 border border-zinc-800 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">
                Select winner : {selectedMonth}
              </h2>
              <button
                onClick={() => setShowWeekDialog(false)}
                className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(entriesByMonth.get(selectedMonth) || []).map((entry, index) => (
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
                        {entry.weekLabel || `Week ${index + 1}`}
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

            {(entriesByMonth.get(selectedMonth) || []).length === 0 && (
              <p className="mt-2 text-sm text-zinc-400">
                No weekly winners recorded for this month yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
