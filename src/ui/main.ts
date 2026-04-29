import '@picocss/pico/css/pico.min.css';
import { render } from './render.js';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Mount point #app not found in index.html');
}

render(
  app,
  `
    <header>
      <hgroup>
        <h1>Calculadora IRPF España</h1>
        <p>Salario neto, IRPF y cotización social entre 2012 y 2026.</p>
      </hgroup>
    </header>
    <section>
      <p>Hola, IRPF — el formulario aterriza en <a href="https://github.com/ceballosiker/auditor-irpf-es/issues/49">#49</a>.</p>
    </section>
  `,
);
