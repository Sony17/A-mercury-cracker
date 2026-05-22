"use client";

import { useEffect } from "react";
import { contrastRatio, pickReadableText } from "@/lib/contrast";

/**
 * Dev-only DOM contrast auditor.
 *
 * Walks visible text nodes, resolves the effective foreground + background,
 * and console.warn()s any pair below WCAG AA (4.5:1 for normal text, 3:1
 * for large text). Skips images, SVGs, decorative spans with no text, and
 * elements with [data-contrast-skip].
 *
 * Returns null in production. Safe to mount in app/layout.tsx.
 */
export default function ContrastAuditor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    const audit = () => {
      const failures: Array<{ el: Element; fg: string; bg: string; ratio: number; text: string }> = [];
      const all = document.body.querySelectorAll<HTMLElement>("*");

      all.forEach((el) => {
        if (el.hasAttribute("data-contrast-skip")) return;
        if (el.closest("[data-contrast-skip]")) return;
        const text = (el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE)
          ? (el.textContent ?? "").trim()
          : "";
        if (!text || text.length < 2) return;

        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") return;

        const fg = toHex(cs.color);
        const bg = resolveBackground(el);
        if (!fg || !bg) return;

        const fontSizePx = parseFloat(cs.fontSize);
        const fontWeight = parseInt(cs.fontWeight, 10) || 400;
        const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
        const threshold = isLarge ? 3 : 4.5;

        const ratio = contrastRatio(fg, bg);
        if (ratio < threshold) {
          failures.push({ el, fg, bg, ratio, text: text.slice(0, 60) });
        }
      });

      if (failures.length === 0) {
        console.info(`[ContrastAuditor] ✓ All ${all.length} text nodes pass WCAG AA.`);
        return;
      }

      console.groupCollapsed(
        `[ContrastAuditor] ✗ ${failures.length} contrast failure(s) — click to expand`,
      );
      failures.slice(0, 50).forEach((f) => {
        const suggest = pickReadableText(f.bg);
        console.warn(
          `${f.ratio.toFixed(2)}:1  fg=${f.fg} bg=${f.bg}  →  try color="${suggest}"`,
          { element: f.el, sample: f.text },
        );
      });
      if (failures.length > 50) console.warn(`…and ${failures.length - 50} more`);
      console.groupEnd();
    };

    // Initial pass after first paint, then on route/DOM changes.
    const t = window.setTimeout(audit, 800);
    const observer = new MutationObserver(() => {
      window.clearTimeout((observer as unknown as { _t?: number })._t);
      (observer as unknown as { _t?: number })._t = window.setTimeout(audit, 1200);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}

function toHex(color: string): string | null {
  if (!color) return null;
  const m = color.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([0-9.]+))?\)/);
  if (!m) return null;
  const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  if (a < 0.4) return null; // very translucent — auditor can't infer background blend reliably
  const toHex2 = (n: string) => parseInt(n, 10).toString(16).padStart(2, "0");
  return `#${toHex2(m[1])}${toHex2(m[2])}${toHex2(m[3])}`;
}

function resolveBackground(el: Element): string | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const hex = toHex(bg);
      if (hex) return hex;
    }
    node = node.parentElement;
  }
  return toHex(getComputedStyle(document.body).backgroundColor) || "#000814";
}
