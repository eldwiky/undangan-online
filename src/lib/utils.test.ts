import { describe, it, expect } from "vitest";
import { calculateCountdown } from "./utils";

describe("calculateCountdown", () => {
  it("should return isPast=true with all zeros when event date is in the past", () => {
    const eventDate = new Date("2023-01-01T00:00:00Z");
    const now = new Date("2024-01-01T00:00:00Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it("should return isPast=true when event date equals now", () => {
    const date = new Date("2024-06-15T10:00:00Z");

    const result = calculateCountdown(date, date);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it("should calculate correct countdown for exactly 1 day ahead", () => {
    const now = new Date("2024-06-15T10:00:00Z");
    const eventDate = new Date("2024-06-16T10:00:00Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: false,
    });
  });

  it("should calculate correct countdown for hours, minutes, and seconds", () => {
    const now = new Date("2024-06-15T10:00:00Z");
    // 2 hours, 30 minutes, 45 seconds ahead
    const eventDate = new Date("2024-06-15T12:30:45Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 0,
      hours: 2,
      minutes: 30,
      seconds: 45,
      isPast: false,
    });
  });

  it("should calculate correct countdown for multiple days with time components", () => {
    const now = new Date("2024-06-15T10:00:00Z");
    // 3 days, 5 hours, 20 minutes, 10 seconds ahead
    const eventDate = new Date("2024-06-18T15:20:10Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 3,
      hours: 5,
      minutes: 20,
      seconds: 10,
      isPast: false,
    });
  });

  it("should return isPast=false with non-negative values for future dates", () => {
    const now = new Date("2024-01-01T00:00:00Z");
    const eventDate = new Date("2024-12-31T23:59:59Z");

    const result = calculateCountdown(eventDate, now);

    expect(result.isPast).toBe(false);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeLessThan(24);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeLessThan(60);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
    expect(result.seconds).toBeLessThan(60);
  });

  it("should handle 1 second in the future", () => {
    const now = new Date("2024-06-15T10:00:00Z");
    const eventDate = new Date("2024-06-15T10:00:01Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      isPast: false,
    });
  });

  it("should handle 1 second in the past", () => {
    const now = new Date("2024-06-15T10:00:01Z");
    const eventDate = new Date("2024-06-15T10:00:00Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it("should correctly decompose total time difference", () => {
    const now = new Date("2024-06-15T00:00:00Z");
    const eventDate = new Date("2024-06-15T23:59:59Z");

    const result = calculateCountdown(eventDate, now);

    expect(result).toEqual({
      days: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
      isPast: false,
    });
  });
});
