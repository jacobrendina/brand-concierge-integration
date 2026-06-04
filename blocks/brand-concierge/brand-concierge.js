export default function decorate(block) {
  const mount = document.createElement('div');
  mount.setAttribute('id', 'brand-concierge-mount');
  block.append(mount);

  window.adobe.concierge.bootstrap({
    instanceName: "alloy",
    stylingConfigurations: window.styleConfiguration,
    selector: "#brand-concierge-mount",
    stickySession: false
  });
}