/** Five real seconds of preparation, independent of the selected playback speed. */
export function previewPixelsPerSecond(distance: number, playbackRate: number) {
  const rate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
  return Math.max(1, distance) / (5 * rate);
}
