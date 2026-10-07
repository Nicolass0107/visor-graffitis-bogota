import { useEffect, useRef, useState } from 'react';
import type { Graffiti } from '../types';
import { bearing, hasApiKey, loadGoogleMaps } from '../lib/googleMapsLoader';
import { streetViewUrl } from '../lib/streetViewUrl';
import styles from './StreetViewPanel.module.css';

/** Estados de la vista panorámica. */
export type StreetViewState =
  | 'cargando'
  | 'sin-clave'
  | 'sin-cobertura'
  | 'listo';

interface StreetViewPanelProps {
  graffiti: Graffiti;
  onClose: () => void;
}

/** Radio de búsqueda de panoramas alrededor del grafiti (metros). */
const SEARCH_RADIUS = 50;

/**
 * Vista panorámica tipo Street View del lugar donde está el grafiti.
 * Degradación: sin clave ⇒ aviso; sin cobertura ⇒ mensaje + foto del grafiti.
 */
export default function StreetViewPanel({ graffiti, onClose }: StreetViewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<StreetViewState>('cargando');

  useEffect(() => {
    let cancelled = false;
    let readyTimer: number | undefined;

    const markReady = () => {
      if (cancelled) return;
      window.clearTimeout(readyTimer);
      setState('listo');
    };

    if (!hasApiKey()) {
      setState('sin-clave');
      return;
    }

    setState('cargando');

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;
        const service = new maps.StreetViewService();
        service.getPanorama(
          {
            location: { lat: graffiti.lat, lng: graffiti.lng },
            radius: SEARCH_RADIUS,
          },
          (data, status) => {
            if (cancelled) return;
            if (status !== maps.StreetViewStatus.OK || !data?.location?.latLng) {
              setState('sin-cobertura');
              return;
            }

            const position = data.location.latLng;
            const heading = bearing(
              position.lat(),
              position.lng(),
              graffiti.lat,
              graffiti.lng,
            );

            if (!containerRef.current) return;
            const panorama = new maps.StreetViewPanorama(containerRef.current, {
              position,
              pov: { heading, pitch: 0 },
              zoom: 0,
              addressControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
            });
            panorama.addListener('status_changed', markReady);
            // Por si el evento no llega, la imagen deja de "cargar" a los 5 s.
            readyTimer = window.setTimeout(markReady, 5000);
          },
        );
      })
      .catch(() => {
        if (!cancelled) setState('sin-clave');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
    };
  }, [graffiti.id, graffiti.lat, graffiti.lng]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Vista del lugar"
    >
      <div className={styles.window}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            Vista del lugar · {graffiti.barrio}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Cerrar vista del lugar"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className={styles.viewport}>
          <div ref={containerRef} data-testid="panorama" className={styles.pano} />

          {state === 'cargando' ? (
            <div className={styles.message} role="status" aria-label="Cargando vista de calle">
              Cargando vista de calle…
            </div>
          ) : null}

          {state === 'sin-clave' ? (
            <div className={styles.message} role="status">
              <p className={styles.messageText}>
                Vista de calle no disponible: falta la clave de API de Google Maps.
              </p>
              <a
                className={styles.externalLink}
                href={streetViewUrl(graffiti.lat, graffiti.lng)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir Street View de Google Maps en una pestaña nueva"
                data-testid="abrir-street-view"
              >
                Abrir en Street View de Google Maps ↗
              </a>
            </div>
          ) : null}

          {state === 'sin-cobertura' ? (
            <div className={styles.fallback}>
              <p className={styles.message} role="status">
                No hay vista de calle disponible en esta ubicación.
              </p>
              <img
                className={styles.photo}
                src={graffiti.foto}
                alt={`Grafiti: ${graffiti.titulo || graffiti.id}`}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
