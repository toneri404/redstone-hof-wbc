import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/redstone.svg";

const base =
  "relative px-6 py-4 text-[17px] font-semibold tracking-wide transition-colors duration-200";

const underline =
  "after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-[3px] " +
  "after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:rounded-full " +
  "after:transition-transform after:duration-300 after:ease-out";

const linkCls = ({ isActive }) =>
  isActive
    ? `${base} ${underline} text-white after:w-3/4 after:scale-x-100`
    : `${base} ${underline} text-zinc-400 hover:text-white after:w-2/3 after:scale-x-0 hover:after:scale-x-100`;

export default function Nav() {
  const navigate = useNavigate();
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const THRESHOLD = 8, TOP_PIN = 16;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = y - lastY.current;
          if (y <= TOP_PIN) setHidden(false);
          else if (Math.abs(delta) > THRESHOLD) setHidden(delta > 0);
          lastY.current = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 will-change-transform"
      animate={hidden ? { y: "-100%", opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.6 }}
    >
      <div className="relative backdrop-blur-md bg-black/70 border-b border-zinc-800 shadow-[0_0_25px_rgba(255,0,0,0.15)]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/70 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group" aria-label="Go to Home">
            <img
              src={logo}
              alt="RedStone"
              className="h-10 md:h-11 object-contain drop-shadow-[0_0_10px_rgba(255,0,0,0.45)] transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
          </button>

          <nav className="flex items-center gap-10">
            <NavLink to="/" className={linkCls}>Home</NavLink>
            <NavLink to="/hof" className={linkCls}>HoF</NavLink>
            <NavLink to="/wbc" className={linkCls}>WBC</NavLink>
          </nav>
        </div>
        <div aria-hidden className="h-[3px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      </div>
    </motion.header>
  );
}
