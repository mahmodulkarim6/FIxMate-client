import {
  ArrowRight,
  Check,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

const PROOF = [
  { label: "Verified techs", value: "180+" },
  { label: "Jobs completed", value: "12.4k" },
  { label: "Average rating", value: "4.9/5" },
];

const STEPS = [
  { label: "Asked", done: true },
  { label: "Accepted", done: true },
  { label: "Fixing", done: true, active: true },
  { label: "Done", done: false },
];

type ArtProps = { className?: string };


function DeviceArt({
  className,
  children,
}: ArtProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={className}>
      {children}
    </svg>
  );
}

/** Soft contact shadow under a device. */
function Shadow({ cx = 40, cy = 76, rx = 18 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.11} fill="#000" fillOpacity="0.2" />;
}

type RayDef = readonly [angle: number, length: number];

/**
 * Spiderweb crack that radiates from an impact point: jagged rays, a few
 * branches, broken rings and light-catching shards. Clipped to the glass.
 */
function Crack({
  cx,
  cy,
  clip,
  rays,
  rings = [5, 10],
  shards = [],
  seed = 1,
}: {
  cx: number;
  cy: number;
  clip: string;
  rays: readonly RayDef[];
  rings?: readonly number[];
  shards?: readonly number[];
  seed?: number;
}) {
  const pt = (angle: number, dist: number) => {
    const a = (angle * Math.PI) / 180;
    const jitter = Math.sin(angle * 0.7 + dist * 1.3 + seed) * Math.min(1.1, dist * 0.09);
    const px = cx + Math.cos(a) * dist - Math.sin(a) * jitter;
    const py = cy + Math.sin(a) * dist + Math.cos(a) * jitter;
    return [px, py] as const;
  };
  const f = (n: number) => n.toFixed(1);

  const lines: string[] = [];
  rays.forEach(([angle, length], index) => {
    const p1 = pt(angle, length * 0.34);
    const p2 = pt(angle, length * 0.68);
    const p3 = pt(angle, length);
    lines.push(`M${f(cx)} ${f(cy)}L${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}L${f(p3[0])} ${f(p3[1])}`);
    if (index % 2 === 0) {
      const from = pt(angle, length * 0.52);
      const side = index % 4 === 0 ? 28 : -28;
      const end = (() => {
        const a = ((angle + side) * Math.PI) / 180;
        return [from[0] + Math.cos(a) * length * 0.34, from[1] + Math.sin(a) * length * 0.34] as const;
      })();
      lines.push(`M${f(from[0])} ${f(from[1])}L${f(end[0])} ${f(end[1])}`);
    }
  });

  const sorted = [...rays].sort((a, b) => a[0] - b[0]);
  rings.forEach((radius, ringIndex) => {
    sorted.forEach(([angle, length], i) => {
      const next = sorted[(i + 1) % sorted.length];
      if (length < radius || next[1] < radius) return;
      if ((i + ringIndex + seed) % 3 === 0) return;
      const a = pt(angle, radius);
      const m = pt((angle + (next[0] > angle ? next[0] : next[0] + 360)) / 2, radius * 1.06);
      const b = pt(next[0], radius);
      lines.push(`M${f(a[0])} ${f(a[1])}L${f(m[0])} ${f(m[1])}L${f(b[0])} ${f(b[1])}`);
    });
  });

  const d = lines.join("");
  return (
    <g clipPath={`url(#${clip})`}>
      {shards.map((i) => {
        const [angleA, lenA] = sorted[i % sorted.length];
        const [angleB, lenB] = sorted[(i + 1) % sorted.length];
        const r = Math.min(lenA, lenB) * 0.7;
        const a = pt(angleA, r);
        const b = pt(angleB, r);
        return (
          <path
            key={i}
            d={`M${f(cx)} ${f(cy)}L${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}Z`}
            fill="#fff"
            fillOpacity="0.1"
          />
        );
      })}
      <path d={d} transform="translate(0.45 0.55)" stroke="#000" strokeOpacity="0.5" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={d} stroke="#fff" strokeOpacity="0.9" strokeWidth="0.55" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r="2.1" fill="#fff" fillOpacity="0.35" />
      <circle cx={cx} cy={cy} r="1" fill="#000" fillOpacity="0.7" />
    </g>
  );
}

function BrokenPhone({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bp-frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4e9eb" />
          <stop offset="0.5" stopColor="#97a2a7" />
          <stop offset="1" stopColor="#c9d1d4" />
        </linearGradient>
        <linearGradient id="bp-screen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#1f6f7a" />
          <stop offset="0.55" stopColor="#123a52" />
          <stop offset="1" stopColor="#0a1822" />
        </linearGradient>
        <clipPath id="bp-clip">
          <rect x="27" y="9" width="26" height="60" rx="4.5" />
        </clipPath>
      </defs>
      <Shadow cy={74.6} rx={15} />
      <rect x="22.6" y="22" width="1.4" height="5" rx="0.7" fill="#9aa4a8" />
      <rect x="22.6" y="29" width="1.4" height="8" rx="0.7" fill="#9aa4a8" />
      <rect x="56" y="24" width="1.4" height="10" rx="0.7" fill="#9aa4a8" />
      <rect x="24" y="5" width="32" height="68" rx="7.5" fill="url(#bp-frame)" />
      <rect x="25.2" y="6.2" width="29.6" height="65.6" rx="6.5" fill="#0b1012" />
      <rect x="27" y="9" width="26" height="60" rx="4.5" fill="url(#bp-screen)" />
      <g clipPath="url(#bp-clip)">
        <circle cx="34" cy="26" r="13" fill="#7fe0d2" fillOpacity="0.16" />
        <rect x="30" y="17" width="14" height="2.2" rx="1.1" fill="#fff" fillOpacity="0.8" />
        <rect x="30" y="21" width="9" height="1.4" rx="0.7" fill="#fff" fillOpacity="0.45" />
        {[0, 1, 2, 3].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={30 + col * 5.6}
              y={55 + row * 6.2}
              width="4.2"
              height="4.2"
              rx="1.2"
              fill={["#ff8a65", "#ffd54f", "#81c784", "#64b5f6"][(col + row) % 4]}
              fillOpacity="0.7"
            />
          ))
        )}
        <path d="M27 9H40L27 33Z" fill="#fff" fillOpacity="0.07" />
        <path d="M44 34L53 28V50L46 56Z" fill="#000" fillOpacity="0.3" />
      </g>
      <rect x="35.5" y="11" width="9" height="2.6" rx="1.3" fill="#000" />
      <Crack
        cx={47}
        cy={46}
        clip="bp-clip"
        seed={2}
        rays={[
          [200, 24], [236, 30], [268, 20], [300, 18], [340, 14],
          [20, 10], [58, 16], [100, 24], [140, 28], [172, 20],
        ]}
        rings={[5, 10, 16]}
        shards={[1, 4, 7]}
      />
    </DeviceArt>
  );
}

