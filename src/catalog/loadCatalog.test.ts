import rawCatalog from '../data/graffitis.json';
import { loadCatalog } from './loadCatalog';

describe('loadCatalog', () => {
  it('carga el catálogo real con registros completos', () => {
    const state = loadCatalog(rawCatalog);

    expect(state.status).toBe('ok');
    if (state.status !== 'ok') return;

    expect(state.graffitis).toHaveLength(10);
    for (const graffiti of state.graffitis) {
      expect(graffiti.id).toBeTruthy();
      expect(Number.isFinite(graffiti.lat)).toBe(true);
      expect(Number.isFinite(graffiti.lng)).toBe(true);
      expect(graffiti.foto).toBeTruthy();
      expect(graffiti.barrio).toBeTruthy();
      expect(graffiti.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof graffiti.autor).toBe('string');
      expect(typeof graffiti.titulo).toBe('string');
    }
  });

  it('acepta registros sin autor ni título y los expone vacíos', () => {
    const state = loadCatalog([
      {
        id: 'x-1',
        lat: 4.6,
        lng: -74.08,
        foto: '/graffitis/x.svg',
        barrio: 'Teusaquillo',
        fecha: '2025-01-01',
      },
    ]);

    expect(state.status).toBe('ok');
    if (state.status !== 'ok') return;
    expect(state.graffitis[0].autor).toBe('');
    expect(state.graffitis[0].titulo).toBe('');
  });

  it('descarta registros con coordenadas fuera de Bogotá o no numéricas', () => {
    const state = loadCatalog([
      {
        id: 'ok-1',
        lat: 4.65,
        lng: -74.06,
        foto: '/graffitis/ok.svg',
        barrio: 'Chapinero',
        fecha: '2025-01-01',
      },
      {
        id: 'lejos-1',
        lat: 40.7,
        lng: -74.0,
        foto: '/graffitis/ny.svg',
        barrio: 'Otro sitio',
        fecha: '2025-01-01',
      },
      {
        id: 'roto-1',
        lat: 'no-numerica',
        lng: -74.08,
        foto: '/graffitis/roto.svg',
        barrio: 'Teusaquillo',
        fecha: '2025-01-01',
      },
    ]);

    expect(state.status).toBe('ok');
    if (state.status !== 'ok') return;
    expect(state.graffitis.map((g) => g.id)).toEqual(['ok-1']);
  });

  it('devuelve error cuando los datos mal formados no son un arreglo', () => {
    expect(loadCatalog({ graffitis: [] }).status).toBe('error');
    expect(loadCatalog(null).status).toBe('error');
    expect(loadCatalog('graffitis.json roto').status).toBe('error');
  });
});
