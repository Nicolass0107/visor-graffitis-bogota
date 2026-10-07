import {
  bearing,
  getApiKey,
  hasApiKey,
  loadGoogleMaps,
  resetGoogleMapsLoader,
} from './googleMapsLoader';

describe('getApiKey / hasApiKey', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('reporta que no hay clave cuando la variable está vacía', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    expect(getApiKey()).toBe('');
    expect(hasApiKey()).toBe(false);
  });

  it('lee la clave desde el entorno', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', ' mi-clave ');
    expect(getApiKey()).toBe('mi-clave');
    expect(hasApiKey()).toBe(true);
  });
});

describe('loadGoogleMaps', () => {
  beforeEach(() => {
    resetGoogleMapsLoader();
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetGoogleMapsLoader();
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
  });

  it('rechaza con missing-api-key cuando no hay clave', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');

    await expect(loadGoogleMaps()).rejects.toThrow('missing-api-key');
    expect(document.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
  });

  it('agrega el script de Google Maps con la clave cuando la hay', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'clave-de-prueba');

    void loadGoogleMaps();

    const script = document.querySelector('script[src*="maps.googleapis.com"]');
    expect(script).not.toBeNull();
    expect(script!.getAttribute('src')).toContain('clave-de-prueba');
    expect(script!.getAttribute('src')).toContain('callback=');
  });

  it('reutiliza la misma promesa en cargas concurrentes', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'clave-de-prueba');

    const first = loadGoogleMaps();
    const second = loadGoogleMaps();

    expect(first).toBe(second);
  });
});

describe('bearing', () => {
  it('apunta al norte cuando el destino está al norte', () => {
    expect(bearing(4.6, -74.08, 4.7, -74.08)).toBeCloseTo(0, 0);
  });

  it('apunta al este cuando el destino está al este', () => {
    expect(bearing(4.6, -74.08, 4.6, -73.98)).toBeCloseTo(90, 0);
  });

  it('apunta al oeste cuando el destino está al oeste', () => {
    expect(bearing(4.6, -74.08, 4.6, -74.18)).toBeCloseTo(270, 0);
  });
});