function BrokenLaptop({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bl-alu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dfe2" />
          <stop offset="1" stopColor="#99a5aa" />
        </linearGradient>
        <linearGradient id="bl-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f78c4" />
          <stop offset="0.6" stopColor="#173f78" />
          <stop offset="1" stopColor="#0f2447" />
        </linearGradient>
        <linearGradient id="bl-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe1e4" />
          <stop offset="1" stopColor="#a4afb3" />
        </linearGradient>
        <clipPath id="bl-clip">
          <rect x="15.5" y="13.5" width="49" height="31" rx="1" />
        </clipPath>
      </defs>
      <Shadow cy={65.4} rx={32} />
      <rect x="12" y="9" width="56" height="39" rx="3" fill="url(#bl-alu)" />
      <rect x="13.4" y="10.4" width="53.2" height="36.2" rx="2" fill="#090d0f" />
      <rect x="15.5" y="13.5" width="49" height="31" rx="1" fill="url(#bl-screen)" />
      <g clipPath="url(#bl-clip)">
        <rect x="19" y="17" width="20" height="13" rx="1.2" fill="#fff" fillOpacity="0.9" />
        <rect x="19" y="17" width="20" height="3" rx="1.2" fill="#1d6fd0" />
        <rect x="21" y="23" width="14" height="1.3" rx="0.6" fill="#8aa0b8" />
        <rect x="21" y="26" width="10" height="1.3" rx="0.6" fill="#8aa0b8" />
        <rect x="19" y="36" width="42" height="3.6" rx="1.2" fill="#fff" fillOpacity="0.2" />
        <path d="M42 13.5H64.5V44.5H36L40 36L36 30L44 24Z" fill="#05060a" fillOpacity="0.88" />
        <path d="M46 13.5V44.5M50 13.5V44.5M58 13.5V44.5" stroke="#b64cff" strokeOpacity="0.8" strokeWidth="0.9" />
        <path d="M54 13.5V44.5" stroke="#35e0a1" strokeOpacity="0.75" strokeWidth="0.7" />
        <path d="M15.5 13.5H34L15.5 30Z" fill="#fff" fillOpacity="0.08" />
      </g>
      <Crack
        cx={48}
        cy={26}
        clip="bl-clip"
        seed={4}
        rays={[
          [190, 30], [225, 22], [262, 16], [300, 14], [340, 22],
          [10, 20], [50, 18], [95, 18], [135, 26], [165, 32],
        ]}
        rings={[5, 10, 15]}
        shards={[0, 3, 6]}
      />
      <circle cx="40" cy="12" r="0.7" fill="#2a3438" />
      <path d="M6 51H74L76 61Q76 64 73 64H7Q4 64 4 61Z" fill="url(#bl-base)" />
      <rect x="31" y="48.4" width="18" height="2.4" rx="1.2" fill="#7a868b" />
      <path d="M13 53H67L68.6 58.6H11.4Z" fill="#1a2225" />
      {[54.4, 56, 57.6].map((y) => (
        <path key={y} d={`M14 ${y}H66`} stroke="#8a989e" strokeWidth="1.1" strokeDasharray="2.3 0.9" />
      ))}
      <rect x="34" y="59.8" width="12" height="3" rx="0.9" fill="#b5bfc3" stroke="#8d989c" strokeWidth="0.3" />
    </DeviceArt>
  );
}

