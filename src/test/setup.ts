import '@testing-library/jest-dom/vitest';

// jsdom no implementa ResizeObserver (lo usa MapLibre en el navegador real).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
