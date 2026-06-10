/*
 * Swaps Brand Concierge's default "thinking" loading dots for a playful,
 * on-brand bouncing sock animation.
 *
 * Brand Concierge renders a loading bubble in light DOM whenever it is
 * generating a response:
 *
 *   <div class="chat-message concierge-message new-message">
 *     <div class="message-content message-loading">
 *       <div class="loading-dots"> … 3 × .loading-dot … </div>
 *       <div> Generating response… </div>   // optional
 *     </div>
 *   </div>
 *
 * Brand Concierge later looks the bubble back up via `.message-loading` to
 * remove it once the answer arrives, so we keep that container intact and only
 * replace the inner `.loading-dots` with our socks. A single MutationObserver
 * per mount covers every integration (inline block, invocation modal, floating
 * widget) since they all render into one shared `#brand-concierge-mount`.
 */

const SOCK = '\u{1F9E6}';
const SOCK_COUNT = 3;
const STYLE_ID = 'concierge-sock-loader-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .sock-loader {
      display: inline-flex;
      align-items: flex-end;
      gap: 6px;
    }
    .sock-loader-sock {
      display: inline-block;
      font-size: 24px;
      line-height: 1;
      transform-origin: 50% 90%;
      filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.18));
      animation: sock-loader-bounce 1.1s ease-in-out infinite;
    }
    .sock-loader-sock:nth-child(2) { animation-delay: 0.16s; }
    .sock-loader-sock:nth-child(3) { animation-delay: 0.32s; }
    @keyframes sock-loader-bounce {
      0%, 100% { transform: translateY(0) rotate(-10deg); }
      30% { transform: translateY(-11px) rotate(10deg); }
      60% { transform: translateY(0) rotate(-4deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .sock-loader-sock { animation: none; }
    }
  `;
  document.head.append(style);
}

function buildSockLoader() {
  const wrap = document.createElement('div');
  wrap.className = 'sock-loader';
  wrap.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < SOCK_COUNT; i += 1) {
    const sock = document.createElement('span');
    sock.className = 'sock-loader-sock';
    sock.textContent = SOCK;
    wrap.append(sock);
  }
  return wrap;
}

function decorateLoading(el) {
  if (el.dataset.sockLoader) return;
  el.dataset.sockLoader = 'true';
  const dots = el.querySelector('.loading-dots');
  const socks = buildSockLoader();
  if (dots) dots.replaceWith(socks);
  else el.prepend(socks);
}

function scan(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (node.matches?.('.message-loading')) decorateLoading(node);
  node.querySelectorAll?.('.message-loading').forEach(decorateLoading);
}

/**
 * Starts watching a Brand Concierge mount for loading bubbles and replaces
 * their dots with the sock animation. Safe to call multiple times per mount.
 *
 * @param {Element} root the element Brand Concierge renders into
 */
export default function initConciergeSockLoader(root) {
  if (!root || root.dataset.sockLoaderObserved) return;
  root.dataset.sockLoaderObserved = 'true';

  injectStyles();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(scan);
    });
  });
  observer.observe(root, { childList: true, subtree: true });

  // Catch a bubble that may already be present when we attach.
  scan(root);
}
