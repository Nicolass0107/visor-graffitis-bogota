import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { FakeMap } from './test/fakeMaplibre';
import { POINT_LAYER, SELECTED_LAYER } from './components/MapCanvas';

vi.mock('maplibre-gl', async () => {
  const { FakeMap: Map, FakePopup: Popup } = await import('./test/fakeMaplibre');
  return {
    Map,
    Popup,
    NavigationControl: class FakeNavigationControl {},
  };
});

function renderApp() {
  const view = render(<App />);
  const map = FakeMap.last;
  act(() => map.fire('load'));
  return { ...view, map };
}

describe('App', () => {
  beforeEach(() => FakeMap.reset());

  it('muestra el título del visor', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /visor de grafitis de bogotá/i }),
    ).toBeInTheDocument();
  });

  it('abre el panel de detalle al hacer clic en un marcador', () => {
    const { map } = renderApp();

    expect(screen.queryByLabelText('Detalle del grafiti')).not.toBeInTheDocument();

    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-001' } }],
      });
    });

    const panel = screen.getByLabelText('Detalle del grafiti');
    expect(panel).toHaveTextContent('Tachas en el pedestal de Bolívar');
    expect(map.filters[SELECTED_LAYER]).toEqual(['==', ['get', 'id'], 'grf-001']);
  });

  it('cambia el panel cuando se selecciona otro marcador', () => {
    const { map } = renderApp();

    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-001' } }],
      });
    });
    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-002' } }],
      });
    });

    const panel = screen.getByLabelText('Detalle del grafiti');
    expect(panel).toHaveTextContent('Sin miedo en la barricada');
    expect(panel).not.toHaveTextContent('Tachas en el pedestal de Bolívar');
    expect(map.filters[SELECTED_LAYER]).toEqual(['==', ['get', 'id'], 'grf-002']);
  });

  it('cierra el panel y deselecciona el marcador con el botón de cerrar', () => {
    const { map } = renderApp();

    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-001' } }],
      });
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    });

    expect(screen.queryByLabelText('Detalle del grafiti')).not.toBeInTheDocument();
    expect(map.filters[SELECTED_LAYER]).toEqual(['==', ['get', 'id'], '__ninguno__']);
  });

  it('muestra un error y no despliega marcadores cuando el catálogo está mal formado', async () => {
    vi.doMock('./data/graffitis.json', () => ({ default: { no: 'es un arreglo' } }));
    vi.resetModules();

    const { default: FreshApp } = await import('./App');
    render(<FreshApp />);

    expect(screen.getByRole('alert')).toHaveTextContent(/no están bien formados/i);
    expect(FakeMap.instances).toHaveLength(0);

    vi.doUnmock('./data/graffitis.json');
    vi.resetModules();
  });
});

function visibleIdsFromMap(map: FakeMap): unknown[] {
  const data = map.getSource('graffiti-source').data as {
    features: Array<{ id?: unknown }>;
  };
  return data.features.map((feature) => feature.id);
}

describe('App: búsqueda y filtros', () => {
  beforeEach(() => FakeMap.reset());

  it('combina barrio y búsqueda mostrando solo la intersección', () => {
    const { map } = renderApp();

    fireEvent.change(screen.getByLabelText('Filtrar por barrio'), {
      target: { value: 'Centro Administrativo' },
    });
    fireEvent.change(screen.getByLabelText('Buscar grafitis'), {
      target: { value: 'puerta' },
    });

    expect(screen.getByText('1 de 10 grafitis')).toBeInTheDocument();
    expect(visibleIdsFromMap(map)).toEqual(['grf-003']);
  });

  it('ofrece el selector de artistas con su opción por defecto', () => {
    renderApp();

    const selector = screen.getByLabelText('Filtrar por artista');
    expect(within(selector).getByRole('option', { name: 'Todos los artistas' })).toBeInTheDocument();
  });

  it('restablecer filtros devuelve el catálogo completo', () => {
    const { map } = renderApp();

    fireEvent.change(screen.getByLabelText('Filtrar por barrio'), {
      target: { value: 'La Veracruz' },
    });
    fireEvent.change(screen.getByLabelText('Buscar grafitis'), {
      target: { value: 'sin miedo' },
    });
    expect(visibleIdsFromMap(map)).toEqual(['grf-002']);

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer filtros' }));

    expect(screen.getByText('10 de 10 grafitis')).toBeInTheDocument();
    expect(visibleIdsFromMap(map)).toHaveLength(10);
    expect(screen.getByLabelText('Buscar grafitis')).toHaveValue('');
    expect(screen.getByLabelText('Filtrar por barrio')).toHaveValue('');
  });

  it('sin coincidencias muestra el mensaje y deja el mapa sin marcadores', () => {
    const { map } = renderApp();

    fireEvent.change(screen.getByLabelText('Buscar grafitis'), {
      target: { value: 'texto inexistente' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('No hay resultados');
    expect(visibleIdsFromMap(map)).toEqual([]);
    expect(screen.getByText('0 de 10 grafitis')).toBeInTheDocument();
  });

  it('cierra el panel si los filtros ocultan el grafiti seleccionado', () => {
    const { map } = renderApp();

    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-001' } }],
      });
    });
    expect(screen.getByLabelText('Detalle del grafiti')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por barrio'), {
      target: { value: 'Ciudad Universitaria' },
    });

    expect(screen.queryByLabelText('Detalle del grafiti')).not.toBeInTheDocument();
  });
});

describe('App: vista del lugar (sin clave de API)', () => {
  beforeEach(() => FakeMap.reset());

  it('abre la vista del lugar con el aviso de clave y deja el resto operativo', async () => {
    const { map } = renderApp();

    act(() => {
      map.fireLayer('click', POINT_LAYER, {
        features: [{ properties: { id: 'grf-001' } }],
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ver el lugar' }));

    const dialog = await screen.findByRole('dialog', { name: 'Vista del lugar' });
    expect(within(dialog).getByText(/falta la clave de api/i)).toBeInTheDocument();

    // Cerrar la vista mantiene operativos mapa y panel de detalle.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar vista del lugar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Detalle del grafiti')).toBeInTheDocument();
    expect(screen.getByTestId('mapa-bogota')).toBeInTheDocument();
    expect(map.removed).toBe(false);
  });
});
