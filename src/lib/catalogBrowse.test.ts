import { describe, expect, it } from 'vitest';
import { browseCatalog, type BrowseOptions } from './catalogBrowse';
import { VERIFIED_REPERTOIRE } from './verifiedRepertoire';
const items = Array.from({ length: 1000 }, (_, n) => ({ id: String(n), title: `Song ${String(n).padStart(4, '0')}`, artistOrSource: 'Composer', category: n % 2 ? 'Riyaz' : 'Traditional', difficulty: 'Beginner', tempoBpm: 60 + n }));
const options: BrowseOptions = { query: '', category: 'All', difficulty: 'All', sort: 'title', page: 0 };
describe('catalog browsing', () => {
  it('limits a thousand-song result to twenty rows', () => { const result = browseCatalog(items, options); expect(result.items).toHaveLength(20); expect(result.pages).toBe(50); expect(result.total).toBe(1000); });
  it('has no duplicate entries across pages', () => { const first = browseCatalog(items, options).items; const second = browseCatalog(items, { ...options, page: 1 }).items; expect(new Set([...first, ...second].map(i => i.id)).size).toBe(40); });
  it('filters and clamps stale page numbers', () => { const result = browseCatalog(items, { ...options, query: 'song 0001', category: 'Riyaz', page: 49 }); expect(result.total).toBe(1); expect(result.page).toBe(0); });
  it('handles no matches without an invalid pager', () => { const result = browseCatalog(items, { ...options, query: 'missing' }); expect(result.items).toEqual([]); expect(result.pages).toBe(1); });
  it('includes only explicitly complete entries without title heuristics', () => {
    const base = items[0];
    const classified = [
      { ...base, id: 'complete', title: 'Opening study', completeness: 'complete' as const },
      { ...base, id: 'excerpt', title: 'Full song', completeness: 'excerpt' as const },
      { ...base, id: 'study', completeness: 'study' as const },
      { ...base, id: 'unknown', completeness: 'unknown' as const },
      { ...base, id: 'missing', title: 'Complete piece' },
    ];
    expect(browseCatalog(classified, { ...options, fullOnly: true }).items.map(item => item.id)).toEqual(['complete']);
    expect(browseCatalog(classified, options).total).toBe(5);
    expect(browseCatalog(classified, { ...options, fullOnly: false }).total).toBe(5);
  });
  it('combines full-only with search, collection, level and tempo sort before pagination', () => {
    const classified = items.map((item, index) => ({ ...item, completeness: index % 3 === 0 ? 'complete' as const : 'excerpt' as const }));
    const filtered = { ...options, query: 'song 00', category: 'Riyaz', difficulty: 'Beginner', sort: 'tempo' as const, fullOnly: true };
    const expected = classified.filter(item => item.completeness === 'complete' && item.category === 'Riyaz' && item.title.includes('Song 00'));
    const result = browseCatalog(classified, filtered);
    expect(result.total).toBe(expected.length);
    expect(result.items).toEqual(expected.slice(0, 20));
    expect(browseCatalog(classified, { ...filtered, page: 49 }).page).toBe(0);
    expect(browseCatalog(classified, { ...filtered, difficulty: 'Advanced' }).total).toBe(0);
  });
  it('paginates complete entries without duplicates and clamps a stale page', () => {
    const classified = items.map((item, index) => ({ ...item, completeness: index < 41 ? 'complete' as const : 'unknown' as const }));
    const filtered = { ...options, fullOnly: true };
    const first = browseCatalog(classified, filtered);
    const second = browseCatalog(classified, { ...filtered, page: 1 });
    const last = browseCatalog(classified, { ...filtered, page: 49 });
    expect(first.total).toBe(41);
    expect(first.pages).toBe(3);
    expect(new Set([...first.items, ...second.items].map(item => item.id)).size).toBe(40);
    expect(last.page).toBe(2);
    expect(last.items).toHaveLength(1);
  });
  it('returns an empty valid pager when no entries are explicitly complete', () => {
    expect(browseCatalog(items, { ...options, fullOnly: true, page: 49 })).toEqual({ items: [], total: 0, pages: 1, page: 0 });
  });
  it('marks every registered verified entry complete', () => {
    expect(VERIFIED_REPERTOIRE.length).toBeGreaterThan(0);
    expect(VERIFIED_REPERTOIRE.every(item => item.completeness === 'complete')).toBe(true);
    expect(browseCatalog(VERIFIED_REPERTOIRE, { ...options, fullOnly: true }).total).toBe(VERIFIED_REPERTOIRE.length);
  });
});
