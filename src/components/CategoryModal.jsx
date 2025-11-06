import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const options = [
  { key: "overall", label: "Overall" },
  { key: "visual",  label: "Visual & Art content" },
  { key: "written", label: "Written content" },
  { key: "meme",    label: "Meme content" },
  { key: "other",   label: "Other Creative Content" },
];

export default function CategoryModal({ open, month, monthLabel, onClose }) {
  const navigate = useNavigate();
  const go = (key) => {
    navigate(`/hof?month=${encodeURIComponent(month)}&category=${encodeURIComponent(key)}`);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative mx-auto mt-28 w-[95%] max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="absolute -top-1 -left-1 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{monthLabel}</h2>
            <p className="mt-1 text-sm text-zinc-300">Which content type do you want to see?</p>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => go(opt.key)}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 text-left hover:border-red-500/40 transition"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="relative z-10 font-semibold">{opt.label}</div>
                  <div className="relative z-10 mt-1 text-xs text-zinc-400">Tap to open {opt.label.toLowerCase()}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:border-zinc-400/40">
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
