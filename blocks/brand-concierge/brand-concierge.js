// Step 1 source: Adobe Experience Platform Web SDK (alloy)
const ALLOY_SRC = 'https://cdn1.adoberesources.net/alloy/2.30.1-beta.15/alloy.min.js';

// Step 2 source: Brand Concierge Web Client
const BC_CLIENT_SRC = 'https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js';

// Step 3 configuration: Web SDK settings consumed by alloy('configure', ...)
const ALLOY_CONFIG = {
  defaultConsent: 'in',
  edgeDomain: 'edge-int.adobedc.net',
  edgeBasePath: 'ee',
  datastreamId: '4ad3b263-7c37-4c5c-aaaa-9b41ea12a715',
  orgId: '0F211E64690BA86B0A494136@AdobeOrg',
  debugEnabled: true,
  idMigrationEnabled: false,
  thirdPartyCookiesEnabled: false,
  prehidingStyle: '.personalization-container { opacity: 0 !important }',
  onBeforeEventSend: (options) => {
    const params = new URLSearchParams(window.location.search);
    options.xdm.web.webPageDetails.name = params.get('title') || 'your-page-name';
    return true;
  },
};

/**
 * Defines the global `window.alloy` queue stub so calls made before
 * `alloy.min.js` finishes loading are buffered and replayed.
 */
function installAlloyStub() {
  if (window.alloy) return;
  // eslint-disable-next-line no-underscore-dangle
  window.__alloyNS = window.__alloyNS || [];
  // eslint-disable-next-line no-underscore-dangle
  window.__alloyNS.push('alloy');
  const queue = [];
  window.alloy = function alloyStub(...args) {
    return new Promise((resolve, reject) => { queue.push([resolve, reject, args]); });
  };
  window.alloy.q = queue;
}

/**
 * Injects an external script into <head>. Uses `async = false` so that two
 * scripts injected back-to-back execute in DOM order (matching the documented
 * "Web SDK first, Web Client second" requirement). Scripts injected at runtime
 * by code already trusted under the CSP nonce are permitted by 'strict-dynamic',
 * so no nonce attribute is required here.
 * @param {string} src
 * @returns {Promise<void>} resolves when the script has loaded and executed
 */
function injectHeadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.head.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      }
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.append(script);
  });
}

/**
 * Resolves once the page has fully loaded (or immediately if already loaded),
 * so that Brand Concierge initialization happens after the page is ready.
 * @returns {Promise<void>}
 */
function pageLoaded() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
}

function bootstrapConcierge(selector) {
  if (!window.adobe?.concierge?.bootstrap) {
    // eslint-disable-next-line no-console
    console.error('Brand Concierge web client did not register window.adobe.concierge.bootstrap');
    return;
  }
  window.adobe.concierge.bootstrap({
    instanceName: 'alloy',
    stylingConfigurations: window.styleConfiguration || {},
    selector,
  });
}

/**
 * loads and decorates the brand concierge block
 *
 * Follows Adobe's documented 5-step Brand Concierge integration:
 *   1. Inject Web SDK script into <head>
 *   2. Inject Brand Concierge Web Client script into <head>, after the Web SDK
 *   3. Configure the Web SDK
 *   4. Initialize Brand Concierge after the page loads
 *   5. Add the mount point element where Brand Concierge will render
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Step 5: Add Mount Point Element
  // Sized inline so layout is established before BC measures it; the block CSS
  // file may not have applied yet (loadBlock races CSS and JS).
  const mount = document.createElement('div');
  mount.id = 'brand-concierge-mount';
  mount.style.width = '600px';
  mount.style.minHeight = '600px';
  block.textContent = '';
  block.append(mount);

  // Install the alloy queue stub so any alloy() calls made before
  // alloy.min.js executes are buffered and replayed in order.
  installAlloyStub();

  try {
    // Step 1: Inject Web SDK into <head>
    const webSdkReady = injectHeadScript(ALLOY_SRC);

    // Step 2: Inject Web Client Script into <head>, after the Web SDK
    // (async=false on both tags preserves execution order)
    const webClientReady = injectHeadScript(BC_CLIENT_SRC);

    // Step 3: Configure Web SDK
    // Calls are queued by the alloy stub and replayed once alloy.min.js executes.
    window.alloy('configure', ALLOY_CONFIG);
    window.alloy('sendEvent', {});

    // Step 4: Initialize Brand Concierge after the page loads
    await Promise.all([webSdkReady, webClientReady, pageLoaded()]);
    bootstrapConcierge(`#${mount.id}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Brand Concierge initialization failed:', error);
  }
}
