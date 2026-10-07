import { render, screen, act } from '@testing-library/react';
import MapCanvas, {
  BOGOTA_CENTER,
  BOGOTA_ZOOM,
  CLUSTER_LAYER,
  POINT_LAYER,
  SELECTED_LAYER,
  buildFeatureCollection,
} from './MapCanvas';
import { FakeMap, FakePopup } from '../test/fakeMaplibre';
import type { Graffiti } from '../types';

vi.mock('maplibre-gl', async () => {
  const { FakeMap: Map, FakePopup: Popup } = await import('../test/fakeMaplibre');
  return {
    Map,
    Popup,
    NavigationControl: class FakeNavigationControl {},
  };
});

const SAMPLE: Graffiti[] = [
  {
    id: 'grf-001',
    lat: 4.5981,
    lng: -74.0758,
    foto: '/graffitis/grafiti-01.svg',
    barrio: 'La Candelaria',
    autor: 'Tinta Sur',
    fecha: '2024-03-12',
    titulo: 'Mural del callejón',
  },
  {
    id: 'grf-002',
    lat: 4.6486,
    lng: -74.0564,
    foto: '/graffitis/grafiti-02.svg',
    barrio: 'Chapinero',
    autor: 'Roka',
    fecha: '2024-05-02',
    titulo: 'León de Chapinero',
  },
];

function setup(props: Partial<Parameters<typeof MapCanvas>[0]> = {}) {
  const onSelect = vi.fn();
  render(
    <MapCanvas graffitis={SAMPLE} selectedId={null} onSelect={onSelect} {...props} />,
  );
  const map = FakeMap.last;
  act(() => map.fire('load'));
  return { map, onSelect };
}

describe('MapCanvas', () => {
  beforeEach(() => {
    FakeMap.reset();
    FakePopup.reset();
  });

  it('monta el mapa centrado en Bogotá con controles de zoom', () => {
    const { map } = setup();

    expect(screen.getByTestId('mapa-bogota')).toBeInTheDocument();
    expect(map.options.center).toEqual(BOGOTA_CENTER);
    expect(map.options.zoom).toBe(BOGOTA_ZOOM);
    expect(map.controls).toHaveLength(1);
  });

  it('crea un feature por grafiti en su coordenada exacta', () => {
    const { map } = setup();

    const source = map.getSource('graffiti-source');
    const data = source.data as ReturnType<typeof buildFeatureCollection>;
    expect(data.features).toHaveLength(2);
    expect(data.features[0].geometry.coordinates).toEqual([-74.0758, 4.5981]);
    expect(data.features[1].geometry.coordinates).toEqual([-74.0564, 4.6486]);
    expect(source.config.cluster).toBe(true);
  });

  it('configura clusters para el zoom bajo e individuales para el zoom alto', () => {
    const { map } = setup();

    // Vista alejada: solo entidades con point_count (agrupaciones).
    expect(map.layers.find((l) => l.id === CLUSTER_LAYER)?.filter).toEqual([
      'has',
      'point_count',
    ]);
    // Vista acercada: solo puntos NO agrupados.
    expect(map.layers.find((l) => l.id === POINT_LAYER)?.filter).toEqual([
      '!',
      ['has', 'point_count'],
    ]);
    expect(map.layerIds).toContain(CLUSTER_LAYER);
    expect(map.layerIds).toContain(POINT_LAYER);
  });

  it('al hacer clic en un cluster se acerca para expandirlo', async () => {
    const { map } = setup();

    map.fireLayer('click', CLUSTER_LAYER, {
      features: [
        {
          properties: { cluster_id: 7 },
          geometry: { type: 'Point', coordinates: [-74.07, 4.65] },
        },
      ],
    });
    await vi.waitFor(() => expect(map.easeToCalls).toHaveLength(1));
    expect(map.easeToCalls[0]).toEqual({ center: [-74.07, 4.65], zoom: 14 });
  });

  it('al hacer clic en un marcador emite su selección', () => {
    const { map, onSelect } = setup();

    map.fireLayer('click', POINT_LAYER, {
      features: [{ properties: { id: 'grf-002' } }],
    });

    expect(onSelect).toHaveBeenCalledWith('grf-002');
  });

  it('resalta el marcador y muestra su identificador al pasar el cursor', () => {
    const { map } = setup();

    map.fireLayer('mouseenter', POINT_LAYER, {
      features: [
        {
          id: 'grf-001',
          properties: { id: 'grf-001' },
          geometry: { type: 'Point', coordinates: [-74.0758, 4.5981] },
        },
      ],
    });

    expect(map.featureStates[0]).toMatchObject({
      op: 'set',
      target: { source: 'graffiti-source', id: 'grf-001' },
      state: { hover: true },
    });
    expect(FakePopup.instances.at(-1)?.html).toBe('<strong>grf-001</strong>');
    expect(FakePopup.instances.at(-1)?.addedTo).toBe(map);

    map.fireLayer('mouseleave', POINT_LAYER, undefined);
    expect(map.featureStates[1]).toMatchObject({
      op: 'remove',
      target: { source: 'graffiti-source', id: 'grf-001' },
      state: 'hover',
    });
  });

  it('actualiza los features cuando cambian los grafitis visibles', () => {
    const { map, rerender } = (() => {
      const onSelect = vi.fn();
      const view = render(
        <MapCanvas graffitis={SAMPLE} selectedId={null} onSelect={onSelect} />,
      );
      const map = FakeMap.last;
      act(() => map.fire('load'));
      return { map, rerender: view.rerender };
    })();

    rerender(<MapCanvas graffitis={[SAMPLE[0]]} selectedId={null} onSelect={() => {}} />);

    const data = map.getSource('graffiti-source').data as ReturnType<typeof buildFeatureCollection>;
    expect(data.features).toHaveLength(1);
    expect(data.features[0].id).toBe('grf-001');
  });

  it('resalta el marcador seleccionado y limpia el filtro al deseleccionar', () => {
    const onSelect = vi.fn();
    const view = render(
      <MapCanvas graffitis={SAMPLE} selectedId={null} onSelect={onSelect} />,
    );
    const map = FakeMap.last;
    act(() => map.fire('load'));

    view.rerender(
      <MapCanvas graffitis={SAMPLE} selectedId="grf-002" onSelect={onSelect} />,
    );
    expect(map.filters[SELECTED_LAYER]).toEqual(['==', ['get', 'id'], 'grf-002']);

    view.rerender(
      <MapCanvas graffitis={SAMPLE} selectedId={null} onSelect={onSelect} />,
    );
    expect(map.filters[SELECTED_LAYER]).toEqual(['==', ['get', 'id'], '__ninguno__']);
  });
});
