import { describe, expect, it } from "vitest";
import { normalizeYouTubeUrl } from "./transcription";

describe("normalizeYouTubeUrl", () => {
  it("canonicalizes supported YouTube URL forms", () => {
    expect(normalizeYouTubeUrl("https://youtu.be/abc123?t=20")).toBe("https://www.youtube.com/watch?v=abc123");
    expect(normalizeYouTubeUrl("https://www.youtube.com/watch?v=abc123&feature=share")).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("rejects unsupported or malformed sources", () => {
    expect(normalizeYouTubeUrl("http://youtube.com/watch?v=abc123")).toBeNull();
    expect(normalizeYouTubeUrl("https://example.com/watch?v=abc123")).toBeNull();
    expect(normalizeYouTubeUrl("not a URL")).toBeNull();
  });
  it('does not mislabel channel, playlist, multi-path or credential URLs as videos', () => {
    for (const url of [
      'https://www.youtube.com/playlist?v=abc123',
      'https://www.youtube.com/@channel?v=abc123',
      'https://youtu.be/abc123/extra',
      'https://www.youtube.com/watch?v=a%26b',
      'https://user:password@youtube.com/watch?v=abc123',
      'https://youtube.com:8443/watch?v=abc123',
    ]) expect(normalizeYouTubeUrl(url), url).toBeNull();
  });
});
