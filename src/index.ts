// Core
export { BigshipClient, type RequestOptions } from './core/BigshipClient';
export * from './core/types';

// Errors
export * from './errors';

// Workflow
export { ShipmentWorkflow } from './workflow/ShipmentWorkflow';

// Infrastructure (for advanced users)
export { EventDispatcher } from './infrastructure/EventDispatcher';
export { Logger, type LoggerAdapter } from './infrastructure/Logger';

// HTTP
export { ResponseValidator, formatZodErrors } from './http/ResponseValidator';
export { RetryManager } from './http/RetryManager';

// Auth
export { TokenManager } from './auth/TokenManager';

// Utils
export * from './utils';

// Version
export { SDK_VERSION } from './version';
