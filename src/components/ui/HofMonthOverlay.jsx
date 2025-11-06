import { memo, useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { normalizeCategory } from "../../data/hof.js";

const SECTIONS = [
  { key: "written", label: "Written content" },
  { key: "visual", label: "Visual & Art content" },
  { key: "meme", label: "Meme content" },
  { key: "other", label: "Other Creative Content" },
];


function parseMonthString(label) {
  if (!label) return 0;
  const d = new Date(label.replace(",", " 1,"));
  return d.getTime() || 0;
}

/*month tile for the popup.
*/
const MonthTile = memo(function MonthTile({ month, entries, onOpen }) {

  const winners = useMemo(() => {
    const map = {};

    const monthEntries = entries.filter((e) => e.month === month);

    const sortByTimeOrId = (a, b) => {
      if (a.createdAt && b.createdAt) return a.createdAt - b.createdAt;
      return (a.id || 0) - (b.id || 0);
    };

    for (const sec of SECTIONS) {
      const candidates = monthEntries.filter(
        (e) => normalizeCategory(e.category) === sec.key
      );
      if (!candidates.length) continue;


      let chosen = candidates.find((e) => e.placement === 1);


      if (!chosen) {
        chosen = [...candidates].sort(sortByTimeOrId)[0];
      }

      if (chosen) {
        map[sec.key] = chosen;
      }
    }

    return map;
  }, [entries, month]);


  const preview = useMemo(() => {
    const list = [];
    const seen = new Set();

    for (const w of Object.values(winners)) {
      if (!w) continue;
      const key = w.id ?? `${w.name}-${w.category}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(w);
      if (list.length >= 4) break;
    }

    return list;
  }, [winners]);

  return (
    <motion.button
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
        <div className="text-sm text-white/85">Hall of Fame</div>
        <div className="mt-0.5 text-2xl font-bold text-white">{month}</div>


        <div className="mt-4">
          {preview.length === 0 ? (
            <p className="text-xs text-red-100/85">
              No Hall of Fame winners recorded for this month yet.
            </p>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-wide text-red-100/80 mb-2">
                Top winners
              </p>
              <div className="flex flex-wrap gap-2">
                {preview.map((w) => (
                  <div
                    key={w.id ?? `${w.name}-${w.category}`}
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
          Tap to view all winners
        </div>
      </div>
    </motion.button>
  );
});

export default function HofMonthOverlay({ open, onClose }) {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch("https://redstone-hub-api.onrender.com/api/hof");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mapped = data.map((row) => ({
          id: row.id,
          name: row.name || "",
          avatar: row.avatar || "",
          month: row.month || "",
          category: row.category || "",
          placement:
            row.placement === null || row.placement === undefined
              ? null
              : Number(row.placement),
          createdAt: row.created_at ? new Date(row.created_at) : null,
        }));

        if (!cancelled) setEntries(mapped);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load HoF data!");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  
  const months = useMemo(() => {
    const set = new Set();
    for (const e of entries) {
      if (e.month) set.add(e.month);
    }
    const arr = Array.from(set);
    arr.sort((a, b) => parseMonthString(b) - parseMonthString(a));
    return arr;
  }, [entries]);

  const goAll = () => {
    onClose?.();
    navigate("/hof");
  };

  const goMonth = (m) => {
    onClose?.();
    navigate(`/hof?month=${encodeURIComponent(m)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center"
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
            className="relative w-[min(95vw,1100px)] max-h-[88vh] overflow-auto rounded-2xl bg-[#0e0505] border border-zinc-800 p-6"
          >
            <div className="flex items-center justify-between gap-4 sticky top-0 bg-[#0e0505] pb-4">
              <div className="text-xl font-semibold">
                Select Month • <span className="text-red-400">Hall of Fame</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            {error && (
              <p className="mt-1 mb-3 text-xs text-red-300">
                Error loading data: {error}
              </p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              
              <motion.button
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
                  <div className="text-sm text-white/85">Hall of Fame</div>
                  <div className="mt-0.5 text-2xl font-bold text-white">
                    View all winners
                  </div>
                  <div className="mt-4 text-sm text-white/85">
                    • Browse every month and category
                  </div>
                </div>
              </motion.button>

              {months.map((m) => (
                <MonthTile
                  key={m}
                  month={m}
                  entries={entries}
                  onOpen={goMonth}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
