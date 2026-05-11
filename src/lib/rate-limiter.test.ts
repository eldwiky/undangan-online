import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, _resetStore } from "./rate-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow the first request", () => {
    const result = checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // default max is 3, so 3-1=2 remaining
  });

  it("should allow requests up to the max limit", () => {
    const result1 = checkRateLimit("user-2");
    const result2 = checkRateLimit("user-2");
    const result3 = checkRateLimit("user-2");

    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("should reject requests exceeding the max limit", () => {
    checkRateLimit("user-3");
    checkRateLimit("user-3");
    checkRateLimit("user-3");

    const result = checkRateLimit("user-3");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should use default max of 3 requests per 60 seconds", () => {
    checkRateLimit("user-4");
    checkRateLimit("user-4");
    checkRateLimit("user-4");

    const blocked = checkRateLimit("user-4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should reset after the time window expires", () => {
    checkRateLimit("user-5");
    checkRateLimit("user-5");
    checkRateLimit("user-5");

    // Advance time past the 60-second window
    vi.advanceTimersByTime(60001);

    const result = checkRateLimit("user-5");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("should track different identifiers independently", () => {
    checkRateLimit("user-a");
    checkRateLimit("user-a");
    checkRateLimit("user-a");

    // user-a is now blocked
    const blockedA = checkRateLimit("user-a");
    expect(blockedA.allowed).toBe(false);

    // user-b should still be allowed
    const resultB = checkRateLimit("user-b");
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(2);
  });

  it("should respect custom maxRequests parameter", () => {
    const result1 = checkRateLimit("user-6", 5);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);

    checkRateLimit("user-6", 5);
    checkRateLimit("user-6", 5);
    checkRateLimit("user-6", 5);
    const result5 = checkRateLimit("user-6", 5);
    expect(result5.allowed).toBe(true);
    expect(result5.remaining).toBe(0);

    const result6 = checkRateLimit("user-6", 5);
    expect(result6.allowed).toBe(false);
    expect(result6.remaining).toBe(0);
  });

  it("should respect custom windowMs parameter", () => {
    checkRateLimit("user-7", 3, 5000); // 5 second window
    checkRateLimit("user-7", 3, 5000);
    checkRateLimit("user-7", 3, 5000);

    const blocked = checkRateLimit("user-7", 3, 5000);
    expect(blocked.allowed).toBe(false);

    // Advance 5 seconds
    vi.advanceTimersByTime(5001);

    const allowed = checkRateLimit("user-7", 3, 5000);
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(2);
  });

  it("should not reset before the window expires", () => {
    checkRateLimit("user-8");
    checkRateLimit("user-8");
    checkRateLimit("user-8");

    // Advance time but not past the window
    vi.advanceTimersByTime(30000); // 30 seconds, window is 60 seconds

    const result = checkRateLimit("user-8");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
