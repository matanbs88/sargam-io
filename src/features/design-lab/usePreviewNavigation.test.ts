import { afterEach, expect, it, vi } from 'vitest';
import { navigatePreview, parsePreviewLocation } from './usePreviewNavigation';

afterEach(() => vi.unstubAllGlobals());
function browser(hash = '#library') {
  const pushState = vi.fn(), dispatchEvent = vi.fn();
  vi.stubGlobal('window', { location: { hash, pathname: '/living-score', search: '?pilot=1' }, history: { state: { __NA: true }, pushState }, dispatchEvent });
  return { pushState, dispatchEvent };
}
it('lets Next integrate a screen change instead of replaying its private history marker', () => {
  const page = browser();
  navigatePreview('practice');
  expect(page.pushState).toHaveBeenCalledWith(null, '', '/living-score?pilot=1#practice');
  expect(page.dispatchEvent).toHaveBeenCalledOnce();
});
it('bookmarks a catalog ID and removes it for private session imports', () => {
  const page = browser();
  navigatePreview('practice', 'riyaz-alankar-one');
  expect(page.pushState).toHaveBeenCalledWith(null, '', '/living-score?pilot=1&score=riyaz-alankar-one#practice');
  expect(parsePreviewLocation('?score=riyaz-alankar-one#practice')).toEqual({ screen:'practice', scoreId:'riyaz-alankar-one' });
  navigatePreview('practice', null);
  expect(page.pushState).toHaveBeenLastCalledWith(null, '', '/living-score?pilot=1#practice');
});
it('keeps the path and search when returning home', () => {
  const page = browser();
  navigatePreview('home');
  expect(page.pushState).toHaveBeenCalledWith(null, '', '/living-score?pilot=1');
});
it('does not add duplicate history entries for the same screen', () => {
  const page = browser();
  navigatePreview('library');
  expect(page.pushState).not.toHaveBeenCalled();
});
