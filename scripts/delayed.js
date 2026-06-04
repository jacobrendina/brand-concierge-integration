import { getMetadata } from './aem.js';

// add delayed functionality here

// Metadata-powered floating Brand Concierge widget.
// Enable per page with metadata `brand-concierge` set to `floating` or `true`.
const conciergeMode = getMetadata('brand-concierge').trim().toLowerCase();
if (conciergeMode === 'floating' || conciergeMode === 'true') {
  import('./floating-concierge.js').then(({ default: initFloatingConcierge }) => {
    initFloatingConcierge();
  });
}
