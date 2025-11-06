import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
  { label: "May, 2025", value: "2025-05" },
  { label: "June, 2025", value: "2025-06" },
  { label: "July, 2025", value: "2025-07" },
  { label: "August, 2025", value: "2025-08" },
  { label: "September, 2025", value: "2025-09" },
  { label: "October, 2025", value: "2025-10" },
  { label: "November, 2025", value: "2025-11" },
];

const OPTIONS = [
  { label: "Written content", value: "Written content" },
  { label: "Visual & Art content", value: "Visual & Art content" },
  { label: "Meme content", value: "Meme content" },
  { label: "Other Creative Content", value: "Other Creative Content" },
  { label: "All", value: "All" },
];

export default function HofMonthSelect() {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const navigate = useNavigate();

  const openFor = (m) => {
    setSelectedMonth(m);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const go = (opt) => {
    const params = new URLSearchParams();
    if (selectedMonth?.value) params.set("month", selectedMonth.value);
    if (opt.value) params.set("category", opt.value);
    navigate(`/hof?${params.toString()}`);
  };

  const Tile = ({ m }) => (
    <button
      onClick={() => openFor(m)}
      className="group relative w-full rounded-2xl p-6 text-left border border-white/10
                 bg-gradient-to-br from-red-700 via-red-600/80 to-red-900
                 shadow-[0_8px_40px_rgba(255,0,0,0.12)] hover:scale-[1.02] transition"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-white/5 opacity-80 pointer-events-none" />
      <div className="relative z-10">
        <div className="text-xs text-white/80">Hall of Fame</div>
        <div className="mt-1 text-2xl font-bold">{m.label}</div>
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-white/90">
          <span className="h-2 w-2 rounded-full bg-white/90" />
          Tap to choose content type
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#100202] text-white">
      <div aria-hidden className="h-1.5 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-red-500 via-rose-300 to-white bg-clip-text text-transparent">
            Select Month
          </h1>
          <p className="text-white/75">
            Choose a month to browse Hall of Fame winners.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Close
          </button>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MONTHS.map((m) => (
            <Tile key={m.value} m={m} />
          ))}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/70" onClick={close} />
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="relative mx-auto mt-24 w-[min(640px,92vw)]
                           rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/60">Hall of Fame</div>
                    <h2 className="text-2xl font-bold">{selectedMonth?.label}</h2>
                  </div>
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="h-9 w-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 grid place-items-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => go(opt)}
                      className="rounded-xl border border-white/10 bg-zinc-800/60 hover:bg-zinc-700
                                 px-4 py-3 text-left font-medium"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
