// Global type declarations for the vendored minified.js library.
// The module declaration (export =) lives in src/scripts/vendor/minified.d.ts
// for tsify resolution. These globals are needed by tsc for type-checking.

interface M {
  [index: number]: HTMLElement;
  length: number;
  add(child: M | string): M;
  set(property: string, value?: unknown): M;
  set(cssObj: Record<string, unknown>): M;
  get(property: string): unknown;
  select(selector: string): M;
  on(events: string, handler: (...args: unknown[]) => void): M;
  off(handler: (...args: unknown[]) => void): M;
  trigger(name: string, eventObj?: unknown): M;
  each(callback: (element: HTMLElement, index: number) => void): M;
}

interface MinifiedStatic {
  (selector: string): M;
  off(handler: (...args: unknown[]) => void): void;
}

interface MinifiedUtils {
  copyObj<T>(obj: T): T;
  extend(target: Record<string, unknown>, ...sources: Record<string, unknown>[]): Record<string, unknown>;
  eachObj<T extends object>(obj: T, callback: (key: string, value: T[keyof T]) => void): void;
  find<T>(array: T[], callback: (item: T) => unknown): T | undefined;
  equals(a: unknown, b: unknown): boolean;
}

interface MinifiedModule {
  $: MinifiedStatic;
  _: MinifiedUtils;
  HTML: (template: string, data?: Record<string, unknown>) => M;
}
