import { describe, it, expect } from "vitest";
import { generateSlug, ensureUniqueSlug } from "./slug";

describe("generateSlug", () => {
  it("should generate slug from groom and bride names", () => {
    expect(generateSlug("Budi", "Ani")).toBe("budi-ani");
  });

  it("should convert names to lowercase", () => {
    expect(generateSlug("BUDI", "ANI")).toBe("budi-ani");
  });

  it("should replace spaces with dashes", () => {
    expect(generateSlug("Budi Santoso", "Ani Wijaya")).toBe(
      "budi-santoso-ani-wijaya"
    );
  });

  it("should remove special characters", () => {
    expect(generateSlug("Budi's", "Ani@Home")).toBe("budis-anihome");
  });

  it("should trim whitespace from names", () => {
    expect(generateSlug("  Budi  ", "  Ani  ")).toBe("budi-ani");
  });

  it("should collapse multiple dashes into one", () => {
    expect(generateSlug("Budi - Putra", "Ani - Putri")).toBe(
      "budi-putra-ani-putri"
    );
  });

  it("should handle names with multiple spaces", () => {
    expect(generateSlug("Budi   Santoso", "Ani   Wijaya")).toBe(
      "budi-santoso-ani-wijaya"
    );
  });

  it("should handle names with numbers", () => {
    expect(generateSlug("Budi2", "Ani3")).toBe("budi2-ani3");
  });
});

describe("ensureUniqueSlug", () => {
  it("should return baseSlug if not in existing slugs", () => {
    expect(ensureUniqueSlug("budi-ani", [])).toBe("budi-ani");
  });

  it("should return baseSlug if existing slugs do not contain it", () => {
    expect(ensureUniqueSlug("budi-ani", ["other-slug"])).toBe("budi-ani");
  });

  it("should append -1 if baseSlug already exists", () => {
    expect(ensureUniqueSlug("budi-ani", ["budi-ani"])).toBe("budi-ani-1");
  });

  it("should append -2 if baseSlug and baseSlug-1 already exist", () => {
    expect(ensureUniqueSlug("budi-ani", ["budi-ani", "budi-ani-1"])).toBe(
      "budi-ani-2"
    );
  });

  it("should find the next available counter", () => {
    expect(
      ensureUniqueSlug("budi-ani", [
        "budi-ani",
        "budi-ani-1",
        "budi-ani-2",
        "budi-ani-3",
      ])
    ).toBe("budi-ani-4");
  });
});
