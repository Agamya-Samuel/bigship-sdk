import { describe, it, expect } from 'vitest';
import { SDK_VERSION } from '../version';

describe('version', () => {
  it('exports SDK_VERSION as a string', () => {
    expect(typeof SDK_VERSION).toBe('string');
  });

  it('is a valid semver-like string', () => {
    expect(SDK_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
