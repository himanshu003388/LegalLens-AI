/**
 * @file rate-limiter.ts
 * @description In-memory token bucket rate limiter for API protection.
 * Regulates request velocity per client IP to mitigate denial-of-service and API abuse.
 * Includes automatic periodic eviction of stale buckets to prevent memory leaks.
 */

interface TokenBucket {
  tokens: number;
  lastRefillTimestamp: number;
}

/**
 * In-memory state store mapping client identifiers to token buckets.
 */
const clientBuckets = new Map<string, TokenBucket>();

/**
 * Maximum idle time before an inactive bucket is evicted from memory (10 minutes).
 */
const MAX_BUCKET_IDLE_MS = 10 * 60 * 1000;
let lastCleanupTimestamp = Date.now();

/**
 * Configuration options for the Token Bucket rate limiter.
 */
export interface RateLimiterOptions {
  /** Maximum burst capacity of tokens */
  capacity: number;
  /** Tokens added per second */
  refillRate: number;
}

/**
 * Default limiter configs:
 * - Analysis/Upload: 10 requests per minute burst, refills 1 token every 6 seconds.
 * - Chat: 30 requests per minute burst, refills 1 token every 2 seconds.
 */
export const UPLOAD_LIMIT_CONFIG: RateLimiterOptions = {
  capacity: 10,
  refillRate: 10 / 60, // ~0.166 tokens/sec
};

export const CHAT_LIMIT_CONFIG: RateLimiterOptions = {
  capacity: 30,
  refillRate: 30 / 60, // 0.5 tokens/sec
};

/**
 * Removes inactive client buckets to prevent unbounded memory growth over long server uptime.
 */
export function cleanExpiredBuckets(force: boolean = false): number {
  const now = Date.now();
  if (!force && now - lastCleanupTimestamp < 60_000) {
    return 0; // Run at most once per minute unless forced
  }

  let evicted = 0;
  clientBuckets.forEach((bucket, clientId) => {
    if (now - bucket.lastRefillTimestamp > MAX_BUCKET_IDLE_MS) {
      clientBuckets.delete(clientId);
      evicted++;
    }
  });

  lastCleanupTimestamp = now;
  return evicted;
}

/**
 * Resets all rate limiter state. Primarily used in unit tests for clean isolation.
 */
export function resetRateLimiter(): void {
  clientBuckets.clear();
  lastCleanupTimestamp = Date.now();
}

/**
 * Evaluates whether a client request is permitted under token bucket rate constraints.
 *
 * @param clientId Unique identifier for the client (e.g., IP address or session token)
 * @param options Rate limiter configuration specifying capacity and refill velocity
 * @returns Object with `allowed` flag, `remaining` tokens, and `retryAfterSeconds`
 */
export function checkRateLimit(
  clientId: string,
  options: RateLimiterOptions = UPLOAD_LIMIT_CONFIG
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  cleanExpiredBuckets();

  const now = Date.now();
  let bucket = clientBuckets.get(clientId);

  if (!bucket) {
    bucket = {
      tokens: options.capacity - 1, // Consume 1 token immediately
      lastRefillTimestamp: now,
    };
    clientBuckets.set(clientId, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Calculate elapsed time in seconds and refill tokens
  const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
  bucket.tokens = Math.min(
    options.capacity,
    bucket.tokens + elapsedSeconds * options.refillRate
  );
  bucket.lastRefillTimestamp = now;

  // Check if at least 1 token is available
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Calculate time required to refill 1 token
  const tokensNeeded = 1 - bucket.tokens;
  const retryAfterSeconds = Math.ceil(tokensNeeded / options.refillRate);

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds,
  };
}

/**
 * Extracts a client identifier from request headers (Cloudflare, proxies, x-forwarded-for, x-real-ip)
 * or defaults to a fallback localhost key.
 *
 * @param headers Standard web Request Headers
 * @returns Sanitized client string identifier
 */
export function getClientIdentifier(headers: Headers): string {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headers.get("x-real-ip") || "anonymous-client";
}
