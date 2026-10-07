import { useEffect, useState } from 'react';
import type { Graffiti } from '../types';
import { copyTextToClipboard } from '../lib/copyTextToClipboard';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
  graffiti: Graffiti;
  /** Grafitis actualmente visibles en el mapa (para navegar entre ellos). */
  visibles: Graffiti[];
  onSelect: (id: string) => void;
  onClose: () => void;
  onOpenStreetView: (graffiti: Graffiti) => void;
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

function formatFecha(fecha: string): string {
  const date = new Date(`${fecha}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? fecha : dateFormatter.format(date);
}

/** Panel de detalle del grafiti seleccionado. */
export default function DetailPanel({
  graffiti,
  visibles,
  onSelect,
  onClose,
  onOpenStreetView,
}: DetailPanelProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Al cambiar de grafiti se reinician los estados transitorios.
  useEffect(() => {
    setImageLoaded(false);
    setCopied(false);
    setCopyFailed(false);
  }, [graffiti.id]);

  // La confirmación de copia desaparece sola.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const index = visibles.findIndex((item) => item.id === graffiti.id);
  const previous = index > 0 ? visibles[index - 1] : null;
  const next = index >= 0 && index < visibles.length - 1 ? visibles[index + 1] : null;

  const copyCoordinates = async () => {
    try {
      await copyTextToClipboard(`${graffiti.lat}, ${graffiti.lng}`);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
      setCopied(false);
    }
  };

  return (
    <aside className={styles.panel} aria-label="Detalle del grafiti">
      <header className={styles.header}>
        <h2 className={styles.title}>{graffiti.titulo || graffiti.id}</h2>
        <button
          type="button"
          className={styles.close}
          aria-label="Cerrar panel"
          onClick={onClose}
        >
          ✕
        </button>
      </header>

      <figure className={styles.photoBox}>
        {!imageLoaded ? (
          <span className={styles.spinner} role="status" aria-label="Cargando foto">
            Cargando foto…
          </span>
        ) : null}
        <img
          className={imageLoaded ? styles.photoLoaded : styles.photoPending}
          src={graffiti.foto}
          alt={`Grafiti: ${graffiti.titulo || graffiti.id}`}
          onLoad={() => setImageLoaded(true)}
          data-testid="foto-graffiti"
        />
      </figure>

      <dl className={styles.meta}>
        <div>
          <dt>Autor</dt>
          <dd data-testid="detalle-autor">{graffiti.autor || 'Autor desconocido'}</dd>
        </div>
        <div>
          <dt>Barrio</dt>
          <dd>{graffiti.barrio}</dd>
        </div>
        <div>
          <dt>Fecha de registro</dt>
          <dd>{formatFecha(graffiti.fecha)}</dd>
        </div>
        <div>
          <dt>Referencia</dt>
          <dd>{graffiti.id}</dd>
        </div>
      </dl>

      <div className={styles.location}>
        <p className={styles.coordinates}>
          {graffiti.lat.toFixed(4)}, {graffiti.lng.toFixed(4)}
        </p>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => void copyCoordinates()}
        >
          Copiar coordenadas
        </button>
        {copied ? (
          <span role="status" className={styles.copyStatus}>
            ¡Copiado!
          </span>
        ) : null}
        {copyFailed ? (
          <span role="alert" className={styles.copyStatus}>
            No se pudieron copiar las coordenadas
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className={styles.primary}
        onClick={() => onOpenStreetView(graffiti)}
      >
        Ver el lugar
      </button>

      <nav className={styles.nav} aria-label="Navegar entre grafitis">
        <button
          type="button"
          className={styles.secondary}
          disabled={!previous}
          onClick={() => previous && onSelect(previous.id)}
        >
          ← Anterior
        </button>
        <span className={styles.position}>
          {index >= 0 ? `${index + 1} / ${visibles.length}` : ''}
        </span>
        <button
          type="button"
          className={styles.secondary}
          disabled={!next}
          onClick={() => next && onSelect(next.id)}
        >
          Siguiente →
        </button>
      </nav>
    </aside>
  );
}
