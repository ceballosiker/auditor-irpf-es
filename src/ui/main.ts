import '@picocss/pico/css/pico.min.css';
import './sr-only.css';
import { mountApp } from './app.js';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Mount point #app not found in index.html');
}
mountApp(app);
