import { describe, expect, it } from 'vitest';
import { browseCatalog, type BrowseOptions } from './catalogBrowse';
const items = Array.from({ length: 1000 }, (_, n) => ({ id: String(n), title: `Song ${String(n).padStart(4, '0')}`, artistOrSource: 'Composer', category: n % 2 ? 'Riyaz' : 'Traditional', difficulty: 'Beginner', tempoBpm: 60 + n }));
const options: BrowseOptions = { query: '', category: 'All', difficulty: 'All', sort: 'title', page: 0 };
describe('catalog browsing', () => {
  it('limits a thousand-song result to twenty rows', () => { const result = browseCatalog(items, options); expect(result.items).toHaveLength(20); expect(result.pages).toBe(50); expect(result.total).toBe(1000); });
  it('has no duplicate entries across pages', () => { const first = browseCatalog(items, options).items; const second = browseCatalog(items, { ...options, page: 1 }).items; expect(new Set([...first, ...second].map(i => i.id)).size).toBe(40); });
  it('filters and clamps stale page numbers', () => { const result = browseCatalog(items, { ...options, query: 'song 0001', category: 'Riyaz', page: 49 }); expect(result.total).toBe(1); expect(result.page).toBe(0); });
  it('handles no matches without an invalid pager', () => { const result = browseCatalog(items, { ...options, query: 'missing' }); expect(result.items).toEqual([]); expect(result.pages).toBe(1); });
});
