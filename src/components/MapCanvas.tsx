import { useEffect, useRef } from 'react';
import '../lib/maplibreWorker';
import { Map as MapLibreMap, NavigationControl, Popup } from 'maplibre-gl';
import type { GeoJSONSource, MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { Graffiti } from '../types';
import styles from './MapCanvas.module.css';

/** Centro y zoom iniciales: vista de ciudad de Bogotá. */
export const BOGOTA_CENTER: [number, number] = [-74.0721, 4.711];
export const BOGOTA_ZOOM = 11;

const SOURCE_ID = 'graffiti-source';
export const CLUSTER_LAYER = 'graffiti-clusters';
export const CLUSTER_COUNT_LAYER = 'graffiti-cluster-count';
export const SELECTED_LAYER = 'graffiti-selected';
export const POINT_LAYER = 'graffiti-points';

/** Estilo base: tiles raster de OpenStreetMap (sin dependencia de Google para el mapa). */
const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© Colaboradores de OpenStreetMap',
    },
  },
  layers: [{ id: 'osm-raster', type: 'raster', source: 'osm-raster' }],
};

/** Convierte los grafitis visibles en un FeatureCollection con clusterización nativa. */
export function buildFeatureCollection(graffitis: Graffiti[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: graffitis.map((graffiti) => ({
      type: 'Feature' as const,
      id: graffiti.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [graffiti.lng, graffiti.lat] as [number, number],
      },
      properties: { id: graffiti.id, barrio: graffiti.barrio, titulo: graffiti.titulo },
    })),
  };
}

interface MapCanvasProps {
  graffitis: Graffiti[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function MapCanvas({ graffitis, selectedId, onSelect }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const loadedRef = useRef(false);
  const hoveredIdRef = useRef<string | number | null>(null);
  const graffitisRef = useRef(graffitis);
  const onSelectRef = useRef(onSelect);

  graffitisRef.current = graffitis;
  onSelectRef.current = onSelect;

  // Montaje único del mapa.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: MAP_STYLE,
      center: BOGOTA_CENTER,
      zoom: BOGOTA_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right');

    map.on('load', () => {
      const popup = new Popup({ closeButton: false, offset: 14 });
      popupRef.current = popup;

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: buildFeatureCollection(graffitisRef.current),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Capa de clusters (zoom bajo): solo entidades agrupadas.
      map.addLayer({
        id: CLUSTER_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0077b6',
          'circle-radius': 20,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Contador dentro del cluster.
      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 13,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Halo del grafiti seleccionado (debajo del punto).
      map.addLayer({
        id: SELECTED_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['get', 'id'], '__ninguno__'],
        paint: {
          'circle-radius': 17,
          'circle-color': '#ffb703',
          'circle-opacity': 0.55,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#f48c06',
        },
      });

      // Grafitis individuales (zoom alto): no agrupados.
      map.addLayer({
        id: POINT_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 13, 9],
          'circle-color': '#d00000',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Clic en un cluster → acercar hasta expandirlo.
      map.on('click', CLUSTER_LAYER, (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const coordinates = feature?.geometry.type === 'Point' ? feature.geometry.coordinates : null;
        if (typeof clusterId !== 'number' || !coordinates) return;
        const source = map.getSource(SOURCE_ID) as GeoJSONSource;
        void source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: coordinates as [number, number], zoom });
        });
      });

      // Clic en un grafiti → selección (punto individual o su halo).
      const handlePointClick = (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === 'string') onSelectRef.current(id);
      };
      map.on('click', POINT_LAYER, handlePointClick);
      map.on('click', SELECTED_LAYER, handlePointClick);

      // Cursor + tooltip con el identificador al pasar el cursor.
      map.on('mouseenter', POINT_LAYER, (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature || feature.id === undefined) return;
        hoveredIdRef.current = feature.id;
        map.setFeatureState({ source: SOURCE_ID, id: feature.id }, { hover: true });
        const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : null;
        if (coordinates) {
          popup
            .setLngLat(coordinates as [number, number])
            .setHTML(`<strong>${String(feature.properties?.id ?? '')}</strong>`)
            .addTo(map);
        }
      });
      map.on('mouseleave', POINT_LAYER, () => {
        map.getCanvas().style.cursor = '';
        if (hoveredIdRef.current !== null) {
          // MapLibre exige el id de la feature para quitar un estado concreto.
          map.removeFeatureState({ source: SOURCE_ID, id: hoveredIdRef.current }, 'hover');
          hoveredIdRef.current = null;
        }
        popup.remove();
      });

      loadedRef.current = true;

      // Sincroniza estado que pudo cambiar antes de que el mapa cargara.
      const source = map.getSource(SOURCE_ID) as GeoJSONSource;
      source.setData(buildFeatureCollection(graffitisRef.current));
      map.setFilter(SELECTED_LAYER, ['==', ['get', 'id'], '__ninguno__']);
    });

    return () => {
      popupRef.current?.remove();
      loadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Datos: actualizar features cuando cambian los grafitis visibles.
  useEffect(() => {
    if (!loadedRef.current) return;
    const source = mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(buildFeatureCollection(graffitis));
  }, [graffitis]);

  // Selección: resaltar el marcador elegido (o ninguno).
  useEffect(() => {
    if (!loadedRef.current) return;
    mapRef.current?.setFilter(SELECTED_LAYER, ['==', ['get', 'id'], selectedId ?? '__ninguno__']);
  }, [selectedId]);

  return <div ref={containerRef} className={styles.map} data-testid="mapa-bogota" />;
}
