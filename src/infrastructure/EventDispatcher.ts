import type { InternalAxiosRequestConfig } from 'axios';
import type { BigshipConfig, ApiResponse, RequestContext, BigshipError } from '../core/types';
import type { Logger } from './Logger';

type BeforeRequestHook = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
type ResponseHook = (response: ApiResponse<unknown>, context: RequestContext) => void | Promise<void>;
type ErrorHook = (error: BigshipError, context: RequestContext) => void | Promise<void>;
type RetryHook = (attempt: number, error: BigshipError, context: RequestContext) => void | Promise<void>;

export class EventDispatcher {
  private hooks: {
    onResponse?: ResponseHook;
    onError?: ErrorHook;
    onRetry?: RetryHook;
    onBeforeRequest?: BeforeRequestHook;
  };
  private logger?: Logger;

  constructor(config: BigshipConfig, logger?: Logger) {
    this.hooks = {
      onResponse: config.onResponse,
      onError: config.onError,
      onRetry: config.onRetry,
      onBeforeRequest: config.onBeforeRequest
    };
    this.logger = logger;
  }

  async dispatchBeforeRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (!this.hooks.onBeforeRequest) return config;
    return await this.hooks.onBeforeRequest(config);
  }

  async dispatchResponse(response: ApiResponse<unknown>, context: RequestContext): Promise<void> {
    if (!this.hooks.onResponse) return;
    try {
      await this.hooks.onResponse(response, context);
    } catch (err) {
      this.warn('onResponse', err);
    }
  }

  async dispatchError(error: BigshipError, context: RequestContext): Promise<void> {
    if (!this.hooks.onError) return;
    try {
      await this.hooks.onError(error, context);
    } catch (err) {
      this.warn('onError', err);
    }
  }

  async dispatchRetry(attempt: number, error: BigshipError, context: RequestContext): Promise<void> {
    if (!this.hooks.onRetry) return;
    try {
      await this.hooks.onRetry(attempt, error, context);
    } catch (err) {
      this.warn('onRetry', err);
    }
  }

  private warn(hookName: string, err: unknown): void {
    const message = `[Bigship SDK] ${hookName} hook error (ignored)`;
    if (this.logger) {
      this.logger.warn(message, err instanceof Error ? { message: err.message, stack: err.stack } : err);
    } else {
      console.warn(message, err);
    }
  }
}
