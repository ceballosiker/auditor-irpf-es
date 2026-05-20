// test/contrast.test.ts
//
// Verifica los ratios de contraste WCAG 2.1 para todos los pares texto/fondo
// críticos de la SPA y los SVGs del manual, en ambos esquemas (light + dark).
// No se hardcodean colores: se parsean los tokens definidos en
// src/ui/theme.css y se importan las paletas de scripts/render-charts.ts.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PALETTE_LIGHT, PALETTE_DARK } from '../scripts/render-charts.ts';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME_CSS = readFileSync(join(REPO_ROOT, 'src/ui/theme.css'), 'utf8');

type Tokens = Record<string, string>;

/** Extrae custom properties (`--name: value`) del cuerpo dado. */
function parseProps(body: string): Tokens {
  const out: Tokens = {};
  const re = /--([a-z][a-z0-9-]*)\s*:\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out[`--${m[1]}`] = m[2].trim();
  }
  return out;
}

/** Tokens del `:root` light (primer bloque `:root { ... }`). */
function parseLightTokens(css: string): Tokens {
  const match = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!match) throw new Error('contrast: no :root block found in theme.css');
  return parseProps(match[1]);
}

/** Tokens del bloque `@media (prefers-color-scheme: dark) { :root { ... } }`. */
function parseDarkTokens(css: string): Tokens {
  const match = css.match(
    /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\}/,
  );
  if (!match) throw new Error('contrast: no dark @media :root block found in theme.css');
  return parseProps(match[1]);
}

/** Combina light + dark: cualquier token no redefinido en dark hereda de light. */
function resolveTokens(light: Tokens, dark: Tokens): Tokens {
  return { ...light, ...dark };
}

/** Parsea `#rgb`, `#rrggbb` o `rgba(r, g, b, a)` a {r,g,b,a} en [0..255], a en [0..1]. */
function parseColor(v: string): { r: number; g: number; b: number; a: number } {
  const s = v.trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    const expand = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;
    return {
      r: parseInt(expand.slice(0, 2), 16),
      g: parseInt(expand.slice(2, 4), 16),
      b: parseInt(expand.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgba = s.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => Number(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  throw new Error(`contrast: unsupported color '${v}'`);
}

/** Compone color con alpha sobre fondo opaco — devuelve hex {r,g,b}. */
function flatten(
  fg: { r: number; g: number; b: number; a: number },
  bg: { r: number; g: number; b: number },
): { r: number; g: number; b: number } {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

/** Luminancia relativa WCAG 2.1. */
function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio WCAG 2.1 entre dos colores opacos. */
function ratio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const L1 = Math.max(luminance(a), luminance(b));
  const L2 = Math.min(luminance(a), luminance(b));
  return (L1 + 0.05) / (L2 + 0.05);
}

/** Resuelve un token (que puede ser hex/rgba/`var(--otro)`) recursivamente. */
function resolve(tokens: Tokens, value: string, depth = 0): string {
  if (depth > 8) throw new Error(`contrast: token resolution too deep for '${value}'`);
  const v = value.trim();
  const varMatch = v.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i);
  if (varMatch) {
    const next = tokens[varMatch[1]];
    if (!next) throw new Error(`contrast: unresolved var ${varMatch[1]}`);
    return resolve(tokens, next, depth + 1);
  }
  return v;
}

/** Calcula contraste entre dos token-names, aplanando alpha sobre `over` si hace falta. */
function contrastBetween(tokens: Tokens, fgName: string, bgName: string, overName?: string): number {
  const fg = parseColor(resolve(tokens, tokens[fgName] ?? fgName));
  const bg = parseColor(resolve(tokens, tokens[bgName] ?? bgName));
  if (fg.a < 1) {
    const over = parseColor(resolve(tokens, tokens[overName ?? bgName] ?? overName ?? bgName));
    const flat = flatten(fg, over);
    return ratio(flat, { r: bg.r, g: bg.g, b: bg.b });
  }
  return ratio({ r: fg.r, g: fg.g, b: fg.b }, { r: bg.r, g: bg.g, b: bg.b });
}

interface Pair {
  fg: string;
  bg: string;
  /** Si el `fg` es translucent, sobre qué token aplanarlo. */
  over?: string;
  min: number;
  label: string;
}

const SPA_PAIRS: Pair[] = [
  { fg: '--ink', bg: '--paper', min: 4.5, label: 'ink on paper' },
  { fg: '--ink-soft', bg: '--paper', min: 4.5, label: 'ink-soft on paper' },
  { fg: '--ink-mute', bg: '--paper', min: 4.5, label: 'ink-mute on paper' },
  { fg: '--accent', bg: '--paper', min: 4.5, label: 'accent on paper' },
  { fg: '--neto', bg: '--paper', min: 4.5, label: 'neto on paper' },
  { fg: '--ss', bg: '--paper', min: 4.5, label: 'ss on paper' },
  { fg: '--cta-ink', bg: '--accent', min: 4.5, label: 'cta-ink on accent' },
  { fg: '--ink', bg: '--surface', min: 4.5, label: 'ink on surface' },
  { fg: '--ink-soft', bg: '--surface', min: 4.5, label: 'ink-soft on surface' },
  { fg: '--paper-translucent', bg: '--ink', over: '--ink', min: 4.5, label: 'paper-translucent on ink' },
];

describe('contrast: SPA tokens meet WCAG 2.1 AA in both schemes', () => {
  const light = parseLightTokens(THEME_CSS);
  const dark = resolveTokens(light, parseDarkTokens(THEME_CSS));

  for (const p of SPA_PAIRS) {
    it(`light: ${p.label} ≥ ${p.min}:1`, () => {
      const r = contrastBetween(light, p.fg, p.bg, p.over);
      expect(r, `actual ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(p.min);
    });
    it(`dark: ${p.label} ≥ ${p.min}:1`, () => {
      const r = contrastBetween(dark, p.fg, p.bg, p.over);
      expect(r, `actual ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(p.min);
    });
  }
});

describe('contrast: manual chart palette meets WCAG 2.1 AA in both schemes', () => {
  const variants = [
    { name: 'light', p: PALETTE_LIGHT },
    { name: 'dark', p: PALETTE_DARK },
  ] as const;

  for (const v of variants) {
    const bg = parseColor(v.p.bg);
    for (const fg of [v.p.axis, v.p.text, v.p.title, ...v.p.series]) {
      it(`${v.name}: ${fg} on ${v.p.bg} ≥ 4.5:1`, () => {
        const r = ratio(parseColor(fg), bg);
        expect(r, `actual ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
