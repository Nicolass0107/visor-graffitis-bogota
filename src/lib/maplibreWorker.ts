/**
 * MapLibre GL v6 carga su worker desde `dist/maplibre-gl-worker.mjs`, que
 * importa a su vez a `maplibre-gl-shared.mjs`. En Vite hay que entregarle una
 * URL procesada por el pipeline de workers (`?worker&url`) para que el build
 * de producción emita un chunk autocontenido; con la URL por defecto el worker
 * falla y el mapa no pinta ni clusters ni marcadores.
 *
 * En los tests no se configura (no hay WebGL).
 */
if (import.meta.env.MODE !== 'test') {
  const [{ setWorkerUrl }, workerModule] = await Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
  ]);
  setWorkerUrl(workerModule.default);
}
