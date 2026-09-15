import type { EventLoopRange } from "./playback";

export function validPracticeRange(start: number, end: number, count: number): EventLoopRange | null {
  return Number.isInteger(start) && Number.isInteger(end) && Number.isInteger(count) &&
    start >= 0 && end >= start && end < count ? { startIndex: start, endIndex: end } : null;
}
export function practiceTime(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, Number.isFinite(milliseconds) ? milliseconds : 0) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
