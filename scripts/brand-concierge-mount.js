/*
 * Shared Brand Concierge mounting helper.
 *
 * Every UI integration (inline block, agent-invocation modal, floating widget)
 * routes through here so there is exactly one `#brand-concierge-mount` element
 * and Brand Concierge is bootstrapped a single time per page. Callers that show
 * and hide their UI (modal, floating panel) can keep the live instance in the
 * DOM and simply toggle visibility, preserving the conversation across re-opens.
 */

import { loadCSS } from './aem.js';
import initConciergeSockLoader from './concierge-sock-loader.js';

const MOUNT_ID = 'brand-concierge-mount';
let mountEl = null;
let bootstrapped = false;

/**
 * Resolves once the Brand Concierge runtime loaded in head.html is available.
 * @param {number} timeout maximum time to wait in ms
 * @returns {Promise<boolean>} whether the runtime became available
 */
function whenConciergeReady(timeout = 15000) {
  return new Promise((resolve) => {
    if (window.adobe?.concierge?.bootstrap) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (window.adobe?.concierge?.bootstrap) {
        window.clearInterval(timer);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Mounts Brand Concierge inside the given container.
 *
 * The first caller creates the `#brand-concierge-mount` element and bootstraps
 * the agent. Subsequent callers receive the same element back without
 * re-bootstrapping, so a page should only host a single integration at a time.
 *
 * The `styleConfiguration` from styleconfigurations.js is always passed to the
 * agent. Our extra neo-brutalist re-skin and the sock loading animation are
 * opt-out via `customStyling` so the inline block can render the agent in its
 * unembellished, default styling.
 *
 * @param {Element} container element that should host the agent
 * @param {object} [options] mount options
 * @param {boolean} [options.customStyling=true] apply the site theme overrides
 *   and the sock loading animation
 * @returns {Promise<Element>} the mount element
 */
export default async function mountBrandConcierge(container, { customStyling = true } = {}) {
  if (mountEl) {
    return mountEl;
  }

  mountEl = document.createElement('div');
  mountEl.id = MOUNT_ID;
  container.append(mountEl);

  if (customStyling) {
    // Re-skin Brand Concierge to match the site's neo-brutalist theme.
    loadCSS(`${window.hlx.codeBasePath}/styles/brand-concierge-theme.css`);

    // Replace Brand Concierge's loading dots with a fun sock animation.
    initConciergeSockLoader(mountEl);
  }

  const ready = await whenConciergeReady();
  if (ready && !bootstrapped) {
    bootstrapped = true;
    window.adobe.concierge.bootstrap({
      instanceName: "alloy",
      stylingConfigurations: window.styleConfiguration,
      selector: "#brand-concierge-mount",
      stickySession: false
    });
    alloy("sendEvent", {});
  } else if (!ready) {
    // eslint-disable-next-line no-console
    console.error('Brand Concierge runtime did not load in time.');
  }

  return mountEl;
}
