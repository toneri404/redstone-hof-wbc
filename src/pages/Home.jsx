// src/pages/Home.jsx
import React, { useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import hofBg from "../assets/temp-hof-bg.png";
import homeBg from "../assets/home.png";
import wbcBg from "../assets/temp-wbc.png";
import redstoneLogoPng from "../assets/redstone-logo.png";
import WbcMonthOverlay from "../components/ui/WbcMonthOverlay.jsx";
import HofMonthOverlay from "../components/ui/HofMonthOverlay.jsx";
//import Avatar from "../components/ui/Avatar.jsx";
import homeHeroVideo from "../assets/temp-home-hero.mp4";

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

function parseMonth(label = "") {
  if (!label) return -1;
  const monthPart = String(label).split(",")[0].trim().split(" ")[0];
  const idx = MONTH_ORDER.indexOf(monthPart);
  return idx === -1 ? -1 : idx;
}

function normalizeHofCategory(cat = "") {
  const s = String(cat || "").toLowerCase();
  if (s.includes("written")) return "written";
  if (s.includes("visual") || s.includes("art")) return "visual";
  if (s.includes("meme")) return "meme";
  if (s.includes("other")) return "other";
  return "overall";
}

function WinnerMini({ w }) {
  const isTba = w.name === "TBA";
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:bg-black/30 transition-colors">
      <Avatar
        src={w.avatar}
        name={w.name}
        seed={w.personId || w.discord || w.x || w.name}
        size={36}
      />
      <div className="min-w-0">
        <div className="text-white font-semibold truncate">
          {w.name}
          {isTba ? (
            <span className="ml-2 text-[11px] text-white/50 font-medium">
              pending
            </span>
          ) : null}
        </div>
        <div className="text-xs text-white/70 truncate">
          <span className="text-red-300/90">{w.label}</span>
          {w.x ? <span className="text-white/55">  @{w.x}</span> : ""}
        </div>
      </div>
      <div className="ml-auto text-[11px] px-2 py-[2px] rounded-full bg-yellow-400/12 border border-yellow-300/35 text-yellow-100/90">
        1st
      </div>
    </div>
  );
}

