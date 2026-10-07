import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import StreetViewPanel from './StreetViewPanel';
import { bearing, hasApiKey, loadGoogleMaps } from '../lib/googleMapsLoader';
import type { Graffiti } from '../types';

vi.mock('../lib/googleMapsLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/googleMapsLoader')>();
  return { ...actual, hasApiKey: vi.fn(), loadGoogleMaps: vi.fn() };
});

const GRAFFITI: Graffiti = {
  id: 'grf-001',
  lat: 4.6486,
  lng: -74.0564,
  foto: '/graffitis/grafiti-01.svg',
  barrio: 'Chapinero',
  autor: 'Roka',
  fecha: '2024-05-02',
  titulo: 'León de Chapinero',
};

interface FakePano {
  options: Record<string, any>;
  listeners: Record<string, () => void>;
}

function makeLatLng(lat: number, lng: number) {
  return { lat: () => lat, lng: () => lng };
}

function buildFakeMaps(covered: boolean) {
  const panoramas: FakePano[] = [];
  const requests: Array<Record<string, any>> = [];

  const maps = {
    StreetViewStatus: { OK: 'OK', NOT_FOUND: 'NOT_FOUND' },
    StreetViewService: class {
      getPanorama(request: Record<string, any>, callback: (data: any, status: string) => void) {
        requests.push(request);
        if (covered) {
          callback({ location: { latLng: makeLatLng(4.65, -74.06) } }, 'OK');
        } else {
          callback(null, 'NOT_FOUND');
        }
      }
    },
    StreetViewPanorama: class {
      options: Record<string, any>;
      listeners: Record<string, () => void> = {};

      constructor(_element: HTMLElement, options: Record<string, any>) {
        this.options = options;
        panoramas.push(this);
      }

      addListener(event: string, handler: () => void) {
        this.listeners[event] = handler;
      }
    },
  };

  return { maps, panoramas, requests };
}

function setup() {
  const onClose = vi.fn();
  const view = render(<StreetViewPanel graffiti={GRAFFITI} onClose={onClose} />);
  return { ...view, onClose };
}

describe('StreetViewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasApiKey).mockReturnValue(true);
  });

  it('sin clave de API muestra el aviso y no intenta cargar Google Maps', async () => {
    vi.mocked(hasApiKey).mockReturnValue(false);

    setup();

    await waitFor(() => {
      expect(
        screen.getByText(/vista de calle no disponible: falta la clave de api/i),
      ).toBeInTheDocument();
    });
    expect(loadGoogleMaps).not.toHaveBeenCalled();
  });

  it('sin clave ofrece el enlace a Street View con las coordenadas del grafiti', async () => {
    vi.mocked(hasApiKey).mockReturnValue(false);

    setup();

    const link = await screen.findByTestId('abrir-street-view');
    expect(link).toHaveAttribute(
      'href',
      `https://www.google.com/maps?layer=cbs&cbll=${GRAFFITI.lat},${GRAFFITI.lng}`,
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.getAttribute('aria-label')).toMatch(/street view/i);
    // El aviso original sigue visible junto al enlace.
    expect(
      screen.getByText(/vista de calle no disponible: falta la clave de api/i),
    ).toBeInTheDocument();
  });

  it('con cobertura crea el panorama orientado hacia el grafiti y reemplaza el indicador', async () => {
    const { maps, panoramas, requests } = buildFakeMaps(true);
    vi.mocked(loadGoogleMaps).mockResolvedValue(maps as unknown as typeof google.maps);

    setup();

    // Indicador de carga mientras se inicializa.
    expect(screen.getByLabelText('Cargando vista de calle')).toBeInTheDocument();

    await waitFor(() => expect(panoramas).toHaveLength(1));
    const panorama = panoramas[0];

    // Se buscó panorama en la coordenada exacta del grafiti.
    expect(requests[0]).toEqual({
      location: { lat: GRAFFITI.lat, lng: GRAFFITI.lng },
      radius: 50,
    });

    // La cámara apunta desde la posición de la calle hacia el grafiti.
    const expectedHeading = bearing(4.65, -74.06, GRAFFITI.lat, GRAFFITI.lng);
    expect(panorama.options.pov.heading).toBeCloseTo(expectedHeading, 5);
    expect(panorama.options.pov.pitch).toBe(0);

    // El indicador se reemplaza cuando la panorámica está lista.
    expect(screen.getByLabelText('Cargando vista de calle')).toBeInTheDocument();
    act(() => panorama.listeners['status_changed']());
    expect(screen.queryByLabelText('Cargando vista de calle')).not.toBeInTheDocument();
    expect(screen.getByTestId('panorama')).toBeInTheDocument();

    // Con clave y cobertura no se ofrece el enlace externo.
    expect(screen.queryByTestId('abrir-street-view')).not.toBeInTheDocument();
  });

  it('sin cobertura muestra el mensaje y la foto del grafiti como alternativa', async () => {
    const { maps, panoramas } = buildFakeMaps(false);
    vi.mocked(loadGoogleMaps).mockResolvedValue(maps as unknown as typeof google.maps);

    setup();

    await waitFor(() => {
      expect(
        screen.getByText(/no hay vista de calle disponible/i),
      ).toBeInTheDocument();
    });
    expect(panoramas).toHaveLength(0);
    expect(screen.getByRole('img')).toHaveAttribute('src', GRAFFITI.foto);
    expect(
      screen.getByRole('heading', { name: /vista del lugar/i }),
    ).toBeInTheDocument();
    // Sin cobertura el enlace externo tampoco se ofrece: Google no tendría panorama.
    expect(screen.queryByTestId('abrir-street-view')).not.toBeInTheDocument();
  });

  it('si la librería de Google no carga, informa que la vista no está disponible', async () => {
    vi.mocked(loadGoogleMaps).mockRejectedValue(new Error('script-load-failed'));

    setup();

    await waitFor(() => {
      expect(
        screen.getByText(/vista de calle no disponible: falta la clave de api/i),
      ).toBeInTheDocument();
    });
  });

  it('el botón de cerrar invoca onClose', async () => {
    vi.mocked(hasApiKey).mockReturnValue(false);
    const { onClose } = setup();

    const button = await screen.findByRole('button', { name: 'Cerrar vista del lugar' });
    fireEvent.click(button);

    expect(onClose).toHaveBeenCalled();
  });
});
