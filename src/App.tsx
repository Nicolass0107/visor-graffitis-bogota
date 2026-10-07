import { useEffect, useMemo, useState } from 'react';
import rawCatalog from './data/graffitis.json';
import { loadCatalog } from './catalog/loadCatalog';
import { EMPTY_FILTERS, filterGraffitis, type FilterState } from './filters/filterGraffitis';
import MapCanvas from './components/MapCanvas';
import FilterBar from './components/FilterBar';
import DetailPanel from './components/DetailPanel';
import StreetViewPanel from './components/StreetViewPanel';
import styles from './App.module.css';
import type { Graffiti } from './types';

export default function App() {
  const catalog = useMemo(() => loadCatalog(rawCatalog), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [streetViewGraffiti, setStreetViewGraffiti] = useState<Graffiti | null>(null);

  const catalogList = catalog.status === 'ok' ? catalog.graffitis : [];
  const visible = useMemo(
    () => filterGraffitis(catalogList, filters),
    [catalogList, filters],
  );
  const visibleIds = useMemo(() => visible.map((graffiti) => graffiti.id), [visible]);

  // Si los filtros ocultan el grafiti seleccionado, se cierra su panel.
  useEffect(() => {
    if (selectedId && !visibleIds.includes(selectedId)) setSelectedId(null);
  }, [selectedId, visibleIds]);

  if (catalog.status === 'error') {
    return (
      <main className={styles.error}>
        <h1>Visor de Grafitis de Bogotá</h1>
        <p role="alert">{catalog.message}</p>
      </main>
    );
  }

  const selected = visible.find((graffiti) => graffiti.id === selectedId) ?? null;

  return (
    <div className={styles.app}>
      <MapCanvas
        graffitis={visible}
        selectedId={selected ? selected.id : null}
        onSelect={setSelectedId}
      />

      <header className={styles.topbar}>
        <h1 className={styles.brand}>Visor de Grafitis de Bogotá</h1>
        <span className={styles.count}>
          {visible.length} de {catalogList.length} grafitis
        </span>
      </header>

      <div className={styles.leftColumn}>
        <FilterBar catalogo={catalogList} filters={filters} onChange={setFilters} />
        {visible.length === 0 ? (
          <p className={styles.noResults} role="status">
            No hay resultados
          </p>
        ) : null}
      </div>

      {selected ? (
        <DetailPanel
          graffiti={selected}
          visibles={visible}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
          onOpenStreetView={setStreetViewGraffiti}
        />
      ) : null}

      {streetViewGraffiti ? (
        <StreetViewPanel
          graffiti={streetViewGraffiti}
          onClose={() => setStreetViewGraffiti(null)}
        />
      ) : null}
    </div>
  );
}
