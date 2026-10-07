import type { CatalogState, Graffiti } from '../types';

/** Rango geográfico aproximado del municipio de Bogotá. */
const BOGOTA_BOUNDS = {
  latMin: 4.2,
  latMax: 4.85,
  lngMin: -74.4,
  lngMax: -73.95,
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isInBogota(lat: number, lng: number): boolean {
  return (
    lat >= BOGOTA_BOUNDS.latMin &&
    lat <= BOGOTA_BOUNDS.latMax &&
    lng >= BOGOTA_BOUNDS.lngMin &&
    lng <= BOGOTA_BOUNDS.lngMax
  );
}

/** Valida los campos obligatorios y las coordenadas de un registro crudo. */
function isValidRecord(record: unknown): record is Record<string, unknown> {
  if (typeof record !== 'object' || record === null) return false;
  const rec = record as Record<string, unknown>;
  if (!isNonEmptyString(rec.id)) return false;
  if (!isNonEmptyString(rec.foto)) return false;
  if (!isNonEmptyString(rec.barrio)) return false;
  if (!isNonEmptyString(rec.fecha)) return false;
  if (!isFiniteNumber(rec.lat) || !isFiniteNumber(rec.lng)) return false;
  return isInBogota(rec.lat, rec.lng);
}

/** Normaliza un registro válido, dejando los campos opcionales como vacíos. */
function normalize(record: Record<string, unknown>): Graffiti {
  return {
    id: record.id as string,
    lat: record.lat as number,
    lng: record.lng as number,
    foto: record.foto as string,
    barrio: record.barrio as string,
    autor: typeof record.autor === 'string' ? record.autor : '',
    fecha: record.fecha as string,
    titulo: typeof record.titulo === 'string' ? record.titulo : '',
  };
}

/**
 * Convierte los datos crudos del catálogo en el estado de la aplicación.
 *
 * - Si los datos no son un arreglo (JSON ilegible o mal formado) ⇒ `error`.
 * - Los registros con coordenadas fuera de Bogotá o no numéricas se descartan.
 * - `autor` y `titulo` son opcionales: si faltan quedan como cadena vacía.
 */
export function loadCatalog(raw: unknown): CatalogState {
  if (!Array.isArray(raw)) {
    return {
      status: 'error',
      message: 'No se pudo cargar el catálogo de grafitis: los datos no están bien formados.',
    };
  }

  const graffitis = raw.filter(isValidRecord).map(normalize);
  return { status: 'ok', graffitis };
}
