import "server-only";

import type { CompletedTranscription } from "./contracts";

export type CachedSong = CompletedTranscription & {
  sourceUrl: string;
  sourceFingerprint: string;
  createdAt: Date;
};

/**
 * Persistence boundary. A PostgreSQL implementation replaces this interface
 * without changing the route handler or a transcription provider.
 */
export interface SongCache {
  findBySourceUrl(sourceUrl: string): Promise<CachedSong | null>;
  save(song: CachedSong): Promise<void>;
}

export class InMemorySongCache implements SongCache {
  private readonly bySourceUrl = new Map<string, CachedSong>();

  async findBySourceUrl(sourceUrl: string): Promise<CachedSong | null> {
    return this.bySourceUrl.get(sourceUrl) ?? null;
  }

  async save(song: CachedSong): Promise<void> {
    this.bySourceUrl.set(song.sourceUrl, song);
  }
}

