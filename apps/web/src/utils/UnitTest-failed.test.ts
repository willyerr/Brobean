
import { describe, it, expect } from 'vitest';

describe('P11 - Demonstrasi Unit Test Failed', () => {
  it('should fail intentionally to demonstrate CI/CD failure', () => {
    expect(1 + 1).toBe(3);
  });
});
