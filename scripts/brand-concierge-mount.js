/*
 * Shared Brand Concierge mounting helper.
 *
 * Every UI integration (inline block, agent-invocation modal, floating widget)
 * routes through here so there is exactly one `#brand-concierge-mount` element
 * and Brand Concierge is bootstrapped a single time per page. Callers that show
 * and hide their UI (modal, floating panel) can keep the live instance in the
 * DOM and simply toggle visibility, preserving the conversation across re-opens.
 */

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
 * @param {Element} container element that should host the agent
 * @returns {Promise<Element>} the mount element
 */
export default async function mountBrandConcierge(container) {
  if (mountEl) {
    return mountEl;
  }

  mountEl = document.createElement('div');
  mountEl.id = MOUNT_ID;
  container.append(mountEl);

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
