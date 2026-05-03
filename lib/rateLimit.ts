type RateLimitOptions = {
  endpoint: string;
  limit: number;
  windowMs: number;
  userId: string;
};

const requests = new Map<string, number[]>();

export function checkRateLimit({
  endpoint,
  limit,
  windowMs,
  userId,
}: RateLimitOptions) {
  const now = Date.now();
  const key = `${userId}:${endpoint}`;
  const recentRequests = (requests.get(key) || []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recentRequests.length >= limit) {
    requests.set(key, recentRequests);
    return false;
  }

  recentRequests.push(now);
  requests.set(key, recentRequests);
  return true;
}
