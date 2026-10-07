/**
 * Construcción del enlace externo a Street View de Google Maps.
 * Es deliberadamente independiente de `googleMapsLoader.ts`: este módulo NO usa
 * la API de Google (ni clave ni cuota), solo genera la URL de un enlace normal.
 */

/**
 * Deeplink de Street View a partir de unas coordenadas.
 * Las coordenadas se pasan tal cual (sin redondear) para apuntar al grafiti.
 */
export function streetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?layer=cbs&cbll=${lat},${lng}`;
}
