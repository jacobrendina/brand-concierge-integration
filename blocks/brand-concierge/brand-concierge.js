import mountBrandConcierge from '../../scripts/brand-concierge-mount.js';

/**
 * Inline Brand Concierge block.
 * Renders a branded, framed panel that embeds the agent directly in the page.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  block.textContent = '';

  const panel = document.createElement('div');
  panel.className = 'brand-concierge-panel';

  const bar = document.createElement('div');
  bar.className = 'brand-concierge-bar';
  bar.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.12 24.7c-.13 0-.26-.03-.38-.08a.97.97 0 0 1-.6-.9V19.5H6.17A4.88 4.88 0 0 1 1.3 14.62V7.47A4.88 4.88 0 0 1 6.17 2.6h5.14a.97.97 0 1 1 0 1.95H6.17A2.93 2.93 0 0 0 3.25 7.47v7.15a2.93 2.93 0 0 0 2.92 2.93h1.95a.97.97 0 0 1 .98.97v2.91l3.75-3.61c.18-.17.42-.27.68-.27h6.3a2.93 2.93 0 0 0 2.92-2.93v-1.65a.97.97 0 1 1 1.95 0v1.65a4.88 4.88 0 0 1-4.87 4.88h-5.9l-5.12 4.93c-.19.18-.43.27-.68.27Z" fill="currentColor"/>
        <path d="M17.26 11.8c-.24 0-.49-.06-.71-.19a1.34 1.34 0 0 1-.69-1.53l.6-2.77-1.9-2.09a1.34 1.34 0 0 1 1.35-2.18l2.76.6 2.1-1.9a1.34 1.34 0 0 1 2.18 1.36l-.6 2.76 1.9 2.1a1.34 1.34 0 0 1-1.43 2.2l-2.76-.6-2.1 1.9c-.26.24-.6.37-.95.37Z" fill="currentColor"/>
      </svg>
    <span class="brand-concierge-label">Ask Sock2U</span>
    <span class="brand-concierge-status">AI Assistant</span>
  `;

  const frame = document.createElement('div');
  frame.className = 'brand-concierge-frame';

  panel.append(bar, frame);
  block.append(panel);

  // The inline block intentionally renders Brand Concierge in its default
  // styling: no neo-brutalist re-skin and no sock loading animation. The shared
  // styleConfiguration still applies.
  mountBrandConcierge(frame, { customStyling: false });
}
