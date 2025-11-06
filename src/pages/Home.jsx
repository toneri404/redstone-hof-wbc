import React, { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import hofBg from "../assets/hof-bg.png";
import homeBg from "../assets/home.png";
import wbcBg from "../assets/wbc.png";
import redstoneLogoPng from "../assets/redstone-logo.png";
import WbcMonthOverlay from "../components/ui/WbcMonthOverlay.jsx";



import homeHeroVideo from "../assets/home-hero.mp4";


import HofMonthOverlay from "../components/ui/HofMonthOverlay.jsx";


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
  to,
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

/*main*/
export default function Home() {
  const navigate = useNavigate();
  const [showMonths, setShowMonths] = useState(false);
  const [showWbcMonths, setShowWbcMonths] = useState(false);


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

      {/*dark overlay on bg*/}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

      <header className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RedstoneMark />
          <div>
            <h1 className="font-brandDisplay text-4xl text-white">
              RedStone Community{" "}
              <span className="text-red-400">Hub</span>
            </h1>
            <p className="text-xs md:text-sm text-white/60 italic">
              Where creativity meets precision
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
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
      </main>


      <HofMonthOverlay open={showMonths} onClose={() => setShowMonths(false)} />
      <WbcMonthOverlay open={showWbcMonths} onClose={() => setShowWbcMonths(false)}/>

        
    </div>
  );
}
