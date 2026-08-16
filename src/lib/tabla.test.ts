import { describe, expect, it } from "vitest";
import { BASIC_THEKAS, validateBasicTheka } from "./tabla";

describe("basic tabla thekas", () => {
  it("aligns one displayed bol with every matra of its taal", () => {
    expect(Object.keys(BASIC_THEKAS).every((id) => validateBasicTheka(id as keyof typeof BASIC_THEKAS))).toBe(true);
  });
});
