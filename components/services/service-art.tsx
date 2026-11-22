import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const PALETTES: Record<
  string,
  { from: string; to: string; ink: string; accent: string; soft: string }
> = {
  Smartphone: {
    from: "#0f4f52",
    to: "#1c7b74",
    ink: "#f3ede0",
    accent: "#f2b65c",
    soft: "#bfe3d8",
  },
  "Laptop & PC": {
    from: "#123c52",
    to: "#2b6f86",
    ink: "#f1ece0",
    accent: "#f4c06b",
    soft: "#bcdde3",
  },
  AC: {
    from: "#155b5c",
    to: "#3e8f83",
    ink: "#f7f2e6",
    accent: "#f6cf83",
    soft: "#cdeae0",
  },
  Refrigerator: {
    from: "#1d4c45",
    to: "#4c8b7a",
    ink: "#f6f0e2",
    accent: "#e9b662",
    soft: "#d1e7db",
  },
  TV: {
    from: "#263a4d",
    to: "#4d6b80",
    ink: "#f5f0e3",
    accent: "#f3c16d",
    soft: "#c6d8e2",
  },
  "Washing Machine": {
    from: "#155a55",
    to: "#3d8d82",
    ink: "#f6f1e4",
    accent: "#f0b45a",
    soft: "#c9e8e0",
  },
  Electrical: {
    from: "#4a3a1d",
    to: "#8a6a2c",
    ink: "#faf4e6",
    accent: "#ffd27a",
    soft: "#efd9ac",
  },
};

