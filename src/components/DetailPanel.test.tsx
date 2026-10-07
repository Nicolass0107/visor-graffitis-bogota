import { act, fireEvent, render, screen } from '@testing-library/react';
import DetailPanel from './DetailPanel';
import type { Graffiti } from '../types';

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
  {
    id: 'grf-003',
    lat: 4.6195,
    lng: -74.0925,
    foto: '/graffitis/grafiti-03.svg',
    barrio: 'Teusaquillo',
    autor: '',
    fecha: '2024-06-18',
    titulo: 'Frases de la 24',
  },
];

function setup(index = 0) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const onOpenStreetView = vi.fn();
  render(
    <DetailPanel
      graffiti={SAMPLE[index]}
      visibles={SAMPLE}
      onSelect={onSelect}
      onClose={onClose}
      onOpenStreetView={onOpenStreetView}
    />,
  );
  return { onSelect, onClose, onOpenStreetView };
}

describe('DetailPanel: foto y metadatos', () => {
  it('muestra foto, título, autor, barrio, fecha y coordenadas', () => {
    setup();

    expect(screen.getByTestId('foto-graffiti')).toHaveAttribute(
      'src',
      '/graffitis/grafiti-01.svg',
    );
    expect(
      screen.getByRole('heading', { name: 'Mural del callejón' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('detalle-autor')).toHaveTextContent('Tinta Sur');
    expect(screen.getByText('La Candelaria')).toBeInTheDocument();
    expect(screen.getByText('12 de marzo de 2024')).toBeInTheDocument();
    expect(screen.getByText('4.5981, -74.0758')).toBeInTheDocument();
  });

  it('muestra el indicador de carga mientras la foto no está lista', () => {
    setup();

    expect(screen.getByLabelText('Cargando foto')).toBeInTheDocument();

    fireEvent.load(screen.getByTestId('foto-graffiti'));

    expect(screen.queryByLabelText('Cargando foto')).not.toBeInTheDocument();
  });

  it('muestra "Autor desconocido" cuando no hay autor registrado', () => {
    setup(2);

    expect(screen.getByTestId('detalle-autor')).toHaveTextContent(
      'Autor desconocido',
    );
  });
});

describe('DetailPanel: navegación entre grafitis', () => {
  it('avanza al siguiente grafiti del conjunto visible', () => {
    const { onSelect } = setup();

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(onSelect).toHaveBeenCalledWith('grf-002');
  });

  it('retrocede al grafiti anterior', () => {
    const { onSelect } = setup(1);

    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));

    expect(onSelect).toHaveBeenCalledWith('grf-001');
  });

  it('deshabilita "siguiente" en el último grafiti', () => {
    setup(2);

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeEnabled();
  });

  it('deshabilita "anterior" en el primer grafiti', () => {
    setup(0);

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled();
  });
});

describe('DetailPanel: compartir ubicación', () => {
  it('copia las coordenadas exactas al portapapeles y lo confirma', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Copiar coordenadas' }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith('4.5981, -74.0758');
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
  });

  it('confirma la copia con el respaldo si la Clipboard API está denegada', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn(() => true);
    Object.assign(document, { execCommand });

    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Copiar coordenadas' }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();

    Reflect.deleteProperty(document, 'execCommand');
  });
});

describe('DetailPanel: vista del lugar', () => {
  it('al pulsar "Ver el lugar" entrega el grafiti con su coordenada', () => {
    const { onOpenStreetView } = setup(1);

    fireEvent.click(screen.getByRole('button', { name: 'Ver el lugar' }));

    expect(onOpenStreetView).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'grf-002',
        lat: 4.6486,
        lng: -74.0564,
      }),
    );
  });
});
