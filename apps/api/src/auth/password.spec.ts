import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the correct password', async () => {
    const stored = await hashPassword('correct horse');
    expect(await verifyPassword('correct horse', stored)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const stored = await hashPassword('correct horse');
    expect(await verifyPassword('wrong horse', stored)).toBe(false);
  });

  it('never stores the plain password and salts each hash', async () => {
    const first = await hashPassword('same password');
    const second = await hashPassword('same password');
    expect(first).not.toContain('same password');
    expect(first).not.toBe(second);
  });

  it('rejects a malformed stored value', async () => {
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });
});
