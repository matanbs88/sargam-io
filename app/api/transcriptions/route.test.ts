import { describe, expect, it } from "vitest";
import { mockMidiData } from "@/src/lib/mockMidiData";
import { POST } from "./route";

function createRequest(sourceUrl: string): Request {
  return new Request("http://localhost/api/transcriptions", {
    body: JSON.stringify({ sourceUrl }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/transcriptions", () => {
  it("returns the same canonical mock MIDI phrase used by the UI", async () => {
    const response = await POST(
      createRequest("https://youtu.be/sargamAuditFixture"),
    );
    const body = (await response.json()) as {
      sourceUrl: string;
      status: string;
      song: { midiEvents: unknown };
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("provider");
    expect(body.sourceUrl).toBe(
      "https://www.youtube.com/watch?v=sargamAuditFixture",
    );
    expect(body.song.midiEvents).toEqual(mockMidiData.noteEvents);
  });

  it("rejects an unsupported source URL before it reaches the provider", async () => {
    const response = await POST(createRequest("https://example.com/video"));
    expect(response.status).toBe(400);
  });
});
