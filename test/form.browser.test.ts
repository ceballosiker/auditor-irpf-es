// test/form.browser.test.ts
import '../src/ui/theme.css';
import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountForm } from '../src/ui/form';
import type { FormState } from '../src/ui/form';

function setup(initial: FormState = { bruto: 30_000, anio: 2026 }): {
  host: HTMLElement;
  onChange: ReturnType<typeof vi.fn>;
  bruto: HTMLInputElement;
  range: HTMLInputElement;
  output: HTMLOutputElement;
} {
  document.body.innerHTML = '<div id="host"></div>';
  const host = document.getElementById('host');
  if (!host) throw new Error('test setup: #host not in DOM');
  const onChange = vi.fn<(s: FormState) => void>();
  mountForm(host, { initial, onChange });
  const bruto = host.querySelector<HTMLInputElement>('#input-bruto');
  if (!bruto) throw new Error('bruto input missing');
  const range = host.querySelector<HTMLInputElement>('#input-anio');
  if (!range) throw new Error('range input missing');
  const output = host.querySelector<HTMLOutputElement>('output[for="input-anio"]');
  if (!output) throw new Error('output missing');
  return { host, onChange, bruto, range, output };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('mountForm año scrubber', () => {
  it('renders a range input with min=2012 max=2026 and the initial year as value', () => {
    const { range } = setup({ bruto: 30_000, anio: 2018 });
    expect(range.type).toBe('range');
    expect(range.min).toBe('2012');
    expect(range.max).toBe('2026');
    expect(range.step).toBe('1');
    expect(range.value).toBe('2018');
  });

  it('mirrors the year in <output> and aria-valuetext at mount', () => {
    const { range, output } = setup({ bruto: 30_000, anio: 2018 });
    expect(output.textContent).toBe('2018');
    expect(range.getAttribute('aria-valuetext')).toBe('2018');
  });

  it('fires onChange on the input event during drag (not just change)', () => {
    const { onChange, range } = setup();
    range.value = '2020';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith({ bruto: 30_000, anio: 2020 });
  });

  it('updates <output> and aria-valuetext when the value changes', () => {
    const { range, output } = setup();
    range.value = '2015';
    range.dispatchEvent(new Event('input', { bubbles: true }));
    expect(output.textContent).toBe('2015');
    expect(range.getAttribute('aria-valuetext')).toBe('2015');
  });

  it('decrements the year by one on a real ArrowLeft keypress', async () => {
    const { onChange, range } = setup({ bruto: 30_000, anio: 2020 });
    range.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith({ bruto: 30_000, anio: 2019 });
  });

  it('fires onChange on the bruto input event with the parsed numeric value', () => {
    const { onChange, bruto } = setup({ bruto: 30_000, anio: 2020 });
    bruto.value = '45000';
    bruto.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith({ bruto: 45000, anio: 2020 });
  });

  it('renders end-of-range tick labels 2012 and 2026', () => {
    const { host } = setup();
    const ticks = host.querySelectorAll('.anio-ticks span');
    expect(ticks.length).toBe(2);
    expect(ticks[0]?.textContent).toBe('2012');
    expect(ticks[1]?.textContent).toBe('2026');
  });

  it('still has the bruto and CCAA controls in the form-row', () => {
    const { host } = setup();
    expect(host.querySelector<HTMLInputElement>('#input-bruto')).not.toBeNull();
    expect(host.querySelector<HTMLSelectElement>('#input-ccaa')).not.toBeNull();
  });
});
