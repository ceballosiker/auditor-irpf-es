import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index';

describe('VERSION', () => {
  it('matches package.json', () => {
    expect(VERSION).toBe('1.4.0');
  });
});
