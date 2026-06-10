import { loadCSS } from './aem.js';
import mountBrandConcierge from './brand-concierge-mount.js';

/*
 * Metadata-powered floating Brand Concierge widget.
 *
 * Enabled per page via a `brand-concierge` metadata value of `floating` (or
 * `true`). Renders a launcher button pinned to the bottom-right that opens a
 * compact chat window. Brand Concierge is mounted lazily on first open and the
 * window simply toggles visibility afterwards so the session is preserved.
 */

const LAUNCHER_LABEL = 'Chat with our agent';
const TITLE = 'Ask Sock2U';

let initialised = false;

function buildLauncher() {
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'floating-concierge-launcher';
  launcher.setAttribute('aria-label', LAUNCHER_LABEL);
  launcher.innerHTML = `
    <span class="floating-concierge-launcher-icon" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.12 24.7c-.13 0-.26-.03-.38-.08a.97.97 0 0 1-.6-.9V19.5H6.17A4.88 4.88 0 0 1 1.3 14.62V7.47A4.88 4.88 0 0 1 6.17 2.6h5.14a.97.97 0 1 1 0 1.95H6.17A2.93 2.93 0 0 0 3.25 7.47v7.15a2.93 2.93 0 0 0 2.92 2.93h1.95a.97.97 0 0 1 .98.97v2.91l3.75-3.61c.18-.17.42-.27.68-.27h6.3a2.93 2.93 0 0 0 2.92-2.93v-1.65a.97.97 0 1 1 1.95 0v1.65a4.88 4.88 0 0 1-4.87 4.88h-5.9l-5.12 4.93c-.19.18-.43.27-.68.27Z" fill="currentColor"/>
        <path d="M17.26 11.8c-.24 0-.49-.06-.71-.19a1.34 1.34 0 0 1-.69-1.53l.6-2.77-1.9-2.09a1.34 1.34 0 0 1 1.35-2.18l2.76.6 2.1-1.9a1.34 1.34 0 0 1 2.18 1.36l-.6 2.76 1.9 2.1a1.34 1.34 0 0 1-1.43 2.2l-2.76-.6-2.1 1.9c-.26.24-.6.37-.95.37Z" fill="currentColor"/>
      </svg>
    </span>
    <span class="floating-concierge-launcher-text">${LAUNCHER_LABEL}</span>
  `;
  return launcher;
}

function buildPanel() {
  const panel = document.createElement('div');
  panel.className = 'floating-concierge-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', TITLE);
  panel.hidden = true;

  const header = document.createElement('div');
  header.className = 'floating-concierge-header';
  header.innerHTML = `
    <span class="floating-concierge-dot" aria-hidden="true"></span>
    <span class="floating-concierge-title">${TITLE}</span>
  `;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'floating-concierge-close';
  close.setAttribute('aria-label', 'Minimise');
  close.innerHTML = '<span class="floating-concierge-close-icon" aria-hidden="true"></span>';
  header.append(close);

  const body = document.createElement('div');
  body.className = 'floating-concierge-body';

  panel.append(header, body);
  return {
    panel, body, close,
  };
}

/**
 * Initialises and injects the floating widget. Safe to call once per page.
 */
export default async function initFloatingConcierge() {
  if (initialised) return;
  initialised = true;

  await loadCSS(`${window.hlx.codeBasePath}/styles/floating-concierge.css`);

  const launcher = buildLauncher();
  const { panel, body, close } = buildPanel();
  document.body.append(launcher, panel);

  let conciergeMounted = false;

  const open = () => {
    panel.hidden = false;
    launcher.classList.add('is-open');
    document.body.classList.add('floating-concierge-open');
    if (!conciergeMounted) {
      conciergeMounted = true;
      mountBrandConcierge(body);
    }
  };

  const minimize = () => {
    panel.hidden = true;
    launcher.classList.remove('is-open');
    document.body.classList.remove('floating-concierge-open');
  };

  launcher.addEventListener('click', () => {
    if (panel.hidden) open();
    else minimize();
  });
  close.addEventListener('click', minimize);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) minimize();
  });
}
