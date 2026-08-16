import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/imports/score-pdf", () => {
  it("keeps the local-only OMR adapter disabled unless explicitly configured", async () => {
    const formData = new FormData();
    formData.set("score", new File(["not-used"], "score.pdf", { type: "application/pdf" }));
    const response = await POST(
      new Request("http://localhost/api/imports/score-pdf", {
        body: formData,
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
  });
});
