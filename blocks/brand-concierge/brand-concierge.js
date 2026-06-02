export default function decorate(block) {
  const mount = document.createElement('div');
  mount.setAttribute('id', 'brand-concierge-mount');
  block.append(mount);
}