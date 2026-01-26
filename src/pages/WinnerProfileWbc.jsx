import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

export default function WinnerProfileWbc() {
  const { personKey } = useParams();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [monthFilter, setMonthFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("https://backend.minershub.online/api/wbc");
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

  const allWinsForPerson = useMemo(() => {
    const key = (personKey || "").trim().toLowerCase();
    if (!key) return [];
    return entries.filter((e) => personKeyOf(e) === key);
  }, [entries, personKey]);

  const winnerMeta = useMemo(() => {
    if (allWinsForPerson.length === 0) return null;
    // Prefer the "richest" entry
    const best =
      allWinsForPerson.find((e) => e.avatar && e.name) || allWinsForPerson[0];
    return {
      name: best.name,
      avatar: best.avatar,
      discord: best.discord,
      x: best.x,
    };
  }, [allWinsForPerson]);

  const monthsForPerson = useMemo(() => {
    const set = new Set();
    for (const e of allWinsForPerson) if (e.month) set.add(e.month);
    const arr = Array.from(set);
    arr.sort((a, b) => monthIndex(b) - monthIndex(a));
    return arr;
  }, [allWinsForPerson]);

  const filteredWins = useMemo(() => {
    const wins = [...allWinsForPerson];

    // Sort newest month first, then week label
    wins.sort((a, b) => {
      const m = monthIndex(b.month) - monthIndex(a.month);
      if (m !== 0) return m;
      return (b.weekLabel || b.dateRange || "").localeCompare(
        a.weekLabel || a.dateRange || ""
      );
    });

    if (monthFilter === "All") return wins;
    return wins.filter((w) => w.month === monthFilter);
  }, [allWinsForPerson, monthFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-zinc-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-red-400">Error: {error}</p>
          <Link
            to="/wbc"
            className="inline-block mt-4 rounded-lg px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          >
            Back to WBC
          </Link>
        </div>
      </div>
    );
  }

  if (!winnerMeta) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold">Winner not found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            This profile key does not match any WBC winners in your data.
          </p>

          <Link
            to="/wbc"
            className="inline-block mt-4 rounded-lg px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          >
            Back to WBC
          </Link>
        </div>
      </div>
    );
  }

  const totalWins = allWinsForPerson.length;

  return (
    <div className="min-h-screen bg-[#0e0505] text-white">
      <div
        aria-hidden
        className="h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Winner <span className="text-red-400">Profile</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              WBC history and winning entries for this miner.
            </p>
          </div>

          <Link
            to="/wbc"
            className="rounded-lg px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          >
            Back to WBC
          </Link>
        </div>

        <section className="mt-8 glass-tile-watery p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <img
              src={winnerMeta.avatar || "/favicon.ico"}
              alt={winnerMeta.name}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-white/20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xl font-semibold text-white truncate">
                  {winnerMeta.name}
                </div>

                <span className="rounded-full bg-green-600/20 px-2 py-[2px] text-[11px] text-green-400">
                  {totalWins} WBC win{totalWins > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                {winnerMeta.discord && (
                  <span className="inline-flex items-center gap-1">
                    <DiscordIcon />
                    <span className="truncate">@{winnerMeta.discord}</span>
                  </span>
                )}
                {winnerMeta.x && (
                  <span className="inline-flex items-center gap-1">
                    <XIcon />
                    <span className="truncate">@{winnerMeta.x}</span>
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard?.writeText(url);
                  }}
                  className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                >
                  Copy profile link
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Filter month:</span>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="rounded-lg bg-zinc-950 border border-zinc-800 px-2 py-2 text-xs text-zinc-200"
                  >
                    <option value="All">All</option>
                    {monthsForPerson.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-zinc-100">
              Winning timeline
            </h2>
            <p className="text-xs text-zinc-400">
              Showing {filteredWins.length} result{filteredWins.length !== 1 ? "s" : ""}.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWins.map((w) => {
              const label = w.weekLabel || w.dateRange || "Week";
              return (
                <div key={w.id} className="glass-tile-watery p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">
                        {w.month} • {label}
                      </div>
                      {w.dateRange && (
                        <div className="mt-1 text-xs text-zinc-400">
                          {w.dateRange}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-zinc-300">
                        WBC winner entry
                      </div>
                    </div>

                    <Link
                      to={`/wbc?id=${encodeURIComponent(String(w.id))}`}
                      className="shrink-0 rounded-lg px-3 py-2 text-xs bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                    >
                      Open
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {w.link && (
                      <a
                        href={w.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-zinc-100/10 hover:bg-zinc-100/20 border border-zinc-700 px-3 py-2 text-xs text-white transition-colors"
                      >
                        View content <span aria-hidden>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWins.length === 0 && (
            <p className="mt-4 text-sm text-zinc-400">
              No wins found for this filter.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
