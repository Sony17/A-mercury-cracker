/**
 * Design-system contrast utilities (WCAG 2.1).
 *
 * RULES enforced by this module:
 *  1. Gold (#D4AF37 / #FFD166) is for accents — never body text on white.
 *  2. Navy (#001D3D) is the body text on white surfaces.
 *  3. Gold buttons (.btn-gold) must keep dark text (#000814 / #001D3D).
 *  4. White text is only safe on navy / near-black backgrounds.
 *
 * Pair tokens with `pickReadableText(bg)` whenever you compose ad-hoc colors.
 */

export const BRAND = {
  navy: "#000814",
  navySecondary: "#001D3D",
  gold: "#D4AF37",
  goldSpark: "#FFD166",
  goldDark: "#A67C00",
  goldPremium: "#B8860B",
  goldAccent: "#D4AF37",
  goldLight: "#FFD166",
  white: "#FFFFFF",
  slate600: "#475569",
  slate400: "#94A3B8",
} as const;

export type HexColor = `#${string}`;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3
    ? m.split("").map((c) => c + c).join("")
    : m.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(hexToRgb(a));
  const lb = relativeLuminance(hexToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export const meetsAA = (fg: string, bg: string, large = false) =>
  contrastRatio(fg, bg) >= (large ? 3 : 4.5);
export const meetsAAA = (fg: string, bg: string, large = false) =>
  contrastRatio(fg, bg) >= (large ? 4.5 : 7);

/** Return the readable brand text color for a given background. */
export function pickReadableText(bg: string): HexColor {
  const ratioWhite = contrastRatio(BRAND.white, bg);
  const ratioNavy = contrastRatio(BRAND.navySecondary, bg);
  return (ratioWhite >= ratioNavy ? BRAND.white : BRAND.navySecondary) as HexColor;
}

/** Approved (text, background) combinations. Anything else should be reviewed.
 *  NOTE: gold-dark / gold-premium are ACCENT colors (icons/borders/large headings)
 *  — they're below 4.5:1 on white so they do NOT appear here as body text pairs. */
export const SAFE_PAIRS: Array<{ fg: HexColor; bg: HexColor; ratio: number; label: string }> = [
  { fg: BRAND.navySecondary, bg: BRAND.white, ratio: 16.7, label: "navy on white (body)" },
  { fg: BRAND.navy, bg: BRAND.white, ratio: 20.5, label: "deep navy on white (heading)" },
  { fg: BRAND.slate600, bg: BRAND.white, ratio: 7.0, label: "slate-600 on white (muted text)" },
  { fg: BRAND.white, bg: BRAND.navy, ratio: 19.8, label: "white on navy (hero/body)" },
  { fg: BRAND.white, bg: BRAND.navySecondary, ratio: 13.4, label: "white on navy-secondary" },
  { fg: BRAND.goldSpark, bg: BRAND.navy, ratio: 11.4, label: "gold-spark on navy (accent)" },
  { fg: BRAND.gold, bg: BRAND.navy, ratio: 9.4, label: "gold on navy (accent)" },
  { fg: BRAND.navy, bg: BRAND.gold, ratio: 9.4, label: "navy on gold button (CTA)" },
  { fg: BRAND.navy, bg: BRAND.goldSpark, ratio: 13.0, label: "navy on gold-spark (CTA)" },
];

/** Accent-only gold tokens — usable for ≥3:1 non-text UI (borders/icons/large headings) but
 *  NEVER for body text on white. The ContrastAuditor will flag them if misused. */
export const ACCENT_ONLY_ON_WHITE: HexColor[] = [
  BRAND.goldDark,
  BRAND.goldPremium,
  BRAND.goldAccent,
  BRAND.goldLight,
];

/** Throw at module-load if any approved pair regresses (math guard). */
export function assertSafePairs(): void {
  for (const p of SAFE_PAIRS) {
    const actual = contrastRatio(p.fg, p.bg);
    if (actual < p.ratio - 0.2) {
      throw new Error(
        `Contrast token regression: ${p.label} measured ${actual.toFixed(2)}, expected ≥ ${p.ratio}`,
      );
    }
  }
}
