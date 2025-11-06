import { useState } from "react";
import { motion } from "framer-motion";
import CategoryModal from "../components/ui/CategoryModal.jsx";

const months = [
  { label: "May, 2025", key: "2025-05" },
  { label: "June, 2025", key: "2025-06" },
  { label: "July, 2025", key: "2025-07" },
  { label: "August, 2025", key: "2025-08" },
  { label: "September, 2025", key: "2025-09" },
  { label: "October, 2025", key: "2025-10" },
  { label: "November, 2025", key: "2025-11" },
];

export default function HofMonths() {
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-rose-300 to-white bg-clip-text text-transparent">
            Select Month
          </h1>
          <p className="text-zinc-400">
            Choose a month to browse Hall of Fame winners.
          </p>
        </header>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {months.map((m, i) => (
            <motion.button
              key={m.key}
              onClick={() => setActive(m)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 220, damping: 20 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-600 via-rose-700 to-fuchsia-700 p-5 text-left shadow-lg hover:shadow-red-900/25 transition"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-white/5 mix-blend-soft-light" />
              <div className="relative z-10">
                <div className="text-sm text-white/80">Hall of Fame</div>
                <div className="mt-1 text-2xl font-bold">{m.label}</div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-white/90">
                  <span className="h-2 w-2 rounded-full bg-white/90" />
                  Tap to choose content type
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <CategoryModal
        open={!!active}
        month={active?.key}
        monthLabel={active?.label}
        onClose={() => setActive(null)}
      />
    </div>
  );
}
