/** Integer backing pixels prevent perpetual bitmap resets at Windows 125%/150% scaling. */
export function canvasResolution(width: number, height: number, deviceRatio: number) {
  const ratio = Math.max(1, Math.min(2, Number.isFinite(deviceRatio) ? deviceRatio : 1));
  const pixelWidth = Math.max(1, Math.round(width * ratio));
  const pixelHeight = Math.max(1, Math.round(height * ratio));
  return { width: pixelWidth, height: pixelHeight, scaleX: pixelWidth / width, scaleY: pixelHeight / height };
}
