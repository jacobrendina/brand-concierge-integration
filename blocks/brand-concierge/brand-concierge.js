import { loadCSS } from '../../scripts/aem.js';

/**
 * Brand Concierge block.
 * Makes the block the agent mount point and starts Brand Concierge.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  block.id = 'brand-concierge-mount';
  window.adobe.concierge.bootstrap({
    instanceName: 'alloy',
    stylingConfigurations: window.styleConfiguration,
    selector: '#brand-concierge-mount',
    stickySession: false,
  });
}
