/**
 * Registro de un grafiti del catálogo.
 *
 * - `id`: identificador único.
 * - `lat` / `lng`: coordenadas dentro del área de Bogotá.
 * - `foto`: URL pública de la foto (archivo en `public/graffitis/`).
 * - `barrio`: barrio de Bogotá donde está el grafiti.
 * - `autor`: seudónimo del autor; cadena vacía si se desconoce.
 * - `fecha`: fecha de registro en formato ISO `YYYY-MM-DD`.
 * - `titulo`: título descriptivo; cadena vacía si no tiene.
 */
export interface Graffiti {
  id: string;
  lat: number;
  lng: number;
  foto: string;
  barrio: string;
  autor: string;
  fecha: string;
  titulo: string;
}

/** Resultado de la carga del catálogo. */
export type CatalogState =
  | { status: 'ok'; graffitis: Graffiti[] }
  | { status: 'error'; message: string };
