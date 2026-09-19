import { BigshipClient, type BigshipConfig } from '@agamya/bigship-sdk';

const clientCache = new Map<string, { client: BigshipClient; createdAt: number }>();
const CLIENT_TTL = 10 * 60 * 1000;

function hashCredentials(creds: BigshipConfig): string {
  return `${creds.baseURL}::${creds.userName}::${creds.password}::${creds.accessKey}::${creds.timeout ?? ''}::${creds.maxRetries ?? ''}::${creds.retryDelay ?? ''}::${creds.maxRetryDelay ?? ''}::${creds.tokenTtlMs ?? ''}::${creds.retryOnStatusCodes?.join(',') ?? ''}`;
}

export function getOrCreateClient(creds: BigshipConfig): BigshipClient {
  cleanupExpired();

  const key = hashCredentials(creds);
  const cached = clientCache.get(key);

  if (cached && Date.now() - cached.createdAt < CLIENT_TTL) {
    return cached.client;
  }

  const client = new BigshipClient({
    ...creds,
    enableDetailedLogging: creds.enableDetailedLogging ?? false,
  });
  clientCache.set(key, { client, createdAt: Date.now() });
  return client;
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of clientCache) {
    if (now - entry.createdAt > CLIENT_TTL) clientCache.delete(key);
  }
}
