import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wbcEntries, wbcMonths } from "../data/wbc";

const personKeyOf = (entry) =>
  (entry.personId || entry.name || "").trim().toLowerCase();


function useWinnersByMonth() {
  return useMemo(() => {
    const map = new Map();
    for (const e of wbcEntries) {
      if (!e.month) continue;
      const month = e.month;
      const key = personKeyOf(e);
      if (!key) continue;

      if (!map.has(month)) map.set(month, []);
      const arr = map.get(month);
      if (!arr.find((w) => w.key === key)) {
        arr.push({
          key,
          name: e.name,
          avatar: e.avatar,
        });
      }
    }
    return map;
  }, []);
}


function useWeeksByMonth() {
  return useMemo(() => {
    const map = new Map();
    for (const e of wbcEntries) {
      if (!e.month) continue;
      const month = e.month;
      if (!map.has(month)) map.set(month, []);
      map.get(month).push(e);
    }
    for (const [month, arr] of map.entries()) {
      arr.sort((a, b) => (a.weekLabel || "").localeCompare(b.weekLabel || ""));
    }
    return map;
  }, []);
}

export default function WbcMonthSelect() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const winnersByMonth = useWinnersByMonth();
  const weeksByMonth = useWeeksByMonth();

  const openWeeksForMonth = (month) => {
    setSelectedMonth(month);
  };

  const closeWeeks = () => setSelectedMonth(null);

  const handleWeekClick = (month, weekLabel) => {
    const search = new URLSearchParams();
    search.set("month", month);
    search.set("week", weekLabel);
    navigate(`/wbc?${search.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative w-[min(100vw,1100px)] max-h-[90vh] rounded-3xl bg-black border border-zinc-800 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0 bg-black/95 border-b border-zinc-800">
          <h1 className="text-xl md:text-2xl font-semibold">
            Select Month <span className="text-zinc-400">• Weekly Best Content</span>
          </h1>
          <button
            onClick={() => navigate("/")}
            className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wbcMonths.map((month) => {
            const winners = winnersByMonth.get(month) || [];
            return (
              <button
                key={month}
                type="button"
                onClick={() => openWeeksForMonth(month)}
                className="rounded-3xl bg-red-900/90 border border-red-700/70 text-left p-4 shadow-[0_20px_60px_rgba(0,0,0,0.75)] hover:border-red-400 transition-colors"
              >
                <p className="text-xs text-red-200/80 font-semibold">
                  Weekly Best Content
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {month}
                </h2>

                {winners.length === 0 ? (
                  <p className="mt-4 text-xs text-red-100/80">
                    No WBC winners recorded for this month yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-red-100/80">
                      Winners in this month
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {winners.map((w) => (
                        <div
                          key={w.key}
                          className="inline-flex items-center gap-2 rounded-full bg-black/35 px-2 py-1"
                        >
                          <img
                            src={w.avatar || "/favicon.ico"}
                            alt={w.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-zinc-50">
                            {w.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-[11px] text-red-100/80">
                  Tap to choose week and view winner.
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMonth && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeWeeks} />
          <div className="relative w-[min(95vw,700px)] max-h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Select winner : {selectedMonth}
              </h2>
              <button
                onClick={closeWeeks}
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
                  onClick={() =>
                    handleWeekClick(selectedMonth, entry.weekLabel)
                  }
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
                        {entry.weekLabel || "Week"}
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
          </div>
        </div>
      )}
    </div>
  );
}
