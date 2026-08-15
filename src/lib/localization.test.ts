import { describe, expect, it } from "vitest";
import { getDictionary } from "./localization";

describe("getDictionary", () => {
  it("returns the requested local UI dictionary", () => {
    expect(getDictionary("en").hero.transcribe).toBe("Transcribe");
    expect(getDictionary("hi").navigation.credits).toBe("क्रेडिट");
  });
});