function BrokenFridge({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bf-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b3bdc1" />
          <stop offset="0.35" stopColor="#eef2f3" />
          <stop offset="0.7" stopColor="#c3ccd0" />
          <stop offset="1" stopColor="#9aa6ab" />
        </linearGradient>
        <clipPath id="bf-clip">
          <rect x="22" y="32" width="36" height="40" rx="2" />
        </clipPath>
      </defs>
      <ellipse cx="40" cy="76.4" rx="24" ry="3.2" fill="#4fb0d8" fillOpacity="0.5" />
      <ellipse cx="40" cy="76.4" rx="13" ry="1.6" fill="#bfeaf7" fillOpacity="0.5" />
      <rect x="23" y="72" width="6" height="3" rx="1" fill="#4a5459" />
      <rect x="51" y="72" width="6" height="3" rx="1" fill="#4a5459" />
      <rect x="20" y="3" width="40" height="70" rx="4.5" fill="url(#bf-steel)" stroke="#7f8b90" strokeWidth="0.8" />
      <rect x="22" y="5" width="36" height="25" rx="2.5" fill="#fff" fillOpacity="0.14" />
      <path d="M20 31H60" stroke="#5f6b70" strokeWidth="1.6" />
      <rect x="24" y="11" width="2.6" height="12" rx="1.3" fill="#6d797e" />
      <rect x="24.4" y="11.6" width="0.9" height="10.8" rx="0.45" fill="#fff" fillOpacity="0.6" />
      <rect x="24" y="37" width="2.6" height="20" rx="1.3" fill="#6d797e" />
      <rect x="24.4" y="37.6" width="0.9" height="18.8" rx="0.45" fill="#fff" fillOpacity="0.6" />
      <rect x="37" y="9" width="17" height="8.6" rx="1.6" fill="#0b1113" />
      <text x="45.5" y="15.7" textAnchor="middle" fontSize="6" fontWeight="700" fill="#ff5a4d" fontFamily="monospace">
        18°
      </text>
      <circle cx="40" cy="22.6" r="1" fill="#ff5a4d" />
      <g clipPath="url(#bf-clip)">
        <path d="M22 32H32L22 48Z" fill="#fff" fillOpacity="0.16" />
        <path d="M50 32H58V60L50 52Z" fill="#000" fillOpacity="0.08" />
      </g>
      <Crack
        cx={46}
        cy={54}
        clip="bf-clip"
        seed={3}
        rays={[
          [200, 18], [240, 22], [275, 18], [315, 14],
          [15, 12], [60, 14], [105, 16], [150, 20],
        ]}
        rings={[5, 9]}
        shards={[2, 5]}
      />
      <path d="M32 73V76.6" stroke="#4fb0d8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M47 73V77.4" stroke="#4fb0d8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M61 9l3-3M63 16h4M58 4V1" stroke="#ffb02e" strokeWidth="1.6" strokeLinecap="round" />
    </DeviceArt>
  );
}

function BrokenWatch({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bw-strap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a2124" />
          <stop offset="0.5" stopColor="#3b474c" />
          <stop offset="1" stopColor="#1a2124" />
        </linearGradient>
        <linearGradient id="bw-case" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef2f3" />
          <stop offset="0.5" stopColor="#9aa5aa" />
          <stop offset="1" stopColor="#d3dadd" />
        </linearGradient>
        <linearGradient id="bw-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#13262c" />
          <stop offset="1" stopColor="#05090b" />
        </linearGradient>
        <clipPath id="bw-clip">
          <rect x="24" y="18" width="32" height="42" rx="9" />
        </clipPath>
      </defs>
      <Shadow cy={77} rx={14} />
      <rect x="30" y="1" width="20" height="18" rx="3.5" fill="url(#bw-strap)" />
      {[5, 9, 13].map((y) => (
        <circle key={y} cx="40" cy={y} r="0.9" fill="#0c1113" />
      ))}
      <g transform="rotate(13 40 66)">
        <rect x="30" y="60" width="20" height="18" rx="3.5" fill="url(#bw-strap)" />
        <path d="M30.8 61.4L49 64.6" stroke="#000" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="1.4 1.2" />
      </g>
      <rect x="59.4" y="29" width="3" height="9" rx="1.4" fill="#aeb8bc" />
      <rect x="59.6" y="43" width="2" height="6" rx="1" fill="#7f8b90" />
      <rect x="20" y="14" width="40" height="50" rx="13" fill="url(#bw-case)" />
      <rect x="22" y="16" width="36" height="46" rx="11" fill="#070b0d" />
      <rect x="24" y="18" width="32" height="42" rx="9" fill="url(#bw-glass)" />
      <g clipPath="url(#bw-clip)">
        <circle cx="40" cy="39" r="11.5" stroke="#3a1713" strokeWidth="3" />
        <circle cx="40" cy="39" r="11.5" stroke="#ff4f64" strokeWidth="3" strokeDasharray="52 80" strokeLinecap="round" transform="rotate(-90 40 39)" />
        <circle cx="40" cy="39" r="7.6" stroke="#10301a" strokeWidth="3" />
        <circle cx="40" cy="39" r="7.6" stroke="#7bf23c" strokeWidth="3" strokeDasharray="34 80" strokeLinecap="round" transform="rotate(-90 40 39)" />
        <circle cx="40" cy="39" r="3.8" stroke="#082a31" strokeWidth="2.6" />
        <circle cx="40" cy="39" r="3.8" stroke="#2ee6d6" strokeWidth="2.6" strokeDasharray="15 80" strokeLinecap="round" transform="rotate(-90 40 39)" />
        <text x="40" y="26.4" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="#fff" fillOpacity="0.9" fontFamily="monospace">
          10:08
        </text>
        <path d="M24 18H42L24 40Z" fill="#fff" fillOpacity="0.1" />
      </g>
      <Crack
        cx={48}
        cy={28}
        clip="bw-clip"
        seed={5}
        rays={[
          [195, 22], [235, 24], [275, 16], [320, 14],
          [15, 12], [60, 18], [100, 26], [150, 28],
        ]}
        rings={[4, 8, 12]}
        shards={[1, 5]}
      />
    </DeviceArt>
  );
}

