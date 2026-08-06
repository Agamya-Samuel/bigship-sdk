import { describe, it, expect, vi } from 'vitest';
import { EventDispatcher } from '../EventDispatcher';
import type { BigshipConfig, ApiResponse, RequestContext, BigshipError } from '../../core/types';
import type { InternalAxiosRequestConfig } from 'axios';

function createConfig(hooks: Partial<BigshipConfig> = {}): BigshipConfig {
  return {
    baseURL: 'https://api.test.com',
    userName: 'test',
    password: 'test',
    accessKey: 'test',
    ...hooks,
  };
}

const response: ApiResponse<unknown> = { success: true, message: 'ok', responseCode: 200, data: 'test' };
const context: RequestContext = { endpoint: '/api/test', method: 'GET', startTime: Date.now() };

describe('EventDispatcher', () => {
  it('dispatches onResponse hook', async () => {
    const onResponse = vi.fn();
    const ed = new EventDispatcher(createConfig({ onResponse }));
    await ed.dispatchResponse(response, context);
    expect(onResponse).toHaveBeenCalledWith(response, context);
  });

  it('dispatches async onResponse hook', async () => {
    const onResponse = vi.fn().mockResolvedValue(undefined);
    const ed = new EventDispatcher(createConfig({ onResponse }));
    await ed.dispatchResponse(response, context);
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it('dispatches onError hook', async () => {
    const onError = vi.fn();
    const ed = new EventDispatcher(createConfig({ onError }));
    const error = { message: 'fail', statusCode: 500 } as unknown as BigshipError;
    await ed.dispatchError(error, context);
    expect(onError).toHaveBeenCalledWith(error, context);
  });

  it('dispatches onRetry hook', async () => {
    const onRetry = vi.fn();
    const ed = new EventDispatcher(createConfig({ onRetry }));
    const error = { message: 'fail', statusCode: 500 } as unknown as BigshipError;
    await ed.dispatchRetry(2, error, context);
    expect(onRetry).toHaveBeenCalledWith(2, error, context);
  });

  it('dispatchBeforeRequest returns modified config', async () => {
    const onBeforeRequest = vi.fn((config: InternalAxiosRequestConfig) => {
      config.headers.set('X-Custom', 'value');
      return config;
    });
    const ed = new EventDispatcher(createConfig({ onBeforeRequest }));
    const config = { headers: { set: vi.fn(), get: vi.fn() } } as unknown as InternalAxiosRequestConfig;
    const result = await ed.dispatchBeforeRequest(config);
    expect(onBeforeRequest).toHaveBeenCalledWith(config);
    expect(result).toBe(config);
  });

  it('returns config unchanged when no onBeforeRequest hook', async () => {
    const ed = new EventDispatcher(createConfig());
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const result = await ed.dispatchBeforeRequest(config);
    expect(result).toBe(config);
  });

  it('does nothing when no hooks registered', async () => {
    const ed = new EventDispatcher(createConfig());
    // Should not throw
    await ed.dispatchResponse(response, context);
    await ed.dispatchError({} as BigshipError, context);
    await ed.dispatchRetry(1, {} as BigshipError, context);
  });

  it('onBeforeRequest re-throws on hook error', async () => {
    const onBeforeRequest = vi.fn().mockRejectedValue(new Error('hook failed'));
    const ed = new EventDispatcher(createConfig({ onBeforeRequest }));
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    await expect(ed.dispatchBeforeRequest(config)).rejects.toThrow('hook failed');
  });

  it('onResponse does not throw on hook error (fire-and-forget)', async () => {
    const onResponse = vi.fn().mockRejectedValue(new Error('hook failed'));
    const ed = new EventDispatcher(createConfig({ onResponse }));
    // Should NOT throw
    await ed.dispatchResponse(response, context);
  });

  it('onError does not throw on hook error (fire-and-forget)', async () => {
    const onError = vi.fn().mockRejectedValue(new Error('hook failed'));
    const ed = new EventDispatcher(createConfig({ onError }));
    await ed.dispatchError({} as BigshipError, context);
    expect(onError).toHaveBeenCalled();
  });

  it('onRetry does not throw on hook error (fire-and-forget)', async () => {
    const onRetry = vi.fn().mockRejectedValue(new Error('hook failed'));
    const ed = new EventDispatcher(createConfig({ onRetry }));
    await ed.dispatchRetry(1, {} as BigshipError, context);
    expect(onRetry).toHaveBeenCalled();
  });

  it('warn uses Logger.warn when logger is provided', async () => {
    const warnSpy = vi.fn();
    const mockLogger = { warn: warnSpy } as any;
    const onResponse = vi.fn().mockRejectedValue(new Error('test'));
    const ed = new EventDispatcher(createConfig({ onResponse }), mockLogger);
    await ed.dispatchResponse(response, context);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('onResponse'),
      expect.objectContaining({ message: 'test' })
    );
  });

  it('warn falls back to console.warn when no logger', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onResponse = vi.fn().mockRejectedValue(new Error('test'));
    const ed = new EventDispatcher(createConfig({ onResponse }));
    await ed.dispatchResponse(response, context);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('onResponse'),
      expect.any(Error)
    );
    consoleWarnSpy.mockRestore();
  });

  it('warn handles non-Error values', async () => {
    const warnSpy = vi.fn();
    const mockLogger = { warn: warnSpy } as any;
    const onResponse = vi.fn().mockRejectedValue('string error');
    const ed = new EventDispatcher(createConfig({ onResponse }), mockLogger);
    await ed.dispatchResponse(response, context);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('onResponse'),
      'string error'
    );
  });
});
