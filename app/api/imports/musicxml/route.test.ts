import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/imports/musicxml", () => {
  it("rejects files that are not MusicXML or MXL", async () => {
    const formData = new FormData();
    formData.set("score", new File(["not-score"], "score.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("http://localhost/api/imports/musicxml", { body: formData, method: "POST" }));

    expect(response.status).toBe(400);
  });
});
