import React, { useEffect, useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import hofBg from "../assets/hof-bg.png";
import homeBg from "../assets/home.png";
import wbcBg from "../assets/wbc.png";
import redstoneLogoPng from "../assets/redstone-logo.png";
import WbcMonthOverlay from "../components/ui/WbcMonthOverlay.jsx";
import HofMonthOverlay from "../components/ui/HofMonthOverlay.jsx";
import homeHeroVideo from "../assets/home-hero.mp4";

function TypewriterLine({
  text = "Forged by builders. Inspired by creators. Immortalized in RedStone.",
  speed = 28,
  startDelay = 250,
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => {
      const id = setInterval(() => {
        setI((prev) => {
          if (prev >= text.length) {
            clearInterval(id);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, speed, startDelay]);

  return (
    <div className="w-full flex justify-center mt-2">
      <span className="whitespace-nowrap text-white/80 font-brand text-center">
        {text.slice(0, i)}
      </span>
      <span className="rs-caret" aria-hidden />
    </div>
  );
}

function RedstoneMark({ className = "h-9 w-9" }) {
  return (
    <motion.div
      className="relative grid place-items-center"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
      whileHover={{ scale: 1.08, transition: { duration: 0.25 } }}
      style={{ transformOrigin: "center" }}
    >
      <motion.div
        className="absolute inset-0 -z-10 rounded-full"
        style={{
          background:
            "radial-gradient(62% 62% at 50% 50%, rgba(255,70,70,.25), transparent 70%)",
        }}
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.96, 1.05, 0.96] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src={redstoneLogoPng}
        alt="RedStone"
        className={`${className} object-contain select-none pointer-events-none`}
        draggable="false"
        style={{
          filter: "drop-shadow(0 0 12px rgba(255,80,80,0.55)) brightness(1.05)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
        whileHover={{
          rotate: [0, 720],
          transition: { repeat: Infinity, ease: "linear", duration: 2 },
          filter:
            "drop-shadow(0 0 16px rgba(255,100,100,0.8)) brightness(1.18)",
          scale: 1.08,
        }}
      />
    </motion.div>
  );
}

const Tile = memo(function Tile({
  title,
  subtitle,
  gradient,
  bgImage,
  glow,
  onClick,
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ y: 40, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      whileHover={{
        scale: 1.05,
        rotate: 1,
        boxShadow: `0 0 25px ${glow}`,
        filter: "brightness(1.06)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`relative w-full max-w-[520px] aspect-[6/4] rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col justify-between text-left border border-white/10 ${gradient}`}
    >
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-500"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/22 to-black/62 pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          {title}
        </h2>
        <p className="text-white/80 mt-1 text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-white/90 text-sm font-medium tracking-wide">
        <span className="inline-block h-2 w-2 rounded-full bg-white/90 animate-pulse" />
        Tap to explore
      </div>
    </motion.button>
  );
});

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

function monthIndex(label) {
  if (!label) return -1;
  const monthPart = label.split(",")[0].trim().split(" ")[0];
  const idx = MONTH_ORDER.indexOf(monthPart);
  return idx === -1 ? -1 : idx;
}

function personKeyOf(entry) {
  return (entry.personId || entry.name || "").trim().toLowerCase();
}

const normalizeHofCategory = (cat = "") => {
  const s = String(cat || "").toLowerCase();
  if (s.includes("written")) return "written";
  if (s.includes("visual") || s.includes("art")) return "visual";
  if (s.includes("meme")) return "meme";
  if (s.includes("other")) return "other";
  return "overall";
};

const HOF_SPOTLIGHT_CATEGORIES = [
  { key: "written", label: "Written content" },
  { key: "visual", label: "Visual and Art content" },
  { key: "meme", label: "Meme content" },
  { key: "other", label: "Other Creative Content" },
];

function SpotlightPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200">
      {children}
    </span>
  );
}

function SpotlightCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-sm p-5 sm:p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/70">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function WinnerRow({ avatar, name, discord, x, right, subline }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/25 border border-white/10 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={avatar || "/favicon.ico"}
          alt={name || "Winner"}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {name || "Not set yet"}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-white/70">
            {subline ? <span className="truncate">{subline}</span> : null}
            {discord ? <span className="truncate">@{discord}</span> : null}
            {x ? <span className="truncate">@{x}</span> : null}
          </div>
        </div>
      </div>
      {right}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [showMonths, setShowMonths] = useState(false);
  const [showWbcMonths, setShowWbcMonths] = useState(false);

  // Spotlight data
  const [hofEntries, setHofEntries] = useState([]);
  const [wbcEntries, setWbcEntries] = useState([]);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [spotlightErr, setSpotlightErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSpotlight() {
      try {
        setSpotlightLoading(true);
        setSpotlightErr("");

        const [hofRes, wbcRes] = await Promise.all([
          fetch("https://backend.minershub.online/api/hof"),
          fetch("https://backend.minershub.online/api/wbc"),
        ]);

        if (!hofRes.ok) throw new Error(`HoF HTTP ${hofRes.status}`);
        if (!wbcRes.ok) throw new Error(`WBC HTTP ${wbcRes.status}`);

        const hofData = await hofRes.json();
        const wbcData = await wbcRes.json();

        const hofMapped = hofData.map((row) => ({
          id: row.id,
          personId: row.person_id || null,
          name: row.name || "",
          avatar: row.avatar || "",
          discord: row.discord || "",
          x: row.x_handle || row.x || "",
          month: row.month || "",
          year: row.year ? Number(row.year) : null,
          category: row.category || "",
          link: row.link || "",
          placement:
            row.placement === null || row.placement === undefined
              ? null
              : Number(row.placement),
          createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
        }));

        const wbcMapped = wbcData.map((row) => ({
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
          createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
        }));

        if (!cancelled) {
          setHofEntries(hofMapped);
          setWbcEntries(wbcMapped);
        }
      } catch (e) {
        if (!cancelled) setSpotlightErr(e?.message || "Failed to load spotlight data.");
      } finally {
        if (!cancelled) setSpotlightLoading(false);
      }
    }

    loadSpotlight();
    return () => {
      cancelled = true;
    };
  }, []);

  const hofYears = useMemo(() => {
    const set = new Set();
    for (const e of hofEntries) if (e.year) set.add(e.year);
    return Array.from(set).sort((a, b) => b - a);
  }, [hofEntries]);

  const wbcYears = useMemo(() => {
    const set = new Set();
    for (const e of wbcEntries) if (e.year) set.add(e.year);
    return Array.from(set).sort((a, b) => b - a);
  }, [wbcEntries]);

  const latestHofYear = hofYears[0] || null;
  const latestWbcYear = wbcYears[0] || null;

  const latestHofMonth = useMemo(() => {
    if (!latestHofYear) return "";
    const months = new Set();
    for (const e of hofEntries) {
      if (e.year !== latestHofYear) continue;
      if (e.month) months.add(e.month);
    }
    const arr = Array.from(months);
    arr.sort((a, b) => monthIndex(b) - monthIndex(a));
    return arr[0] || "";
  }, [hofEntries, latestHofYear]);

  const latestWbcMonth = useMemo(() => {
    if (!latestWbcYear) return "";
    const months = new Set();
    for (const e of wbcEntries) {
      if (e.year !== latestWbcYear) continue;
      if (e.month) months.add(e.month);
    }
    const arr = Array.from(months);
    arr.sort((a, b) => monthIndex(b) - monthIndex(a));
    return arr[0] || "";
  }, [wbcEntries, latestWbcYear]);

  // HoF spotlight: 4 categories, each should show 1st place winner
  const hofSpotlightByCategory = useMemo(() => {
    if (!latestHofYear || !latestHofMonth) return [];

    const monthEntries = hofEntries
      .filter((e) => e.year === latestHofYear && e.month === latestHofMonth)
      .map((e) => ({ ...e, _cat: normalizeHofCategory(e.category) }));

    // Only winners that are explicitly 1st
    const firstWinners = monthEntries.filter((e) => e.placement === 1);

    // Pick one per category (if duplicates, take newest)
    const pick = new Map();
    for (const e of firstWinners) {
      if (!HOF_SPOTLIGHT_CATEGORIES.find((c) => c.key === e._cat)) continue;
      const existing = pick.get(e._cat);
      if (!existing) pick.set(e._cat, e);
      else if ((e.createdAt || 0) > (existing.createdAt || 0)) pick.set(e._cat, e);
    }

    // Return in fixed category order with placeholders when missing
    return HOF_SPOTLIGHT_CATEGORIES.map((c) => ({
      categoryKey: c.key,
      categoryLabel: c.label,
      entry: pick.get(c.key) || null,
    }));
  }, [hofEntries, latestHofYear, latestHofMonth]);

  // WBC spotlight: keep as-is (latest by createdAt in latest month)
  const wbcSpotlight = useMemo(() => {
    if (!latestWbcYear || !latestWbcMonth) return null;

    const list = wbcEntries
      .filter((e) => e.year === latestWbcYear && e.month === latestWbcMonth)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return list[0] || null;
  }, [wbcEntries, latestWbcYear, latestWbcMonth]);

  const hofOpenLink = latestHofYear
    ? `/hof?year=${encodeURIComponent(String(latestHofYear))}&month=${encodeURIComponent(
        latestHofMonth || ""
      )}&category=overall`
    : "/hof";

  const wbcOpenLink = wbcSpotlight
    ? `/wbc?year=${encodeURIComponent(String(wbcSpotlight.year || latestWbcYear || ""))}&month=${encodeURIComponent(
        wbcSpotlight.month || latestWbcMonth || ""
      )}&week=${encodeURIComponent(wbcSpotlight.weekLabel || wbcSpotlight.dateRange || "")}`
    : "/wbc";

  return (
    <div
      className="min-h-screen bg-[#100202] text-white overflow-hidden relative"
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={homeHeroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

      <header className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RedstoneMark />
          <div>
            <h1 className="font-brandDisplay text-4xl text-white">
              RedStone Community <span className="text-red-400">Hub</span>
            </h1>
            <p className="text-xs md:text-sm text-white/60 italic">
              Where creativity meets precision
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-24 pt-6 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="heading-win text-smooth
                       text-[56px] md:text-[72px]
                       bg-gradient-to-r from-red-500 via-rose-400 to-white
                       bg-clip-text text-transparent tracking-tight
                       hero-title-premium"
          >
            Discover. Create. Shine.
          </motion.h2>

          <TypewriterLine />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 place-items-center">
          <Tile
            title="Hall of Fame"
            subtitle="See the legends who defined excellence"
            gradient="bg-gradient-to-br from-red-600 via-rose-700 to-fuchsia-700"
            bgImage={hofBg}
            glow="rgba(255, 80, 80, 0.40)"
            onClick={() => setShowMonths(true)}
          />
          <Tile
            title="Weekly Best Content"
            subtitle="Celebrate top creators every week"
            gradient="bg-gradient-to-br from-[#8B0000] via-[#b22222] to-[#d32f2f]"
            bgImage={wbcBg}
            glow="rgba(255, 60, 60, 0.35)"
            onClick={() => setShowWbcMonths(true)}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-14 md:mt-16"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                Spotlight
              </h3>
              <p className="text-sm text-white/65 mt-1">
                Latest highlights from HoF and WBC, auto updated from your existing data.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/hof"
                className="rounded-lg px-3 py-2 text-sm bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
              >
                Explore HoF
              </Link>
              <Link
                to="/wbc"
                className="rounded-lg px-3 py-2 text-sm bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
              >
                Explore WBC
              </Link>
            </div>
          </div>

          {spotlightLoading ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/70">
              Loading spotlight...
            </div>
          ) : spotlightErr ? (
            <div className="rounded-2xl border border-red-500/30 bg-black/25 p-5 text-sm text-red-200">
              Error: {spotlightErr}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpotlightCard
                title="Hall of Fame spotlight"
                subtitle={
                  latestHofYear && latestHofMonth
                    ? `1st place winners for ${latestHofMonth} (${latestHofYear})`
                    : "No HoF data found yet."
                }
                action={
                  <Link
                    to={hofOpenLink}
                    className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
                  >
                    Open month
                  </Link>
                }
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <SpotlightPill>Latest month</SpotlightPill>
                  {latestHofYear ? <SpotlightPill>Year: {latestHofYear}</SpotlightPill> : null}
                  {latestHofMonth ? <SpotlightPill>Month: {latestHofMonth}</SpotlightPill> : null}
                </div>

                <div className="mt-4 space-y-3">
                  {hofSpotlightByCategory.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                      Add HoF entries and they will appear here automatically.
                    </div>
                  ) : (
                    hofSpotlightByCategory.map(({ categoryKey, categoryLabel, entry }) => (
                      <WinnerRow
                        key={categoryKey}
                        avatar={entry?.avatar}
                        name={entry?.name || "Not set yet"}
                        discord={entry?.discord}
                        x={entry?.x}
                        subline={categoryLabel}
                        right={
                          <div className="flex items-center gap-2">
                            <SpotlightPill>1st</SpotlightPill>
                            {entry?.link ? (
                              <a
                                href={entry.link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg px-3 py-2 text-xs bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
                              >
                                View
                              </a>
                            ) : (
                              <span className="rounded-lg px-3 py-2 text-xs bg-black/15 border border-white/10 text-white/50">
                                Missing
                              </span>
                            )}
                          </div>
                        }
                      />
                    ))
                  )}
                </div>
              </SpotlightCard>

              <SpotlightCard
                title="Weekly Best Content spotlight"
                subtitle={
                  latestWbcYear && latestWbcMonth
                    ? `Latest winner for ${latestWbcMonth} (${latestWbcYear})`
                    : "No WBC data found yet."
                }
                action={
                  <Link
                    to={wbcOpenLink}
                    className="rounded-lg px-3 py-2 text-xs sm:text-sm bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
                  >
                    Open winner
                  </Link>
                }
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <SpotlightPill>Latest week</SpotlightPill>
                  {latestWbcYear ? <SpotlightPill>Year: {latestWbcYear}</SpotlightPill> : null}
                  {latestWbcMonth ? <SpotlightPill>Month: {latestWbcMonth}</SpotlightPill> : null}
                </div>

                <div className="mt-4">
                  {!wbcSpotlight ? (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                      Add at least one WBC entry and it will appear here automatically.
                    </div>
                  ) : (
                    <WinnerRow
                      avatar={wbcSpotlight.avatar}
                      name={wbcSpotlight.name}
                      discord={wbcSpotlight.discord}
                      x={wbcSpotlight.x}
                      right={
                        <div className="flex items-center gap-2">
                          <SpotlightPill>
                            {wbcSpotlight.weekLabel || wbcSpotlight.dateRange || "Week"}
                          </SpotlightPill>
                          {wbcSpotlight.link ? (
                            <a
                              href={wbcSpotlight.link}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg px-3 py-2 text-xs bg-black/30 border border-white/10 text-white/85 hover:bg-black/40"
                            >
                              View
                            </a>
                          ) : null}
                        </div>
                      }
                    />
                  )}
                </div>
              </SpotlightCard>
            </div>
          )}
        </motion.section>
      </main>

      <HofMonthOverlay open={showMonths} onClose={() => setShowMonths(false)} />
      <WbcMonthOverlay open={showWbcMonths} onClose={() => setShowWbcMonths(false)} />
    </div>
  );
}
