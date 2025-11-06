export default function ContentTypeDialog({ open, onClose, onPick }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg px-2 py-1 text-sm bg-zinc-800 hover:bg-zinc-700"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold">
          <span className="bg-gradient-to-r from-rose-400 via-red-400 to-white bg-clip-text text-transparent">
            Choose content type
          </span>
        </h3>

        <div className="mt-4 grid gap-2">
          {[
            ["Written Content", "written"],
            ["Visual & Art Content", "visual"],
            ["Meme Content", "meme"],
            ["Other Creative Content", "other"],
          ].map(([label, key]) => (
            <button
              key={key}
              onClick={() => onPick(key)}
              className="rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2 text-left hover:bg-zinc-800"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