function BrokenTv({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c7fd1" />
          <stop offset="0.65" stopColor="#8ec9e8" />
          <stop offset="1" stopColor="#f4c97a" />
        </linearGradient>
        <linearGradient id="bt-foot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8d0d3" />
          <stop offset="1" stopColor="#7f8b90" />
        </linearGradient>
        <clipPath id="bt-clip">
          <rect x="6" y="12" width="68" height="40" rx="1.5" />
        </clipPath>
      </defs>
      <Shadow cy={64.6} rx={26} />
      <rect x="35" y="55" width="10" height="6" fill="url(#bt-foot)" />
      <rect x="24" y="60" width="32" height="3.4" rx="1.7" fill="url(#bt-foot)" />
      <rect x="3.6" y="9.6" width="72.8" height="46" rx="3" fill="#0d1214" />
      <rect x="6" y="12" width="68" height="40" rx="1.5" fill="url(#bt-sky)" />
      <g clipPath="url(#bt-clip)">
        <circle cx="22" cy="24" r="4.4" fill="#fff6c9" />
        <path d="M6 52V40L18 30L27 38L38 26L52 42L60 36L74 46V52Z" fill="#2f5f4a" />
        <path d="M38 26L52 42L44 44L36 36Z" fill="#fff" fillOpacity="0.25" />
        <path d="M6 52V45L20 39L34 46L48 40L74 50V52Z" fill="#1d3f35" />
        <path d="M46 12H74V52H40L47 42L42 32L50 24Z" fill="#05070b" fillOpacity="0.9" />
        {[48, 51.5, 57, 62.5, 66.5].map((x, i) => (
          <path
            key={x}
            d={`M${x} 12V52`}
            stroke={["#ff2bd6", "#27f08a", "#ffffff", "#ff2bd6", "#2ac4ff"][i]}
            strokeOpacity={[0.85, 0.8, 0.55, 0.7, 0.8][i]}
            strokeWidth={[1, 0.8, 0.6, 0.9, 0.7][i]}
          />
        ))}
        <path d="M6 12H30L6 34Z" fill="#fff" fillOpacity="0.1" />
      </g>
      <Crack
        cx={56}
        cy={30}
        clip="bt-clip"
        seed={6}
        rays={[
          [185, 36], [220, 26], [255, 18], [290, 18], [330, 18],
          [10, 18], [45, 22], [90, 22], [130, 28], [160, 36],
        ]}
        rings={[5, 10, 16, 22]}
        shards={[0, 3, 6, 8]}
      />
      <rect x="36" y="53.2" width="8" height="1.2" rx="0.6" fill="#4a565b" />
    </DeviceArt>
  );
}