function Art({ category, uid }: { category: Category; uid: string }) {
  const strokes = { fill: "none", strokeLinecap: "round" as const };

  switch (category) {
    case "Smartphone":
      return (
        <>
          <g transform="translate(148 62) rotate(-6)">
            <rect x="0" y="0" width="104" height="176" rx="20" fill="#0b2c2e" opacity="0.35" />
            <rect x="-4" y="-4" width="104" height="176" rx="20" fill="#f7f2e6" />
            <rect x="8" y="10" width="80" height="140" rx="10" fill={`url(#${uid}-screen)`} />
            <path d="M20 34l46 52-22 16 34 40" stroke="#0f4f52" strokeWidth="5" {...strokes} opacity="0.85" />
            <path d="M66 26l-14 30" stroke="#f2b65c" strokeWidth="5" {...strokes} />
            <rect x="40" y="156" width="16" height="5" rx="2.5" fill="#c9c1ae" />
          </g>
          <g transform="translate(268 168) rotate(14)">
            <rect x="0" y="0" width="10" height="62" rx="5" fill="#f2b65c" />
            <rect x="-5" y="-14" width="20" height="18" rx="5" fill="#f7f2e6" />
          </g>
        </>
      );
    case "Laptop & PC":
      return (
        <>
          <g transform="translate(84 84)">
            <path d="M0 18h170v104H0z" fill="#0b2c2e" opacity="0.3" transform="translate(10 12)" />
            <rect x="0" y="0" width="170" height="112" rx="10" fill="#0b2c2e" />
            <rect x="8" y="8" width="154" height="96" rx="6" fill={`url(#${uid}-screen)`} />
            <rect x="24" y="26" width="64" height="7" rx="3.5" fill="#f7f2e6" opacity="0.9" />
            <rect x="24" y="42" width="96" height="5" rx="2.5" fill="#cdeae0" opacity="0.6" />
            <rect x="24" y="54" width="48" height="5" rx="2.5" fill="#cdeae0" opacity="0.4" />
            <circle cx="128" cy="70" r="16" fill="#f2b65c" opacity="0.85" />
            <path d="M-18 112h206l14 26H-32z" fill="#f7f2e6" />
            <path d="M66 118h38" stroke="#c9c1ae" strokeWidth="4" {...strokes} />
          </g>
          <g transform="translate(286 74) rotate(12)">
            <rect x="0" y="0" width="26" height="26" rx="6" fill="#f2b65c" opacity="0.9" />
            <rect x="8" y="8" width="10" height="10" rx="2" fill="#0f4f52" />
          </g>
        </>
      );
    case "AC":
      return (
        <>
          <g transform="translate(80 70)">
            <rect x="10" y="12" width="240" height="68" rx="18" fill="#0b2c2e" opacity="0.3" />
            <rect x="0" y="0" width="240" height="68" rx="18" fill="#f7f2e6" />
            <rect x="0" y="42" width="240" height="26" rx="12" fill="#e4ddcb" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={16 + i * 44} y="48" width="32" height="4" rx="2" fill="#8c9a92" />
            ))}
            <circle cx="206" cy="24" r="6" fill="#f2b65c" />
            <rect x="16" y="16" width="52" height="6" rx="3" fill="#0f4f52" opacity="0.25" />
          </g>
          <g stroke="#f7f2e6" strokeWidth="5" {...strokes} opacity="0.8">
            <path d="M112 168c18 14 2 26 20 40" />
            <path d="M164 174c18 14 2 26 20 40" />
            <path d="M216 168c18 14 2 26 20 40" />
          </g>
          <circle cx="306" cy="212" r="26" fill="#f2b65c" opacity="0.25" />
        </>
      );
    case "Refrigerator":
      return (
        <>
          <g transform="translate(152 48)">
            <rect x="8" y="10" width="108" height="196" rx="16" fill="#0b2c2e" opacity="0.3" />
            <rect x="0" y="0" width="108" height="196" rx="16" fill="#f7f2e6" />
            <rect x="6" y="6" width="96" height="64" rx="10" fill={`url(#${uid}-cool)`} />
            <rect x="6" y="78" width="96" height="112" rx="10" fill="#eee7d8" />
            <rect x="86" y="18" width="6" height="40" rx="3" fill="#b9b1a0" />
            <rect x="86" y="90" width="6" height="56" rx="3" fill="#b9b1a0" />
            <circle cx="54" cy="116" r="16" fill="#cdeae0" opacity="0.7" />
            <path d="M46 116l6 6 12-14" stroke="#0f4f52" strokeWidth="3" {...strokes} />
          </g>
          <g transform="translate(112 196)">
            <rect x="0" y="0" width="52" height="34" rx="8" fill="#f2b65c" />
            <path d="M10 10h32M10 17h22" stroke="#4a3a1d" strokeWidth="3" {...strokes} opacity="0.5" />
          </g>
        </>
      );
    case "TV":
      return (
        <>
          <g transform="translate(92 66)">
            <rect x="10" y="12" width="216" height="132" rx="10" fill="#0b2c2e" opacity="0.35" />
            <rect x="0" y="0" width="216" height="132" rx="10" fill="#f7f2e6" />
            <rect x="8" y="8" width="200" height="116" rx="5" fill={`url(#${uid}-screen)`} />
            <path d="M86 52l40 22-40 22z" fill="#f7f2e6" opacity="0.9" />
            <rect x="168" y="24" width="24" height="4" rx="2" fill="#f7f2e6" opacity="0.4" />
            <path d="M88 132l-14 26h68l-14-26z" fill="#e4ddcb" />
            <rect x="60" y="158" width="96" height="8" rx="4" fill="#c9c1ae" />
          </g>
          <g transform="translate(300 172) rotate(-14)">
            <rect x="0" y="0" width="14" height="52" rx="7" fill="#f2b65c" />
            <circle cx="7" cy="60" r="12" fill="#f2b65c" />
          </g>
        </>
      );
    case "Washing Machine":
      return (
        <>
          <g transform="translate(136 50)">
            <rect x="10" y="12" width="128" height="188" rx="18" fill="#0b2c2e" opacity="0.3" />
            <rect x="0" y="0" width="128" height="188" rx="18" fill="#f7f2e6" />
            <rect x="10" y="10" width="108" height="20" rx="8" fill={`url(#${uid}-cool)`} />
            <circle cx="104" cy="20" r="5" fill="#f2b65c" />
            <circle cx="64" cy="104" r="48" fill="#e4ddcb" />
            <circle cx="64" cy="104" r="38" fill={`url(#${uid}-screen)`} />
            <path d="M34 108c12-14 22 8 34-4s20 8 30-2" stroke="#f7f2e6" strokeWidth="4" {...strokes} opacity="0.8" />
            <circle cx="64" cy="168" r="7" fill="#c9c1ae" />
          </g>
          <circle cx="292" cy="74" r="14" fill="#f7f2e6" opacity="0.35" />
          <circle cx="316" cy="52" r="8" fill="#f7f2e6" opacity="0.25" />
        </>
      );
    case "Electrical":
      return (
        <>
          <g transform="translate(120 68)">
            <rect x="8" y="10" width="150" height="150" rx="26" fill="#0b2c2e" opacity="0.35" />
            <rect x="0" y="0" width="150" height="150" rx="26" fill="#f7f2e6" />
            <circle cx="46" cy="48" r="12" fill="#0f4f52" opacity="0.25" />
            <circle cx="104" cy="48" r="12" fill="#0f4f52" opacity="0.25" />
            <path d="M82 66l-18 34h22l-16 40 44-52H92l14-22z" fill="#f2b65c" stroke="#8a6a2c" strokeWidth="3" strokeLinejoin="round" />
            <rect x="26" y="112" width="98" height="6" rx="3" fill="#c9c1ae" />
          </g>
          <g transform="translate(276 158) rotate(18)">
            <rect x="0" y="0" width="12" height="70" rx="6" fill="#f2b65c" />
            <path d="M6 0l-12-18h24z" fill="#f7f2e6" />
          </g>
        </>
      );
    default:
      return null;
  }
}

