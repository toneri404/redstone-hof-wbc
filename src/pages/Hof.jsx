import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";



const CATEGORY_SLUGS = [
  { slug: "overall", label: "All" },
  { slug: "written", label: "Written content" },
  { slug: "visual", label: "Visual & Art content" },
  { slug: "meme", label: "Meme content" },
  { slug: "other", label: "Other Creative Content" },
];

const normalizeCategory = (cat = "") => {
  const s = cat.toLowerCase();
  if (s.includes("written")) return "written";
  if (s.includes("visual") || s.includes("art")) return "visual";
  if (s.includes("meme")) return "meme";
  if (s.includes("other")) return "other";
  return "overall";
};

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

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-red-600 text-white"
          : "bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search name, Discord, X"
      className="w-full md:w-[360px] rounded-lg bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-sm outline-none focus:border-red-500"
    />
  );
}


function ProfileCard({ entry, wins, onViewProfile, showFirstBadge }) {
  return (
    <div className="glass-tile-watery relative p-4">
      <div className="flex items-center gap-3">
        <img
          src={entry.avatar || "/favicon.ico"}
          alt={entry.name}
          className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-white font-semibold truncate">
              {entry.name}
            </div>
            {showFirstBadge && (
              <span className="text-[11px] px-2 py-[2px] rounded-full bg-yellow-400/20 border border-yellow-300/60 text-yellow-100">
                1st place
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            {entry.discord && (
              <span className="inline-flex items-center gap-1">
                <DiscordIcon />
                <span className="truncate">@{entry.discord}</span>
              </span>
            )}
            {entry.x && (
              <span className="inline-flex items-center gap-1">
                <XIcon />
                <span className="truncate">@{entry.x}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-zinc-300">
        <span className="text-zinc-400">Month:</span>{" "}
        {entry.month || "All months"}{" "}
        <span className="text-zinc-500 mx-1">•</span>
        <span className="text-zinc-400">Category:</span>{" "}
        {entry.category || "Overall"}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-zinc-200">
          <span className="text-white font-semibold">{wins}</span> HoF wins
        </div>

        <button
          type="button"
          onClick={onViewProfile}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100/10 hover:bg-zinc-100/20 border border-zinc-700 px-3 py-2 text-sm text-white transition-colors"
        >
          View profile <span aria-hidden>↗</span>
        </button>
      </div>
    </div>
  );
}

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


function parseMonthString(label) {
  if (!label) return -1;

  // handle "October", "October, 2025", "October 2025" etc.
  const monthPart = label.split(",")[0].trim().split(" ")[0];
  const idx = MONTH_ORDER.indexOf(monthPart);

  return idx === -1 ? -1 : idx;
}

/*main page*/

export default function Hof() {
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [selectedPersonKey, setSelectedPersonKey] = useState(null);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMonthDialog, setShowMonthDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("https://redstone-hub-api.onrender.com/api/hof");
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
          category: row.category || "",
          link: row.link || "",
          placement:
            row.placement === null || row.placement === undefined
              ? null
              : Number(row.placement),
          createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
        }));

        if (!cancelled) setEntries(mapped);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load HoF data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCatSlug =
    CATEGORY_SLUGS.find((c) => c.slug === params.get("category"))?.slug ||
    "overall";
  const monthParam = params.get("month") || "";

  const months = useMemo(() => {
    const set = new Set();
    for (const e of entries) {
      if (e.month) set.add(e.month);
    }
    const arr = Array.from(set);
    arr.sort((a, b) => parseMonthString(b) - parseMonthString(a));
    return arr;
  }, [entries]);

  // Count wins by person
  const winsByPerson = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = personKeyOf(e);
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [entries]);

  const selectedPersonEntries = useMemo(() => {
    if (!selectedPersonKey) return [];
    return entries.filter((e) => personKeyOf(e) === selectedPersonKey);
  }, [entries, selectedPersonKey]);

  const selectedProfile = useMemo(() => {
    if (!selectedPersonEntries.length) return null;
    const first = selectedPersonEntries[0];
    return {
      name: first.name,
      avatar: first.avatar,
      discord: first.discord,
      x: first.x,
      wins: winsByPerson.get(selectedPersonKey) || selectedPersonEntries.length,
    };
  }, [selectedPersonEntries, winsByPerson, selectedPersonKey]);

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    next.set("category", slug);
    setParams(next, { replace: true });
    setSelectedPersonKey(null);
  };

  const setMonth = (m) => {
    const next = new URLSearchParams(params);
    if (m) next.set("month", m);
    else next.delete("month");
    setParams(next, { replace: true });
    setSelectedPersonKey(null);
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    next.set("category", "overall");
    next.delete("month");
    setParams(next, { replace: true });
    setQuery("");
    setSelectedPersonKey(null);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelectedPersonKey(null);
  };

  const showClear =
    activeCatSlug !== "overall" || !!monthParam || query.trim() !== "";

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = entries
      .map((e) => ({
        ...e,
        _cat: normalizeCategory(e.category),
        _hay: [e.name, e.discord, e.x]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      }))
      .filter((e) =>
        activeCatSlug === "overall" ? true : e._cat === activeCatSlug
      )
      .filter((e) => (monthParam ? e.month === monthParam : true))
      .filter((e) => (q ? e._hay.includes(q) : true));

  
    if (monthParam) {
      list = [...list].sort((a, b) => {
        const aFirst = a.placement === 1 ? 0 : 1;
        const bFirst = b.placement === 1 ? 0 : 1;
        if (aFirst !== bFirst) return aFirst - bFirst;


        if (
          a.placement != null &&
          b.placement != null &&
          a.placement !== b.placement
        ) {
          return a.placement - b.placement;
        }

        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    }

    return list;
  }, [entries, activeCatSlug, monthParam, query]);


  const isAllMonthsAllCat = activeCatSlug === "overall" && !monthParam;

  const displayEntries = useMemo(() => {
    if (!isAllMonthsAllCat) return filteredEntries;

    const byPerson = new Map();

    for (const e of filteredEntries) {
      const key = personKeyOf(e);
      if (!key) continue;
      const current = byPerson.get(key);
      if (!current) {
        byPerson.set(key, e);
      } else {
        if ((e.createdAt || 0) > (current.createdAt || 0)) {
          byPerson.set(key, e);
        }
      }
    }

    const arr = Array.from(byPerson.values());

    arr.sort((a, b) => {
      const winsA = winsByPerson.get(personKeyOf(a)) || 0;
      const winsB = winsByPerson.get(personKeyOf(b)) || 0;
      if (winsA !== winsB) return winsB - winsA;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return arr;
  }, [filteredEntries, isAllMonthsAllCat, winsByPerson]);

  const headerMonth = monthParam || "All months";
  const headerCatLabel =
    CATEGORY_SLUGS.find((c) => c.slug === activeCatSlug)?.label || "All";

  const openMonthDialog = () => setShowMonthDialog(true);
  const closeMonthDialog = () => setShowMonthDialog(false);

  const handleViewProfile = (rawKey) => {
    const key = (rawKey || "").trim().toLowerCase();
    if (!key) return;
    setSelectedPersonKey(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0e0505] text-white">
      <div
        aria-hidden
        className="h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Hall of <span className="text-red-400">Fame</span>
        </h1>
        <div className="mt-2 text-zinc-300">
          {headerMonth} • {headerCatLabel}
        </div>


        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={openMonthDialog}
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-zinc-900/90 border border-zinc-800 hover:border-red-500 transition-colors"
          >
            Select Month
          </button>

          {CATEGORY_SLUGS.map((c) => (
            <Pill
              key={c.slug}
              active={c.slug === activeCatSlug}
              onClick={() => setCategory(c.slug)}
            >
              {c.label}
            </Pill>
          ))}

          {showClear && (
            <button
              onClick={clearAll}
              className="ml-auto rounded-lg px-3 py-2 text-sm bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        <div className="mt-4">
          <SearchBox value={query} onChange={handleQueryChange} />
        </div>

        {loading && (
          <p className="mt-6 text-sm text-zinc-400">
            Loading Hall of Fame winners…(waking up the server, this can
            take a few seconds on first load)
          </p>
        )}
        {error && (
          <p className="mt-6 text-sm text-red-400">Error: {error}</p>
        )}

        {selectedProfile && (
          <section className="mt-8 space-y-4">
            <div className="glass-tile-watery p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-900/60 overflow-hidden flex items-center justify-center text-xl font-semibold">
                {selectedProfile.avatar ? (
                  <img
                    src={selectedProfile.avatar}
                    alt={selectedProfile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{selectedProfile.name?.[0] || "?"}</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {selectedProfile.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/50 text-red-100">
                    {selectedProfile.wins} HoF wins
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 border border-white/15 text-zinc-200">
                    Selected profile
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-300">
                  {selectedProfile.discord && (
                    <a
                      href={`https://discord.com/users/${selectedProfile.discord}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                    >
                      <DiscordIcon />
                      <span>@{selectedProfile.discord}</span>
                    </a>
                  )}
                  {selectedProfile.x && (
                    <a
                      href={`https://x.com/${selectedProfile.x}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-4"
                    >
                      <XIcon />
                      <span>@{selectedProfile.x}</span>
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPersonKey(null)}
                className="self-start rounded-md border border-zinc-700 bg-black/40 px-3 py-1.5 text-xs sm:text-sm text-zinc-200 hover:bg-black/60"
              >
                Clear selection
              </button>
            </div>

            <div className="glass-tile-watery p-5 sm:p-6">
              <h3 className="text-lg font-semibold mb-3">
                Winning content links
              </h3>

              {selectedPersonEntries.length === 0 ? (
                <p className="text-sm text-slate-300">
                  No Hall of Fame entries yet for this miner.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {selectedPersonEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/30 px-3 py-2"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-100">
                          {entry.month} · {entry.category}
                          {entry.placement === 1 &&
                            monthParam === entry.month && (
                              <span className="ml-2 text-[11px] px-2 py-[1px] rounded-full bg-yellow-400/15 border border-yellow-400/60 text-yellow-100">
                                1st place
                              </span>
                            )}
                        </p>
                      </div>

                      {entry.link && (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border border-red-400/70 bg-red-500/20 hover:bg-red-500/30"
                        >
                          View content
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {!loading && displayEntries.length === 0 ? (
            <div className="col-span-full text-zinc-400">
              No winners found for this filter.
            </div>
          ) : (
            displayEntries.map((entry) => {
              const key = personKeyOf(entry);
              const wins = winsByPerson.get(key) || 1;
              const showFirstBadge =
                !!monthParam && entry.placement === 1 && entry.month === monthParam;

              return (
                <ProfileCard
                  key={entry.id}
                  entry={entry}
                  wins={wins}
                  showFirstBadge={showFirstBadge}
                  onViewProfile={() => handleViewProfile(key)}
                />
              );
            })
          )}
        </div>
      </div>

      {showMonthDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeMonthDialog}
          />
          <div className="relative w-[min(95vw,650px)] rounded-2xl bg-zinc-950 border border-zinc-800 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Choose a month</h2>
              <button
                onClick={closeMonthDialog}
                className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMonth("");
                  closeMonthDialog();
                }}
                className={[
                  "rounded-md px-3 py-2 text-sm border transition-colors",
                  monthParam === ""
                    ? "bg-red-600 text-white border-red-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-red-500",
                ].join(" ")}
              >
                All months
              </button>

              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMonth(m);
                    closeMonthDialog();
                  }}
                  className={[
                    "rounded-md px-3 py-2 text-sm border transition-colors",
                    m === monthParam
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-zinc-900 border-zinc-800 hover:border-red-500",
                  ].join(" ")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
