"use client";
import { useSyncExternalStore } from 'react';

export type PreviewScreen = 'home' | 'library' | 'import' | 'practice';
const changed = 'sargam-preview-navigation';
function readLocation() {
  return window.location.search + window.location.hash;
}
export function parsePreviewLocation(location: string): { screen: PreviewScreen; scoreId: string | null } {
  const [search, hash = ''] = location.split('#');
  const screen = hash === 'library' || hash === 'import' || hash === 'practice' ? hash : 'home';
  return { screen, scoreId: new URLSearchParams(search).get('score') };
}
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
    window.removeEventListener(changed, listener);
  };
}
const serverLocation = () => '';

export function navigatePreview(next: PreviewScreen, scoreId?: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (scoreId === null) params.delete('score');
  else if (scoreId !== undefined) params.set('score', scoreId);
  const search = params.size ? `?${params}` : '';
  const hash = next === 'home' ? '' : `#${next}`;
  if (search + hash === readLocation()) return;
  // Next's history wrapper copies its own state. Passing history.state back
  // includes __NA, which bypasses the router update and leaves a stale URL.
  window.history.pushState(null, '', window.location.pathname + search + hash);
  window.dispatchEvent(new Event(changed));
}

/** Native Back/Forward work without remounting the audio session or filters. */
export function usePreviewNavigation() {
  const location = useSyncExternalStore(subscribe, readLocation, serverLocation);
  return { ...parsePreviewLocation(location), navigate: navigatePreview };
}
