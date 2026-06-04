import mountBrandConcierge from '../../scripts/brand-concierge-mount.js';

const DEFAULTS = {
  eyebrow: 'AI Assistant',
  heading: 'Not sure where to start? Chat with our agent',
  cta: 'Chat with our agent',
  title: 'Brand Concierge',
};

/**
 * Reads optional authored configuration from the block.
 * Row 1: callout heading, Row 2: button label, Row 3: eyebrow label.
 * @param {Element} block the block element
 * @returns {{eyebrow:string, heading:string, cta:string, title:string}}
 */
function readConfig(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')]
    .map((cell) => cell.textContent.trim())
    .filter(Boolean);
  const [heading, cta, eyebrow] = cells;
  return {
    ...DEFAULTS,
    ...(heading ? { heading } : {}),
    ...(cta ? { cta } : {}),
    ...(eyebrow ? { eyebrow } : {}),
  };
}

/**
 * Lazily builds the modal that hosts Brand Concierge. Built once on first open
 * and reused afterwards so the conversation survives minimise / re-open.
 * @param {{title:string}} config
 * @returns {{open:Function}}
 */
function createConciergeModal(config) {
  const overlay = document.createElement('div');
  overlay.className = 'agent-invocation-overlay';
  overlay.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'agent-invocation-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', config.title);

  const header = document.createElement('div');
  header.className = 'agent-invocation-modal-header';
  header.innerHTML = `
    <span class="agent-invocation-modal-dot" aria-hidden="true"></span>
    <span class="agent-invocation-modal-title">${config.title}</span>
  `;

  const controls = document.createElement('div');
  controls.className = 'agent-invocation-modal-controls';

  const minimizeBtn = document.createElement('button');
  minimizeBtn.type = 'button';
  minimizeBtn.className = 'agent-invocation-icon-btn';
  minimizeBtn.setAttribute('aria-label', 'Minimise');
  minimizeBtn.innerHTML = '<span class="agent-invocation-min-icon" aria-hidden="true"></span>';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'agent-invocation-icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<span class="agent-invocation-close-icon" aria-hidden="true"></span>';

  controls.append(minimizeBtn, closeBtn);
  header.append(controls);

  const body = document.createElement('div');
  body.className = 'agent-invocation-modal-body';

  modal.append(header, body);
  overlay.append(modal);

  // floating pill shown while minimised so the user can bring the agent back
  const restore = document.createElement('button');
  restore.type = 'button';
  restore.className = 'agent-invocation-restore';
  restore.hidden = true;
  restore.innerHTML = `
    <span class="agent-invocation-restore-dot" aria-hidden="true"></span>
    <span>${config.title}</span>
  `;

  document.body.append(overlay, restore);

  let conciergeMounted = false;

  const open = () => {
    overlay.hidden = false;
    restore.hidden = true;
    document.body.classList.add('agent-invocation-open');
    if (!conciergeMounted) {
      conciergeMounted = true;
      mountBrandConcierge(body);
    }
  };

  const minimize = () => {
    overlay.hidden = true;
    restore.hidden = false;
    document.body.classList.remove('agent-invocation-open');
  };

  const close = () => {
    overlay.hidden = true;
    restore.hidden = true;
    document.body.classList.remove('agent-invocation-open');
  };

  minimizeBtn.addEventListener('click', minimize);
  closeBtn.addEventListener('click', close);
  restore.addEventListener('click', open);

  // click on the dimmed backdrop minimises (keeps the session alive)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) minimize();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) minimize();
  });

  return { open };
}

/**
 * Agent invocation block: a styled callout with a button that opens Brand
 * Concierge in a large, minimisable modal.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';

  const callout = document.createElement('div');
  callout.className = 'agent-invocation-callout';

  const text = document.createElement('div');
  text.className = 'agent-invocation-text';
  text.innerHTML = `
    <span class="agent-invocation-eyebrow">${config.eyebrow}</span>
    <p class="agent-invocation-heading">${config.heading}</p>
  `;

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'button accent agent-invocation-cta';
  cta.textContent = config.cta;

  callout.append(text, cta);
  block.append(callout);

  let modal = null;
  cta.addEventListener('click', () => {
    if (!modal) modal = createConciergeModal(config);
    modal.open();
  });
}
