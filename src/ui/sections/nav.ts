// src/ui/sections/nav.ts
import { render } from '../render.js';

export function mountNav(target: HTMLElement): void {
  render(
    target,
    `
    <nav class="nav" aria-label="Navegación principal">
      <span class="wordmark">Auditor IRPF · 2012–2026</span>
      <span>
        <a href="./manual/">Manual divulgativo</a>
        <a href="https://github.com/ceballosiker/auditor-irpf-es">GitHub ↗</a>
      </span>
    </nav>
  `,
  );
}