function BrokenPc({ className }: ArtProps) {
  return (
    <DeviceArt className={className}>
      <defs>
        <linearGradient id="bc-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1166e0" />
          <stop offset="1" stopColor="#0a3f9a" />
        </linearGradient>
        <linearGradient id="bc-foot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8d0d3" />
          <stop offset="1" stopColor="#7f8b90" />
        </linearGradient>
        <linearGradient id="bc-tower" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38434a" />
          <stop offset="1" stopColor="#12181b" />
        </linearGradient>
        <linearGradient id="bc-rgb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3df2" />
          <stop offset="0.5" stopColor="#7a5cff" />
          <stop offset="1" stopColor="#21d4fd" />
        </linearGradient>
        <clipPath id="bc-clip">
          <rect x="5" y="14" width="42" height="28" rx="1" />
        </clipPath>
        <clipPath id="bc-glass-clip">
          <rect x="58.5" y="24" width="15" height="36" rx="1.5" />
        </clipPath>
      </defs>
      <Shadow cy={72.4} rx={34} />
      <path d="M38 53C44 60 46 66 56 67" stroke="#222b2f" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="24" y="44" width="6" height="8" fill="url(#bc-foot)" />
      <rect x="15" y="52" width="24" height="3.4" rx="1.7" fill="url(#bc-foot)" />
      <rect x="3" y="11.6" width="46" height="32.4" rx="2.6" fill="#0d1316" />
      <rect x="5" y="14" width="42" height="28" rx="1" fill="url(#bc-blue)" />
      <g clipPath="url(#bc-clip)">
        <text x="9" y="26" fontSize="10" fontWeight="700" fill="#fff" fontFamily="sans-serif">
          :(
        </text>
        <rect x="9" y="29" width="22" height="1.3" rx="0.6" fill="#fff" fillOpacity="0.85" />
        <rect x="9" y="32" width="16" height="1.3" rx="0.6" fill="#fff" fillOpacity="0.6" />
        <rect x="9" y="36" width="5" height="5" fill="#fff" fillOpacity="0.9" />
        <path d="M35 14H47V42H28L33 33L30 25Z" fill="#04060a" fillOpacity="0.88" />
        <path d="M37 14V42M41 14V42" stroke="#ff2bd6" strokeOpacity="0.8" strokeWidth="0.8" />
        <path d="M44 14V42" stroke="#27f08a" strokeOpacity="0.75" strokeWidth="0.7" />
        <path d="M5 14H20L5 28Z" fill="#fff" fillOpacity="0.1" />
      </g>
      <Crack
        cx={32}
        cy={26}
        clip="bc-clip"
        seed={7}
        rays={[
          [190, 28], [228, 18], [265, 12], [305, 12], [345, 14],
          [15, 16], [55, 14], [95, 14], [135, 20], [162, 28],
        ]}
        rings={[4, 8, 13]}
        shards={[1, 4, 7]}
      />
      <rect x="56" y="19" width="20" height="52" rx="2.6" fill="url(#bc-tower)" />
      <rect x="58.5" y="24" width="15" height="36" rx="1.5" fill="#070b0d" />
      <g clipPath="url(#bc-glass-clip)">
        <circle cx="66" cy="32" r="4.6" stroke="url(#bc-rgb)" strokeWidth="1.3" />
        <circle cx="66" cy="32" r="1.4" fill="url(#bc-rgb)" />
        <circle cx="66" cy="45" r="4.6" stroke="url(#bc-rgb)" strokeWidth="1.3" />
        <circle cx="66" cy="45" r="1.4" fill="url(#bc-rgb)" />
        <rect x="60" y="53" width="12" height="4" rx="1" fill="#1b2a30" stroke="url(#bc-rgb)" strokeWidth="0.6" />
        <path d="M58.5 24H66L58.5 40Z" fill="#fff" fillOpacity="0.08" />
      </g>
      <Crack
        cx={70}
        cy={30}
        clip="bc-glass-clip"
        seed={3}
        rays={[
          [200, 12], [245, 14], [290, 8], [340, 8],
          [20, 6], [70, 10], [110, 14], [160, 14],
        ]}
        rings={[4, 7]}
        shards={[1]}
      />
      <circle cx="66" cy="65.6" r="1.5" fill="#ff4d4d" />
      <circle cx="66" cy="65.6" r="3" fill="#ff4d4d" fillOpacity="0.25" />
      <ellipse cx="64" cy="14" rx="3.4" ry="2.4" fill="#aeb9bd" fillOpacity="0.5" />
      <ellipse cx="68" cy="8.6" rx="3" ry="2.1" fill="#aeb9bd" fillOpacity="0.38" />
      <ellipse cx="65" cy="3.6" rx="2.4" ry="1.7" fill="#aeb9bd" fillOpacity="0.26" />
    </DeviceArt>
  );
}

const FLOATING_DEVICES = [
  { label: "Phone", Art: BrokenPhone, tilt: "-4deg" },
  { label: "Laptop", Art: BrokenLaptop, tilt: "3deg" },
  { label: "Fridge", Art: BrokenFridge, tilt: "-2deg" },
  { label: "Desktop", Art: BrokenPc, tilt: "2deg" },
  { label: "Watch", Art: BrokenWatch, tilt: "4deg" },
  { label: "TV", Art: BrokenTv, tilt: "-3deg" },
];

/** Seconds for one full lap around the AC. */
const ORBIT_PERIOD = 36;

/**
 * Elliptical orbit without JS: every card follows the same ellipse with
 * `offset-path` and a linear animation, so all six move at exactly the same
 * speed and stay evenly spaced (they never catch up with or overlap each other).
 * On containers narrower than 33rem the ellipse gets too small for six cards,
 * so the orbit layer is hidden there instead of letting cards touch.
 */
const ORBIT_STYLES = `
.orbit-card{offset-path:ellipse(var(--rx) var(--ry) at 0 0);offset-rotate:0deg;offset-anchor:50% 50%;animation:orbit-go var(--orbit-period,36s) linear infinite}
@keyframes orbit-go{from{offset-distance:0%}to{offset-distance:100%}}
@supports not (offset-path: ellipse(1px 1px at 0 0)){.orbit-layer{display:none!important}}
@container (max-width: 33rem){.orbit-layer{display:none!important}}
@media (prefers-reduced-motion: reduce){
.orbit-card{animation-play-state:paused}
}
`;

const REVIEWERS = [
  { initials: "AR", tone: "bg-primary text-primary-foreground" },
  { initials: "SN", tone: "bg-chart-4 text-white" },
  { initials: "TK", tone: "bg-accent text-accent-foreground" },
  { initials: "MH", tone: "bg-chart-3 text-white" },
];

/** Builds a gear outline as an SVG path (teeth + a hub hole). */
function gearPath(teeth: number, outer: number, inner: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i += 1) {
    const base = i * step;
    const angles = [
      [base - step * 0.28, inner],
      [base - step * 0.16, outer],
      [base + step * 0.16, outer],
      [base + step * 0.28, inner],
    ] as const;
    for (const [angle, radius] of angles) {
      points.push(
        `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`
      );
    }
  }
  return `M${points.join("L")}Z`;
}

const GEAR = gearPath(9, 34, 27);

