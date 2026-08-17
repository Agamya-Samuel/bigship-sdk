import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../Logger';
import { BigshipApiError } from '../../errors';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('does nothing when disabled', () => {
    const logger = new Logger(false);
    logger.logRequest({ method: 'GET', url: '/test' });
    logger.logResponse({ success: true, message: 'ok', responseCode: 200, data: null });
    logger.logError(new BigshipApiError('fail', 400));
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs request when enabled', () => {
    const logger = new Logger(true);
    logger.logRequest({ method: 'POST', url: '/api/test', data: { key: 'value' } });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Bigship SDK Request]',
      expect.objectContaining({ method: 'POST', url: '/api/test' })
    );
  });

  it('masks Authorization header', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'GET',
      url: '/test',
      headers: { Authorization: 'Bearer real-token-123' },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.headers.Authorization).toBe('Bearer ***');
  });

  it('masks password and access_key in data', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { password: 'secret', access_key: 'key123', normal: 'visible' },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.password).toBe('***');
    expect(logged.data.access_key).toBe('***');
    expect(logged.data.normal).toBe('visible');
  });

  it('deep-sanitizes nested sensitive data', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: {
        outer: {
          inner: {
            password: 'deep-secret',
            safe: 'ok',
          },
        },
      },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.outer.inner.password).toBe('***');
    expect(logged.data.outer.inner.safe).toBe('ok');
  });

  it('truncates long strings', () => {
    const logger = new Logger(true);
    const longString = 'x'.repeat(500);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { file: longString },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.file).toContain('[truncated 500 chars]');
    expect(logged.data.file.length).toBeLessThan(500);
  });

  it('sanitizes nested arrays', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { items: [{ password: 'p1' }, { password: 'p2', name: 'test' }] },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.items[0].password).toBe('***');
    expect(logged.data.items[1].password).toBe('***');
    expect(logged.data.items[1].name).toBe('test');
  });

  it('logs response', () => {
    const logger = new Logger(true);
    logger.logResponse({ success: true, message: 'ok', responseCode: 200, data: 'data' });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Bigship SDK Response]',
      expect.objectContaining({ success: true, hasData: true })
    );
  });

  it('logs error with requestId and endpoint for BigshipApiError', () => {
    const logger = new Logger(true);
    const err = new BigshipApiError('fail', 400, { requestId: 'req-1', endpoint: '/api/test' });
    logger.logError(err);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Bigship SDK Error]',
      expect.objectContaining({ statusCode: 400, requestId: 'req-1', endpoint: '/api/test' })
    );
  });

  it('logs error without requestId/endpoint for non-BigshipApiError', () => {
    const logger = new Logger(true);
    const err = new Error('generic') as any;
    err.statusCode = 500;
    logger.logError(err);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('warn() delegates to adapter.warn when enabled', () => {
    const warnSpy = vi.fn();
    const logger = new Logger(true, { warn: warnSpy });
    logger.warn('test warning', { detail: 'info' });
    expect(warnSpy).toHaveBeenCalledWith('test warning', { detail: 'info' });
  });

  it('warn() does nothing when disabled', () => {
    const warnSpy = vi.fn();
    const logger = new Logger(false, { warn: warnSpy });
    logger.warn('test warning');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warn() uses default console.warn when no custom adapter', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new Logger(true);
    logger.warn('default warn test', { extra: 1 });
    expect(consoleWarnSpy).toHaveBeenCalledWith('default warn test', { extra: 1 });
    consoleWarnSpy.mockRestore();
  });

  it('uses custom adapter for debug/info/warn/error', () => {
    const adapter = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const logger = new Logger(true, adapter);
    logger.logRequest({ method: 'GET', url: '/test' });
    logger.logResponse({ success: true, message: 'ok', responseCode: 200, data: null });
    logger.logError(new BigshipApiError('fail', 400));
    logger.warn('test');
    expect(adapter.debug).toHaveBeenCalled();
    expect(adapter.error).toHaveBeenCalled();
    expect(adapter.warn).toHaveBeenCalled();
  });

  it('returns headers unchanged when no auth header present', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'GET',
      url: '/test',
      headers: { 'Content-Type': 'application/json' },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.headers['Content-Type']).toBe('application/json');
  });

  it('handles undefined headers', () => {
    const logger = new Logger(true);
    logger.logRequest({ method: 'GET', url: '/test' });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.headers).toBeUndefined();
  });

  it('handles undefined data in request', () => {
    const logger = new Logger(true);
    logger.logRequest({ method: 'GET', url: '/test' });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data).toBeUndefined();
  });

  it('returns data unchanged when null', () => {
    const logger = new Logger(true);
    logger.logRequest({ method: 'POST', url: '/test', data: null as any });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data).toBeNull();
  });

  it('returns data unchanged for non-object types', () => {
    const logger = new Logger(true);
    logger.logRequest({ method: 'POST', url: '/test', data: 'raw string' as any });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data).toBe('raw string');
  });

  it('masks lowercase authorization header', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'GET',
      url: '/test',
      headers: { authorization: 'bearer token123' },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.headers.authorization).toBe('bearer ***');
  });

  it('truncates long string values in nested objects', () => {
    const logger = new Logger(true);
    const longStr = 'x'.repeat(300);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { nested: { deep: { value: longStr } } },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.nested.deep.value).toContain('[truncated 300 chars]');
  });

  it('respects depth limit of 5', () => {
    const logger = new Logger(true);
    const deepObj: any = { a: { b: { c: { d: { e: { f: { g: 'too deep' } } } } } } };
    logger.logRequest({ method: 'POST', url: '/test', data: deepObj });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.a.b.c.d.e.f).toBe('[depth limit]');
  });

  it('preserves null/boolean/number values in sanitized data', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { a: null, b: true, c: 42, d: undefined },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.a).toBeNull();
    expect(logged.data.b).toBe(true);
    expect(logged.data.c).toBe(42);
  });

  it('masks token and secret keys', () => {
    const logger = new Logger(true);
    logger.logRequest({
      method: 'POST',
      url: '/test',
      data: { token: 'abc', secret: 'xyz', normal: 'ok' },
    });
    const logged = consoleLogSpy.mock.calls[0][1];
    expect(logged.data.token).toBe('***');
    expect(logged.data.secret).toBe('***');
    expect(logged.data.normal).toBe('ok');
  });

  it('logs response with null data showing hasData: false', () => {
    const logger = new Logger(true);
    logger.logResponse({ success: false, message: 'fail', responseCode: 400, data: null });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Bigship SDK Response]',
      expect.objectContaining({ success: false, hasData: false })
    );
  });
});
