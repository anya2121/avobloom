// Ornamen kecil (bintang, hati, bunga, CD) — semuanya SVG buatan sendiri.

type P = { size?: number; color?: string; className?: string; style?: React.CSSProperties };

export function Sparkle({ size = 24, color = "#fff", className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1Z" fill={color} stroke="#3f2a36" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ size = 40, color = "#c8b5ff", className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <path d="M20 3 L24.5 14.5 L37 15.2 L27.3 23 L30.6 35.3 L20 28.4 L9.4 35.3 L12.7 23 L3 15.2 L15.5 14.5Z" fill={color} stroke="#3f2a36" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 17 L17 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Heart({ size = 36, color = "#ff9acb", className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 32" className={className} style={style} aria-hidden>
      <path d="M18 30 C6 21 2 15 2 9.5 C2 5 5.5 2 9.5 2 C13 2 16 4 18 7.5 C20 4 23 2 26.5 2 C30.5 2 34 5 34 9.5 C34 15 30 21 18 30Z" fill={color} stroke="#3f2a36" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 8 Q9 5.5 12 5.5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Flower({ size = 40, color = "#ffb3d1", className, style }: P) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      {petals.map((r) => (
        <ellipse key={r} cx="20" cy="10.5" rx="7" ry="9" fill={color} stroke="#3f2a36" strokeWidth="1.6" transform={`rotate(${r} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5" fill="#fff3b8" stroke="#3f2a36" strokeWidth="1.6" />
    </svg>
  );
}

export function Disc({ size = 80, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="cd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd6ea" />
          <stop offset=".35" stopColor="#e8f6ff" />
          <stop offset=".6" stopColor="#efe8ff" />
          <stop offset="1" stopColor="#eaf6d8" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="37" fill="url(#cd)" stroke="#3f2a36" strokeWidth="2" />
      <circle cx="40" cy="40" r="12" fill="#fff" stroke="#3f2a36" strokeWidth="2" />
      <circle cx="40" cy="40" r="4" fill="#fffaf6" stroke="#3f2a36" strokeWidth="1.5" />
      <path d="M18 24 A26 26 0 0 1 30 15" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export const CATEGORY_EMOJI: Record<string, string> = { barang: "🎀", skincare: "🧴", pakaian: "👗" };