const AC_STYLES = `
.ac2-shake{transform-box:fill-box;transform-origin:center;animation:ac2-shake 4.5s ease-in-out infinite}
.ac2-panel{transform-box:fill-box;transform-origin:center bottom;transform:rotate(-3deg);animation:ac2-panel 3.4s ease-in-out infinite}
.ac2-frost{animation:ac2-frost 3s ease-in-out infinite}
.ac2-fan{animation:ac2-fan 1.2s steps(1) infinite}
.ac2-led{animation:ac2-blink 1s steps(1) infinite}
.ac2-spark{animation:ac2-spark 1.4s steps(1) infinite}
.ac2-wire{transform-box:fill-box;transform-origin:top center;animation:ac2-wire 2.8s ease-in-out infinite}
.ac2-smoke{transform-box:fill-box;transform-origin:center;animation:ac2-smoke 3.2s ease-out infinite}
.ac2-drip{transform-box:fill-box;transform-origin:center top;animation:ac2-drip 1.9s cubic-bezier(.5,0,1,.6) infinite}
.ac2-ice{transform-box:fill-box;transform-origin:center;animation:ac2-ice 2.6s cubic-bezier(.5,0,1,.6) infinite}
.ac2-ripple{transform-box:fill-box;transform-origin:center;opacity:0;animation:ac2-ripple 1.9s ease-out infinite}
.ac2-merc{transform-box:fill-box;transform-origin:center bottom;animation:ac2-merc 2.8s ease-in-out infinite}
.ac2-ring{transform-box:fill-box;transform-origin:center;opacity:0;animation:ac2-ring 2s ease-out infinite}
@keyframes ac2-shake{0%,84%,100%{transform:rotate(0)}87%{transform:rotate(-.8deg) translateX(-1px)}90%{transform:rotate(.7deg) translateX(1px)}93%{transform:rotate(-.4deg)}}
@keyframes ac2-panel{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(-5.5deg)}}
@keyframes ac2-frost{0%,100%{opacity:.45}50%{opacity:.9}}
@keyframes ac2-fan{0%{transform:translateX(0)}25%{transform:translateX(3px)}50%{transform:translateX(0)}75%{transform:translateX(2px)}}
@keyframes ac2-blink{0%,49%{opacity:1}50%,100%{opacity:.15}}
@keyframes ac2-spark{0%{opacity:1}8%{opacity:0}16%{opacity:1}26%,62%{opacity:0}68%{opacity:1}74%,100%{opacity:0}}
@keyframes ac2-wire{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
@keyframes ac2-smoke{0%{transform:translateY(0) scale(.6);opacity:0}20%{opacity:.6}100%{transform:translateY(-34px) scale(1.7);opacity:0}}
@keyframes ac2-drip{0%{transform:translateY(0) scale(.4);opacity:0}12%{transform:translateY(2px) scale(1);opacity:1}85%{opacity:1}100%{transform:translateY(var(--fall,78px)) scale(1);opacity:0}}
@keyframes ac2-ice{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateY(var(--fall,78px)) rotate(110deg);opacity:0}}
@keyframes ac2-ripple{0%,84%{transform:scale(.2);opacity:0}86%{transform:scale(.2);opacity:.8}100%{transform:scale(1);opacity:0}}
@keyframes ac2-merc{0%,100%{transform:scaleY(.6)}50%{transform:scaleY(1)}}
@keyframes ac2-ring{0%{transform:scale(.9);opacity:.6}100%{transform:scale(1.4);opacity:0}}
@media (prefers-reduced-motion: reduce){
.ac2-shake,.ac2-panel,.ac2-frost,.ac2-fan,.ac2-led,.ac2-spark,.ac2-wire,.ac2-smoke,.ac2-drip,.ac2-ice,.ac2-ripple,.ac2-merc,.ac2-ring{animation:none}
}
`;

const COIL_FINS = Array.from({ length: 17 }, (_, i) => `M${74 + i * 12} 118v44`).join("");
const FAN_BLADES = Array.from({ length: 21 }, (_, i) => `M${66 + i * 11} 198l6-26`).join("");
const ICICLES = [
  [80, 12],
  [110, 17],
  [148, 11],
  [190, 18],
  [228, 12],
  [256, 15],
]
  .map(([x, h]) => `M${x - 5} 162l5 ${h} 5-${h}z`)
  .join("");

function Drip({
  x,
  y,
  delay,
  fall = 78,
}: {
  x: number;
  y: number;
  delay: number;
  fall?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0-7c4 5 6 8 6 12a6 6 0 0 1-12 0c0-4 2-7 6-12z"
        className="ac2-drip fill-chart-4"
        style={{ animationDelay: `${delay}s`, ["--fall" as string]: `${fall}px` }}
      />
    </g>
  );
}

function IceChunk({
  x,
  y,
  delay,
  fall = 78,
}: {
  x: number;
  y: number;
  delay: number;
  fall?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-5"
        y="-5"
        width="10"
        height="10"
        rx="2.5"
        fill="#d8f3fb"
        stroke="#7cc4d8"
        strokeWidth="1.5"
        className="ac2-ice"
        style={{ animationDelay: `${delay}s`, ["--fall" as string]: `${fall}px` }}
      />
    </g>
  );
}

