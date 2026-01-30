import { describe, it, expect } from 'vitest';

describe('Second Brain AI', () => {
    it('should pass basic test', () => {
        expect(true).toBe(true);
    });

    it('should have correct environment setup', () => {
        expect(import.meta.env).toBeDefined();
    });
});
