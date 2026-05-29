const ALLOY_SRC = 'https://cdn1.adoberesources.net/alloy/2.30.1-beta.15/alloy.min.js';
const BC_CLIENT_SRC = 'https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js';

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
  window.__alloyNS = window.__alloyNS || [];
  window.__alloyNS.push('alloy');
  const queue = [];
  window.alloy = function alloyStub(...args) {
    return new Promise((resolve, reject) => { queue.push([resolve, reject, args]); });
  };
  window.alloy.q = queue;
}

/**
 * Loads an external script via DOM injection. Scripts injected at runtime
 * by code already trusted under the CSP nonce are permitted by
 * 'strict-dynamic', so no nonce attribute is required here.
 * @param {string} src
 * @returns {Promise<void>}
 */
function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.append(script);
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
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const mount = document.createElement('div');
  mount.id = 'brand-concierge-mount';
  block.textContent = '';
  block.append(mount);

  installAlloyStub();

  try {
    await Promise.all([
      loadExternalScript(ALLOY_SRC),
      loadExternalScript(BC_CLIENT_SRC),
    ]);

    window.alloy('configure', ALLOY_CONFIG);
    window.alloy('sendEvent', {});

    bootstrapConcierge(`#${mount.id}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Brand Concierge initialization failed:', error);
  }
}
