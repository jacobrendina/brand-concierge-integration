export default function decorate(block) {
  block.setAttribute('id', 'brand-concierge-mount');

  window.adobe.concierge.bootstrap({
    instanceName: "alloy",
    stylingConfigurations: window.styleConfiguration,
    selector: "#brand-concierge-mount",
    stickySession: false
  });
}
