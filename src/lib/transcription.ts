export type TranscriptionSource = {
  sourceUrl: string;
};

export type TranscriptionStatus = "mock" | "cache_hit" | "provider";

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

/**
 * Canonicalizes supported video links for a future Song_Cache lookup.
 * Parsing is deliberately server-side at the API boundary; browser input is
 * always untrusted.
 */
export function normalizeYouTubeUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl.trim());
    if (parsed.protocol !== "https:" || !YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
    }

    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  } catch {
    return null;
  }
}
