export type TranscriptionSource = {
  sourceUrl: string;
};

export type TranscriptionStatus = "mock" | "cache_hit" | "provider";

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

/**
 * Canonicalizes supported video links for a future Song_Cache lookup.
 * Shared format validation for intake UI and API boundary. This does not verify
 * that the video exists, is accessible, or has been transcribed.
 */
export function normalizeYouTubeUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl.trim());
    if (parsed.protocol !== "https:" || !YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase()) || parsed.username || parsed.password || parsed.port) {
      return null;
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return /^[a-zA-Z0-9_-]+$/.test(videoId) ? `https://www.youtube.com/watch?v=${videoId}` : null;
    }
    if (parsed.pathname !== '/watch') return null;
    const videoId = parsed.searchParams.get("v");
    return videoId && /^[a-zA-Z0-9_-]+$/.test(videoId) ? `https://www.youtube.com/watch?v=${videoId}` : null;
  } catch {
    return null;
  }
}
