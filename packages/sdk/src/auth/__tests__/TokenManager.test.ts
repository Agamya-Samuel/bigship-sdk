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

// API login response format
function loginResponse(token: string) {
  return {
    status: true,
    message: 'Logged in Successfully',
    status_code: 200,
    data: {
      firstName: 'Test',
      lastName: 'User',
      EmailID: 'user@test.com',
      mobileNumber: '9876543210',
      countryname: 'India',
      IsEmailVerifed: '1',
      token,
      tokenExpiringAt: '2025-01-01T00:00:00Z',
      is_outbound_service_enabled: '1',
      api_master_client_account: {
        access_key: 'key123',
        access_key_generated_date: '2025-01-01',
        is_account_enabled: '1',
        created_date: '2025-01-01T00:00:00Z',
        updated_date: '2025-01-01T00:00:00Z',
      },
      userWallet: { Balance: '5000.00', kycCurrency: '₹' },
    },
  };
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
      data: loginResponse('tok-abc'),
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    const token = await tm.getToken();
    expect(token).toBe('tok-abc');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('api/outbound/login', expect.objectContaining({
      username: 'user@test.com',
      password: 'pass123',
      access_key: 'key123',
    }));
    expect((axios.defaults.headers.common as Record<string, string>)['Authorization']).toBe('Bearer tok-abc');
  });

  it('returns cached token on subsequent calls', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: loginResponse('tok-abc'),
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
          data: loginResponse('tok-abc'),
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
      data: loginResponse('tok-1'),
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await tm.getToken();

    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: loginResponse('tok-2'),
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

  it('throws BigshipAuthError when login response data is null', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { status: true, message: 'ok', status_code: 200, data: null },
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await expect(tm.getToken()).rejects.toThrow(BigshipAuthError);
  });

  it('clearToken resets state and forces new fetch', async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: loginResponse('tok'),
    });
    const tm = new TokenManager(axios, createConfig(), dispatcher);
    await tm.getToken();
    tm.clearToken();
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: loginResponse('tok-new'),
    });
    const token = await tm.getToken();
    expect(token).toBe('tok-new');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
