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
    <span class="brand-concierge-dot" aria-hidden="true"></span>
    <span class="brand-concierge-label">Brand Concierge</span>
    <span class="brand-concierge-status">AI Assistant</span>
  `;

  const frame = document.createElement('div');
  frame.className = 'brand-concierge-frame';

  panel.append(bar, frame);
  block.append(panel);

  mountBrandConcierge(frame);
}
