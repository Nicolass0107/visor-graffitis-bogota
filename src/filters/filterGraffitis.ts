import type { Graffiti } from '../types';

/** Estado de la búsqueda y los filtros. Valores vacíos = sin restricción. */
export interface FilterState {
  texto: string;
  barrio: string;
  autor: string;
  /** Fecha inicial en `YYYY-MM-DD`; vacío = sin límite inferior. */
  desde: string;
  /** Fecha final en `YYYY-MM-DD`; vacío = sin límite superior. */
  hasta: string;
}

export const EMPTY_FILTERS: FilterState = {
  texto: '',
  barrio: '',
  autor: '',
  desde: '',
  hasta: '',
};

/**
 * Aplica búsqueda por texto y filtros de barrio, autor y rango de fechas.
 * Todos los filtros se combinan entre sí (intersección) y el texto no
 * distingue mayúsculas de minúsculas.
 */
export function filterGraffitis(graffitis: Graffiti[], filters: FilterState): Graffiti[] {
  const texto = filters.texto.trim().toLowerCase();

  return graffitis.filter((graffiti) => {
    if (texto) {
      const coincidencia = `${graffiti.titulo} ${graffiti.barrio} ${graffiti.autor}`
        .toLowerCase()
        .includes(texto);
      if (!coincidencia) return false;
    }
    if (filters.barrio && graffiti.barrio !== filters.barrio) return false;
    if (filters.autor && graffiti.autor !== filters.autor) return false;
    if (filters.desde && graffiti.fecha < filters.desde) return false;
    if (filters.hasta && graffiti.fecha > filters.hasta) return false;
    return true;
  });
}

/** Barrios presentes en el catálogo, ordenados alfabéticamente. */
export function uniqueBarrios(graffitis: Graffiti[]): string[] {
  return [...new Set(graffitis.map((graffiti) => graffiti.barrio))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

/** Autores presentes en el catálogo (sin duplicados ni vacíos), ordenados. */
export function uniqueAutores(graffitis: Graffiti[]): string[] {
  return [...new Set(graffitis.map((graffiti) => graffiti.autor).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'es'),
  );
}