function Ripple({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx="24"
      ry="4.5"
      fill="none"
      strokeWidth="2"
      className="ac2-ripple stroke-chart-4"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function RepairBench() {
  return (
    <svg
      viewBox="0 0 420 380"
      role="img"
      aria-label="A split air conditioner with its front panel open, showing a frozen coil, a burnt circuit board with sparks, loose wires and water dripping, next to a thermometer reading 38 degrees"
      className="h-full w-full"
    >
      <style>{AC_STYLES}</style>
      <defs>
        <linearGradient id="ac2-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--card)" }} />
          <stop offset="1" style={{ stopColor: "var(--secondary)" }} />
        </linearGradient>
        <linearGradient id="ac2-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--secondary)" }} />
          <stop offset="1" style={{ stopColor: "var(--card)" }} />
        </linearGradient>
        <linearGradient id="ac2-coil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c6a73" />
          <stop offset="1" stopColor="#173a40" />
        </linearGradient>
        <clipPath id="ac2-fan">
          <rect x="66" y="172" width="204" height="26" rx="6" />
        </clipPath>
        <filter id="ac2-shadow" x="-10%" y="-20%" width="120%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#0b3130" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* backdrop blobs */}
      <path
        d="M70 190c-8-70 48-132 128-142 82-10 158 30 168 104 9 68-46 150-136 168-90 16-152-34-160-130z"
        className="fill-accent/45"
      />
      <path
        d="M96 214c-4-52 36-96 98-104 62-8 118 22 124 76 6 52-34 112-102 124-68 12-116-26-120-96z"
        className="fill-primary/10"
      />
      <path
        d="M52 322c60 18 250 18 318 0"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
        className="stroke-foreground/30"
      />

      {/* puddle */}
      <ellipse cx="232" cy="302" rx="100" ry="11" className="fill-chart-4/30" />
      <ellipse cx="232" cy="302" rx="56" ry="5.5" className="fill-chart-4/30" />
      <Ripple x={170} y={301} delay={0} />
      <Ripple x={214} y={301} delay={0.9} />

      {/* gear */}
      <g transform="translate(330 292)">
        <g className="spin-slow">
          <path d={GEAR} className="fill-primary" />
          <circle r="12" className="fill-card" />
        </g>
      </g>

      {/* the unit */}
      <g transform="rotate(-1.5 210 156)">
        <g className="ac2-shake">
          {/* body */}
          <rect
            x="40"
            y="96"
            width="340"
            height="120"
            rx="24"
            fill="url(#ac2-body)"
            filter="url(#ac2-shadow)"
            className="stroke-foreground/20"
            strokeWidth="2"
          />
          {/* open cavity */}
          <rect x="54" y="108" width="312" height="96" rx="14" fill="#0f2427" />

          {/* frozen evaporator coil */}
          <rect x="66" y="118" width="204" height="44" rx="6" fill="url(#ac2-coil)" />
          <path d={COIL_FINS} fill="none" stroke="#4aa0aa" strokeOpacity="0.45" strokeWidth="1.6" />
          <g className="ac2-frost" fill="#e9fbff">
            <rect x="66" y="118" width="204" height="9" rx="4.5" fillOpacity="0.75" />
            <ellipse cx="104" cy="140" rx="30" ry="6" fillOpacity="0.7" />
            <ellipse cx="174" cy="146" rx="38" ry="7" fillOpacity="0.7" />
            <ellipse cx="238" cy="138" rx="26" ry="5.5" fillOpacity="0.7" />
          </g>
          <path d={ICICLES} fill="#d8f3fb" fillOpacity="0.95" />

          {/* blower fan, struggling */}
          <rect x="66" y="172" width="204" height="26" rx="6" fill="#163236" />
          <g clipPath="url(#ac2-fan)">
            <g className="ac2-fan">
              <path
                d={FAN_BLADES}
                fill="none"
                stroke="#5fa8b0"
                strokeOpacity="0.65"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* burnt control board */}
          <rect x="282" y="116" width="72" height="80" rx="8" fill="#1d6b57" />
          <path
            d="M292 152h50M292 158h30M332 152v26"
            fill="none"
            stroke="#7fd0b2"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <rect x="292" y="126" width="24" height="18" rx="2" fill="#12302a" />
          <rect x="324" y="126" width="22" height="18" rx="2" fill="#1a1a1a" />
          <ellipse cx="335" cy="135" rx="15" ry="11" fill="#000" fillOpacity="0.3" />
          <circle cx="300" cy="170" r="5" fill="#c9d6d8" />
          <circle cx="314" cy="170" r="5" fill="#c9d6d8" />
          <circle cx="328" cy="170" r="5" fill="#e0b85a" />
          <circle cx="344" cy="186" r="7" fill="#ff4d4d" fillOpacity="0.3" className="ac2-led" />
          <circle cx="344" cy="186" r="3" fill="#ff4d4d" className="ac2-led" />

          {/* sparks from the burnt chip */}
          <g className="ac2-spark">
            <path
              d="M326 122l-6-8M335 120v-10M344 122l7-7"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-brand-amber"
            />
          </g>

          {/* loose wires hanging out of the unit */}
          <g className="ac2-wire">
            <path
              d="M300 196c-2 14 10 18 6 34"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-brand-amber"
            />
            <path
              d="M314 196c4 12-8 16-2 30"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-destructive"
            />
          </g>
          <g className="ac2-spark" style={{ animationDelay: "0.5s" }}>
            <path
              d="M300 234l-7 4M312 232l8 3M306 224v-8"
              fill="none"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="stroke-brand-amber"
            />
          </g>

          {/* front panel flipped open and hanging crooked */}
          <g className="ac2-panel">
            <path
              d="M58 96l18-32h268l18 32z"
              fill="url(#ac2-panel)"
              className="stroke-foreground/20"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M92 74h236M86 82h248M80 90h260"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-foreground/15"
            />
          </g>
        </g>
      </g>

      {/* smoke from the burnt chip */}
      <circle cx="333" cy="104" r="7" className="ac2-smoke fill-foreground/20" />
      <circle cx="342" cy="100" r="6" className="ac2-smoke fill-foreground/20" style={{ animationDelay: "1.1s" }} />
      <circle cx="326" cy="102" r="8" className="ac2-smoke fill-foreground/20" style={{ animationDelay: "2.2s" }} />

      {/* water and ice dropping from the unit */}
      <Drip x={170} y={222} delay={0} />
      <Drip x={214} y={222} delay={0.9} />
      <IceChunk x={252} y={222} delay={0.4} />
      <IceChunk x={192} y={222} delay={1.6} />

      {/* "no cooling" thermometer badge */}
      <g transform="translate(60 40)">
        <rect
          x="-34"
          y="-24"
          width="92"
          height="48"
          rx="24"
          className="fill-card stroke-border"
          strokeWidth="1.5"
          filter="url(#ac2-shadow)"
        />
        <circle cx="-10" cy="0" r="22" fill="none" strokeWidth="2" className="ac2-ring stroke-destructive" />
        <rect x="-14" y="-15" width="8" height="26" rx="4" className="fill-secondary" />
        <rect x="-12" y="-13" width="4" height="24" rx="2" className="ac2-merc fill-destructive" />
        <circle cx="-10" cy="13" r="7" className="fill-destructive" />
        <text
          x="24"
          y="6"
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          className="fill-foreground"
        >
          38°C
        </text>
      </g>

      {/* sparkles */}
      <path
        d="M398 196v14M391 203h14M64 330v12M58 336h12"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-primary/70"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="dotted-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_30%_30%,black,transparent)]" />
      </div>

      <div className="shell grid items-center gap-14 pt-12 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pt-20 lg:pb-24">
        <div className="fade-up">
          <p className="font-hand inline-flex -rotate-2 items-center gap-2 text-2xl font-bold text-primary">
            Hi! Tell us what broke
            <svg
              viewBox="0 0 48 24"
              aria-hidden
              className="h-5 w-10 stroke-primary"
              fill="none"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 14c10-12 24-12 38 0M32 6l9 8-11 3" />
            </svg>
          </p>

          <h1 className="display-title mt-3">
            Broken device? Get it fixed by{" "}
            <span className="relative inline-block whitespace-nowrap">
              verified
              <svg
                viewBox="0 0 220 18"
                aria-hidden
                preserveAspectRatio="none"
                className="absolute inset-x-0 -bottom-2 h-3.5 w-full stroke-accent-foreground dark:stroke-accent"
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
              >
                <path
                  className="draw-line"
                  d="M3 11c28-9 52 7 80 0s52-9 80-1 40 4 54-2"
                />
              </svg>
            </span>{" "}
            technicians.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Phones, laptops, ACs, fridges, TVs, washing machines, wiring. Pick
            someone who has fixed it before, watch the job move forward, and
            pay once it is done and working.
          </p>

          <form
            action="/services"
            className="mt-7 flex flex-col gap-2 rounded-[1.6rem] border border-border/80 bg-card p-2 shadow-[0_18px_50px_-34px_rgba(11,49,48,0.65)] sm:flex-row sm:items-center sm:rounded-full sm:pl-4"
          >
            <label className="flex flex-1 items-center gap-2 px-2 sm:px-0">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Search services</span>
              <input
                name="search"
                placeholder="What needs fixing? e.g. AC servicing"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </label>
            <label className="sm:w-40">
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue=""
                className="h-11 w-full cursor-pointer rounded-full bg-secondary/70 px-3 text-sm font-medium outline-none"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-full px-6 text-sm font-semibold"
            >
              Find a fix
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {REVIEWERS.map((reviewer) => (
                  <span
                    key={reviewer.initials}
                    className={`grid size-8 place-items-center rounded-full border-2 border-background text-[10px] font-bold ${reviewer.tone}`}
                  >
                    {reviewer.initials}
                  </span>
                ))}
              </div>
              <div className="text-xs leading-tight">
                <p className="flex items-center gap-1 font-bold">
                  <Star className="size-3.5 fill-brand-amber text-brand-amber" />
                  4.9 average rating
                </p>
                <p className="text-muted-foreground">from 2,300+ reviews</p>
              </div>
            </div>
            <span aria-hidden className="hidden h-8 w-px bg-border sm:block" />
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              Every technician is ID-verified
            </p>
          </div>

          <p className="mt-7 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Every technician is checked by our team before they can take jobs.
          </p>
        </div>

        <div
          className="relative mx-auto w-full max-w-xl pt-24 pb-28 lg:max-w-none"
          style={{ containerType: "inline-size" }}
        >
          <style>{ORBIT_STYLES}</style>

          <div className="relative mx-auto aspect-[420/380] w-full max-w-[22rem]">
            <RepairBench />

            {/* devices orbiting the AC, passing behind the ticket and the sticky note */}
            <div
              aria-hidden
              className="orbit-layer pointer-events-none absolute top-1/2 left-1/2 z-20 hidden size-0 sm:block"
              style={{
                ["--rx" as string]: "calc(50cqw - 3.5rem)",
                ["--ry" as string]: "11rem",
                ["--orbit-period" as string]: `${ORBIT_PERIOD}s`,
              }}
            >
              {FLOATING_DEVICES.map(({ label, Art, tilt }, index) => {
                const phase = (ORBIT_PERIOD * index) / FLOATING_DEVICES.length;
                return (
                  <div
                    key={label}
                    className="orbit-card absolute top-0 left-0 flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-lg"
                    style={{ animationDelay: `-${phase}s`, rotate: tilt }}
                  >
                    <span className="grid size-20 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Art className="size-[4.5rem]" />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* repair ticket */}
          <div
            className="float-slow absolute left-[calc(50%-15rem)] z-30 w-56 rounded-xl border border-dashed border-primary/40 bg-card p-4 shadow-xl"
            style={{ ["--tilt" as string]: "-3deg" }}
          >
            <span className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 rounded-sm bg-accent/80" />
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Repair ticket · #2048
            </p>
            <p className="mt-1.5 font-heading text-base leading-tight font-bold">
              Cracked screen swap
            </p>
            <p className="text-[11px] text-muted-foreground">
              Rakib Hasan · Dhaka, Bangladesh
            </p>
            <div className="mt-3 flex items-start justify-between">
              {STEPS.map((step, index) => (
                <div key={step.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full items-center">
                    {index > 0 && (
                      <span
                        className={`absolute right-1/2 h-0.5 w-full ${
                          step.done ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 mx-auto grid size-4 place-items-center rounded-full border-2 ${
                        step.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {step.done && <Check className="size-2.5" strokeWidth={4} />}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-medium ${
                      step.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* sticky note */}
          <div
            className="float-slower font-hand absolute top-2 right-0 z-30 w-40 rounded-sm bg-accent p-3 text-xl leading-tight font-bold text-[#3b2a06] shadow-lg sm:right-4"
            style={{ ["--tilt" as string]: "5deg" }}
          >
            <span className="absolute -top-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-primary shadow" />
            Pay after it&apos;s fixed. Not before!
          </div>
        </div>
      </div>

      <div className="border-y border-border/70 bg-card/60">
        <div className="shell grid gap-6 py-6 sm:grid-cols-3">
          {PROOF.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 ${
                index > 0 ? "sm:border-l sm:border-border/70 sm:pl-6" : ""
              }`}
            >
              <span className="font-heading text-2xl font-bold">
                {item.value}
              </span>
              <span className="text-xs leading-tight text-muted-foreground">
                {item.label}
                <br />
                across FixMate
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}