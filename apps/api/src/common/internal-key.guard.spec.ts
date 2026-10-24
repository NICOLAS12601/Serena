import { isValidInternalKey } from './internal-key.guard.js';

describe('isValidInternalKey', () => {
  it('accepts the exact key', () => {
    expect(isValidInternalKey('s3cret-key', 's3cret-key')).toBe(true);
  });

  it('rejects a missing, different or partial key', () => {
    expect(isValidInternalKey('s3cret-key', undefined)).toBe(false);
    expect(isValidInternalKey('s3cret-key', '')).toBe(false);
    expect(isValidInternalKey('s3cret-key', 's3cret-kez')).toBe(false);
    expect(isValidInternalKey('s3cret-key', 's3cret')).toBe(false);
  });
});
