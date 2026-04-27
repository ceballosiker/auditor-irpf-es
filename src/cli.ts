// CLI entry point for `npm run build:excel`.

import { generarExcel } from './excel';

const DEFAULT_OUT = 'Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx';

function printHelp(): void {
  console.log(`Usage: npm run build:excel -- [options]

Genera el Excel completo de auditoría (2012-2026, brutos 0-100 000 €).

Options:
  -o, --out <path>   Ruta del fichero de salida.
                     Default: ${DEFAULT_OUT}
  -h, --help         Muestra esta ayuda.
`);
}

function parseArgs(argv: readonly string[]): { out: string } {
  let out = DEFAULT_OUT;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') {
      const next = argv[i + 1];
      if (next === undefined) {
        console.error(`Error: ${a} requiere un valor.`);
        process.exit(1);
      }
      out = next;
      i++;
    } else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else if (a !== undefined) {
      console.error(`Error: argumento desconocido "${a}".`);
      printHelp();
      process.exit(1);
    }
  }
  return { out };
}

function main(): void {
  const { out } = parseArgs(process.argv.slice(2));
  console.log(`Generando ${out} ...`);
  const t0 = Date.now();
  generarExcel(out);
  const seconds = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`✅ Done in ${seconds}s`);
}

main();
