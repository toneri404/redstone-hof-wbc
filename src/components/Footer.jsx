export default function Footer() {
  return (
    <footer className="bg-[#100202] border-t border-redstone-800 border-opacity-60">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 text-sm text-redstone-100/80 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left side */}
        <div className="text-center md:text-left">
          <p>© 2025 RedStone Community Hub</p>
          <p className="mt-1 text-xs text-redstone-100/60">
            Built by the{" "}
            <span className="text-red-400 font-medium">
              RedStone Miners community
            </span>
          </p>
        </div>

        {/* Right side */}
        <div className="flex gap-4">
          <a
            href="https://redstone.finance"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-400 transition"
          >
            Official Site
          </a>
          <a
            href="https://x.com/redstone_defi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-400 transition"
          >
            Twitter
          </a>
          <a
            href="https://discord.gg/redstonedefi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-400 transition"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}