function SpotlightCard({
  hofTitle,
  hofMeta,
  hofWinners,
  wbcTitle,
  wbcMeta,
  wbcWinner,
  onExploreHof,
  onExploreWbc,
  onOpenMonth,
  onOpenWinner,
}) {
  return (
    <div className="glass-tile-watery relative p-6 text-left w-full">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">
            <span className="text-white">Spot</span>
            <span className="text-red-400">light</span>
          </div>
          <div className="text-white/65 mt-1">
            Latest highlights from HoF and WBC, auto updated from your data.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExploreHof}
            className="rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-100/10 hover:bg-zinc-100/20 border border-white/10 text-white transition-colors"
          >
            Explore HoF
          </button>
          <button
            onClick={onExploreWbc}
            className="rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-100/10 hover:bg-zinc-100/20 border border-white/10 text-white transition-colors"
          >
            Explore WBC
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold text-white">
              {hofTitle || "Hall of Fame spotlight"}
            </div>
            <div className="text-sm mt-1">
              <span className="text-white/60">1st place winners</span>
              <span className="text-white/25">  •  </span>
              <span className="text-red-300/90">{hofMeta}</span>
            </div>
          </div>

          <button
            onClick={onOpenMonth}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-100/10 hover:bg-zinc-100/20 border border-white/10 text-white transition-colors"
          >
            Open month
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {hofWinners.map((w) => (
            <WinnerMini key={w.key} w={w} />
          ))}
        </div>

        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-extrabold text-white">
              {wbcTitle || "Weekly Best Content spotlight"}
            </div>
            <div className="text-sm mt-1">
              <span className="text-white/60">Latest winner</span>
              <span className="text-white/25">  •  </span>
              <span className="text-red-300/90">{wbcMeta}</span>
            </div>
          </div>

          <button
            onClick={onOpenWinner}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-100/10 hover:bg-zinc-100/20 border border-white/10 text-white transition-colors"
          >
            Open winner
          </button>
        </div>

        <div className="mt-4">
          {wbcWinner ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:bg-black/30 transition-colors">
              <Avatar
                src={wbcWinner.avatar}
                name={wbcWinner.name}
                seed={
                  wbcWinner.personId ||
                  wbcWinner.discord ||
                  wbcWinner.x ||
                  wbcWinner.name
                }
                size={40}
              />
              <div className="min-w-0">
                <div className="text-white font-semibold truncate">
                  {wbcWinner.name}
                </div>
                <div className="text-xs text-white/70 truncate">
                  <span className="text-red-300/90">{wbcWinner.label}</span>
                  {wbcWinner.x ? (
                    <span className="text-white/55">  @{wbcWinner.x}</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {wbcWinner.range ? (
                <div className="ml-auto rounded-full px-3 py-1 text-xs bg-black/20 border border-white/10 text-white/80">
                  {wbcWinner.range}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-white/60">
              No WBC winner found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [showMonths, setShowMonths] = useState(false);
  const [showWbcMonths, setShowWbcMonths] = useState(false);

  const [hofRows, setHofRows] = useState([]);
  const [wbcRows, setWbcRows] = useState([]);
  const [spotlightLoading, setSpotlightLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setSpotlightLoading(true);

        const [hofRes, wbcRes] = await Promise.all([
          fetch("https://backend.minershub.online/api/hof"),
          fetch("https://backend.minershub.online/api/wbc"),
        ]);

        const hofData = hofRes.ok ? await hofRes.json() : [];
        const wbcData = wbcRes.ok ? await wbcRes.json() : [];

        if (cancelled) return;

        setHofRows(Array.isArray(hofData) ? hofData : []);
        setWbcRows(Array.isArray(wbcData) ? wbcData : []);
      } catch (e) {
        if (!cancelled) {
          setHofRows([]);
          setWbcRows([]);
        }
      } finally {
        if (!cancelled) setSpotlightLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hofSpotlight = useMemo(() => {
    if (!hofRows.length) {
      return { year: null, month: "", winners: [] };
    }

    const mapped = hofRows.map((row) => ({
      id: row.id,
      personId: row.person_id || null,
      name: row.name || "",
      avatar: row.avatar || "",
      discord: row.discord || "",
      x: row.x_handle || row.x || "",
      month: row.month || "",
      year: row.year ? Number(row.year) : null,
      category: row.category || "",
      placement:
        row.placement === null || row.placement === undefined
          ? null
          : Number(row.placement),
      createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    }));

    const years = Array.from(
      new Set(mapped.map((m) => m.year).filter(Boolean))
    ).sort((a, b) => b - a);

    const newestYear = years[0] || null;

    const monthsInYear = Array.from(
      new Set(
        mapped
          .filter((m) => (newestYear ? m.year === newestYear : true))
          .map((m) => m.month)
          .filter(Boolean)
      )
    ).sort((a, b) => parseMonth(b) - parseMonth(a));

    const newestMonth = monthsInYear[0] || "";

    const monthRows = mapped.filter(
      (m) =>
        (newestYear ? m.year === newestYear : true) &&
        (newestMonth ? m.month === newestMonth : true)
    );

    const firstsByCat = new Map();
    for (const r of monthRows) {
      if (r.placement !== 1) continue;
      const slug = normalizeHofCategory(r.category);
      if (!["written", "visual", "meme", "other"].includes(slug)) continue;

      const existing = firstsByCat.get(slug);
      if (!existing) firstsByCat.set(slug, r);
      else if ((r.createdAt || 0) > (existing.createdAt || 0))
        firstsByCat.set(slug, r);
    }

    const order = [
      { slug: "written", label: "Written content" },
      { slug: "visual", label: "Visual & Art content" },
      { slug: "meme", label: "Meme content" },
      { slug: "other", label: "Other Creative Content" },
    ];

    const winners = order
      .map((o) => {
        const r = firstsByCat.get(o.slug);
        if (!r) return null;
        return {
          key: `${o.slug}-${r.id}`,
          name: r.name,
          avatar: r.avatar,
          discord: r.discord,
          x: r.x,
          personId: r.personId,
          label: o.label,
        };
      })
      .filter(Boolean);

    return { year: newestYear, month: newestMonth, winners };
  }, [hofRows]);

  const wbcSpotlight = useMemo(() => {
    if (!wbcRows.length) return null;

    const mapped = wbcRows.map((row) => ({
      id: row.id,
      personId: row.person_id || null,
      name: row.name || "",
      avatar: row.avatar || "",
      discord: row.discord || "",
      x: row.x_handle || row.x || "",
      month: row.month || "",
      year: row.year ? Number(row.year) : null,
      week: row.week || row.week_label || "",
      range: row.week_range || row.range || "",
      createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    }));

    mapped.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const top = mapped[0];
    if (!top) return null;

    return {
      year: top.year || null,
      month: top.month || "",
      winner: {
        name: top.name,
        avatar: top.avatar,
        discord: top.discord,
        x: top.x,
        personId: top.personId,
        label: "Latest winner",
        range: top.range || "",
      },
    };
  }, [wbcRows]);

  const hofMeta = hofSpotlight.year
    ? `${hofSpotlight.month} (${hofSpotlight.year})`
    : "No HoF data yet";

  const wbcMeta = wbcSpotlight?.year
    ? `${wbcSpotlight.month} (${wbcSpotlight.year})`
    : "No WBC data yet";

  const hofWinners4 = useMemo(() => {
    const list = hofSpotlight.winners || [];
    if (list.length === 4) return list;

    const needed = 4 - list.length;
    const fillers = Array.from({ length: Math.max(0, needed) }).map((_, i) => ({
      key: `empty-${i}`,
      name: "TBA",
      avatar: "",
      discord: "",
      x: "",
      personId: "",
      label: "TBA",
    }));
    return [...list, ...fillers].slice(0, 4);
  }, [hofSpotlight.winners]);

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

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-24 pt-2 md:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="heading-win text-smooth text-[56px] md:text-[72px] bg-gradient-to-r from-red-500 via-rose-400 to-white bg-clip-text text-transparent tracking-tight hero-title-premium"
          >
            Discover. Create. Shine.
          </motion.h2>

          <TypewriterLine />
        </motion.div>

        {/* FIRST: HoF + WBC tiles */}
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

        {/* THEN: Spotlight card below */}
        <div className="mt-10">
          {spotlightLoading ? (
            <div className="glass-tile-watery p-6 text-left">
              <div className="text-white font-semibold text-lg">
                <span className="text-white">Spot</span>
                <span className="text-red-400">light</span>
              </div>
              <div className="mt-2 text-white/60 text-sm">
                Loading latest highlights...
              </div>
            </div>
          ) : (
            <SpotlightCard
              hofTitle="Hall of Fame spotlight"
              hofMeta={hofMeta}
              hofWinners={hofWinners4}
              wbcTitle="Weekly Best Content spotlight"
              wbcMeta={wbcMeta}
              wbcWinner={wbcSpotlight?.winner || null}
              onExploreHof={() => navigate("/hof")}
              onExploreWbc={() => navigate("/wbc")}
              onOpenMonth={() => setShowMonths(true)}
              onOpenWinner={() => navigate("/wbc")}
            />
          )}
        </div>
      </main>

      <HofMonthOverlay open={showMonths} onClose={() => setShowMonths(false)} />
      <WbcMonthOverlay
        open={showWbcMonths}
        onClose={() => setShowWbcMonths(false)}
      />
    </div>
  );
}
