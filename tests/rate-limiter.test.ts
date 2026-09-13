import { describe, it, expect } from "vitest";
import { checkRateLimit, RateLimiterOptions } from "@/lib/security/rate-limiter";

describe("Token Bucket Rate Limiter", () => {
  it("should permit requests within capacity limit", () => {
    const config: RateLimiterOptions = { capacity: 3, refillRate: 1 };
    const clientId = `test_client_${Date.now()}_1`;

    const r1 = checkRateLimit(clientId, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(clientId, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(clientId, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("should block requests once burst capacity is exhausted", () => {
    const config: RateLimiterOptions = { capacity: 2, refillRate: 0.1 };
    const clientId = `test_client_${Date.now()}_2`;

    checkRateLimit(clientId, config); // 1 left
    checkRateLimit(clientId, config); // 0 left

    const blocked = checkRateLimit(clientId, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
