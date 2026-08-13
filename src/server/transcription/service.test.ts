import { describe, expect, it } from "vitest";
import type { CompletedTranscription, TranscriptionProvider } from "./contracts";
import { requestTranscription } from "./service";
import { InMemorySongCache } from "./songCache";

const sourceUrl = "https://www.youtube.com/watch?v=abc123";
const completed: CompletedTranscription = {
  provider: "klangio",
  providerJobId: "job-1",
  providerVersion: "test",
  midiEvents: [{ midi: 60, startMs: 0, durationMs: 320 }],
};

describe("requestTranscription", () => {
  it("calls the provider once and serves the next identical source from cache", async () => {
    let submissionCount = 0;
    const provider: TranscriptionProvider = {
      async submitSource() {
        submissionCount += 1;
        return { provider: "klangio", providerJobId: "job-1", status: "completed" };
      },
      async getJob() {
        return { provider: "klangio", providerJobId: "job-1", status: "completed" };
      },
      async getCompletedTranscription() {
        return completed;
      },
    };
    const cache = new InMemorySongCache();

    expect((await requestTranscription(sourceUrl, cache, provider)).status).toBe("provider");
    expect((await requestTranscription(sourceUrl, cache, provider)).status).toBe("cache_hit");
    expect(submissionCount).toBe(1);
  });
});
