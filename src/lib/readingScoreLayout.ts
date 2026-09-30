/** Reflow measures to available width, then use spare height without huge glyphs. */
export function readingScoreLayout(width: number, height: number, barCount: number, minimumBarWidth = 240) {
  const columns = Math.max(1, Math.min(Math.max(1, barCount), Math.floor(Math.max(0, width) / minimumBarWidth)));
  const rows = Math.ceil(Math.max(1, barCount) / columns);
  const rowHeight = Math.max(58, Math.min(96, (Math.max(0, height) - 12 * (rows - 1) - 12) / rows));
  return { columns, rowHeight, fontSize: Math.max(20, Math.min(28, rowHeight * .32)) };
}
