// src/pages/WinnerProfile.jsx
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

function monthIdx(m) {
  const i = MONTH_ORDER.indexOf(m);
  return i === -1 ? -1 : i;
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function personKeyOf(entry) {
  return normalizeKey(entry?.personId || entry?.name || "");
}

function pickBestIdentity(primary, fallback) {
  // Prefer non-empty primary, else fallback
  const p = (primary || "").trim();
  if (p) return p;
  return (fallback || "").trim();
}

function safeText(v) {
  return (v || "").toString().trim();
}

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

function groupByYearMonth(items) {
  // items: { year, month, ... }
  const map = new Map(); // year -> month -> arr
  for (const it of items) {
    const y = it.year ?? null;
    const m = it.month || "";
    if (!y || !m) continue;

    if (!map.has(y)) map.set(y, new Map());
    const monthMap = map.get(y);

    if (!monthMap.has(m)) monthMap.set(m, []);
    monthMap.get(m).push(it);
  }

  // sort inside groups
  const years = Array.from(map.keys()).sort((a, b) => b - a);
  const out = years.map((y) => {
    const monthMap = map.get(y);
    const months = Array.from(monthMap.keys()).sort((a, b) => monthIdx(b) - monthIdx(a));
    const monthGroups = months.map((m) => {
      const arr = monthMap.get(m) || [];
      // Sort by something stable if present
      arr.sort((a, b) => {
        const aw = safeText(a.weekLabel || a.dateRange || a.placement || "");
        const bw = safeText(b.weekLabel || b.dateRange || b.placement || "");
        return bw.localeCompare(aw);
      });
      return { month: m, items: arr };
    });
    return { year: y, months: monthGroups };
  });

  return out;
}

export default function WinnerProfile() {
  const { key } = useParams(); // /winner/:key
  const winnerKey = normalizeKey(decodeURIComponent(key || ""));

  const [hofEntries, setHofEntries] = useState([]);
  const [wbcEntries, setWbcEntries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState("all"); // all | hof | wbc
  const [yearFilter, setYearFilter] = useState("all"); // all or number as string

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [hofRes, wbcRes] = await Promise.all([
          fetch("https://backend.minershub.online/api/hof"),
          fetch("https://backend.minershub.online/api/wbc"),
        ]);

        if (!hofRes.ok) throw new Error(`HoF HTTP ${hofRes.status}`);
        if (!wbcRes.ok) throw new Error(`WBC HTTP ${wbcRes.status}`);

        const [hofData, wbcData] = await Promise.all([hofRes.json(), wbcRes.json()]);

        const mappedHof = (hofData || []).map((row) => ({
          id: row.id,
          personId: row.person_id || null,
          name: row.name || "",
          avatar: row.avatar || "",
          discord: row.discord || "",
          x: row.x_handle || row.x || "",
          category: row.category || row.type || "",
          month: row.month || "",
          year: row.year ? Number(row.year) : null,
          placement: row.placement ?? row.rank ?? null,
          link: row.link || row.content_link || "",
        }));

        const mappedWbc = (wbcData || []).map((row) => ({
          id: row.id,
          personId: row.person_id || null,
          name: row.name || "",
          avatar: row.avatar || "",
          discord: row.discord || "",
          x: row.x_handle || row.x || "",
          month: row.month || "",
          year: row.year ? Number(row.year) : null,
          weekLabel: row.week_label || "",
          dateRange: row.date_range || "",
          link: row.link || "",
        }));

        if (!cancelled) {
          setHofEntries(mappedHof);
          setWbcEntries(mappedWbc);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load profile data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hofForPerson = useMemo(() => {
    return hofEntries.filter((e) => personKeyOf(e) === winnerKey);
  }, [hofEntries, winnerKey]);

  const wbcForPerson = useMemo(() => {
    return wbcEntries.filter((e) => personKeyOf(e) === winnerKey);
  }, [wbcEntries, winnerKey]);

  const identity = useMemo(() => {
    // choose best identity from either set
    const sample = hofForPerson[0] || wbcForPerson[0] || null;
    if (!sample) return null;

    const displayName = pickBestIdentity(sample.name, "Unknown winner");
    const avatar = safeText(sample.avatar);
    const discord = safeText(sample.discord);
    const x = safeText(sample.x);

    return { displayName, avatar, discord, x };
  }, [hofForPerson, wbcForPerson]);

  const allYears = useMemo(() => {
    const set = new Set();
    for (const e of hofForPerson) if (e.year) set.add(e.year);
    for (const e of wbcForPerson) if (e.year) set.add(e.year);
    return Array.from(set).sort((a, b) => b - a);
  }, [hofForPerson, wbcForPerson]);

  const filteredHoF = useMemo(() => {
    if (yearFilter === "all") return hofForPerson;
    const y = Number(yearFilter);
    return hofForPerson.filter((e) => e.year === y);
  }, [hofForPerson, yearFilter]);

  const filteredWBC = useMemo(() => {
    if (yearFilter === "all") return wbcForPerson;
    const y = Number(yearFilter);
    return wbcForPerson.filter((e) => e.year === y);
  }, [wbcForPerson, yearFilter]);

  const hofTimeline = useMemo(() => groupByYearMonth(filteredHoF), [filteredHoF]);
  const wbcTimeline = useMemo(() => groupByYearMonth(filteredWBC), [filteredWBC]);

  const totalHoF = hofForPerson.length;
  const totalWBC = wbcForPerson.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-zinc-400">Loading winner profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-red-400">Error: {error}</p>
          <div className="mt-4">
            <Link to="/hof" className="text-sm text-zinc-200 underline">
              Back to HoF
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-[#0e0505] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold">Winner not found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            No HoF or WBC entries matched this profile key.
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/hof" className="text-sm text-zinc-200 underline">
              Go to HoF
            </Link>
            <Link to="/wbc" className="text-sm text-zinc-200 underline">
              Go to WBC
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0505] text-white">
      <div
        aria-hidden
        className="h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Winner <span className="text-red-400">Profile</span>
            </h1>
            <div className="mt-2 text-sm text-zinc-400">
              Built from HoF and WBC history
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/hof"
              className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
            >
              Back to HoF
            </Link>
            <Link
              to="/wbc"
              className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
            >
              Back to WBC
            </Link>
          </div>
        </div>

        {/* Header Card */}
        <div className="mt-8 glass-tile-watery p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <img
              src={identity.avatar || "/favicon.ico"}
              alt={identity.displayName}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-white/20"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xl sm:text-2xl font-bold truncate">
                  {identity.displayName}
                </div>

                <span className="rounded-full bg-red-600/15 px-3 py-1 text-xs text-red-300 border border-red-900/40">
                  HoF wins: {totalHoF}
                </span>
                <span className="rounded-full bg-green-600/15 px-3 py-1 text-xs text-green-300 border border-green-900/40">
                  WBC wins: {totalWBC}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                {identity.discord && (
                  <span className="inline-flex items-center gap-1">
                    <DiscordIcon />
                    <span className="truncate">@{identity.discord}</span>
                  </span>
                )}
                {identity.x && (
                  <span className="inline-flex items-center gap-1">
                    <XIcon />
                    <span className="truncate">@{identity.x}</span>
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: "All" },
                    { id: "hof", label: "HoF" },
                    { id: "wbc", label: "WBC" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={[
                        "rounded-lg px-3 py-2 text-xs sm:text-sm border transition-colors",
                        tab === t.id
                          ? "bg-red-600/20 border-red-700 text-white"
                          : "bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Year Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Year</span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-800 hover:border-red-500 transition-colors"
                  >
                    <option value="all">All</option>
                    {allYears.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-8">
          {(tab === "all" || tab === "hof") && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-100">Hall of Fame</h2>

              {hofTimeline.length === 0 ? (
                <div className="glass-tile-watery p-4 text-sm text-zinc-400">
                  No HoF entries for this selection.
                </div>
              ) : (
                <div className="space-y-4">
                  {hofTimeline.map((y) => (
                    <div key={`hof-${y.year}`} className="glass-tile-watery p-4">
                      <div className="text-sm font-semibold text-zinc-100">
                        {y.year}
                      </div>

                      <div className="mt-3 space-y-3">
                        {y.months.map((m) => (
                          <div key={`hof-${y.year}-${m.month}`}>
                            <div className="text-xs text-zinc-300 mb-2">
                              {m.month}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {m.items.map((e) => (
                                <div
                                  key={`hof-${e.id}`}
                                  className="rounded-xl bg-black/25 border border-white/10 p-3"
                                >
                                  <div className="text-sm font-semibold truncate">
                                    {e.category || "HoF"}
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-400">
                                    {e.month} {e.year ? `(${e.year})` : ""}
                                    {e.placement ? ` • Placement: ${e.placement}` : ""}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-2">
                                    <Link
                                      to={`/hof?year=${encodeURIComponent(
                                        String(e.year || "")
                                      )}&month=${encodeURIComponent(e.month || "")}`}
                                      className="text-xs text-zinc-200 underline"
                                    >
                                      Open in HoF
                                    </Link>

                                    {e.link ? (
                                      <a
                                        href={e.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-zinc-200 underline"
                                      >
                                        View content
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {(tab === "all" || tab === "wbc") && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-100">Weekly Best Content</h2>

              {wbcTimeline.length === 0 ? (
                <div className="glass-tile-watery p-4 text-sm text-zinc-400">
                  No WBC entries for this selection.
                </div>
              ) : (
                <div className="space-y-4">
                  {wbcTimeline.map((y) => (
                    <div key={`wbc-${y.year}`} className="glass-tile-watery p-4">
                      <div className="text-sm font-semibold text-zinc-100">
                        {y.year}
                      </div>

                      <div className="mt-3 space-y-3">
                        {y.months.map((m) => (
                          <div key={`wbc-${y.year}-${m.month}`}>
                            <div className="text-xs text-zinc-300 mb-2">
                              {m.month}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {m.items.map((e) => (
                                <div
                                  key={`wbc-${e.id}`}
                                  className="rounded-xl bg-black/25 border border-white/10 p-3"
                                >
                                  <div className="text-sm font-semibold truncate">
                                    {e.weekLabel || e.dateRange || "Week"}
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-400">
                                    {e.month} {e.year ? `(${e.year})` : ""}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-2">
                                    <Link
                                      to={`/wbc?year=${encodeURIComponent(
                                        String(e.year || "")
                                      )}&month=${encodeURIComponent(
                                        e.month || ""
                                      )}&week=${encodeURIComponent(
                                        e.weekLabel || e.dateRange || ""
                                      )}`}
                                      className="text-xs text-zinc-200 underline"
                                    >
                                      Open in WBC
                                    </Link>

                                    {e.link ? (
                                      <a
                                        href={e.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-zinc-200 underline"
                                      >
                                        View content
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
