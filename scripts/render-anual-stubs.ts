// Generate the 15 docs/anual/YYYY.md stubs + docs/anual/index.md from
// obtenerParametros(). Values come straight from src/normativa.ts so the
// stubs cannot drift from the engine's source of truth.
//
// Run: `npm run anual:stubs` (from repo root). Idempotent.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { obtenerParametros, ANIO_MIN, ANIO_MAX } from '../src/normativa.ts';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(REPO_ROOT, 'docs', 'anual');

// audit-YYYY GitHub issue numbers (created in Phase 2, v0.3.0).
const AUDIT_ISSUE: Readonly<Record<number, number>> = {
  2012: 17,
  2013: 18,
  2014: 19,
  2015: 20,
  2016: 21,
  2017: 22,
  2018: 23,
  2019: 24,
  2020: 25,
  2021: 26,
  2022: 27,
  2023: 28,
  2024: 29,
  2025: 30,
  2026: 31,
};

const REPO_URL = 'https://github.com/ceballosiker/auditor-irpf-es';

function fmtPct(v: number): string {
  return (v * 100).toFixed(2).replace('.', ',') + ' %';
}

function fmtEuro(v: number): string {
  const abs = Math.abs(v);
  const intPart = Math.floor(abs);
  const cents = Math.round((abs - intPart) * 100);
  const intStr = intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = v < 0 ? '-' : '';
  return `${sign}${intStr},${cents.toString().padStart(2, '0')} €`;
}

function nav(anio: number): string {
  const parts: string[] = [];
  if (anio > ANIO_MIN) {
    parts.push(`[← ${String(anio - 1)}](${String(anio - 1)}.md)`);
  }
  parts.push(`[Índice anual](index.md)`);
  if (anio < ANIO_MAX) {
    parts.push(`[${String(anio + 1)} →](${String(anio + 1)}.md)`);
  }
  return parts.join(' · ');
}

function renderStub(anio: number): string {
  const p = obtenerParametros(anio);
  const issue = AUDIT_ISSUE[anio];
  const meiAplica = p.mei[0] > 0 || p.mei[1] > 0;
  const solidaridadAplica = p.solidaridad.length > 0;
  const smiAplica = p.deduccionSMI(0) > 0;

  const lines: string[] = [];
  lines.push(`# Normativa ${String(anio)}`);
  lines.push('');
  lines.push(`▷ [Ver este año en la calculadora →](../../../?anio=${String(anio)})`);
  lines.push('');
  lines.push(
    `> **Pendiente de redacción.** Esta página es un stub. La redacción completa con referencias BOE llegará en Phase 5 (v1.3.0), en paralelo con la validación de [\`audit-${String(anio)}\`](${REPO_URL}/issues/${String(issue)}).`,
  );
  lines.push('');
  lines.push('## Parámetros vigentes');
  lines.push('');
  lines.push(`| Parámetro                       | Valor                  |`);
  lines.push(`| ------------------------------- | ---------------------- |`);
  lines.push(`| Base máxima cotización          | ${fmtEuro(p.baseMax)}  |`);
  lines.push(`| Tipo SS total empresa           | ${fmtPct(p.tipoEmpresaTotal)} |`);
  lines.push(`| Tipo SS total trabajador        | ${fmtPct(p.tipoTrabajadorTotal)} |`);
  lines.push(
    `| MEI                             | ${meiAplica ? `${fmtPct(p.mei[0] + p.mei[1])} (empresa ${fmtPct(p.mei[0])} · trabajador ${fmtPct(p.mei[1])})` : 'no aplica'} |`,
  );
  lines.push(
    `| Cuota de Solidaridad            | ${solidaridadAplica ? 'aplica (3 bandas sobre el exceso)' : 'no aplica'} |`,
  );
  lines.push(`| Mínimo personal contribuyente   | ${fmtEuro(p.irpfMinimo)} |`);
  lines.push(`| Mínimo exento de retención      | ${fmtEuro(p.minimoExento)} |`);
  lines.push(`| Gastos fijos Art. 19            | ${fmtEuro(p.gastosFijos)} |`);
  lines.push(`| Tramos IRPF (incl. autonómico = estatal) | ${String(p.tramosIRPF.length)} |`);
  lines.push(`| Deducción SMI                   | ${smiAplica ? 'aplica' : 'no aplica'} |`);
  lines.push('');
  lines.push(
    'Estos valores se generan directamente de `src/normativa.ts`. Para auditarlos contra el BOE, ver el [issue de auditoría](' +
      REPO_URL +
      '/issues/' +
      String(issue) +
      ').',
  );
  lines.push('');
  lines.push('## Cómo aportar a esta página');
  lines.push('');
  lines.push(
    `1. Abre el [issue \`audit-${String(anio)}\`](${REPO_URL}/issues/${String(issue)}) y reclama el slot.`,
  );
  lines.push('2. Valida cada elemento del checklist contra el BOE.');
  lines.push(
    '3. Cuando el año esté validado, manda un PR con la redacción completa de esta página: cambios respecto al año anterior, motivación legal, cómo afectan a la curva de neto.',
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(nav(anio));
  lines.push('');
  return lines.join('\n');
}

function renderIndex(): string {
  const lines: string[] = [];
  lines.push('# Resúmenes anuales 2012–2026');
  lines.push('');
  lines.push(
    'Una página por año entre 2012 y 2026. En la versión `v0.4.0` todas son **stubs**: contienen los parámetros vigentes (extraídos automáticamente de `src/normativa.ts`) y un enlace al `audit-YYYY` correspondiente. La redacción completa, con referencias BOE y análisis de cambios, llegará en Phase 5 (`v1.3.0`).',
  );
  lines.push('');
  lines.push(`| Año  | Página                       | Issue de auditoría |`);
  lines.push(`| ---- | ---------------------------- | ------------------ |`);
  for (let a = ANIO_MIN; a <= ANIO_MAX; a++) {
    const issue = AUDIT_ISSUE[a];
    lines.push(
      `| ${String(a)} | [Normativa ${String(a)}](${String(a)}.md) | [#${String(issue)}](${REPO_URL}/issues/${String(issue)}) |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

mkdirSync(OUT_DIR, { recursive: true });

for (let a = ANIO_MIN; a <= ANIO_MAX; a++) {
  const out = join(OUT_DIR, `${String(a)}.md`);
  writeFileSync(out, renderStub(a), 'utf8');
  console.log(`[anual] wrote ${out}`);
}

const idxOut = join(OUT_DIR, 'index.md');
writeFileSync(idxOut, renderIndex(), 'utf8');
console.log(`[anual] wrote ${idxOut}`);
