import type { AxiosInstance } from 'axios';
import type { BigshipConfig } from '../core/types';
import type { LoginRequest } from '../core/types';
import { LoginRequestSchema } from '../core/types';
import { BigshipAuthError } from '../errors';
import { EventDispatcher } from '../infrastructure/EventDispatcher';

/**
 * Token management with automatic refresh
 * Handles token caching, expiry, and automatic refresh
 *
 * @example
 * ```ts
 * const tokenManager = new TokenManager(axios, config, eventDispatcher);
 * const token = await tokenManager.getToken(); // Automatically refreshes if needed
 * ```
 */
export class TokenManager {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private axios: AxiosInstance,
    private config: BigshipConfig,
    private eventDispatcher: EventDispatcher
  ) {}

  /**
   * Get a valid token, refreshing if necessary
   * Returns cached token if valid, otherwise refreshes
   *
   * @returns The valid authentication token
   *
   * @example
   * ```ts
   * const token = await tokenManager.getToken();
   * ```
   */
  async getToken(): Promise<string> {
    // Return cached token if valid
    if (this.token && this.isTokenValid()) {
      return this.token;
    }

    // Wait for ongoing refresh (prevents multiple simultaneous refreshes)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new refresh
    this.refreshPromise = this.refreshToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Clear the cached token
   * Called after authentication errors to force re-authentication
   *
   * @example
   * ```ts
   * tokenManager.clearToken(); // Forces token refresh on next request
   * ```
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if the cached token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Refresh the authentication token
   * Makes a login request to get a new token
   */
  private async refreshToken(): Promise<string> {
    const payload: LoginRequest = {
      user_name: this.config.userName,
      password: this.config.password,
      access_key: this.config.accessKey,
    };

    try {
      const validated = LoginRequestSchema.parse(payload);
      const res = await this.axios.post('/api/login/user', validated);

      const token = (res.data as any).data.token;
      this.token = token;
      // Set expiry to 55 minutes (tokens typically last 60 minutes)
      // This gives us a 5-minute buffer to refresh before actual expiry
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      // Set Bearer for all future requests
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return token;
    } catch (error) {
      this.clearToken();
      throw new BigshipAuthError('Failed to refresh authentication token');
    }
  }
}
