// test/dom.browser.test.ts
import { afterEach, describe, expect, it } from 'vitest';
import { requireEl } from '../src/ui/dom';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('requireEl', () => {
  it('returns the element when present', () => {
    document.body.innerHTML = '<div id="x"><span class="y"></span></div>';
    const root = document.getElementById('x');
    if (!root) throw new Error('test setup: #x not found');
    const el = requireEl<HTMLSpanElement>(root, '.y');
    expect(el.tagName).toBe('SPAN');
  });

  it('throws a descriptive error when missing', () => {
    document.body.innerHTML = '<div id="x"></div>';
    const root = document.getElementById('x');
    if (!root) throw new Error('test setup: #x not found');
    expect(() => requireEl(root, '.missing')).toThrow(/\.missing/);
  });

  it('uses document as default root', () => {
    document.body.innerHTML = '<p data-test="ok"></p>';
    const el = requireEl<HTMLParagraphElement>('[data-test="ok"]');
    expect(el.tagName).toBe('P');
  });

  it('includes the root identifier in the error message', () => {
    document.body.innerHTML = '<div id="x"></div>';
    const root = document.getElementById('x');
    if (!root) throw new Error('test setup: #x not found');
    // With an Element root, message names tagName + #id.
    expect(() => requireEl(root, '.missing')).toThrow(/div#x/);
    // With document as default root, message names "document".
    expect(() => requireEl('.also-missing')).toThrow(/document/);
  });
});
