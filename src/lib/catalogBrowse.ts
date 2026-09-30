export type BrowseItem = { id: string; title: string; nativeTitle?: string; artistOrSource: string; category: string; difficulty: string; tempoBpm: number };
export type BrowseOptions = { query: string; category: string; difficulty: string; sort: 'title' | 'tempo'; page: number };
export const CATALOG_PAGE_SIZE = 20;
export function browseCatalog<T extends BrowseItem>(items: readonly T[], options: BrowseOptions) {
  const query = options.query.normalize('NFKC').trim().toLocaleLowerCase();
  const matches = items.filter(item => (options.category === 'All' || item.category === options.category)
    && (options.difficulty === 'All' || item.difficulty === options.difficulty)
    && `${item.title} ${item.nativeTitle ?? ''} ${item.artistOrSource}`.normalize('NFKC').toLocaleLowerCase().includes(query))
    .sort((a, b) => (options.sort === 'tempo' ? a.tempoBpm - b.tempoBpm : 0) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(matches.length / CATALOG_PAGE_SIZE));
  const page = Math.min(pages - 1, Math.max(0, Number.isFinite(options.page) ? Math.floor(options.page) : 0));
  return { items: matches.slice(page * CATALOG_PAGE_SIZE, (page + 1) * CATALOG_PAGE_SIZE), total: matches.length, page, pages };
}
