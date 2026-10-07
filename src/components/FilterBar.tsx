import { useMemo } from 'react';
import type { Graffiti } from '../types';
import { EMPTY_FILTERS, uniqueAutores, uniqueBarrios, type FilterState } from '../filters/filterGraffitis';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  /** Catálogo completo (para poblar los selectores). */
  catalogo: Graffiti[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

/** Buscador por texto, filtros de barrio/artista/fechas y control de restablecer. */
export default function FilterBar({ catalogo, filters, onChange }: FilterBarProps) {
  const barrios = useMemo(() => uniqueBarrios(catalogo), [catalogo]);
  const autores = useMemo(() => uniqueAutores(catalogo), [catalogo]);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <section className={styles.bar} aria-label="Búsqueda y filtros">
      <input
        type="search"
        className={styles.search}
        aria-label="Buscar grafitis"
        placeholder="Buscar por título, barrio o autor…"
        value={filters.texto}
        onChange={(event) => update({ texto: event.target.value })}
      />

      <div className={styles.row}>
        <select
          className={styles.select}
          aria-label="Filtrar por barrio"
          value={filters.barrio}
          onChange={(event) => update({ barrio: event.target.value })}
        >
          <option value="">Todos los barrios</option>
          {barrios.map((barrio) => (
            <option key={barrio} value={barrio}>
              {barrio}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          aria-label="Filtrar por artista"
          value={filters.autor}
          onChange={(event) => update({ autor: event.target.value })}
        >
          <option value="">Todos los artistas</option>
          {autores.map((autor) => (
            <option key={autor} value={autor}>
              {autor}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <label className={styles.dateLabel}>
          Desde
          <input
            type="date"
            aria-label="Fecha inicial"
            value={filters.desde}
            max={filters.hasta || undefined}
            onChange={(event) => update({ desde: event.target.value })}
          />
        </label>
        <label className={styles.dateLabel}>
          Hasta
          <input
            type="date"
            aria-label="Fecha final"
            value={filters.hasta}
            min={filters.desde || undefined}
            onChange={(event) => update({ hasta: event.target.value })}
          />
        </label>
        <button
          type="button"
          className={styles.reset}
          aria-label="Restablecer filtros"
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Restablecer
        </button>
      </div>
    </section>
  );
}
