import { PUBLIC_DOMAIN_CATALOG } from '@/src/lib/publicDomainCatalog';

const candidate = PUBLIC_DOMAIN_CATALOG.find(song => song.id === 'pd-ode-to-joy-theme');
if (!candidate?.noteEvents?.length) throw new Error('Design lab requires the canonical Ode to Joy study.');
export const PILOT = candidate;
export const PILOT_EVENTS = candidate.noteEvents;
