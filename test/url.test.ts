import { describe, expect, it } from 'vitest';
import { parseAnioFromSearch } from '../src/ui/url';
import { ANIO_MIN, ANIO_MAX } from '../src/normativa';

describe('parseAnioFromSearch', () => {
  it('returns the year when ?anio= is in range', () => {
    expect(parseAnioFromSearch('?anio=2018')).toBe(2018);
    expect(parseAnioFromSearch('?anio=2026')).toBe(2026);
    expect(parseAnioFromSearch('?anio=2012')).toBe(2012);
  });

  it('returns null when ?anio= is missing', () => {
    expect(parseAnioFromSearch('')).toBeNull();
    expect(parseAnioFromSearch('?bruto=30000')).toBeNull();
  });

  it('returns null when ?anio= is out of range', () => {
    expect(parseAnioFromSearch(`?anio=${String(ANIO_MIN - 1)}`)).toBeNull();
    expect(parseAnioFromSearch(`?anio=${String(ANIO_MAX + 1)}`)).toBeNull();
  });

  it('returns null when ?anio= is not an integer', () => {
    expect(parseAnioFromSearch('?anio=abc')).toBeNull();
    expect(parseAnioFromSearch('?anio=2024.5')).toBeNull();
    expect(parseAnioFromSearch('?anio=')).toBeNull();
  });

  it('coexists with other params', () => {
    expect(parseAnioFromSearch('?bruto=30000&anio=2020')).toBe(2020);
  });
});
