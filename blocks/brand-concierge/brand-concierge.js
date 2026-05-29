/**
 * loads and decorates the brand concierge block
 *
 * Renders a mount point element that an external Brand Concierge
 * application can attach to.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const mount = document.createElement('div');
  mount.id = 'brand-concierge-mount';

  block.textContent = '';
  block.append(mount);
}
