/**
 * Cargador perezoso de la librería JavaScript de Google Maps.
 * Se usa exclusivamente para Street View; el mapa no depende de Google.
 */

/** Clave leída de `VITE_GOOGLE_MAPS_API_KEY` (vacía si no está configurada). */
export function getApiKey(): string {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim();
}

/** `true` cuando hay clave configurada en el entorno. */
export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

let pending: Promise<typeof google.maps> | null = null;

type GoogleGlobal = { google?: { maps?: typeof google.maps } };

/**
 * Carga la librería de Google Maps una sola vez.
 * Rechaza con `missing-api-key` si no hay clave, o con `script-load-failed`
 * si el script no pudo cargarse.
 */
export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!hasApiKey()) {
    return Promise.reject(new Error('missing-api-key'));
  }

  const existing = (window as GoogleGlobal).google?.maps;
  if (existing) return Promise.resolve(existing);
  if (pending) return pending;

  pending = new Promise<typeof google.maps>((resolve, reject) => {
    const callbackName = '__onGoogleMapsReady';
    const script = document.createElement('script');
    script.async = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(getApiKey())}` +
      `&callback=${callbackName}`;
    script.onerror = () => {
      pending = null;
      reject(new Error('script-load-failed'));
    };
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      const maps = (window as GoogleGlobal).google?.maps;
      if (maps) resolve(maps);
      else reject(new Error('script-load-failed'));
    };
    document.head.appendChild(script);
  });

  return pending;
}

/** Reinicia el estado interno del cargador (solo para tests). */
export function resetGoogleMapsLoader(): void {
  pending = null;
}

/** Rumbo (0–360°, norte = 0) desde `from` hacia `to`, en grados. */
export function bearing(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLng = toRadians(toLng - fromLng);
  const y = Math.sin(deltaLng) * Math.cos(toRadians(toLat));
  const x =
    Math.cos(toRadians(fromLat)) * Math.sin(toRadians(toLat)) -
    Math.sin(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.cos(deltaLng);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}
