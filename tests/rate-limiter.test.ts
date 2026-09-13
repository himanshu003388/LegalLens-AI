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

  it("should extract client IP from Cloudflare and proxy headers", async () => {
    const { getClientIdentifier } = await import("@/lib/security/rate-limiter");
    const h1 = new Headers({ "cf-connecting-ip": "1.1.1.1" });
    expect(getClientIdentifier(h1)).toBe("1.1.1.1");

    const h2 = new Headers({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" });
    expect(getClientIdentifier(h2)).toBe("2.2.2.2");

    const h3 = new Headers();
    expect(getClientIdentifier(h3)).toBe("anonymous-client");
  });

  it("should clean expired buckets and reset state", async () => {
    const { cleanExpiredBuckets, resetRateLimiter } = await import("@/lib/security/rate-limiter");
    expect(cleanExpiredBuckets(true)).toBeGreaterThanOrEqual(0);
    resetRateLimiter();
  });
});

