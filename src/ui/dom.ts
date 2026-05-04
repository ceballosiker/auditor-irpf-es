// src/ui/dom.ts
export function requireEl<T extends Element>(
  rootOrSelector: ParentNode | string,
  selector?: string,
): T {
  const root: ParentNode = typeof rootOrSelector === 'string' ? document : rootOrSelector;
  const sel: string = typeof rootOrSelector === 'string' ? rootOrSelector : (selector ?? '');
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`requireEl: element not found for selector "${sel}"`);
  return el;
}
