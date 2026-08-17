import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenManager } from '../TokenManager';
import { EventDispatcher } from '../../infrastructure/EventDispatcher';
import { BigshipAuthError, BigshipValidationError } from '../../errors';
import type { BigshipConfig } from '../../core/types';
import type { AxiosInstance } from 'axios';

function createConfig(): BigshipConfig {
  return {
    baseURL: 'https://api.test.com',
    userName: 'user@test.com',
    password: 'pass123',
    accessKey: 'key123',
  };
}

function createMockAxios(): AxiosInstance {
  return {
    post: vi.fn(),
    defaults: { headers: { common: {} as Record<string, string> } },
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    },
  } as unknown as AxiosInstance;
}

describe('TokenManager', () => {
  let axios: AxiosInstance;
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    axios = createMockAxios();
    dispatcher = new EventDispatcher(createConfig());
  });

  it('fetches token on first call', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-abc' } },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    const token = await tm.getToken();
    expect(token).toBe('tok-abc');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect((axios.defaults.headers.common as Record<string, string>)['Authorization']).toBe('Bearer tok-abc');
  });

  it('returns cached token on subsequent calls', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-abc' } },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await tm.getToken();
    const token2 = await tm.getToken();
    expect(token2).toBe('tok-abc');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent refresh calls', async () => {
    let callCount = 0;
    (axios.post as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(resolve => {
        callCount++;
        setTimeout(() => resolve({
          data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-abc' } },
        }), 10);
      })
    );
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    const [t1, t2, t3] = await Promise.all([tm.getToken(), tm.getToken(), tm.getToken()]);
    expect(t1).toBe('tok-abc');
    expect(t2).toBe('tok-abc');
    expect(t3).toBe('tok-abc');
    expect(callCount).toBe(1);
  });

  it('refreshes token after clearToken', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-1' } },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await tm.getToken();

    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-2' } },
    });
    tm.clearToken();
    const token = await tm.getToken();
    expect(token).toBe('tok-2');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('throws BigshipAuthError on network failure', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('ECONNREFUSED'));
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await expect(tm.getToken()).rejects.toThrow(BigshipAuthError);
  });

  it('throws BigshipValidationError on malformed login response', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { not_token: 123 } },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    try {
      await tm.getToken();
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(BigshipValidationError);
      expect((err as BigshipValidationError).validationErrors).toHaveProperty('login_response_schema');
    }
  });

  it('throws BigshipAuthError when login response data is null', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: null },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await expect(tm.getToken()).rejects.toThrow(BigshipAuthError);
  });

  it('clearToken resets state and forces new fetch', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok' } },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await tm.getToken();
    tm.clearToken();
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, message: 'ok', responseCode: 200, data: { token: 'tok-new' } },
    });
    const token = await tm.getToken();
    expect(token).toBe('tok-new');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
