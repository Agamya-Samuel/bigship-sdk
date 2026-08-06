import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryManager } from '../RetryManager';
import { EventDispatcher } from '../../infrastructure/EventDispatcher';
import { BigshipApiError, BigshipAuthError, BigshipNetworkError } from '../../errors';
import { BigshipError } from '../../core/types';
import type { BigshipConfig, RequestContext } from '../../core/types';

function createConfig(overrides: Partial<BigshipConfig> = {}): BigshipConfig {
  return {
    baseURL: 'https://api.test.com',
    userName: 'test',
    password: 'test',
    accessKey: 'test',
    maxRetries: 3,
    retryDelay: 10, // fast for tests
    retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
    ...overrides,
  };
}

const ctx: RequestContext = { endpoint: '/api/test', method: 'POST', startTime: Date.now() };

describe('RetryManager', () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    dispatcher = new EventDispatcher(createConfig());
  });

  it('returns result on first success', async () => {
    const rm = new RetryManager(createConfig(), dispatcher);
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await rm.executeWithRetry(fn, ctx);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on BigshipNetworkError and succeeds', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 2, retryDelay: 1 }), dispatcher);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipNetworkError('ECONNREFUSED'))
      .mockResolvedValue('ok');
    const result = await rm.executeWithRetry(fn, ctx);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 status code and succeeds', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 2, retryDelay: 1 }), dispatcher);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipApiError('Server Error', 500))
      .mockResolvedValue('ok');
    const result = await rm.executeWithRetry(fn, ctx);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 400 client error', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 3, retryDelay: 1 }), dispatcher);
    const err = new BigshipApiError('Bad Request', 400);
    const fn = vi.fn().mockRejectedValue(err);
    await expect(rm.executeWithRetry(fn, ctx)).rejects.toThrow('Bad Request');
    expect(fn).toHaveBeenCalledTimes(1); // no retries
  });

  it('does NOT retry on 401 auth error', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 3, retryDelay: 1 }), dispatcher);
    const fn = vi.fn().mockRejectedValue(new BigshipAuthError());
    await expect(rm.executeWithRetry(fn, ctx)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws last error after maxRetries exhausted', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 2, retryDelay: 1 }), dispatcher);
    const err = new BigshipNetworkError('timeout');
    const fn = vi.fn().mockRejectedValue(err);
    await expect(rm.executeWithRetry(fn, ctx)).rejects.toThrow('timeout');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('wraps non-BigshipError in BigshipNetworkError with cause', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 0 }), dispatcher);
    const original = new Error('socket hang up');
    const fn = vi.fn().mockRejectedValue(original);
    try {
      await rm.executeWithRetry(fn, ctx);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipNetworkError);
      expect((err as BigshipNetworkError).cause).toBe(original);
    }
  });

  it('wraps non-Error values in BigshipNetworkError without cause', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 0 }), dispatcher);
    const fn = vi.fn().mockRejectedValue('string error');
    try {
      await rm.executeWithRetry(fn, ctx);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipNetworkError);
      expect((err as BigshipNetworkError).message).toBe('Unknown error occurred');
    }
  });

  it('respects custom retryOnStatusCodes', async () => {
    const rm = new RetryManager(createConfig({ retryOnStatusCodes: [503], maxRetries: 2, retryDelay: 1 }), dispatcher);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipApiError('Service Unavailable', 503))
      .mockResolvedValue('ok');
    const result = await rm.executeWithRetry(fn, ctx);
    expect(result).toBe('ok');

    // 429 not in custom list, should NOT retry
    const fn2 = vi.fn().mockRejectedValue(new BigshipApiError('Rate limited', 429));
    await expect(rm.executeWithRetry(fn2, ctx)).rejects.toThrow('Rate limited');
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('dispatches retry event with correct attempt number', async () => {
    const onRetry = vi.fn();
    const cfg = createConfig({ maxRetries: 2, retryDelay: 1, onRetry });
    const disp = new EventDispatcher(cfg);
    const rm = new RetryManager(cfg, disp);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipNetworkError('fail'))
      .mockResolvedValue('ok');
    await rm.executeWithRetry(fn, ctx);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(
      1, // attempt
      expect.any(BigshipNetworkError),
      expect.objectContaining({ endpoint: '/api/test', attempt: 1 })
    );
  });

  it('does NOT retry on 5xx when removed from retryOnStatusCodes', async () => {
    const rm = new RetryManager(createConfig({ retryOnStatusCodes: [429], maxRetries: 3, retryDelay: 1 }), dispatcher);
    const fn = vi.fn().mockRejectedValue(new BigshipApiError('Internal Error', 500));
    await expect(rm.executeWithRetry(fn, ctx)).rejects.toThrow('Internal Error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses default config values when none provided', async () => {
    const config: BigshipConfig = {
      baseURL: 'https://api.test.com',
      userName: 'test',
      password: 'test',
      accessKey: 'test',
    };
    const rm = new RetryManager(config, dispatcher);
    const fn = vi.fn().mockRejectedValue(new BigshipNetworkError('fail'));
    await expect(rm.executeWithRetry(fn, ctx)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(4); // 1 + 3 default retries
  });

  it('respects maxRetryDelay cap', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 1, retryDelay: 100000, maxRetryDelay: 5 }), dispatcher);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipNetworkError('fail'))
      .mockResolvedValue('ok');
    const start = Date.now();
    const result = await rm.executeWithRetry(fn, ctx);
    const elapsed = Date.now() - start;
    expect(result).toBe('ok');
    expect(elapsed).toBeLessThan(5000);
  });

  it('wraps unknown thrown values in BigshipNetworkError', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 0 }), dispatcher);
    const fn = vi.fn().mockRejectedValue(42);
    try {
      await rm.executeWithRetry(fn, ctx);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipNetworkError);
      expect((err as BigshipNetworkError).message).toBe('Unknown error occurred');
    }
  });

  it('retries multiple times and eventually succeeds', async () => {
    const rm = new RetryManager(createConfig({ maxRetries: 3, retryDelay: 1 }), dispatcher);
    const fn = vi.fn()
      .mockRejectedValueOnce(new BigshipNetworkError('fail1'))
      .mockRejectedValueOnce(new BigshipNetworkError('fail2'))
      .mockRejectedValueOnce(new BigshipNetworkError('fail3'))
      .mockResolvedValue('ok');
    const result = await rm.executeWithRetry(fn, ctx);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
