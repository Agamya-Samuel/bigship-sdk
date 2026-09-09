import { defineConfig } from 'vitest/config';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load .env file
loadEnv({ path: resolve(__dirname, '.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__integration__/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 15000,
    env: {
      BIGSHIP_USER_NAME: process.env.BIGSHIP_USER_NAME || '',
      BIGSHIP_PASSWORD: process.env.BIGSHIP_PASSWORD || '',
      BIGSHIP_ACCESS_KEY: process.env.BIGSHIP_ACCESS_KEY || '',
      BIGSHIP_BASE_URL: process.env.BIGSHIP_BASE_URL || 'https://api.bigship.direct',
      BIGSHIP_TEST_WRITE: process.env.BIGSHIP_TEST_WRITE || 'false',
    },
    pool: 'forks',
  },
});
