import { useParams, Link } from "react-router-dom";
import { hofEntries } from "../data/hof.js";

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden {...props}>
    <path d="M18.9 3H22l-7.7 8.8L22.7 21H16l-5-6.1L4.9 21H2l8.4-9.6L1.5 3H8l4.6 5.6L18.9 3z"/>
  </svg>
);
const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M20 4a16 16 0 0 0-4-.9l-.2.5a13 13 0 0 1 3.3 1.1c-3-1.7-6-1.7-9 0a13 13 0 0 1 3.3-1.1L13.2 3A16 16 0 0 0 9 4C3.7 11.4 5.7 17 5.7 17A9.7 9.7 0 0 0 9 18l.6-.8c-1 0-2-.6-2.7-1.3 1 .8 2.2 1.2 3.4 1.3a9.4 9.4 0 0 0 2.6 0c1.2-.1 2.4-.5 3.4-1.3-.7.7-1.7 1.3-2.7 1.3l.6.8a9.7 9.7 0 0 0 3.3-1s2-5.6-3.3-13zM9.7 13.3c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3.8 0 1.4.6 1.4 1.3s-.6 1.3-1.4 1.3zm4.6 0c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3.8 0 1.4.6 1.4 1.3s-.6 1.3-1.4 1.3z"/>
  </svg>
);

export default function HofProfile() {
  const { id } = useParams();
  const miner = hofEntries.find((m) => m.id === id);

  if (!miner) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-4">
          <Link to="/hof" className="text-sm text-zinc-400 hover:text-zinc-200">← Back to Hall of Fame</Link>
        </div>
        <div className="rounded-2xl border border-zinc-800 p-8 text-center text-zinc-400">
          Miner not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/hof" className="text-sm text-zinc-400 hover:text-zinc-200">← Back to Hall of Fame</Link>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex gap-4 items-center">
        <img src={miner.avatar} alt={miner.name} className="h-20 w-20 rounded-2xl ring-1 ring-zinc-800 object-cover" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{miner.name}</h1>
          
          <div className="mt-1 flex flex-wrap gap-4 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <DiscordIcon className="text-indigo-400" /> @{miner.discord}
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <XIcon className="text-white" /> @{miner.twitter}
            </span>
            <span><span className="text-zinc-400">Role:</span> {miner.role}</span>
            <span><span className="text-zinc-400">HoF Won:</span> {miner.wins?.length ?? 0}</span>
          </div>
        </div>
      </div>
      <h2 className="mt-8 mb-4 text-xl font-semibold">Winning content</h2>
      {(!miner.wins || miner.wins.length === 0) ? (
        <div className="rounded-xl border border-zinc-800 p-6 text-zinc-400">No wins yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {miner.wins.map((w) => (
            <a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={w.preview}
                  alt={w.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="font-medium leading-tight">{w.title}</div>
                <div className="text-xs text-zinc-400 mt-1">Opens in new tab</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