export function ServiceArt({
  category,
  className,
  showLabel = false,
}: {
  category: Category;
  className?: string;
  showLabel?: boolean;
}) {
  const palette = PALETTES[category] ?? PALETTES.Smartphone;
  const uid = `art-${category.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;

  return (
    <div
      className={cn(
        "relative isolate h-full w-full overflow-hidden",
        className
      )}
      style={{
        background: `radial-gradient(120% 120% at 12% 0%, ${palette.to} 0%, ${palette.from} 62%, #08262a 100%)`,
      }}
      aria-hidden={!showLabel}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={`${uid}-screen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.soft} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
          <linearGradient id={`${uid}-cool`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor={palette.soft} stopOpacity="0.5" />
          </linearGradient>
          <pattern id={`${uid}-dots`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={palette.ink} opacity="0.18" />
          </pattern>
        </defs>

        <rect width="400" height="300" fill={`url(#${uid}-dots)`} />
        <circle cx="352" cy="42" r="86" fill={palette.accent} opacity="0.16" />
        <circle cx="30" cy="268" r="96" fill="#ffffff" opacity="0.06" />
        <path
          d="M-20 240c70-44 120 20 190-16s130-64 250-18"
          stroke={palette.ink}
          strokeOpacity="0.16"
          strokeWidth="1.5"
          fill="none"
        />

        <g style={{ filter: "drop-shadow(0 18px 18px rgba(4,20,22,0.35))" }}>
          <Art category={category} uid={uid} />
        </g>
      </svg>

      {showLabel && (
        <div className="absolute inset-x-5 bottom-4 flex items-center justify-between">
          <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white/85 uppercase backdrop-blur">
            {category}
          </span>
          <span className="font-heading text-2xl font-bold text-white/25">
            FixMate
          </span>
        </div>
      )}
    </div>
  );
}

export function hasRealImage(image?: string | null) {
  if (!image) return false;
  return /^https?:\/\//i.test(image) || image.startsWith("/uploads/");
}
