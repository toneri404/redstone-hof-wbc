import { useMemo, useState } from "react";

function initialsFromName(name = "?") {
  const s = String(name || "").trim();
  if (!s) return "?";

  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

// Simple deterministic color from a key
function colorFromKey(key = "") {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 55% 40%)`;
}

export default function Avatar({
  src,
  name,
  seed,
  size = 44, // px
  className = "",
  ringClassName = "ring-1 ring-white/20",
}) {
  const [broken, setBroken] = useState(false);

  const key = useMemo(() => {
    const k = (seed || name || src || "").toString().trim().toLowerCase();
    return k || "avatar";
  }, [seed, name, src]);

  const initials = useMemo(() => initialsFromName(name), [name]);
  const bg = useMemo(() => colorFromKey(key), [key]);

  const showImg = !!src && !broken;

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden ${ringClassName} ${className}`}
      style={{ width: size, height: size }}
      title={name || ""}
    >
      {showImg ? (
        <img
          src={src}
          alt={name || "avatar"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="h-full w-full grid place-items-center text-white font-semibold select-none"
          style={{ background: bg }}
        >
          <span style={{ fontSize: Math.max(12, Math.floor(size * 0.36)) }}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
